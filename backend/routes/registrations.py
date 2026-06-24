from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime, timezone

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

# In-memory storage for registrations
_registrations_db = []
_current_id = 1

@router.post("/", response_model=RegistrationOut, status_code=201)
def create_registration(data: RegistrationCreate):
    global _current_id
    
    # Check if email already registered
    if any(r.email == data.email for r in _registrations_db):
        raise HTTPException(status_code=400, detail="Email already registered.")

    reg_data = data.model_dump()
    reg_data["id"] = _current_id
    reg_data["registered_at"] = datetime.now(timezone.utc)
    
    # Create object for storage
    class InMemoryReg:
        def __init__(self, **entries):
            self.__dict__.update(entries)
            
    reg = InMemoryReg(**reg_data)
    _registrations_db.append(reg)
    _current_id += 1

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
def list_registrations(skip: int = 0, limit: int = 100):
    regs = _registrations_db[skip : skip + limit]
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
def get_stats():
    total = len(_registrations_db)
    colleges = len(set(r.college for r in _registrations_db))
    tracks = {}
    for track in ["AI/ML", "Web3", "Social Impact", "FinTech"]:
        count = sum(1 for r in _registrations_db if r.track == track)
        tracks[track] = count
    return {"total_registrations": total, "colleges_represented": colleges, "by_track": tracks}
