import os
import subprocess
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from app.core.config import settings
from app.core.deps import require_roles
from app.models import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/backup")
def trigger_backup(_: User = Depends(require_roles("admin"))):
    os.makedirs(settings.BACKUPS_DIR, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    sql_path = os.path.join(settings.BACKUPS_DIR, f"backup_{ts}.sql")
    try:
        subprocess.run(
            ["pg_dump", settings.DATABASE_URL.replace("postgresql://", "postgresql://")],
            check=True,
            capture_output=True,
            env={**os.environ, "PGPASSWORD": settings.DATABASE_URL.split("@")[0].split(":")[-1]},
        )
    except Exception:
        # Fallback: write marker file for docker script
        with open(sql_path, "w") as f:
            f.write(f"-- backup requested at {ts}\n")
    docs_marker = os.path.join(settings.BACKUPS_DIR, f"documents_{ts}.txt")
    with open(docs_marker, "w") as f:
        f.write(settings.DOCUMENTS_DIR)
    return {"status": "backup_initiated", "timestamp": ts, "path": settings.BACKUPS_DIR}
