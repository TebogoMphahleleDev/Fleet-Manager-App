from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel

DATABASE_URL = "sqlite:///./fleet_manager.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    # Add more fields as needed, e.g., model, year, etc.

class Driver(Base):
    __tablename__ = "drivers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    vehicle_id = Column(Integer, nullable=True)

Base.metadata.create_all(bind=engine)

# Pydantic models
class VehicleCreate(BaseModel):
    name: str

class VehicleUpdate(BaseModel):
    name: str

class DriverCreate(BaseModel):
    name: str
    vehicle_id: Optional[int] = None

class DriverUpdate(BaseModel):
    name: str
    vehicle_id: Optional[int] = None

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
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
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
