from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["event"])

EVENT_INFO = {
    "name": "SINGULARITY HACK",
    "tagline": "",
    "edition": "2026",
    "dates": {
        "start": "2026-08-15",
        "end": "2026-08-17",
        "registration_deadline": "2026-08-10",
    },
    "venue": "TBD — Announced on Registration",
    "duration_hours": 36,
    "max_team_size": 4,
    "tracks": [
        {
            "id": "aiml",
            "name": "AI / ML",
            "icon": "🤖",
            "description": "Build intelligent systems — from LLM-powered apps to computer vision and predictive analytics.",
            "color": "#c8f135",
        },
        {
            "id": "web3",
            "name": "Web3",
            "icon": "⛓️",
            "description": "Decentralized apps, smart contracts, DAOs, and the future of trustless systems.",
            "color": "#ff2d6f",
        },
        {
            "id": "social",
            "name": "Social Impact",
            "icon": "🌍",
            "description": "Tech for good — solutions tackling climate, healthcare, education, and accessibility.",
            "color": "#ffb830",
        },
        {
            "id": "fintech",
            "name": "FinTech",
            "icon": "💸",
            "description": "Reimagine finance — payments, lending, wealth management, and financial inclusion.",
            "color": "#a78bfa",
        },
    ],
    "prizes": [
        {"rank": "Grand Prize", "amount": "₹50,000", "perks": ["Trophy", "Mentorship Sessions", "Industry Exposure"]},
        {"rank": "1st Runner-Up", "amount": "₹25,000", "perks": ["Certificate", "Swag Pack"]},
        {"rank": "2nd Runner-Up", "amount": "₹15,000", "perks": ["Certificate", "Swag Pack"]},
        {"rank": "Best Social Impact", "amount": "₹5,000", "perks": ["Special Trophy"]},
        {"rank": "Best Rookie Team", "amount": "₹5,000", "perks": ["Mentorship Access"]},
    ],
    "schedule": [
        {"day": "Day 1", "date": "Aug 15", "events": [
            {"time": "09:00 AM", "title": "Participant Check-In & Networking"},
            {"time": "11:00 AM", "title": "Opening Ceremony & Keynote"},
            {"time": "12:00 PM", "title": "Hacking Begins"},
            {"time": "06:00 PM", "title": "Workshop: AI APIs for Hackers"},
            {"time": "09:00 PM", "title": "Midnight Snack & Progress Check"},
        ]},
        {"day": "Day 2", "date": "Aug 16", "events": [
            {"time": "09:00 AM", "title": "Mentor Sessions Begin"},
            {"time": "12:00 PM", "title": "Workshop: Pitch Perfect — How to Present"},
            {"time": "06:00 PM", "title": "Fun Activity & Networking Hour"},
            {"time": "11:00 PM", "title": "Submission Reminder — T-1 Hour"},
        ]},
        {"day": "Day 3", "date": "Aug 17", "events": [
            {"time": "12:00 AM", "title": "Submission Deadline"},
            {"time": "10:00 AM", "title": "Project Presentations Begin"},
            {"time": "02:00 PM", "title": "Judge Deliberations"},
            {"time": "04:00 PM", "title": "Awards Ceremony & Closing"},
        ]},
    ],
}


@router.get("/event-info")
def get_event_info():
    return EVENT_INFO


@router.get("/tracks")
def get_tracks():
    return EVENT_INFO["tracks"]


@router.get("/prizes")
def get_prizes():
    return EVENT_INFO["prizes"]


@router.get("/schedule")
def get_schedule():
    return EVENT_INFO["schedule"]
