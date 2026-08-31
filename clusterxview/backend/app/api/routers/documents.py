import json
import os
import shutil
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models import Document, DocumentVersion, Problem, Task, User
from app.models.enums import ProblemCategory, ProblemPriority, ProblemStatus, TaskStatus
from app.schemas.common import DocumentCreate, DocumentOut, DocumentVersionOut, ValidityConfirm
from app.services.notifications.service import notify_role

router = APIRouter(prefix="/documents", tags=["documents"])


def _doc_out(doc: Document) -> DocumentOut:
    return DocumentOut(
        id=doc.id,
        product_id=doc.product_id,
        name=doc.name,
        doc_type=doc.doc_type,
        versions=[DocumentVersionOut.model_validate(v) for v in doc.versions],
    )


@router.get("/product/{product_id}", response_model=list[DocumentOut])
def list_documents(product_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    docs = db.query(Document).filter(Document.product_id == product_id).all()
    return [_doc_out(d) for d in docs]


@router.post("", response_model=DocumentOut)
def create_document(
    payload: DocumentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "constructor")),
):
    doc = Document(product_id=payload.product_id, name=payload.name, doc_type=payload.doc_type)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return _doc_out(doc)


@router.post("/{document_id}/versions")
async def upload_version(
    document_id: int,
    revision: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin", "constructor")),
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    os.makedirs(settings.DOCUMENTS_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1]
    stored_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.DOCUMENTS_DIR, stored_name)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    db.query(DocumentVersion).filter(DocumentVersion.document_id == document_id).update({"is_current": False})
    version = DocumentVersion(
        document_id=document_id,
        revision=revision,
        file_path=file_path,
        file_name=file.filename,
        validity_status="needs_review",
        author_id=user.id,
        is_current=True,
    )
    db.add(version)
    db.commit()
    db.refresh(version)
    return DocumentVersionOut.model_validate(version)


@router.get("/versions/{version_id}/download")
def download_version(version_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    version = db.query(DocumentVersion).filter(DocumentVersion.id == version_id).first()
    if not version or not version.file_path or not os.path.exists(version.file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(version.file_path, filename=version.file_name or "document")


@router.post("/versions/{version_id}/confirm", response_model=DocumentVersionOut)
def confirm_validity(
    version_id: int,
    payload: ValidityConfirm,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin", "constructor")),
):
    version = db.query(DocumentVersion).filter(DocumentVersion.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    version.validity_status = payload.validity_status
    version.comment = payload.comment
    version.confirmed_by_id = user.id
    version.confirmed_at = datetime.now(UTC)
    if payload.validity_status == "outdated":
        doc = version.document
        db.add(
            Problem(
                title=f"Неактуальный документ: {doc.name}",
                description=f"Rev.{version.revision} помечен как устаревший",
                category=ProblemCategory.DOCUMENTATION.value,
                product_id=doc.product_id,
                priority=ProblemPriority.HIGH.value,
                status=ProblemStatus.NEW.value,
                auto_generated=True,
            )
        )
    db.commit()
    db.refresh(version)
    return DocumentVersionOut.model_validate(version)
