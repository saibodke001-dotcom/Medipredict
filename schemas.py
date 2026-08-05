from pydantic import BaseModel
from typing import Optional, List
import datetime

class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class PredictionCreate(BaseModel):
    age: int
    gender: int
    fever: int
    cough: int
    headache: int
    body_pain: int
    chest_pain: int
    frequent_urination: int
    blood_pressure: int
    blood_sugar: int
    heart_rate: int
    bmi: float

class PredictionResponse(BaseModel):
    id: int
    predicted_disease: str
    confidence: float
    timestamp: datetime.datetime
    class Config:
        from_attributes = True
