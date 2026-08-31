from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models import Order, TechnologyCheck, User
from app.schemas.common import TechnologyConfirm
from app.services.notifications.service import notify_user

router = APIRouter(prefix="/technology", tags=["technology"])


@router.post("/orders/{order_id}/confirm")
def confirm_technology(
    order_id: int,
    payload: TechnologyConfirm,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin", "technologist")),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    check = TechnologyCheck(
        order_id=order.id,
        spec_version_id=order.spec_version_id,
        confirmed=True,
        confirmed_by_id=user.id,
        confirmed_at=datetime.now(UTC),
        comment=payload.comment,
    )
    db.add(check)
    if order.responsible_id:
        notify_user(db, order.responsible_id, "Технология подтверждена", f"Заказ №{order.number}", f"/orders/{order.id}")
    db.commit()
    return {"order_id": order.id, "confirmed": True}
