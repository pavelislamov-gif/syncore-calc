from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Product, User
from app.schemas.common import AssemblyIncreaseRequest
from app.services.calculation.service import analyze_all_products, analyze_assembly_for_product, increase_production

router = APIRouter(prefix="/assembly", tags=["assembly"])


@router.get("")
def assembly_all(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return analyze_all_products(db)


@router.get("/{product_id}")
def assembly_product(product_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    result = analyze_assembly_for_product(db, product_id)
    result["product_name"] = product.name
    result["product_sku"] = product.sku
    return result


@router.post("/{product_id}/increase")
def assembly_increase(
    product_id: int,
    payload: AssemblyIncreaseRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return increase_production(db, product_id, payload.target_qty)
