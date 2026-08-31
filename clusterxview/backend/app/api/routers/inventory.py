from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models import Component, InventoryBalance, InventoryHistory, User
from app.schemas.common import InventoryHistoryOut, InventoryRow, InventoryUpdate
from app.services.calculation.service import recalculate_all_active_orders

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("", response_model=list[InventoryRow])
def list_inventory(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = []
    components = db.query(Component).order_by(Component.name).all()
    for comp in components:
        balance = db.query(InventoryBalance).filter(InventoryBalance.component_id == comp.id).first()
        rows.append(
            InventoryRow(
                component_id=comp.id,
                component_name=comp.name,
                component_sku=comp.sku,
                quantity=balance.quantity if balance else 0,
                unit=comp.unit.value,
                updated_at=balance.updated_at if balance else comp.updated_at,
            )
        )
    return rows


@router.post("/update")
def update_inventory(
    payload: InventoryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin", "supply")),
):
    comp = db.query(Component).filter(Component.id == payload.component_id).first()
    if not comp:
        return {"error": "Component not found"}
    balance = db.query(InventoryBalance).filter(InventoryBalance.component_id == comp.id).first()
    if not balance:
        balance = InventoryBalance(component_id=comp.id, quantity=0)
        db.add(balance)
        db.flush()
    old_qty = balance.quantity
    balance.quantity = payload.quantity
    comp.updated_by_id = user.id
    db.add(
        InventoryHistory(
            component_id=comp.id,
            old_quantity=old_qty,
            new_quantity=payload.quantity,
            user_id=user.id,
            comment=payload.comment,
        )
    )
    db.commit()
    recalculate_all_active_orders(db)
    return {"component_id": comp.id, "old_quantity": float(old_qty), "new_quantity": float(payload.quantity)}


@router.get("/{component_id}/history", response_model=list[InventoryHistoryOut])
def history(component_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    records = (
        db.query(InventoryHistory)
        .filter(InventoryHistory.component_id == component_id)
        .order_by(InventoryHistory.created_at.desc())
        .limit(50)
        .all()
    )
    result = []
    for r in records:
        out = InventoryHistoryOut.model_validate(r)
        out.user_name = r.user.full_name if r.user else None
        result.append(out)
    return result
