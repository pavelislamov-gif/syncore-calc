from decimal import Decimal

import pytest

from app.services.calculation.engine import (
    calculate_additional_needed,
    calculate_assembly,
    calculate_buildable,
    calculate_deficit,
    calculate_free_stock,
    calculate_requirement,
)


def test_requirement_calculation():
    assert calculate_requirement(Decimal("500"), Decimal("2")) == Decimal("1000")


def test_deficit_calculation():
    assert calculate_deficit(Decimal("1000"), Decimal("700")) == Decimal("300")
    assert calculate_deficit(Decimal("500"), Decimal("700")) == Decimal("0")


def test_free_stock():
    assert calculate_free_stock(Decimal("700"), Decimal("600")) == Decimal("100")
    assert calculate_free_stock(Decimal("700"), Decimal("800")) == Decimal("0")


def test_reservation_reduces_free_stock():
    balance = Decimal("700")
    reserved = Decimal("600")
    free = calculate_free_stock(balance, reserved)
    required = Decimal("500")
    deficit = calculate_deficit(required, free)
    assert free == Decimal("100")
    assert deficit == Decimal("400")


def test_assembly_calculation():
    lines = [
        (Decimal("600"), Decimal("1")),
        (Decimal("520"), Decimal("1")),
        (Decimal("1100"), Decimal("2")),
        (Decimal("700"), Decimal("2")),
        (Decimal("800"), Decimal("1")),
    ]
    max_build, limiting = calculate_assembly(lines)
    assert max_build == 350
    assert limiting == 3  # driver line


def test_limiting_component():
    lines = [(Decimal("700"), Decimal("2"))]
    assert calculate_buildable(Decimal("700"), Decimal("2")) == 350


def test_availability_how_many_units():
    free = Decimal("700")
    per_unit = Decimal("2")
    assert calculate_buildable(free, per_unit) == 350


def test_increase_production():
    current = 350
    target = 500
    lines = [
        (1, Decimal("1"), Decimal("600")),
        (2, Decimal("1"), Decimal("520")),
        (3, Decimal("2"), Decimal("1100")),
        (4, Decimal("2"), Decimal("700")),
        (5, Decimal("1"), Decimal("800")),
        (6, Decimal("1.5"), Decimal("900")),
        (7, Decimal("8"), Decimal("3500")),
    ]
    additional = calculate_additional_needed(target, current, lines)
    by_id = {cid: qty for cid, qty in additional}
    assert by_id[4] == Decimal("300")  # driver
    assert by_id[7] == Decimal("500")  # screws: need 4000, have 3500


def test_recalculation_after_inventory_update():
    free_before = calculate_free_stock(Decimal("700"), Decimal("0"))
    build_before = calculate_buildable(free_before, Decimal("2"))
    free_after = calculate_free_stock(Decimal("1000"), Decimal("0"))
    build_after = calculate_buildable(free_after, Decimal("2"))
    assert build_before == 350
    assert build_after == 500


def test_multiple_orders_same_component():
    balance = Decimal("700")
    reserved_order_151 = Decimal("600")
    free_for_new = calculate_free_stock(balance, reserved_order_151)
    required_new = Decimal("500")
    deficit = calculate_deficit(required_new, free_for_new)
    assert free_for_new == Decimal("100")
    assert deficit == Decimal("400")
