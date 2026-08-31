from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models import Delivery, InventoryBalance, InventoryHistory, Shortage, User
from app.schemas.common import DeliveryCreate, DeliveryOut, ShortageOut, ShortageUpdate
from app.services.calculation.service import recalculate_all_active_orders
from app.services.notifications.service import notify_role

router = APIRouter(prefix="/procurement", tags=["procurement"])


@router.get("/shortages", response_model=list[ShortageOut])
def list_shortages(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    items = db.query(Shortage).filter(Shortage.deficit > 0).all()
    result = []
    for s in items:
        out = ShortageOut.model_validate(s)
        out.component_name = s.component.name
        out.component_sku = s.component.sku
        result.append(out)
    return result


@router.patch("/shortages/{shortage_id}", response_model=ShortageOut)
def update_shortage(
    shortage_id: int,
    payload: ShortageUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "supply")),
):
    shortage = db.query(Shortage).filter(Shortage.id == shortage_id).first()
    if not shortage:
        raise HTTPException(status_code=404, detail="Shortage not found")
    shortage.procurement_status = payload.procurement_status
    shortage.expected_date = payload.expected_date
    shortage.comment = payload.comment
    db.commit()
    db.refresh(shortage)
    out = ShortageOut.model_validate(shortage)
    out.component_name = shortage.component.name
    out.component_sku = shortage.component.sku
    return out


@router.get("/deliveries", response_model=list[DeliveryOut])
def list_deliveries(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    items = db.query(Delivery).order_by(Delivery.created_at.desc()).all()
    result = []
    for d in items:
        out = DeliveryOut.model_validate(d)
        out.component_name = d.component.name
        out.component_sku = d.component.sku
        result.append(out)
    return result


@router.post("/deliveries", response_model=DeliveryOut)
def create_delivery(
    payload: DeliveryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "supply")),
):
    delivery = Delivery(
        component_id=payload.component_id,
        quantity=payload.quantity,
        order_date=payload.order_date or date.today(),
        expected_date=payload.expected_date,
        supplier=payload.supplier,
        status=payload.status,
        comment=payload.comment,
    )
    db.add(delivery)
    db.commit()
    db.refresh(delivery)
    out = DeliveryOut.model_validate(delivery)
    out.component_name = delivery.component.name
    out.component_sku = delivery.component.sku
    return out


@router.post("/deliveries/{delivery_id}/receive")
def receive_delivery(
    delivery_id: int,
    quantity: Decimal | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin", "supply")),
):
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    recv_qty = quantity or delivery.quantity
    delivery.received_quantity = recv_qty
    delivery.status = "received" if recv_qty >= delivery.quantity else "partially_received"
    balance = db.query(InventoryBalance).filter(InventoryBalance.component_id == delivery.component_id).first()
    if not balance:
        balance = InventoryBalance(component_id=delivery.component_id, quantity=Decimal("0"))
        db.add(balance)
        db.flush()
    old = balance.quantity
    balance.quantity = old + recv_qty
    db.add(
        InventoryHistory(
            component_id=delivery.component_id,
            old_quantity=old,
            new_quantity=balance.quantity,
            user_id=user.id,
            comment=f"Поступление поставки #{delivery.id}",
        )
    )
    notify_role(db, "production", "Поступила комплектующая", delivery.component.sku, f"/components/{delivery.component_id}")
    db.commit()
    recalculate_all_active_orders(db)
    return {"delivery_id": delivery.id, "received": float(recv_qty), "new_balance": float(balance.quantity)}
