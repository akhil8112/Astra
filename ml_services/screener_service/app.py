import pandas as pd
import joblib
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
from sqlalchemy import create_engine, Table, Column, Integer, String, MetaData

# --- FastAPI App Initialization ---
app = FastAPI(title="DDS Screener ML Service")

# ----------------- DATABASE CONFIG (SQLite) -----------------
DATABASE_FILE = "autism_db.sqlite"
engine = create_engine(f"sqlite:///{DATABASE_FILE}")
metadata = MetaData()

# Table definition for logging predictions
autism_predictions = Table(
    'autism_predictions', metadata,
    Column('id', Integer, primary_key=True, autoincrement=True),
    Column('name', String),
    Column('age', Integer),
    Column('sex', String),
    Column('ethnicity', String),
    Column('score', Integer),
    Column('label', String)
)
metadata.create_all(engine)

# ----------------- MODEL LOAD -----------------
MODEL_FILE = "autism_model.pkl"
FEATURES_FILE = "autism_features.pkl"

model = None
feature_columns = None
model_loaded = False

if os.path.exists(MODEL_FILE) and os.path.exists(FEATURES_FILE):
    try:
        model = joblib.load(MODEL_FILE)
        feature_columns = joblib.load(FEATURES_FILE)
        model_loaded = True
        print("ML model and features loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print(f"Warning: '{MODEL_FILE}' or '{FEATURES_FILE}' not found. Service will use fallback rules.")

# ----------------- PREDICTION LOGIC -----------------
def predict_with_model(age: int, sex: str, a_values: List[int], ethnicity: str, jaundice: bool, family_asd: bool):
    """Creates a DataFrame from input and gets a prediction from the loaded model."""
    df_dict = {
        "Age": [age],
        "Sex_m": [1 if sex.lower() == "male" else 0],
        "Jauundice_yes": [1 if jaundice else 0],
        "Family_ASD_yes": [1 if family_asd else 0]
    }
    
    for i, v in enumerate(a_values, start=1):
        df_dict[f"A{i}"] = [v]

    df = pd.DataFrame(df_dict)

    # One-hot encode ethnicity to match training data
    ethnicity_lower = ethnicity.lower()
    for col in ["Ethnicity_Asian", "Ethnicity_Black", "Ethnicity_Hispanic",
                "Ethnicity_Latino", "Ethnicity_Middle Eastern", "Ethnicity_White-European"]:
        df[col] = 0
    
    if 'asian' in ethnicity_lower: df['Ethnicity_Asian'] = 1
    elif 'black' in ethnicity_lower: df['Ethnicity_Black'] = 1
    elif 'hispanic' in ethnicity_lower: df['Ethnicity_Hispanic'] = 1
    elif 'latino' in ethnicity_lower: df['Ethnicity_Latino'] = 1
    elif 'middle eastern' in ethnicity_lower: df['Ethnicity_Middle Eastern'] = 1
    elif 'white' in ethnicity_lower or 'caucasian' in ethnicity_lower: df['Ethnicity_White-European'] = 1

    # Reindex to ensure column order and presence matches the model's training data exactly
    df = df.reindex(columns=feature_columns, fill_value=0)
    
    # Return the probability of the positive class (usually class '1')
    probability = model.predict_proba(df)[0][1]
    return probability

def rule_based_predict(a_values: List[int]):
    """Fallback prediction logic if the ML model fails or is not loaded."""
    score = sum(a_values)
    if score <= 3:
        return "Low Risk", score
    elif score <= 6:
        return "Medium Risk", score
    else:
        return "High Risk", score

def predict_autism(age: int, sex: str, a_values: List[int], ethnicity: str, name: str, jaundice: bool, family_asd: bool):
    """Orchestrates the prediction, using the ML model if available, otherwise falling back to rules."""
    score = sum(a_values)
    probability = None
    label = "Error"

    if model_loaded:
        try:
            probability = predict_with_model(age, sex, a_values, ethnicity, jaundice, family_asd)
            if probability < 0.33:
                label = "Low Risk"
            elif probability < 0.66:
                label = "Medium Risk"
            else:
                label = "High Risk"
        except Exception as e:
            print(f"Model prediction failed, falling back to rules. Error: {e}")
            label, score = rule_based_predict(a_values)
    else:
        label, score = rule_based_predict(a_values)

    result = {
        "name": name, "label": label, "score": score,
        "probability": probability, "age": age, "sex": sex,
        "ethnicity": ethnicity, "answers": a_values
    }

    try:
        with engine.connect() as conn:
            stmt = autism_predictions.insert().values(
                name=name, age=age, sex=sex, ethnicity=ethnicity,
                score=score, label=label
            )
            conn.execute(stmt)
            conn.commit()
    except Exception as e:
        print(f"Database save error: {e}")
        
    return result

# --- Pydantic Schemas for API Data Validation ---
class ScreenerRequest(BaseModel):
    name: str = "Unknown"
    age: int
    sex: str = "Male"
    ethnicity: str = "Others"
    jaundice: bool
    family_asd: bool
    answers: List[int] = Field(..., min_length=10, max_length=10)

class ScreenerResponse(BaseModel):
    name: str
    label: str
    score: int
    probability: float | None
    age: int
    sex: str
    ethnicity: str
    answers: List[int]

# --- API ROUTE (FastAPI syntax) ---
@app.post("/predict", response_model=ScreenerResponse)
def predict_api(request_data: ScreenerRequest):
    """Receives screener data, runs the prediction model, and returns the result."""
    try:
        result = predict_autism(
            age=request_data.age,
            sex=request_data.sex,
            a_values=request_data.answers,
            ethnicity=request_data.ethnicity,
            name=request_data.name,
            jaundice=request_data.jaundice,
            family_asd=request_data.family_asd
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during prediction: {e}")

@app.get("/")
def read_root():
    return {"status": "DDS Screener ML Service is running"}