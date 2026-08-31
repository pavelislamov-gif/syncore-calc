from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models import Order, Product, Requirement, Shortage, SpecificationVersion, User
from app.models.enums import ORDER_STATUS_TRANSITIONS, OrderPriority, OrderStatus
from app.schemas.common import OrderCreate, OrderOut, OrderStatusUpdate, RequirementOut, ShortageOut
from app.services.calculation.service import (
    create_reservations_for_order,
    get_current_spec_version,
    get_free_stock,
    recalculate_order,
)
from app.services.readiness.readiness import can_transition_to_ready, get_order_readiness
from app.services.notifications.service import notify_user, notify_role

router = APIRouter(prefix="/orders", tags=["orders"])


def _order_out(order: Order) -> OrderOut:
    out = OrderOut.model_validate(order)
    out.priority = order.priority.value
    out.status = order.status.value
    if order.product:
        out.product_name = order.product.name
    if order.spec_version:
        out.spec_revision = order.spec_version.revision
    return out


@router.get("", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    orders = db.query(Order).options(joinedload(Order.product), joinedload(Order.spec_version)).order_by(Order.created_at.desc()).all()
    return [_order_out(o) for o in orders]


@router.post("", response_model=OrderOut)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "director", "production")),
):
    if db.query(Order).filter(Order.number == payload.number).first():
        raise HTTPException(status_code=400, detail="Order number exists")
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    spec_version_id = payload.spec_version_id
    if not spec_version_id:
        version = get_current_spec_version(db, payload.product_id)
        if not version:
            raise HTTPException(status_code=400, detail="No specification version for product")
        spec_version_id = version.id
    order = Order(
        number=payload.number,
        product_id=payload.product_id,
        spec_version_id=spec_version_id,
        quantity=payload.quantity,
        due_date=payload.due_date,
        customer=payload.customer,
        responsible_id=payload.responsible_id,
        comment=payload.comment,
        priority=OrderPriority(payload.priority),
        status=OrderStatus.NEW,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    recalculate_order(db, order.id)
    order = db.query(Order).options(joinedload(Order.product), joinedload(Order.spec_version)).filter(Order.id == order.id).first()
    return _order_out(order)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    order = db.query(Order).options(joinedload(Order.product), joinedload(Order.spec_version)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _order_out(order)


@router.post("/{order_id}/calculate")
def calculate(order_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    order = recalculate_order(db, order_id)
    return {"order_id": order.id, "status": "calculated"}


@router.get("/{order_id}/requirements", response_model=list[RequirementOut])
def requirements(order_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    reqs = db.query(Requirement).filter(Requirement.order_id == order_id).all()
    shortages = {s.component_id: s for s in db.query(Shortage).filter(Shortage.order_id == order_id).all()}
    result = []
    for req in reqs:
        out = RequirementOut.model_validate(req)
        out.unit = req.unit.value
        out.component_name = req.component.name
        out.component_sku = req.component.sku
        out.free_stock = get_free_stock(db, req.component_id)
        if req.component_id in shortages:
            out.deficit = shortages[req.component_id].deficit
        result.append(out)
    return result


@router.get("/{order_id}/shortages", response_model=list[ShortageOut])
def shortages(order_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    items = db.query(Shortage).filter(Shortage.order_id == order_id).all()
    result = []
    for s in items:
        out = ShortageOut.model_validate(s)
        out.component_name = s.component.name
        out.component_sku = s.component.sku
        result.append(out)
    return result


@router.get("/{order_id}/readiness")
def readiness(order_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return get_order_readiness(db, order_id)


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order = db.query(Order).options(joinedload(Order.product), joinedload(Order.spec_version)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    new_status = OrderStatus(payload.status)
    allowed = ORDER_STATUS_TRANSITIONS.get(order.status, [])
    if new_status not in allowed:
        raise HTTPException(status_code=400, detail=f"Cannot transition from {order.status.value} to {new_status.value}")
    if new_status == OrderStatus.READY_FOR_PRODUCTION:
        ok, reasons = can_transition_to_ready(db, order)
        if not ok:
            raise HTTPException(status_code=400, detail={"message": "Launch blocked", "reasons": reasons})
        create_reservations_for_order(db, order)
    order.status = new_status
    if new_status == OrderStatus.READY_FOR_PRODUCTION:
        notify_role(db, "production", "Заказ готов к производству", f"Заказ №{order.number}", f"/orders/{order.id}")
    if order.responsible_id:
        notify_user(db, order.responsible_id, f"Статус заказа №{order.number}", new_status.value, f"/orders/{order.id}")
    db.commit()
    db.refresh(order)
    return _order_out(order)
