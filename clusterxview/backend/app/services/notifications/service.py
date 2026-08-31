from sqlalchemy.orm import Session

from app.models import Notification, User


def notify_user(db: Session, user_id: int, title: str, message: str | None = None, link: str | None = None) -> None:
    db.add(Notification(user_id=user_id, title=title, message=message, link=link))


def notify_role(db: Session, role_code: str, title: str, message: str | None = None, link: str | None = None) -> None:
    users = db.query(User).join(User.roles).filter_by(code=role_code).all()
    for user in users:
        notify_user(db, user.id, title, message, link)
