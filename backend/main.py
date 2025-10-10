from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
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

    Represents a user in the database with username and hashed password.
    """
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
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

Base.metadata.create_all(bind=engine)

# Pydantic models

class UserCreate(BaseModel):
    """
    Pydantic model for user creation.

    Used for registering new users with username and password.
    """
    username: str
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

def get_user(db: Session, username: str):
    """
    Retrieves a user from the database by username.

    Args:
        db (Session): The database session.
        username (str): The username to search for.

    Returns:
        User or None: The user object if found, None otherwise.
    """
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    """
    Authenticates a user by username and password.

    Args:
        db (Session): The database session.
        username (str): The username.
        password (str): The password.

    Returns:
        User or False: The user object if authenticated, False otherwise.
    """
    user = get_user(db, username)
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
        HTTPException: If the username is already registered.
    """
    db_user = get_user(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password)
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
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
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
