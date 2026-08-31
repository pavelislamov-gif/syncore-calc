from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Problem, User
from app.schemas.common import ProblemCreate, ProblemOut, ProblemStatusUpdate
from app.services.notifications.service import notify_user

router = APIRouter(prefix="/problems", tags=["problems"])


@router.get("", response_model=list[ProblemOut])
def list_problems(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Problem).order_by(Problem.created_at.desc()).all()


@router.post("", response_model=ProblemOut)
def create_problem(
    payload: ProblemCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    problem = Problem(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        order_id=payload.order_id,
        product_id=payload.product_id,
        component_id=payload.component_id,
        assignee_id=payload.assignee_id,
        priority=payload.priority,
        due_date=payload.due_date,
        auto_generated=False,
    )
    db.add(problem)
    db.flush()
    if problem.assignee_id:
        notify_user(db, problem.assignee_id, "Вам назначена проблема", problem.title, f"/problems")
    db.commit()
    db.refresh(problem)
    return problem


@router.patch("/{problem_id}/status", response_model=ProblemOut)
def update_status(
    problem_id: int,
    payload: ProblemStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    problem.status = payload.status
    db.commit()
    db.refresh(problem)
    return problem
