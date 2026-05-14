# Singularity Hack — Hackathon Website

A full-stack hackathon website built for inter-college participation and registration.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), Vanilla CSS Modules, Space Grotesk + JetBrains Mono
- **Backend**: Python 3.12, FastAPI, SQLAlchemy, SQLite

## Project Structure
```
singularity/
├── frontend/     ← Next.js 14
└── backend/      ← FastAPI + SQLite
```

## Running Locally

### Backend (port 8000)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```
API docs available at: http://localhost:8000/docs

### Frontend (port 3000)
```bash
cd frontend
npm install
npm run dev
```
Site available at: http://localhost:3000

## API Endpoints
| Method | Path | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/api/registrations/` | Submit registration |
| GET | `/api/registrations/` | List all registrations |
| GET | `/api/registrations/stats` | Participant stats |
| GET | `/api/event-info` | Full event metadata |
| GET | `/api/tracks` | Hackathon tracks |
| GET | `/api/prizes` | Prize breakdown |
| GET | `/api/schedule` | Event schedule |
| GET | `/api/faq/` | FAQ items |

## Pages
- `/` — Full landing page (Hero, About, Tracks, Prizes, Schedule, Judges, FAQ, Sponsors, Footer)
- `/register` — 4-step registration form

## Customization
Update event details (name, date, prizes, tracks) in `backend/routes/events.py`
