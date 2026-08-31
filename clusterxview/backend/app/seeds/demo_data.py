from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models import (
    Component,
    Delivery,
    Document,
    DocumentVersion,
    InventoryBalance,
    Order,
    Product,
    Role,
    Specification,
    SpecificationItem,
    SpecificationVersion,
    User,
)
from app.models.enums import EntityStatus, OrderPriority, OrderStatus, UnitOfMeasure
from app.services.calculation.service import recalculate_order


ROLES = [
    ("admin", "Администратор"),
    ("director", "Руководитель"),
    ("technologist", "Технолог"),
    ("constructor", "Конструктор"),
    ("supply", "Снабжение"),
    ("production", "Производство"),
    ("quality", "ОТК"),
]

DEMO_USERS = [
    ("admin", "Администратор", "admin123", ["admin"]),
    ("director", "Руководитель", "director123", ["director"]),
    ("technologist", "Технолог", "technologist123", ["technologist"]),
    ("constructor", "Конструктор", "constructor123", ["constructor"]),
    ("supply", "Снабженец", "supply123", ["supply"]),
    ("production", "Производство", "production123", ["production"]),
    ("quality", "ОТК", "quality123", ["quality"]),
]

COMPONENTS = [
    ("Корпус", "K-001", UnitOfMeasure.PCS, 600),
    ("Рассеиватель", "R-001", UnitOfMeasure.PCS, 520),
    ("LED-модуль", "LED-50", UnitOfMeasure.PCS, 1100),
    ("Драйвер", "DR-100", UnitOfMeasure.PCS, 700),
    ("Клеммник", "KL-01", UnitOfMeasure.PCS, 800),
    ("Кабель", "CAB-02", UnitOfMeasure.M, 900),
    ("Винт М4×10", "M4-10", UnitOfMeasure.PCS, 3500),
]

SPEC_ITEMS = [
    ("K-001", 1, UnitOfMeasure.PCS, "Корпус", None),
    ("R-001", 1, UnitOfMeasure.PCS, "Рассеиватель", None),
    ("LED-50", 2, UnitOfMeasure.PCS, "Электромонтаж", "LED-модуль"),
    ("DR-100", 2, UnitOfMeasure.PCS, "Электромонтаж", "Драйвер"),
    ("KL-01", 1, UnitOfMeasure.PCS, "Электромонтаж", "Клеммник"),
    ("CAB-02", Decimal("1.5"), UnitOfMeasure.M, "Электромонтаж", "Кабель"),
    ("M4-10", 8, UnitOfMeasure.PCS, "Крепёж", None),
]


def seed_if_empty(db: Session) -> None:
    if db.query(User).first():
        return

    role_map: dict[str, Role] = {}
    for code, name in ROLES:
        role = Role(code=code, name=name)
        db.add(role)
        role_map[code] = role
    db.flush()

    user_map: dict[str, User] = {}
    for username, full_name, password, roles in DEMO_USERS:
        user = User(
            username=username,
            full_name=full_name,
            password_hash=hash_password(password),
            must_change_password=True,
        )
        for r in roles:
            user.roles.append(role_map[r])
        db.add(user)
        user_map[username] = user
    db.flush()

    comp_map: dict[str, Component] = {}
    for name, sku, unit, qty in COMPONENTS:
        comp = Component(name=name, sku=sku, unit=unit, status=EntityStatus.ACTIVE, updated_by_id=user_map["supply"].id)
        db.add(comp)
        db.flush()
        db.add(InventoryBalance(component_id=comp.id, quantity=Decimal(str(qty))))
        comp_map[sku] = comp

    product = Product(
        name="Светильник ЛС-100",
        sku="LS-100",
        description="Демонстрационное изделие",
        version="1.0",
        status=EntityStatus.ACTIVE,
        responsible_id=user_map["technologist"].id,
    )
    db.add(product)
    db.flush()

    spec = Specification(product_id=product.id, name="Основная")
    db.add(spec)
    db.flush()

    version = SpecificationVersion(
        specification_id=spec.id,
        revision="Rev.C",
        status="confirmed",
        author_id=user_map["technologist"].id,
        comment="Демо-спецификация",
        is_current=True,
    )
    db.add(version)
    db.flush()

    group_items: dict[str, int] = {}
    for sku, qty, unit, group, _label in SPEC_ITEMS:
        db.add(
            SpecificationItem(
                spec_version_id=version.id,
                component_id=comp_map[sku].id,
                quantity=Decimal(str(qty)),
                unit=unit,
                group_name=group,
                sort_order=len(group_items),
            )
        )

    order = Order(
        number="152",
        product_id=product.id,
        spec_version_id=version.id,
        quantity=Decimal("500"),
        customer="Демо-заказчик",
        responsible_id=user_map["director"].id,
        priority=OrderPriority.NORMAL,
        status=OrderStatus.ON_REVIEW,
    )
    db.add(order)
    db.flush()

    doc = Document(product_id=product.id, name="Чертёж корпуса", doc_type="drawing")
    db.add(doc)
    db.flush()
    db.add(
        DocumentVersion(
            document_id=doc.id,
            revision="Rev.C",
            validity_status="current",
            is_current=True,
            author_id=user_map["constructor"].id,
            comment="Актуален",
        )
    )
    db.add(
        Delivery(
            component_id=comp_map["DR-100"].id,
            quantity=Decimal("300"),
            expected_date=date(2026, 9, 12),
            supplier="Demo Supplier",
            status="expected",
            comment="Демо-поставка драйверов",
        )
    )
    db.commit()

    recalculate_order(db, order.id)
