from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes_curriculum import router as curriculum_router
from app.api.routes_execution import router as execution_router
from app.api.routes_labs import router as labs_router
from app.api.routes_tutor import router as tutor_router
from app.api.routes_mastery import router as mastery_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Interactive AI Model Engineering Mastery Platform API"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(curriculum_router, prefix="/api")
app.include_router(execution_router, prefix="/api")
app.include_router(labs_router, prefix="/api")
app.include_router(tutor_router, prefix="/api")
app.include_router(mastery_router, prefix="/api")

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
