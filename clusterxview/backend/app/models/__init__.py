from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import EntityStatus, OrderPriority, OrderStatus, UnitOfMeasure
from app.models.user import Role, User

__all__ = [
    "User",
    "Role",
    "Product",
    "Component",
    "Specification",
    "SpecificationVersion",
    "SpecificationItem",
    "Order",
    "Requirement",
    "InventoryBalance",
    "InventoryHistory",
    "Reservation",
    "Shortage",
    "Delivery",
    "Document",
    "DocumentVersion",
    "EngineeringChange",
    "TechnologyCheck",
    "Problem",
    "Task",
    "ChangeHistory",
    "Notification",
]


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    sku: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    version: Mapped[str | None] = mapped_column(String(50))
    status: Mapped[EntityStatus] = mapped_column(Enum(EntityStatus), default=EntityStatus.ACTIVE)
    responsible_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    comment: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    responsible = relationship("User", foreign_keys=[responsible_id])
    specifications = relationship("Specification", back_populates="product", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="product")
    documents = relationship("Document", back_populates="product", cascade="all, delete-orphan")
    engineering_changes = relationship("EngineeringChange", back_populates="product")


class Component(Base):
    __tablename__ = "components"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    sku: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    unit: Mapped[UnitOfMeasure] = mapped_column(Enum(UnitOfMeasure), default=UnitOfMeasure.PCS)
    min_stock: Mapped[Decimal] = mapped_column(Numeric(14, 4), default=0)
    status: Mapped[EntityStatus] = mapped_column(Enum(EntityStatus), default=EntityStatus.ACTIVE)
    comment: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    updated_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))

    updated_by = relationship("User", foreign_keys=[updated_by_id])
    balance = relationship("InventoryBalance", back_populates="component", uselist=False, cascade="all, delete-orphan")
    inventory_history = relationship("InventoryHistory", back_populates="component")
    specification_items = relationship("SpecificationItem", back_populates="component")
    requirements = relationship("Requirement", back_populates="component")
    reservations = relationship("Reservation", back_populates="component")
    shortages = relationship("Shortage", back_populates="component")
    deliveries = relationship("Delivery", back_populates="component")


class Specification(Base):
    __tablename__ = "specifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), default="Основная")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="specifications")
    versions = relationship(
        "SpecificationVersion", back_populates="specification", cascade="all, delete-orphan"
    )


class SpecificationVersion(Base):
    __tablename__ = "specification_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    specification_id: Mapped[int] = mapped_column(
        ForeignKey("specifications.id", ondelete="CASCADE"), nullable=False
    )
    revision: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="draft")
    author_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    comment: Mapped[str | None] = mapped_column(Text)
    change_summary: Mapped[str | None] = mapped_column(Text)
    is_current: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    specification = relationship("Specification", back_populates="versions")
    author = relationship("User")
    items = relationship("SpecificationItem", back_populates="spec_version", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="spec_version")
    technology_checks = relationship("TechnologyCheck", back_populates="spec_version")


class SpecificationItem(Base):
    __tablename__ = "specification_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    spec_version_id: Mapped[int] = mapped_column(
        ForeignKey("specification_versions.id", ondelete="CASCADE"), nullable=False
    )
    component_id: Mapped[int] = mapped_column(ForeignKey("components.id"), nullable=False)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("specification_items.id"))
    group_name: Mapped[str | None] = mapped_column(String(100))
    quantity: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    unit: Mapped[UnitOfMeasure] = mapped_column(Enum(UnitOfMeasure), default=UnitOfMeasure.PCS)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    spec_version = relationship("SpecificationVersion", back_populates="items")
    component = relationship("Component", back_populates="specification_items")
    parent = relationship("SpecificationItem", remote_side="SpecificationItem.id", backref="children")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    spec_version_id: Mapped[int] = mapped_column(ForeignKey("specification_versions.id"), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    due_date: Mapped[date | None] = mapped_column(Date)
    customer: Mapped[str | None] = mapped_column(String(200))
    responsible_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    comment: Mapped[str | None] = mapped_column(Text)
    priority: Mapped[OrderPriority] = mapped_column(Enum(OrderPriority), default=OrderPriority.NORMAL)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.NEW)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    product = relationship("Product", back_populates="orders")
    spec_version = relationship("SpecificationVersion", back_populates="orders")
    responsible = relationship("User", foreign_keys=[responsible_id])
    requirements = relationship("Requirement", back_populates="order", cascade="all, delete-orphan")
    reservations = relationship("Reservation", back_populates="order", cascade="all, delete-orphan")
    shortages = relationship("Shortage", back_populates="order", cascade="all, delete-orphan")
    problems = relationship("Problem", back_populates="order")
    technology_checks = relationship("TechnologyCheck", back_populates="order", cascade="all, delete-orphan")


class Requirement(Base):
    __tablename__ = "requirements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    component_id: Mapped[int] = mapped_column(ForeignKey("components.id"), nullable=False)
    qty_per_unit: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    qty_required: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    unit: Mapped[UnitOfMeasure] = mapped_column(Enum(UnitOfMeasure), default=UnitOfMeasure.PCS)

    order = relationship("Order", back_populates="requirements")
    component = relationship("Component", back_populates="requirements")


class InventoryBalance(Base):
    __tablename__ = "inventory_balances"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    component_id: Mapped[int] = mapped_column(ForeignKey("components.id", ondelete="CASCADE"), unique=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(14, 4), default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    component = relationship("Component", back_populates="balance")


class InventoryHistory(Base):
    __tablename__ = "inventory_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    component_id: Mapped[int] = mapped_column(ForeignKey("components.id"), nullable=False)
    old_quantity: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    new_quantity: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    comment: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    component = relationship("Component", back_populates="inventory_history")
    user = relationship("User")


class Reservation(Base):
    __tablename__ = "reservations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    component_id: Mapped[int] = mapped_column(ForeignKey("components.id"), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    order = relationship("Order", back_populates="reservations")
    component = relationship("Component", back_populates="reservations")


class Shortage(Base):
    __tablename__ = "shortages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    component_id: Mapped[int] = mapped_column(ForeignKey("components.id"), nullable=False)
    required: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    available: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    deficit: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    procurement_status: Mapped[str] = mapped_column(String(30), default="not_ordered")
    expected_date: Mapped[date | None] = mapped_column(Date)
    comment: Mapped[str | None] = mapped_column(Text)

    order = relationship("Order", back_populates="shortages")
    component = relationship("Component", back_populates="shortages")


class Delivery(Base):
    __tablename__ = "deliveries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    component_id: Mapped[int] = mapped_column(ForeignKey("components.id"), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    order_date: Mapped[date | None] = mapped_column(Date)
    expected_date: Mapped[date | None] = mapped_column(Date)
    supplier: Mapped[str | None] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(30), default="ordered")
    comment: Mapped[str | None] = mapped_column(Text)
    received_quantity: Mapped[Decimal] = mapped_column(Numeric(14, 4), default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    component = relationship("Component", back_populates="deliveries")


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    doc_type: Mapped[str] = mapped_column(String(50), default="drawing")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="documents")
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")


class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    revision: Mapped[str] = mapped_column(String(20), nullable=False)
    file_path: Mapped[str | None] = mapped_column(String(500))
    file_name: Mapped[str | None] = mapped_column(String(255))
    validity_status: Mapped[str] = mapped_column(String(30), default="needs_review")
    author_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    comment: Mapped[str | None] = mapped_column(Text)
    is_current: Mapped[bool] = mapped_column(default=False)
    confirmed_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="versions")
    author = relationship("User", foreign_keys=[author_id])
    confirmed_by = relationship("User", foreign_keys=[confirmed_by_id])


class EngineeringChange(Base):
    __tablename__ = "engineering_changes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    old_component_id: Mapped[int | None] = mapped_column(ForeignKey("components.id"))
    new_component_id: Mapped[int | None] = mapped_column(ForeignKey("components.id"))
    impact_json: Mapped[str | None] = mapped_column(Text)
    author_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="engineering_changes")
    old_component = relationship("Component", foreign_keys=[old_component_id])
    new_component = relationship("Component", foreign_keys=[new_component_id])
    author = relationship("User")


class TechnologyCheck(Base):
    __tablename__ = "technology_checks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    spec_version_id: Mapped[int] = mapped_column(ForeignKey("specification_versions.id"), nullable=False)
    confirmed: Mapped[bool] = mapped_column(default=False)
    confirmed_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    comment: Mapped[str | None] = mapped_column(Text)

    order = relationship("Order", back_populates="technology_checks")
    spec_version = relationship("SpecificationVersion", back_populates="technology_checks")
    confirmed_by = relationship("User")


class Problem(Base):
    __tablename__ = "problems"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(50), default="other")
    order_id: Mapped[int | None] = mapped_column(ForeignKey("orders.id"))
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"))
    component_id: Mapped[int | None] = mapped_column(ForeignKey("components.id"))
    assignee_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    priority: Mapped[str] = mapped_column(String(20), default="normal")
    due_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(30), default="new")
    auto_generated: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="problems")
    product = relationship("Product")
    component = relationship("Component")
    assignee = relationship("User")


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    source_type: Mapped[str | None] = mapped_column(String(50))
    source_id: Mapped[int | None] = mapped_column(Integer)
    assignee_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    due_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(30), default="open")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    assignee = relationship("User")


class ChangeHistory(Base):
    __tablename__ = "change_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[int] = mapped_column(Integer, nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    diff_json: Mapped[str | None] = mapped_column(Text)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str | None] = mapped_column(Text)
    link: Mapped[str | None] = mapped_column(String(255))
    is_read: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")
