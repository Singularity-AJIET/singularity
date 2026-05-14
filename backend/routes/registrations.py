from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
import models
from database import get_db

router = APIRouter(prefix="/api/registrations", tags=["registrations"])


class RegistrationCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    college: str
    year_of_study: str
    team_name: Optional[str] = None
    team_size: int = 1
    is_team_lead: bool = True
    team_lead_email: Optional[EmailStr] = None
    track: str
    experience_level: str
    project_idea: Optional[str] = None


class RegistrationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    college: str
    track: str
    team_name: Optional[str]
    registered_at: str


@router.post("/", response_model=RegistrationOut, status_code=201)
def create_registration(data: RegistrationCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Registration).filter(
        models.Registration.email == data.email
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    reg = models.Registration(**data.model_dump())
    db.add(reg)
    db.commit()
    db.refresh(reg)

    return RegistrationOut(
        id=reg.id,
        full_name=reg.full_name,
        email=reg.email,
        college=reg.college,
        track=reg.track,
        team_name=reg.team_name,
        registered_at=reg.registered_at.isoformat(),
    )


@router.get("/", response_model=list[RegistrationOut])
def list_registrations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    regs = db.query(models.Registration).offset(skip).limit(limit).all()
    return [
        RegistrationOut(
            id=r.id,
            full_name=r.full_name,
            email=r.email,
            college=r.college,
            track=r.track,
            team_name=r.team_name,
            registered_at=r.registered_at.isoformat(),
        )
        for r in regs
    ]


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(models.Registration).count()
    colleges = db.query(models.Registration.college).distinct().count()
    tracks = {}
    for track in ["AI/ML", "Web3", "Social Impact", "FinTech"]:
        count = db.query(models.Registration).filter(
            models.Registration.track == track
        ).count()
        tracks[track] = count
    return {"total_registrations": total, "colleges_represented": colleges, "by_track": tracks}
