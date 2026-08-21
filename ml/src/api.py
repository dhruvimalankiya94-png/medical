"""
FastAPI Server for Diabetes Risk Prediction ML Module.

Endpoints:
- POST /predict/diabetes : Evaluates patient health metrics via trained Random Forest model
- GET  /health           : Health check endpoint
- GET  /model-info       : Displays model metadata and evaluation statistics
"""

import os
import sys
import json

# Ensure ml/src is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field, ConfigDict

from predict import get_predictor, MEDICAL_DISCLAIMER

app = FastAPI(
    title="Smart Healthcare Analytics - Diabetes ML API",
    description="Educational Machine Learning API for Diabetes Risk Prediction using Random Forest trained on the Pima Indians Dataset.",
    version="1.0.0"
)

# Enable CORS for local integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DiabetesPredictionRequest(BaseModel):
    model_config = ConfigDict(json_schema_extra={
        "examples": [{
            "pregnancies": 2,
            "glucose": 138.0,
            "blood_pressure": 72.0,
            "skin_thickness": 35.0,
            "insulin": 160.0,
            "bmi": 33.6,
            "diabetes_pedigree_function": 0.627,
            "age": 47
        }]
    })

    pregnancies: int = Field(default=1, ge=0, description="Number of times pregnant")
    glucose: float = Field(default=120.0, gt=0, description="Plasma glucose concentration (mg/dL)")
    blood_pressure: float = Field(default=70.0, ge=0, description="Diastolic blood pressure (mm Hg)")
    skin_thickness: float = Field(default=20.0, ge=0, description="Triceps skin fold thickness (mm)")
    insulin: float = Field(default=79.0, ge=0, description="2-Hour serum insulin (mu U/ml)")
    bmi: float = Field(default=25.0, gt=0, description="Body mass index (weight in kg/(height in m)^2)")
    diabetes_pedigree_function: float = Field(default=0.47, gt=0, description="Diabetes pedigree function (genetic score)")
    age: int = Field(default=33, gt=0, description="Age in years")


@app.get("/")
def read_root():
    return {
        "service": "Smart Healthcare Analytics ML Engine",
        "module": "Diabetes Risk Prediction",
        "algorithm": "Random Forest Classifier",
        "status": "online",
        "endpoints": {
            "predict": "POST /predict/diabetes",
            "health": "GET /health",
            "model_info": "GET /model-info"
        },
        "disclaimer": MEDICAL_DISCLAIMER
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "diabetes-ml-api"}


@app.get("/favicon.ico")
def favicon():
    return Response(content=b"", media_type="image/x-icon")


@app.get("/model-info")
def get_model_info():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    report_path = os.path.join(base_dir, 'models', 'evaluation_report.json')

    if os.path.exists(report_path):
        with open(report_path, 'r') as f:
            return json.load(f)

    return {
        "model_type": "RandomForestClassifier",
        "dataset": "Pima Indians Diabetes Dataset",
        "status": "trained"
    }


@app.post("/predict/diabetes", status_code=status.HTTP_200_OK)
def predict_diabetes(payload: DiabetesPredictionRequest):
    try:
        predictor = get_predictor()

        patient_dict = {
            'Pregnancies': payload.pregnancies,
            'Glucose': payload.glucose,
            'BloodPressure': payload.blood_pressure,
            'SkinThickness': payload.skin_thickness,
            'Insulin': payload.insulin,
            'BMI': payload.bmi,
            'DiabetesPedigreeFunction': payload.diabetes_pedigree_function,
            'Age': payload.age
        }

        result = predictor.predict(patient_dict)
        return result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction engine error: {str(e)}"
        )


if __name__ == '__main__':
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
