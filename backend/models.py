from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from datetime import datetime, timezone
from database import Base


class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    # Personal Info
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False)
    college = Column(String, nullable=False)
    year_of_study = Column(String, nullable=False)
    # Team Info
    team_name = Column(String, nullable=True)
    team_size = Column(Integer, default=1)
    is_team_lead = Column(Boolean, default=True)
    team_lead_email = Column(String, nullable=True)
    # Hackathon preferences
    track = Column(String, nullable=False)
    experience_level = Column(String, nullable=False)  # beginner / intermediate / advanced
    project_idea = Column(Text, nullable=True)
    # Meta
    registered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_confirmed = Column(Boolean, default=False)
