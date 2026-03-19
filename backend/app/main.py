from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from app.api import auth, users, dashboard, resources, forum , sensory_gym,screener
from app.core.database import create_db_and_tables, engine
from app.models.resource import Provider, Ngo,LibraryItem
# from app.api import auth, users, dashboard, resources, forum
def seed_data():
    with Session(engine) as session:
        # Check if providers exist
        if not session.exec(select(Provider)).first():
            print("Seeding Providers...")
            providers = [
                Provider(name="Dr. Anjali Sharma", type="Therapist", location="Mohali", description="Specializes in behavioral therapy.", specialties=["ABA Therapy", "Speech Pathology"]),
                Provider(name="Dr. Vikram Singh", type="Doctor", location="Chandigarh", description="Pediatric neurologist with 15 years of experience.", specialties=["Neurology", "Pediatrics"]),
            ]
            for p in providers:
                session.add(p)
        
        # Check if NGOs exist
        if not session.exec(select(Ngo)).first():
            print("Seeding NGOs...")
            ngos = [
                Ngo(name="Hope Autism Foundation", description="Early intervention programs.", position={"lat": 30.7333, "lng": 76.7794}),
                Ngo(name="Astra Support Center", description="Support services for families.", position={"lat": 30.7175, "lng": 76.7417}),
            ]
            for n in ngos:
                session.add(n)
        
        if not session.exec(select(LibraryItem)).first():
            print("Seeding Library Items...")
            items = [
                LibraryItem(title="Understanding Sensory Needs", type="Article", description="An in-depth look at sensory processing...", tags=["Sensory Issues", "Toddler (1-3)"]),
                LibraryItem(title="Guide to Social Stories", type="Guide", description="How to create effective social stories for your child.", tags=["Communication", "Preschool (3-5)"]),
                LibraryItem(title="Navigating School", type="Article", description="Tips for a successful transition into the school environment.", tags=["Social Skills", "Preschool (3-5)"]),
                LibraryItem(title="Managing Meltdowns", type="Guide", description="Strategies for understanding and managing meltdowns.", tags=["Behavior", "Toddler (1-3)"]),
            ]
            for item in items:
                session.add(item)
        
        session.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    create_db_and_tables()
    seed_data()
    yield
    print("Shutting down...")

app = FastAPI(title="Astra Project API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)



# Include all routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(resources.router, prefix="/api/v1")
app.include_router(forum.router, prefix="/api/v1")
# app.include_router(gym.router, prefix="/api/v1") 
app.include_router(sensory_gym.router, prefix="/api/v1", tags=["Sensory Gym"])
app.include_router(screener.router, prefix="/api/v1") 