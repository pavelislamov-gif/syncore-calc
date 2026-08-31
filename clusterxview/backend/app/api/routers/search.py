from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Component, Document, Order, Problem, Product, User

router = APIRouter(prefix="/search", tags=["search"])


@router.get("")
def search(q: str = Query(min_length=1), db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    term = f"%{q}%"
    results = []
    for o in db.query(Order).filter(Order.number.ilike(term)).limit(10):
        results.append({"type": "order", "id": o.id, "label": f"Заказ №{o.number}", "link": f"/orders/{o.id}"})
    for p in db.query(Product).filter((Product.name.ilike(term)) | (Product.sku.ilike(term))).limit(10):
        results.append({"type": "product", "id": p.id, "label": p.name, "link": f"/products/{p.id}"})
    for c in db.query(Component).filter((Component.name.ilike(term)) | (Component.sku.ilike(term))).limit(10):
        results.append({"type": "component", "id": c.id, "label": c.name, "link": f"/components/{c.id}"})
    for pr in db.query(Problem).filter(Problem.title.ilike(term)).limit(10):
        results.append({"type": "problem", "id": pr.id, "label": pr.title, "link": f"/problems"})
    for d in db.query(Document).filter(Document.name.ilike(term)).limit(10):
        results.append({"type": "document", "id": d.id, "label": d.name, "link": f"/engineering/{d.product_id}"})
    return results
