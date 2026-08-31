from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Order, Problem, Shortage, User
from app.models.enums import ACTIVE_ORDER_STATUSES, OrderStatus, ProblemStatus
from app.services.calculation.service import analyze_all_products
from app.services.readiness.readiness import get_order_readiness

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
def dashboard(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    active = db.query(Order).filter(Order.status.in_(ACTIVE_ORDER_STATUSES)).all()
    ready = [o for o in active if o.status == OrderStatus.READY_FOR_PRODUCTION]
    blocked = []
    attention = []
    for order in active:
        readiness = get_order_readiness(db, order.id)
        if readiness["launch_blocked"]:
            blocked.append({"order_id": order.id, "number": order.number, "reasons": readiness["blocking_reasons"]})
        elif readiness["readiness_percent"] < 100:
            attention.append({"order_id": order.id, "number": order.number, "percent": readiness["readiness_percent"]})

    critical_problems = (
        db.query(Problem)
        .filter(Problem.status != ProblemStatus.CLOSED.value, Problem.priority.in_(["high", "critical"]))
        .order_by(Problem.created_at.desc())
        .limit(10)
        .all()
    )
    blockers = []
    for p in critical_problems:
        blockers.append(
            {
                "problem_id": p.id,
                "title": p.title,
                "order_number": p.order.number if p.order else None,
                "assignee": p.assignee.full_name if p.assignee else None,
                "expected_date": None,
            }
        )
    for s in db.query(Shortage).filter(Shortage.deficit > 0).options(joinedload(Shortage.order), joinedload(Shortage.component)).limit(10):
        if s.expected_date:
            blockers.append(
                {
                    "title": f"Не хватает {s.deficit} × {s.component.sku}",
                    "order_number": s.order.number,
                    "expected_date": str(s.expected_date),
                }
            )

    assembly = analyze_all_products(db)
    return {
        "active_orders_count": len(active),
        "ready_count": len(ready),
        "attention_count": len(attention),
        "blocked_count": len(blocked),
        "blocked_orders": blocked[:5],
        "critical_problems": blockers[:5],
        "assembly_now": assembly[:5],
    }
