from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import os

app = FastAPI(title="Medical Disease Prediction API")

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model and Scaler
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'ml', 'rf_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'ml', 'scaler.pkl')

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
except Exception as e:
    print("Warning: Model or Scaler not found. Run train.py first.")
    model = None
    scaler = None

# Define Input Schema
class PatientData(BaseModel):
    age: int
    gender: int # 0: Female, 1: Male
    fever: int # 0 or 1
    cough: int # 0 or 1
    headache: int # 0 or 1
    body_pain: int # 0 or 1
    chest_pain: int # 0 or 1
    frequent_urination: int # 0 or 1
    blood_pressure: int
    blood_sugar: int
    heart_rate: int
    bmi: float

DISEASE_MAP = {
    0: "Healthy",
    1: "Flu",
    2: "Heart Disease Risk",
    3: "Diabetes"
}

@app.get("/")
def read_root():
    return {"message": "Medical Disease Prediction API is running."}

@app.post("/predict")
def predict_disease(data: PatientData):
    if model is None or scaler is None:
        raise HTTPException(status_code=500, detail="Model not loaded. Train the model first.")
    
    # Convert input to DataFrame
    input_data = pd.DataFrame([data.dict()])
    
    # Preprocess / Scale
    input_scaled = scaler.transform(input_data)
    
    # Predict
    prediction_idx = model.predict(input_scaled)[0]
    
    # Get probabilities (confidence)
    probabilities = model.predict_proba(input_scaled)[0]
    confidence = float(probabilities[prediction_idx])
    
    return {
        "prediction_id": int(prediction_idx),
        "prediction_label": DISEASE_MAP.get(int(prediction_idx), "Unknown"),
        "confidence": confidence
    }
