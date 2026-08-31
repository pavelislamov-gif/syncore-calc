from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import (
    admin,
    assembly,
    auth,
    components,
    dashboard,
    documents,
    engineering,
    inventory,
    notifications,
    orders,
    problems,
    procurement,
    products,
    search,
    specifications,
    technology,
)
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.seeds.demo_data import seed_if_empty


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if settings.SEED_DEMO:
            seed_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(title="ClusterXview API", version="1.0.0", lifespan=lifespan)

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in [
    auth.router,
    products.router,
    components.router,
    specifications.router,
    inventory.router,
    orders.router,
    assembly.router,
    procurement.router,
    documents.router,
    engineering.router,
    technology.router,
    problems.router,
    dashboard.router,
    search.router,
    notifications.router,
    admin.router,
]:
    app.include_router(router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok", "service": "clusterxview"}
