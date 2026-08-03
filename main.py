from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import joblib
import pandas as pd
import os

import database
import models
import schemas
import auth

# Initialize DB
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Advanced Medical Disease Prediction Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])

# Load Model and Scaler
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'ml', 'rf_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'ml', 'scaler.pkl')

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
except Exception as e:
    print("Warning: Model or Scaler not found.")
    model = None
    scaler = None

DISEASE_MAP = {
    0: "Healthy",
    1: "Flu",
    2: "Heart Disease Risk",
    3: "Diabetes"
}

@app.post("/predict", response_model=schemas.PredictionResponse)
def predict_disease(data: schemas.PredictionCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if model is None or scaler is None:
        raise HTTPException(status_code=500, detail="Model not loaded.")
    
    input_data = pd.DataFrame([data.dict()])
    input_scaled = scaler.transform(input_data)
    
    prediction_idx = model.predict(input_scaled)[0]
    probabilities = model.predict_proba(input_scaled)[0]
    confidence = float(probabilities[prediction_idx])
    
    predicted_disease = DISEASE_MAP.get(int(prediction_idx), "Unknown")
    
    # Save to history
    symptoms = ",".join([k for k, v in data.dict().items() if k in ['fever', 'cough', 'headache', 'body_pain', 'chest_pain', 'frequent_urination'] and v == 1])
    
    history = models.PredictionHistory(
        user_id=current_user.id,
        age=data.age,
        blood_pressure=data.blood_pressure,
        bmi=data.bmi,
        symptoms=symptoms,
        predicted_disease=predicted_disease,
        confidence=confidence
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    
    return history

@app.get("/history", response_model=list[schemas.PredictionResponse])
def get_history(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    history = db.query(models.PredictionHistory).filter(models.PredictionHistory.user_id == current_user.id).order_by(models.PredictionHistory.timestamp.desc()).all()
    return history
