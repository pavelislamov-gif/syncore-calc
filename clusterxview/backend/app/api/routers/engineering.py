import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models import Component, EngineeringChange, Order, Product, Specification, SpecificationVersion, Task, User
from app.models.enums import ACTIVE_ORDER_STATUSES, TaskStatus
from app.schemas.common import EngineeringChangeCreate, EngineeringChangeOut
from app.services.notifications.service import notify_role

router = APIRouter(prefix="/engineering", tags=["engineering"])


@router.get("/changes/product/{product_id}", response_model=list[EngineeringChangeOut])
def list_changes(product_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(EngineeringChange).filter(EngineeringChange.product_id == product_id).all()


@router.post("/changes", response_model=EngineeringChangeOut)
def create_change(
    payload: EngineeringChangeCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin", "constructor")),
):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    old_comp = db.query(Component).filter(Component.id == payload.old_component_id).first() if payload.old_component_id else None
    new_comp = db.query(Component).filter(Component.id == payload.new_component_id).first() if payload.new_component_id else None
    active_orders = db.query(Order).filter(Order.product_id == product.id, Order.status.in_(ACTIVE_ORDER_STATUSES)).count()
    specs = db.query(Specification).filter(Specification.product_id == product.id).count()
    impact = {
        "specifications": specs,
        "active_orders": active_orders,
        "documents": "requires_review",
        "procurement": "may_require_update",
        "technology": "requires_review",
    }
    change = EngineeringChange(
        product_id=payload.product_id,
        title=payload.title,
        description=payload.description,
        old_component_id=payload.old_component_id,
        new_component_id=payload.new_component_id,
        impact_json=json.dumps(impact, ensure_ascii=False),
        author_id=user.id,
    )
    db.add(change)
    db.flush()
    tasks = [
        "Проверить спецификацию",
        "Проверить электрическую схему",
        "Проверить сборочный чертёж",
        "Уведомить снабжение",
        "Проверить активные заказы",
    ]
    for title in tasks:
        db.add(Task(title=title, description=payload.title, source_type="engineering_change", source_id=change.id, status=TaskStatus.OPEN.value))
    notify_role(db, "technologist", "Изменена конструкция изделия", product.name, f"/products/{product.id}")
    notify_role(db, "supply", "Изменение конструкции — проверить снабжение", product.name)
    db.commit()
    db.refresh(change)
    return change


@router.get("/changes/{change_id}/impact")
def get_impact(change_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    change = db.query(EngineeringChange).filter(EngineeringChange.id == change_id).first()
    if not change:
        raise HTTPException(status_code=404, detail="Change not found")
    impact = json.loads(change.impact_json) if change.impact_json else {}
    old_name = change.old_component.name if change.old_component else None
    new_name = change.new_component.name if change.new_component else None
    return {
        "change_id": change.id,
        "title": change.title,
        "old_component": old_name,
        "new_component": new_name,
        "impact": impact,
        "affected_areas": ["спецификация", "электрическая схема", "сборочный чертёж", "технологический процесс", "снабжение", "активные заказы"],
    }
