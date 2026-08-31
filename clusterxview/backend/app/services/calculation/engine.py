from decimal import Decimal
from math import floor


def to_decimal(value: float | int | str | Decimal) -> Decimal:
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


def calculate_requirement(order_qty: Decimal, qty_per_unit: Decimal) -> Decimal:
    return order_qty * qty_per_unit


def calculate_free_stock(balance: Decimal, reserved: Decimal) -> Decimal:
    free = balance - reserved
    return free if free > 0 else Decimal("0")


def calculate_deficit(required: Decimal, free: Decimal) -> Decimal:
    deficit = required - free
    return deficit if deficit > 0 else Decimal("0")


def calculate_buildable(free: Decimal, qty_per_unit: Decimal) -> int:
    if qty_per_unit <= 0:
        return 0
    return int(floor(float(free / qty_per_unit)))


def calculate_assembly(lines: list[tuple[Decimal, Decimal]]) -> tuple[int, int | None]:
    """Returns (max_buildable, index_of_limiting_line)."""
    if not lines:
        return 0, None
    buildables = [calculate_buildable(free, per_unit) for free, per_unit in lines]
    max_build = min(buildables)
    limiting_idx = buildables.index(max_build)
    return max_build, limiting_idx


def calculate_additional_needed(
    target_qty: int,
    current_buildable: int,
    lines: list[tuple[Decimal, Decimal, Decimal]],
) -> list[tuple[int, Decimal]]:
    """lines: (component_id, qty_per_unit, free_stock) -> list of (component_id, additional_qty)."""
    if target_qty <= current_buildable:
        return []
    additional: list[tuple[int, Decimal]] = []
    for comp_id, per_unit, free in lines:
        needed = to_decimal(target_qty) * per_unit
        extra = needed - free
        if extra > 0:
            additional.append((comp_id, extra))
    return additional
