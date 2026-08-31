from sqlalchemy.orm import Session, joinedload

from app.models import Document, DocumentVersion, Order, Problem, Shortage, TechnologyCheck
from app.models.enums import OrderStatus, ProblemStatus, ValidityStatus


def check_technology(order: Order, db: Session) -> dict:
    check = (
        db.query(TechnologyCheck)
        .filter(TechnologyCheck.order_id == order.id)
        .order_by(TechnologyCheck.id.desc())
        .first()
    )
    confirmed = check.confirmed if check else False
    spec_confirmed = order.spec_version.status == "confirmed"
    return {
        "name": "technologist",
        "label": "Технолог",
        "status": "green" if confirmed and spec_confirmed else "yellow" if spec_confirmed else "red",
        "message": "Спецификация подтверждена" if confirmed else "Требуется проверка технологом",
        "ok": confirmed and spec_confirmed,
    }


def check_supply(order: Order, db: Session) -> dict:
    shortages = db.query(Shortage).filter(Shortage.order_id == order.id, Shortage.deficit > 0).all()
    if not shortages:
        return {"name": "supply", "label": "Снабжение", "status": "green", "message": "Комплектующие обеспечены", "ok": True}
    unresolved = [s for s in shortages if s.procurement_status not in ("expected", "other_supplier", "other_site", "not_required")]
    if unresolved:
        msgs = [f"Не хватает {s.deficit} × {s.component.sku}" for s in unresolved[:3]]
        return {
            "name": "supply",
            "label": "Снабжение",
            "status": "red",
            "message": "; ".join(msgs),
            "ok": False,
        }
    return {
        "name": "supply",
        "label": "Снабжение",
        "status": "yellow",
        "message": "Ожидается поставка",
        "ok": True,
    }


def check_engineering(order: Order, db: Session) -> dict:
    docs = db.query(Document).filter(Document.product_id == order.product_id).all()
    outdated = []
    for doc in docs:
        current = (
            db.query(DocumentVersion)
            .filter(DocumentVersion.document_id == doc.id, DocumentVersion.is_current.is_(True))
            .first()
        )
        if current and current.validity_status == ValidityStatus.OUTDATED.value:
            outdated.append(doc.name)
    if outdated:
        return {
            "name": "engineering",
            "label": "Конструктор",
            "status": "red",
            "message": f"Устарело: {', '.join(outdated[:3])}",
            "ok": False,
        }
    return {"name": "engineering", "label": "Конструктор", "status": "green", "message": "Документы актуальны", "ok": True}


def check_production(order: Order, db: Session) -> dict:
    if order.status == OrderStatus.READY_FOR_PRODUCTION:
        return {"name": "production", "label": "Производство", "status": "green", "message": "Готов к производству", "ok": True}
    if order.status == OrderStatus.IN_PRODUCTION:
        return {"name": "production", "label": "Производство", "status": "blue", "message": "В производстве", "ok": True}
    return {"name": "production", "label": "Производство", "status": "yellow", "message": "Ожидает обеспечения", "ok": False}


def get_order_readiness(db: Session, order_id: int) -> dict:
    order = (
        db.query(Order)
        .options(joinedload(Order.spec_version), joinedload(Order.shortages))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise ValueError("Order not found")
    checks = [
        check_technology(order, db),
        check_supply(order, db),
        check_engineering(order, db),
        check_production(order, db),
    ]
    ok_count = sum(1 for c in checks if c["ok"])
    percent = int(ok_count / len(checks) * 100) if checks else 0
    blocking = [c for c in checks if not c["ok"] and c["name"] in ("supply", "engineering", "technologist")]
    open_problems = (
        db.query(Problem)
        .filter(Problem.order_id == order.id, Problem.status != ProblemStatus.CLOSED.value)
        .count()
    )
    can_produce = len(blocking) == 0 and open_problems == 0
    blocking_reasons = []
    for c in checks:
        if not c["ok"]:
            blocking_reasons.append(c["message"])
    for s in order.shortages:
        if s.deficit > 0 and s.procurement_status not in ("expected", "other_supplier", "other_site", "not_required"):
            blocking_reasons.append(f"Дефицит {s.component.sku} — {s.deficit} {s.component.unit.value}")
    return {
        "order_id": order.id,
        "readiness_percent": percent,
        "checks": checks,
        "can_produce": can_produce,
        "launch_blocked": not can_produce,
        "blocking_reasons": list(dict.fromkeys(blocking_reasons)),
    }


def can_transition_to_ready(db: Session, order: Order) -> tuple[bool, list[str]]:
    readiness = get_order_readiness(db, order.id)
    return readiness["can_produce"], readiness["blocking_reasons"]
