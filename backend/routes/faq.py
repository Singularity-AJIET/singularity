from fastapi import APIRouter

router = APIRouter(prefix="/api/faq", tags=["faq"])

FAQS = [
    {
        "id": 1,
        "question": "Who can participate in Singularity Hack?",
        "answer": "Any currently enrolled undergraduate or postgraduate student from any college across India. Students from any discipline are welcome — not just CS/IT!",
    },
    {
        "id": 2,
        "question": "Is it free to participate?",
        "answer": "Yes! Singularity Hack is completely free to enter. There are no registration fees whatsoever.",
    },
    {
        "id": 3,
        "question": "How big can a team be?",
        "answer": "Teams can have 2 to 4 members. Solo participants are also welcome, though we encourage team collaboration.",
    },
    {
        "id": 4,
        "question": "Can I participate with students from other colleges?",
        "answer": "Absolutely! Cross-college teams are not only allowed but encouraged. Bring your A-team from wherever they are.",
    },
    {
        "id": 5,
        "question": "What should I build?",
        "answer": "You'll build a working prototype that solves a real-world problem within your chosen track (AI/ML, Web3, Social Impact, or FinTech). Creativity and impact matter most.",
    },
    {
        "id": 6,
        "question": "Do I need to know how to code?",
        "answer": "Coding skills are needed to build the prototype, but we welcome designers, product thinkers, and business strategists as part of the team.",
    },
    {
        "id": 7,
        "question": "Will food and accommodation be provided?",
        "answer": "Yes! All registered on-site participants will have access to meals and refreshments throughout the 36-hour event. Accommodation details will be shared closer to the event.",
    },
    {
        "id": 8,
        "question": "What do I need to bring?",
        "answer": "Your laptop, charger, valid college ID, and your passion to build. Everything else (Wi-Fi, power strips, snacks) is provided.",
    },
    {
        "id": 9,
        "question": "How are projects judged?",
        "answer": "Projects are evaluated on Innovation (30%), Technical Complexity (25%), Impact & Feasibility (25%), and Presentation (20%) by a panel of industry experts.",
    },
    {
        "id": 10,
        "question": "When is the registration deadline?",
        "answer": "Registration closes on August 10, 2026. Register early — spots are limited!",
    },
]


@router.get("/")
def get_faq():
    return FAQS
