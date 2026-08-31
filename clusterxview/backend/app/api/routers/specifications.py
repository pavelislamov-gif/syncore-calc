from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models import Product, Specification, SpecificationItem, SpecificationVersion, User
from app.models.enums import UnitOfMeasure
from app.schemas.common import SpecItemOut, SpecVersionCreate, SpecVersionOut, SpecificationOut
from app.services.notifications.service import notify_role

router = APIRouter(prefix="/specifications", tags=["specifications"])


def _version_out(version: SpecificationVersion) -> SpecVersionOut:
    items = []
    for item in version.items:
        out = SpecItemOut.model_validate(item)
        out.unit = item.unit.value
        if item.component:
            out.component_name = item.component.name
            out.component_sku = item.component.sku
        items.append(out)
    return SpecVersionOut(
        id=version.id,
        revision=version.revision,
        status=version.status,
        comment=version.comment,
        change_summary=version.change_summary,
        is_current=version.is_current,
        created_at=version.created_at,
        items=sorted(items, key=lambda x: x.sort_order),
    )


@router.get("/product/{product_id}", response_model=list[SpecificationOut])
def list_for_product(product_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    specs = (
        db.query(Specification)
        .options(joinedload(Specification.versions).joinedload(SpecificationVersion.items))
        .filter(Specification.product_id == product_id)
        .all()
    )
    result = []
    for spec in specs:
        out = SpecificationOut.model_validate(spec)
        out.versions = [_version_out(v) for v in spec.versions]
        result.append(out)
    return result


@router.post("/product/{product_id}", response_model=SpecificationOut)
def create_specification(
    product_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "technologist")),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    spec = Specification(product_id=product_id)
    db.add(spec)
    db.commit()
    db.refresh(spec)
    return SpecificationOut.model_validate(spec)


@router.post("/{spec_id}/versions", response_model=SpecVersionOut)
def create_version(
    spec_id: int,
    payload: SpecVersionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin", "technologist")),
):
    spec = db.query(Specification).filter(Specification.id == spec_id).first()
    if not spec:
        raise HTTPException(status_code=404, detail="Specification not found")
    if payload.is_current if hasattr(payload, "is_current") else True:
        db.query(SpecificationVersion).filter(SpecificationVersion.specification_id == spec_id).update(
            {"is_current": False}
        )
    version = SpecificationVersion(
        specification_id=spec_id,
        revision=payload.revision,
        status=payload.status,
        author_id=user.id,
        comment=payload.comment,
        change_summary=payload.change_summary,
        is_current=True,
    )
    db.add(version)
    db.flush()
    for idx, item in enumerate(payload.items):
        db.add(
            SpecificationItem(
                spec_version_id=version.id,
                component_id=item.component_id,
                quantity=item.quantity,
                unit=UnitOfMeasure(item.unit),
                parent_id=item.parent_id,
                group_name=item.group_name,
                sort_order=item.sort_order or idx,
            )
        )
    notify_role(db, "technologist", "Новая версия спецификации", f"Rev.{payload.revision}", f"/products/{spec.product_id}")
    db.commit()
    db.refresh(version)
    return _version_out(version)


@router.post("/versions/{version_id}/confirm", response_model=SpecVersionOut)
def confirm_version(
    version_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin", "technologist")),
):
    version = db.query(SpecificationVersion).filter(SpecificationVersion.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    version.status = "confirmed"
    db.commit()
    db.refresh(version)
    return _version_out(version)
