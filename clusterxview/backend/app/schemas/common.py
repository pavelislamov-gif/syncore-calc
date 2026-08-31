from datetime import date, datetime
from decimal import Decimal
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str


class RoleOut(ORMModel):
    id: int
    code: str
    name: str


class UserOut(ORMModel):
    id: int
    username: str
    full_name: str
    is_active: bool
    must_change_password: bool
    roles: list[RoleOut] = []


class ProductCreate(BaseModel):
    name: str
    sku: str
    description: str | None = None
    version: str | None = None
    status: str = "active"
    responsible_id: int | None = None
    comment: str | None = None


class ProductOut(ORMModel):
    id: int
    name: str
    sku: str
    description: str | None
    version: str | None
    status: str
    responsible_id: int | None
    comment: str | None
    created_at: datetime
    updated_at: datetime


class ComponentCreate(BaseModel):
    name: str
    sku: str
    description: str | None = None
    unit: str = "шт"
    min_stock: Decimal = Decimal("0")
    status: str = "active"
    comment: str | None = None


class ComponentOut(ORMModel):
    id: int
    name: str
    sku: str
    description: str | None
    unit: str
    min_stock: Decimal
    status: str
    comment: str | None
    updated_at: datetime
    current_stock: Decimal | None = None


class SpecItemCreate(BaseModel):
    component_id: int
    quantity: Decimal
    unit: str = "шт"
    parent_id: int | None = None
    group_name: str | None = None
    sort_order: int = 0


class SpecVersionCreate(BaseModel):
    revision: str
    comment: str | None = None
    change_summary: str | None = None
    status: str = "draft"
    items: list[SpecItemCreate] = []


class SpecItemOut(ORMModel):
    id: int
    component_id: int
    quantity: Decimal
    unit: str
    parent_id: int | None
    group_name: str | None
    sort_order: int
    component_name: str | None = None
    component_sku: str | None = None


class SpecVersionOut(ORMModel):
    id: int
    revision: str
    status: str
    comment: str | None
    change_summary: str | None
    is_current: bool
    created_at: datetime
    items: list[SpecItemOut] = []


class SpecificationOut(ORMModel):
    id: int
    product_id: int
    name: str
    versions: list[SpecVersionOut] = []


class InventoryUpdate(BaseModel):
    component_id: int
    quantity: Decimal
    comment: str | None = None


class InventoryRow(ORMModel):
    component_id: int
    component_name: str
    component_sku: str
    quantity: Decimal
    unit: str
    updated_at: datetime | None


class InventoryHistoryOut(ORMModel):
    id: int
    old_quantity: Decimal
    new_quantity: Decimal
    comment: str | None
    created_at: datetime
    user_name: str | None = None


class OrderCreate(BaseModel):
    number: str
    product_id: int
    spec_version_id: int | None = None
    quantity: Decimal
    due_date: date | None = None
    customer: str | None = None
    responsible_id: int | None = None
    comment: str | None = None
    priority: str = "normal"


class OrderOut(ORMModel):
    id: int
    number: str
    product_id: int
    spec_version_id: int
    quantity: Decimal
    due_date: date | None
    customer: str | None
    responsible_id: int | None
    comment: str | None
    priority: str
    status: str
    created_at: datetime
    product_name: str | None = None
    spec_revision: str | None = None


class RequirementOut(ORMModel):
    id: int
    component_id: int
    qty_per_unit: Decimal
    qty_required: Decimal
    unit: str
    component_name: str | None = None
    component_sku: str | None = None
    free_stock: Decimal | None = None
    deficit: Decimal | None = None


class ShortageOut(ORMModel):
    id: int
    component_id: int
    required: Decimal
    available: Decimal
    deficit: Decimal
    procurement_status: str
    expected_date: date | None
    component_name: str | None = None
    component_sku: str | None = None


class ShortageUpdate(BaseModel):
    procurement_status: str
    expected_date: date | None = None
    comment: str | None = None


class DeliveryCreate(BaseModel):
    component_id: int
    quantity: Decimal
    order_date: date | None = None
    expected_date: date | None = None
    supplier: str | None = None
    status: str = "ordered"
    comment: str | None = None


class DeliveryOut(ORMModel):
    id: int
    component_id: int
    quantity: Decimal
    order_date: date | None
    expected_date: date | None
    supplier: str | None
    status: str
    comment: str | None
    received_quantity: Decimal
    component_name: str | None = None
    component_sku: str | None = None


class OrderStatusUpdate(BaseModel):
    status: str


class ProblemCreate(BaseModel):
    title: str
    description: str | None = None
    category: str = "other"
    order_id: int | None = None
    product_id: int | None = None
    component_id: int | None = None
    assignee_id: int | None = None
    priority: str = "normal"
    due_date: date | None = None


class ProblemOut(ORMModel):
    id: int
    title: str
    description: str | None
    category: str
    order_id: int | None
    product_id: int | None
    component_id: int | None
    assignee_id: int | None
    priority: str
    due_date: date | None
    status: str
    auto_generated: bool
    created_at: datetime


class ProblemStatusUpdate(BaseModel):
    status: str


class DocumentCreate(BaseModel):
    product_id: int
    name: str
    doc_type: str = "drawing"


class DocumentVersionOut(ORMModel):
    id: int
    revision: str
    file_name: str | None
    validity_status: str
    is_current: bool
    comment: str | None
    created_at: datetime


class DocumentOut(ORMModel):
    id: int
    product_id: int
    name: str
    doc_type: str
    versions: list[DocumentVersionOut] = []


class ValidityConfirm(BaseModel):
    validity_status: str = "current"
    comment: str | None = None


class EngineeringChangeCreate(BaseModel):
    product_id: int
    title: str
    description: str | None = None
    old_component_id: int | None = None
    new_component_id: int | None = None


class EngineeringChangeOut(ORMModel):
    id: int
    product_id: int
    title: str
    description: str | None
    old_component_id: int | None
    new_component_id: int | None
    impact_json: str | None
    created_at: datetime


class TechnologyConfirm(BaseModel):
    comment: str | None = None


class NotificationOut(ORMModel):
    id: int
    title: str
    message: str | None
    link: str | None
    is_read: bool
    created_at: datetime


class AssemblyIncreaseRequest(BaseModel):
    target_qty: int = Field(gt=0)


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
