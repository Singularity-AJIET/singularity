# Singularity

A full-stack landing page and event management system for inter-college participation.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Vanilla CSS Modules
- **Typography**: Space Grotesk + JetBrains Mono

### Backend
- **Framework**: Node.js (Express & TypeScript)
- **Database**: LibSQL via Prisma ORM
- **Architecture**: REST API

## Project Structure

```
singularity/
├── frontend/     ← Next.js 14 Application
│   ├── src/app/
│   │   ├── (landing)       ← Main event landing page
│   │   └── nexus/          ← Admin/Scanner portal routes
│   └── src/components/     ← Landing page & shared UI components
└── backend/      ← Node.js Express Server
    ├── src/routes/         ← API endpoints
    ├── prisma/             ← Database schema and migrations
    └── src/index.ts        ← Server entrypoint
```

## Running Locally

### Backend
```bash
cd backend
npm install
npm run dev
```
API runs on the configured port.

### Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
Site available at: `http://localhost:3000`

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/status` | Health & uptime check |
| `GET/POST` | `/api/participants/*` | Manage event participants & staff |
| `GET/POST` | `/api/counters/*` | Manage counters & real-time SSE updates |
| `POST` | `/api/claims` | QR Code scanner claims |
| `GET` | `/api/claims/report` | View generated claims data |
| `POST` | `/api/scan/batch` | Offline scan batch sync |
| `GET/POST` | `/api/admin/*` | Authentication & admin management |

## Pages

### Landing Page
- `/` — Full landing page containing sections for Hero, About, Tracks, Schedule, Prizes, Teams, Sponsors, Coordinators, and FAQ.

### Nexus (Admin/Scanner Portal)
- `/nexus/login` — Admin authentication
- `/nexus/scanner` — QR Code scanner
- `/nexus/claims` — Claims dashboard
- `/nexus/registration` — Participant registration
- `/nexus/settings` — Admin settings

## Customization
- Landing page contents can be modified in `frontend/src/components/`.
- Event data and admin portal behavior are handled by the backend REST API.
