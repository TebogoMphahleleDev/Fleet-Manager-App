from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Date, func, extract
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import text
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel

# Database configuration
DATABASE_URL = "sqlite:///./fleet_manager.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# SQLAlchemy Models

class User(Base):
    """
    SQLAlchemy model for User.

    Represents a user in the database with email and hashed password.
    """
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

from sqlalchemy import Date

class Vehicle(Base):
    """
    SQLAlchemy model for Vehicle.

    Represents a vehicle with details like name, model, make, etc.
    """
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    model = Column(String, nullable=True)
    make = Column(String, nullable=True)
    color = Column(String, nullable=True)
    registration_number = Column(String, nullable=True)
    license_expiry_date = Column(Date, nullable=True)
    year_of_car = Column(Integer, nullable=True)

class Driver(Base):
    """
    SQLAlchemy model for Driver.

    Represents a driver with personal and vehicle assignment details.
    """
    __tablename__ = "drivers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    vehicle_id = Column(Integer, nullable=True)
    number_of_experience = Column(Integer, nullable=True)
    license_number = Column(String, nullable=True)
    contact_info = Column(String, nullable=True)

class Trip(Base):
    """
    SQLAlchemy model for Trip.

    Represents a trip with driver, vehicle, locations, and times.
    """
    __tablename__ = "trips"
    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, nullable=False)
    vehicle_id = Column(Integer, nullable=False)
    start_location = Column(String, nullable=False)
    end_location = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)

class Maintenance(Base):
    """
    SQLAlchemy model for Maintenance records.

    Represents maintenance activities with costs and dates.
    """
    __tablename__ = "maintenance"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, nullable=False)
    description = Column(String, nullable=False)
    cost = Column(Float, nullable=False)
    maintenance_date = Column(Date, nullable=False)
    next_maintenance_date = Column(Date, nullable=True)

Base.metadata.create_all(bind=engine)

# Pydantic models

class UserCreate(BaseModel):
    """
    Pydantic model for user creation.

    Used for registering new users with email and password.
    """
    email: str
    password: str

from typing import Optional
from datetime import date

class VehicleCreate(BaseModel):
    """
    Pydantic model for creating a new vehicle.

    Contains optional fields for vehicle details.
    """
    name: str
    model: Optional[str] = None
    make: Optional[str] = None
    color: Optional[str] = None
    registration_number: Optional[str] = None
    license_expiry_date: Optional[date] = None
    year_of_car: Optional[int] = None

class VehicleUpdate(BaseModel):
    """
    Pydantic model for updating an existing vehicle.

    Contains optional fields for vehicle details.
    """
    name: str
    model: Optional[str] = None
    make: Optional[str] = None
    color: Optional[str] = None
    registration_number: Optional[str] = None
    license_expiry_date: Optional[date] = None
    year_of_car: Optional[int] = None

class DriverCreate(BaseModel):
    """
    Pydantic model for creating a new driver.

    Contains optional fields for driver details.
    """
    name: str
    vehicle_id: Optional[int] = None
    number_of_experience: Optional[int] = None
    license_number: Optional[str] = None
    contact_info: Optional[str] = None

class DriverUpdate(BaseModel):
    """
    Pydantic model for updating an existing driver.

    Contains optional fields for driver details.
    """
    name: str
    vehicle_id: Optional[int] = None
    number_of_experience: Optional[int] = None
    license_number: Optional[str] = None
    contact_info: Optional[str] = None

class TripCreate(BaseModel):
    """
    Pydantic model for creating a new trip.

    Contains required fields for trip details.
    """
    driver_id: int
    vehicle_id: int
    start_location: str
    end_location: str
    start_time: datetime
    end_time: datetime

from typing import List

class TripSchema(BaseModel):
    """
    Pydantic model for trip response.

    Used for serializing trip data from the database.
    """
    id: int
    driver_id: int
    vehicle_id: int
    start_location: str
    end_location: str
    start_time: datetime
    end_time: datetime

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    """
    Pydantic model for dashboard statistics.
    """

    total_vehicles: int
    total_drivers: int
    total_trips: int
    trips_this_month: int
    maintenance_costs: float

class MonthlyTripData(BaseModel):    
    """
    Pydantic model for monthly trip data.
    """
    month: str
    trip_count: int

    
class MaintenanceCostData(BaseModel):
    """
    Pydantic model for maintenance cost data.
    """
    month: str
    cost: float

class DashboardSummary(BaseModel):
    """
    Pydantic model for complete dashboard summary.
    """
    stats: DashboardStats
    monthly_trips: List[MonthlyTripData]
    maintenance_costs: List[MaintenanceCostData]    

class MaintenanceCreate(BaseModel):
    vehicle_id: int
    description: str
    cost: float
    maintenance_date: date
    next_maintenance_date: Optional[date] = None

class MaintenanceSchema(BaseModel):
    id: int
    vehicle_id: int
    description: str
    cost: float
    maintenance_date: date
    next_maintenance_date: Optional[date] = None

    class Config:
        from_attributes = True
# Security
SECRET_KEY = "your_secret_key_here_change_this"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI(title="Fleet Manager API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def verify_password(plain_password, hashed_password):
    """
    Verifies a plain password against a hashed password.

    Args:
        plain_password (str): The plain text password.
        hashed_password (str): The hashed password.

    Returns:
        bool: True if passwords match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """
    Hashes a plain password using bcrypt.

    Args:
        password (str): The plain text password.

    Returns:
        str: The hashed password.
    """
    return pwd_context.hash(password)

def get_user(db: Session, email: str):
    """
    Retrieves a user from the database by email.

    Args:
        db (Session): The database session.
        email (str): The email to search for.

    Returns:
        User or None: The user object if found, None otherwise.
    """
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, email: str, password: str):
    """
    Authenticates a user by email and password.

    Args:
        db (Session): The database session.
        email (str): The email.
        password (str): The password.

    Returns:
        User or False: The user object if authenticated, False otherwise.
    """
    user = get_user(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Creates a JWT access token.

    Args:
        data (dict): The data to encode in the token.
        expires_delta (Optional[timedelta]): The expiration time delta.

    Returns:
        str: The encoded JWT token.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_db():
    """
    Dependency to get a database session.

    Yields:
        Session: The database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# User registration endpoint
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user.

    Args:
        user (UserCreate): The user data for registration.
        db (Session): The database session.

    Returns:
        dict: A message indicating successful registration.

    Raises:
        HTTPException: If the email is already registered.
    """
    db_user = get_user(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

# Login endpoint
@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Logs in a user and returns an access token.

    Args:
        form_data (OAuth2PasswordRequestForm): The login form data.
        db (Session): The database session.

    Returns:
        dict: The access token and token type.

    Raises:
        HTTPException: If authentication fails.
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/")
def read_root():
    """
    Root endpoint.

    Returns:
        dict: A welcome message.
    """
    return {"message": "Welcome to Fleet Manager API"}

@app.get("/vehicles")
def get_vehicles(db: Session = Depends(get_db)):
    vehicles = db.query(Vehicle).all()
    return vehicles

@app.post("/vehicles")
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    db_vehicle = Vehicle(name=vehicle.name)
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

@app.put("/vehicles/{vehicle_id}")
def update_vehicle(vehicle_id: int, vehicle: VehicleUpdate, db: Session = Depends(get_db)):
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db_vehicle.name = vehicle.name
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

@app.delete("/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(db_vehicle)
    db.commit()
    return {"detail": "Vehicle deleted"}

@app.get("/drivers")
def get_drivers(db: Session = Depends(get_db)):
    drivers = db.query(Driver).all()
    return drivers

@app.post("/drivers")
def create_driver(driver: DriverCreate, db: Session = Depends(get_db)):
    db_driver = Driver(name=driver.name, vehicle_id=driver.vehicle_id)
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    return db_driver

@app.put("/drivers/{driver_id}")
def update_driver(driver_id: int, driver: DriverUpdate, db: Session = Depends(get_db)):
    db_driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not db_driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    db_driver.name = driver.name
    db_driver.vehicle_id = driver.vehicle_id
    db.commit()
    db.refresh(db_driver)
    return db_driver

@app.delete("/drivers/{driver_id}")
def delete_driver(driver_id: int, db: Session = Depends(get_db)):
    db_driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not db_driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    db.delete(db_driver)
    db.commit()
    return {"detail": "Driver deleted"}

@app.get("/trips", response_model=List[TripSchema])
def get_trips(db: Session = Depends(get_db)):
    trips = db.query(Trip).all()
    return trips

@app.post("/trips")
def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    # Check for double-booking
    existing_trip = db.query(Trip).filter(
        ((Trip.driver_id == trip.driver_id) | (Trip.vehicle_id == trip.vehicle_id)),
        Trip.start_time < trip.end_time,
        Trip.end_time > trip.start_time
    ).first()
    if existing_trip:
        raise HTTPException(status_code=400, detail="Driver or vehicle is already booked for this time period")

    db_trip = Trip(
        driver_id=trip.driver_id,
        vehicle_id=trip.vehicle_id,
        start_location=trip.start_location,
        end_location=trip.end_location,
        start_time=trip.start_time,
        end_time=trip.end_time
    )
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

# Dashboard endpoints
@app.get("/stats/summary", response_model=DashboardStats)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Get dashboard summary statistics including counts and monthly data.
    """
    # Total Counts
    total_vehicles = db.query(func.count(Vehicle.id)).scalar() or 0
    total_drivers = db.query(func.count(Driver.id)).scalar() or 0
    total_trips = db.query(func.count(Trip.id)).scalar() or 0

    # Trips this month (current month)
    current_month = datetime.now().month
    current_year = datetime.now().year
    trips_this_month = db.query(func.count(Trip.id)).filter(
        extract('month', Trip.start_time) == current_month,
        extract('year', Trip.start_time) == current_year
    ).scalar() or 0

    # Total maintenance costs (from last 12 months)
    one_year_ago = datetime.now() - timedelta(days=365)
    maintenance_costs = db.query(func.coalesce(func.sum(Maintenance.cost), 0)).filter(
        Maintenance.maintenance_date >= one_year_ago
    ).scalar() or 0.0

    return DashboardStats(
        total_vehicles=total_vehicles,
        total_drivers=total_drivers,
        total_trips=total_trips,
        trips_this_month=trips_this_month,
        maintenance_costs=maintenance_costs
    )
@app.get("/stats/monthly-trips", response_model=List[MonthlyTripData])
def get_monthly_trips(db: Session = Depends(get_db)):
    """
    Get monthly trip counts for the last 12 months.
    """
    # Calculate date 12 months ago
    twelve_months_ago = datetime.now() - timedelta(days=365)
    
    # Query for monthly trip counts
    monthly_trips = db.query(
        func.strftime('%Y-%m', Trip.start_time).label('month'),
        func.count(Trip.id).label('trip_count')
    ).filter(
        Trip.start_time >= twelve_months_ago
    ).group_by(
        func.strftime('%Y-%m', Trip.start_time)
    ).order_by(
        func.strftime('%Y-%m', Trip.start_time)
    ).all()
    
    # Format the response
    result = []
    for month_data in monthly_trips:
        result.append(MonthlyTripData(
            month=month_data.month,
            trip_count=month_data.trip_count
        ))
    
    return result

@app.get("/stats/maintenance-costs", response_model=List[MaintenanceCostData])
def get_maintenance_costs(db: Session = Depends(get_db)):
    """
    Get monthly maintenance costs for the last 12 months.
    """
    # Calculate date 12 months ago
    twelve_months_ago = datetime.now() - timedelta(days=365)
    
    # Query for monthly maintenance costs
    monthly_costs = db.query(
        func.strftime('%Y-%m', Maintenance.maintenance_date).label('month'),
        func.coalesce(func.sum(Maintenance.cost), 0).label('total_cost')
    ).filter(
        Maintenance.maintenance_date >= twelve_months_ago
    ).group_by(
        func.strftime('%Y-%m', Maintenance.maintenance_date)
    ).order_by(
        func.strftime('%Y-%m', Maintenance.maintenance_date)
    ).all()
    
    # Format the response
    result = []
    for cost_data in monthly_costs:
        result.append(MaintenanceCostData(
            month=cost_data.month,
            cost=cost_data.total_cost or 0.0
        ))
    
    return result

@app.get("/stats/dashboard", response_model=DashboardSummary)
def get_complete_dashboard(db: Session = Depends(get_db)):
    """
    Get complete dashboard data including all statistics and charts data.
    """
    stats = get_dashboard_summary(db)
    monthly_trips = get_monthly_trips(db)
    maintenance_costs = get_maintenance_costs(db)
    
    return DashboardSummary(
        stats=stats,
        monthly_trips=monthly_trips,
        maintenance_costs=maintenance_costs
    )

# Maintenance endpoints (for managing maintenance records)
@app.get("/maintenance", response_model=List[MaintenanceSchema])
def get_maintenance_records(db: Session = Depends(get_db)):
    """
    Get all maintenance records.
    """
    return db.query(Maintenance).all()

@app.post("/maintenance", response_model=MaintenanceSchema)
def create_maintenance_record(maintenance: MaintenanceCreate, db: Session = Depends(get_db)):
    """
    Create a new maintenance record.
    """
    db_maintenance = Maintenance(
        vehicle_id=maintenance.vehicle_id,
        description=maintenance.description,
        cost=maintenance.cost,
        maintenance_date=maintenance.maintenance_date,
        next_maintenance_date=maintenance.next_maintenance_date
    )
    db.add(db_maintenance)
    db.commit()
    db.refresh(db_maintenance)
    return db_maintenance

@app.get("/maintenance/vehicle/{vehicle_id}", response_model=List[MaintenanceSchema])
def get_maintenance_by_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """
    Get maintenance records for a specific vehicle.
    """
    return db.query(Maintenance).filter(Maintenance.vehicle_id == vehicle_id).all()