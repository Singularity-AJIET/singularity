from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routes import registrations, events, faq

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Singularity Hack API",
    description="Backend API for the Singularity Hack hackathon platform",
    version="1.0.0",
)

# CORS — allow Next.js dev server and production domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://singularityhack.com",  # update when deployed
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(registrations.router)
app.include_router(events.router)
app.include_router(faq.router)


@app.get("/")
def health_check():
    return {
        "status": "operational",
        "message": "Singularity Hack API is live.",
        "docs": "/docs",
    }
