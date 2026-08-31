from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models import Product, User
from app.models.enums import EntityStatus
from app.schemas.common import ProductCreate, ProductOut

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Product).order_by(Product.name).all()


@router.post("", response_model=ProductOut)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "technologist", "director")),
):
    if db.query(Product).filter(Product.sku == payload.sku).first():
        raise HTTPException(status_code=400, detail="SKU already exists")
    product = Product(
        name=payload.name,
        sku=payload.sku,
        description=payload.description,
        version=payload.version,
        status=EntityStatus(payload.status),
        responsible_id=payload.responsible_id,
        comment=payload.comment,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "technologist")),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in payload.model_dump().items():
        if field == "status":
            setattr(product, field, EntityStatus(value))
        else:
            setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product
