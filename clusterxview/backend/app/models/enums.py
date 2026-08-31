import enum


class UnitOfMeasure(str, enum.Enum):
    PCS = "шт"
    M = "м"
    KG = "кг"
    G = "г"
    L = "л"
    MM = "мм"
    SET = "комплект"
    PACK = "упаковка"
    OTHER = "другое"


class EntityStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"


class SpecVersionStatus(str, enum.Enum):
    DRAFT = "draft"
    REVIEW = "review"
    CONFIRMED = "confirmed"
    OBSOLETE = "obsolete"


class OrderStatus(str, enum.Enum):
    NEW = "new"
    ON_REVIEW = "on_review"
    HAS_PROBLEMS = "has_problems"
    AWAITING_RESOLUTION = "awaiting_resolution"
    READY_FOR_PRODUCTION = "ready_for_production"
    IN_PRODUCTION = "in_production"
    COMPLETED = "completed"


class OrderPriority(str, enum.Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"


ORDER_STATUS_TRANSITIONS: dict[OrderStatus, list[OrderStatus]] = {
    OrderStatus.NEW: [OrderStatus.ON_REVIEW],
    OrderStatus.ON_REVIEW: [OrderStatus.HAS_PROBLEMS, OrderStatus.AWAITING_RESOLUTION, OrderStatus.READY_FOR_PRODUCTION],
    OrderStatus.HAS_PROBLEMS: [OrderStatus.AWAITING_RESOLUTION, OrderStatus.ON_REVIEW],
    OrderStatus.AWAITING_RESOLUTION: [OrderStatus.ON_REVIEW, OrderStatus.HAS_PROBLEMS, OrderStatus.READY_FOR_PRODUCTION],
    OrderStatus.READY_FOR_PRODUCTION: [OrderStatus.IN_PRODUCTION],
    OrderStatus.IN_PRODUCTION: [OrderStatus.COMPLETED],
    OrderStatus.COMPLETED: [],
}


ACTIVE_ORDER_STATUSES = {
    OrderStatus.NEW,
    OrderStatus.ON_REVIEW,
    OrderStatus.HAS_PROBLEMS,
    OrderStatus.AWAITING_RESOLUTION,
    OrderStatus.READY_FOR_PRODUCTION,
    OrderStatus.IN_PRODUCTION,
}


RESERVABLE_ORDER_STATUSES = {
    OrderStatus.READY_FOR_PRODUCTION,
    OrderStatus.IN_PRODUCTION,
}


class ProcurementStatus(str, enum.Enum):
    NOT_ORDERED = "not_ordered"
    ORDERED = "ordered"
    EXPECTED = "expected"
    OTHER_SUPPLIER = "other_supplier"
    OTHER_SITE = "other_site"
    REPLACEMENT_NEEDED = "replacement_needed"
    PROBLEM = "problem"
    NOT_REQUIRED = "not_required"


class DeliveryStatus(str, enum.Enum):
    ORDERED = "ordered"
    EXPECTED = "expected"
    RECEIVED = "received"
    PARTIALLY_RECEIVED = "partially_received"
    CANCELLED = "cancelled"


class DocumentType(str, enum.Enum):
    DRAWING = "drawing"
    ASSEMBLY_DRAWING = "assembly_drawing"
    SCHEMATIC = "schematic"
    MODEL_3D = "model_3d"
    SPECIFICATION = "specification"
    OTHER = "other"


class ValidityStatus(str, enum.Enum):
    CURRENT = "current"
    NEEDS_REVIEW = "needs_review"
    OUTDATED = "outdated"


class ProblemCategory(str, enum.Enum):
    COMPONENTS = "components"
    PROCUREMENT = "procurement"
    ENGINEERING = "engineering"
    TECHNOLOGY = "technology"
    DOCUMENTATION = "documentation"
    PRODUCTION = "production"
    QC = "qc"
    OTHER = "other"


class ProblemStatus(str, enum.Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    WAITING = "waiting"
    SOLUTION_FOUND = "solution_found"
    ON_REVIEW = "on_review"
    CLOSED = "closed"


class ProblemPriority(str, enum.Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"


class TaskStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    CANCELLED = "cancelled"
