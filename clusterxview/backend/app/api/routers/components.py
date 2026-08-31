from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models import Component, InventoryBalance, User
from app.models.enums import EntityStatus, UnitOfMeasure
from app.schemas.common import ComponentCreate, ComponentOut
from app.services.calculation.service import component_availability, critical_components, get_component_usage

router = APIRouter(prefix="/components", tags=["components"])


def _component_out(comp: Component, db: Session) -> ComponentOut:
    balance = db.query(InventoryBalance).filter(InventoryBalance.component_id == comp.id).first()
    data = ComponentOut.model_validate(comp)
    data.unit = comp.unit.value
    data.status = comp.status.value
    data.current_stock = balance.quantity if balance else Decimal("0")
    return data


@router.get("", response_model=list[ComponentOut])
def list_components(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    components = db.query(Component).order_by(Component.name).all()
    return [_component_out(c, db) for c in components]


@router.post("", response_model=ComponentOut)
def create_component(
    payload: ComponentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin", "technologist", "supply")),
):
    if db.query(Component).filter(Component.sku == payload.sku).first():
        raise HTTPException(status_code=400, detail="SKU already exists")
    comp = Component(
        name=payload.name,
        sku=payload.sku,
        description=payload.description,
        unit=UnitOfMeasure(payload.unit),
        min_stock=payload.min_stock,
        status=EntityStatus(payload.status),
        comment=payload.comment,
        updated_by_id=user.id,
    )
    db.add(comp)
    db.flush()
    db.add(InventoryBalance(component_id=comp.id, quantity=Decimal("0")))
    db.commit()
    db.refresh(comp)
    return _component_out(comp, db)


@router.get("/critical/list")
def list_critical(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return critical_components(db)


@router.get("/{component_id}", response_model=ComponentOut)
def get_component(component_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    comp = db.query(Component).filter(Component.id == component_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Component not found")
    return _component_out(comp, db)


@router.get("/{component_id}/usage")
def usage(component_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return get_component_usage(db, component_id)


@router.get("/{component_id}/availability")
def availability(component_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return component_availability(db, component_id)


@router.put("/{component_id}", response_model=ComponentOut)
def update_component(
    component_id: int,
    payload: ComponentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin", "technologist", "supply")),
):
    comp = db.query(Component).filter(Component.id == component_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Component not found")
    comp.name = payload.name
    comp.sku = payload.sku
    comp.description = payload.description
    comp.unit = UnitOfMeasure(payload.unit)
    comp.min_stock = payload.min_stock
    comp.status = EntityStatus(payload.status)
    comp.comment = payload.comment
    comp.updated_by_id = user.id
    db.commit()
    db.refresh(comp)
    return _component_out(comp, db)
