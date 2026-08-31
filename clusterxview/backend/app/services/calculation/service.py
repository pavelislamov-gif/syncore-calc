from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy.orm import Session, joinedload

from app.models import (
    Component,
    InventoryBalance,
    Order,
    Product,
    Requirement,
    Reservation,
    Shortage,
    Specification,
    SpecificationItem,
    SpecificationVersion,
)
from app.models.enums import ACTIVE_ORDER_STATUSES, EntityStatus, RESERVABLE_ORDER_STATUSES
from app.services.calculation.engine import (
    calculate_deficit,
    calculate_free_stock,
    calculate_requirement,
    to_decimal,
)
from app.services.problems.auto import sync_deficit_problems


def get_component_balance(db: Session, component_id: int) -> Decimal:
    balance = db.query(InventoryBalance).filter(InventoryBalance.component_id == component_id).first()
    return balance.quantity if balance else Decimal("0")


def get_reserved_quantity(db: Session, component_id: int, exclude_order_id: int | None = None) -> Decimal:
    query = (
        db.query(Reservation)
        .join(Order)
        .filter(
            Reservation.component_id == component_id,
            Order.status.in_(RESERVABLE_ORDER_STATUSES),
        )
    )
    if exclude_order_id:
        query = query.filter(Reservation.order_id != exclude_order_id)
    total = sum((r.quantity for r in query.all()), Decimal("0"))
    return total


def get_total_reserved(db: Session, component_id: int) -> Decimal:
    query = (
        db.query(Reservation)
        .join(Order)
        .filter(
            Reservation.component_id == component_id,
            Order.status.in_(RESERVABLE_ORDER_STATUSES),
        )
    )
    return sum((r.quantity for r in query.all()), Decimal("0"))


def get_free_stock(db: Session, component_id: int) -> Decimal:
    balance = get_component_balance(db, component_id)
    reserved = get_total_reserved(db, component_id)
    return calculate_free_stock(balance, reserved)


def calculate_order_requirements(db: Session, order: Order) -> list[Requirement]:
    db.query(Requirement).filter(Requirement.order_id == order.id).delete()
    items = (
        db.query(SpecificationItem)
        .filter(SpecificationItem.spec_version_id == order.spec_version_id)
        .all()
    )
    requirements: list[Requirement] = []
    for item in items:
        qty_required = calculate_requirement(to_decimal(order.quantity), to_decimal(item.quantity))
        req = Requirement(
            order_id=order.id,
            component_id=item.component_id,
            qty_per_unit=item.quantity,
            qty_required=qty_required,
            unit=item.unit,
        )
        db.add(req)
        requirements.append(req)
    db.flush()
    return requirements


def calculate_order_shortages(db: Session, order: Order) -> list[Shortage]:
    db.query(Shortage).filter(Shortage.order_id == order.id).delete()
    requirements = db.query(Requirement).filter(Requirement.order_id == order.id).all()
    shortages: list[Shortage] = []
    for req in requirements:
        balance = get_component_balance(db, req.component_id)
        reserved_others = get_reserved_quantity(db, req.component_id, exclude_order_id=order.id)
        free = calculate_free_stock(balance, reserved_others)
        deficit = calculate_deficit(to_decimal(req.qty_required), free)
        shortage = Shortage(
            order_id=order.id,
            component_id=req.component_id,
            required=req.qty_required,
            available=free,
            deficit=deficit,
        )
        db.add(shortage)
        shortages.append(shortage)
    db.flush()
    sync_deficit_problems(db, order)
    return shortages


def recalculate_order(db: Session, order_id: int) -> Order:
    order = (
        db.query(Order)
        .options(joinedload(Order.requirements), joinedload(Order.shortages))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise ValueError("Order not found")
    calculate_order_requirements(db, order)
    calculate_order_shortages(db, order)
    db.commit()
    db.refresh(order)
    return order


def recalculate_all_active_orders(db: Session) -> None:
    orders = db.query(Order).filter(Order.status.in_(ACTIVE_ORDER_STATUSES)).all()
    for order in orders:
        calculate_order_requirements(db, order)
        calculate_order_shortages(db, order)
    db.commit()


def create_reservations_for_order(db: Session, order: Order) -> None:
    db.query(Reservation).filter(Reservation.order_id == order.id).delete()
    requirements = db.query(Requirement).filter(Requirement.order_id == order.id).all()
    now = datetime.now(UTC)
    for req in requirements:
        db.add(
            Reservation(
                order_id=order.id,
                component_id=req.component_id,
                quantity=req.qty_required,
                confirmed_at=now,
            )
        )
    db.flush()
    recalculate_all_active_orders(db)


def get_spec_items_for_product(db: Session, product_id: int) -> list[SpecificationItem]:
    version = (
        db.query(SpecificationVersion)
        .join(SpecificationVersion.specification)
        .filter(Specification.product_id == product_id, SpecificationVersion.is_current.is_(True))
        .first()
    )
    if not version:
        version = (
            db.query(SpecificationVersion)
            .join(SpecificationVersion.specification)
            .filter(Specification.product_id == product_id)
            .order_by(SpecificationVersion.created_at.desc())
            .first()
        )
    if not version:
        return []
    return db.query(SpecificationItem).filter(SpecificationItem.spec_version_id == version.id).all()


def get_current_spec_version(db: Session, product_id: int) -> SpecificationVersion | None:
    return (
        db.query(SpecificationVersion)
        .join(SpecificationVersion.specification)
        .filter(Specification.product_id == product_id, SpecificationVersion.is_current.is_(True))
        .first()
    )


def get_component_usage(db: Session, component_id: int) -> list[dict]:
    items = (
        db.query(SpecificationItem)
        .join(SpecificationVersion)
        .join(SpecificationVersion.specification)
        .filter(SpecificationItem.component_id == component_id)
        .all()
    )
    result = []
    for item in items:
        spec = item.spec_version.specification
        product = spec.product
        active_orders = (
            db.query(Order)
            .filter(
                Order.product_id == product.id,
                Order.status.in_(ACTIVE_ORDER_STATUSES),
            )
            .count()
        )
        result.append(
            {
                "product_id": product.id,
                "product_name": product.name,
                "product_sku": product.sku,
                "qty_per_unit": float(item.quantity),
                "unit": item.unit.value,
                "spec_revision": item.spec_version.revision,
                "active_orders": active_orders,
            }
        )
    return result


def analyze_assembly_for_product(db: Session, product_id: int) -> dict:
    from app.services.calculation.engine import calculate_assembly

    items = get_spec_items_for_product(db, product_id)
    if not items:
        return {"product_id": product_id, "max_buildable": 0, "lines": [], "limiting_component": None}

    lines_data = []
    assembly_lines = []
    for item in items:
        comp = db.query(Component).filter(Component.id == item.component_id).first()
        free = get_free_stock(db, item.component_id)
        buildable = calculate_assembly([(free, to_decimal(item.quantity))])[0]
        lines_data.append(
            {
                "component_id": item.component_id,
                "component_name": comp.name if comp else "",
                "component_sku": comp.sku if comp else "",
                "qty_per_unit": float(item.quantity),
                "unit": item.unit.value,
                "free_stock": float(free),
                "buildable": buildable,
            }
        )
        assembly_lines.append((free, to_decimal(item.quantity)))

    max_build, limiting_idx = calculate_assembly(assembly_lines)
    limiting = lines_data[limiting_idx] if limiting_idx is not None and lines_data else None
    return {
        "product_id": product_id,
        "max_buildable": max_build,
        "lines": lines_data,
        "limiting_component": limiting,
    }


def analyze_all_products(db: Session) -> list[dict]:
    products = db.query(Product).filter(Product.status == EntityStatus.ACTIVE).all()
    results = []
    for product in products:
        analysis = analyze_assembly_for_product(db, product.id)
        if analysis["lines"]:
            results.append(
                {
                    "product_id": product.id,
                    "product_name": product.name,
                    "product_sku": product.sku,
                    "max_buildable": analysis["max_buildable"],
                    "limiting_component_sku": (
                        analysis["limiting_component"]["component_sku"] if analysis["limiting_component"] else None
                    ),
                    "limiting_component_name": (
                        analysis["limiting_component"]["component_name"] if analysis["limiting_component"] else None
                    ),
                }
            )
    return results


def component_availability(db: Session, component_id: int) -> dict:
    from app.services.calculation.engine import calculate_buildable

    comp = db.query(Component).filter(Component.id == component_id).first()
    balance = get_component_balance(db, component_id)
    reserved = get_total_reserved(db, component_id)
    free = calculate_free_stock(balance, reserved)
    usage = get_component_usage(db, component_id)
    products_coverage = []
    for u in usage:
        buildable = calculate_buildable(free, to_decimal(u["qty_per_unit"]))
        products_coverage.append({**u, "buildable_units": buildable})
    return {
        "component_id": component_id,
        "component_name": comp.name if comp else "",
        "component_sku": comp.sku if comp else "",
        "balance": float(balance),
        "reserved": float(reserved),
        "free": float(free),
        "usage": products_coverage,
    }


def increase_production(db: Session, product_id: int, target_qty: int) -> dict:
    from app.services.calculation.engine import calculate_additional_needed

    analysis = analyze_assembly_for_product(db, product_id)
    current = analysis["max_buildable"]
    lines = [
        (line["component_id"], to_decimal(line["qty_per_unit"]), to_decimal(line["free_stock"]))
        for line in analysis["lines"]
    ]
    additional = calculate_additional_needed(target_qty, current, lines)
    comp_map = {c.id: c for c in db.query(Component).filter(Component.id.in_([a[0] for a in additional])).all()}
    additional_list = [
        {
            "component_id": cid,
            "component_sku": comp_map[cid].sku,
            "component_name": comp_map[cid].name,
            "additional_qty": float(qty),
        }
        for cid, qty in additional
    ]
    achievable = target_qty if not additional else current
    if not additional:
        achievable = target_qty
    else:
        # After purchasing additional, target is achievable
        achievable = target_qty
    return {
        "product_id": product_id,
        "current_buildable": current,
        "target_qty": target_qty,
        "additional_needed": additional_list,
        "achievable_after": achievable if not additional else target_qty,
    }


def critical_components(db: Session) -> list[dict]:
    from collections import Counter

    all_analysis = analyze_all_products(db)
    counter: Counter[str] = Counter()
    comp_names: dict[str, str] = {}
    for a in all_analysis:
        sku = a.get("limiting_component_sku")
        if sku:
            counter[sku] += 1
            comp_names[sku] = a.get("limiting_component_name", sku)
    return [
        {"sku": sku, "name": comp_names[sku], "limits_products_count": count}
        for sku, count in counter.most_common()
    ]
