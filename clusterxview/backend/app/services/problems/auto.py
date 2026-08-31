from sqlalchemy.orm import Session

from app.models import Order, Problem, Shortage, User
from app.models.enums import ProblemCategory, ProblemPriority, ProblemStatus


def sync_deficit_problems(db: Session, order: Order) -> None:
    shortages = db.query(Shortage).filter(Shortage.order_id == order.id, Shortage.deficit > 0).all()
    existing = (
        db.query(Problem)
        .filter(
            Problem.order_id == order.id,
            Problem.auto_generated.is_(True),
            Problem.category == ProblemCategory.COMPONENTS.value,
            Problem.status != ProblemStatus.CLOSED.value,
        )
        .all()
    )
    existing_comp_ids = {p.component_id for p in existing}
    supply_user = (
        db.query(User)
        .join(User.roles)
        .filter_by(code="supply")
        .first()
    )
    for shortage in shortages:
        if shortage.component_id in existing_comp_ids:
            for p in existing:
                if p.component_id == shortage.component_id:
                    p.title = f"Дефицит {shortage.component.sku} — {shortage.deficit} {shortage.component.unit.value}"
                    p.description = f"Заказ №{order.number}: не хватает {shortage.deficit}"
            continue
        db.add(
            Problem(
                title=f"Дефицит {shortage.component.sku} — {shortage.deficit} {shortage.component.unit.value}",
                description=f"Заказ №{order.number}: требуется {shortage.required}, доступно {shortage.available}",
                category=ProblemCategory.COMPONENTS.value,
                order_id=order.id,
                component_id=shortage.component_id,
                assignee_id=supply_user.id if supply_user else None,
                priority=ProblemPriority.HIGH.value,
                status=ProblemStatus.NEW.value,
                auto_generated=True,
            )
        )
