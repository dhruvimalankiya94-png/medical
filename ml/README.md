# Diabetes Risk Prediction ML Module

This directory contains the machine learning pipeline and FastAPI serving engine for **Diabetes Risk Prediction**, developed as part of the **Smart Healthcare Analytics System**.

> [!IMPORTANT]
> **Medical Safety Disclaimer**: This machine learning model provides an educational/risk probability estimate only and is **NOT** a medical diagnostic tool. All outputs are intended strictly for academic demonstration and decision-support exploration.

---

## 📁 Directory Architecture

```
ml/
├── dataset/
│   └── diabetes.csv              # Official Pima Indians Diabetes Dataset (UCI / Kaggle)
├── notebooks/
│   └── exploration.ipynb         # Exploratory Data Analysis notebook
├── src/
│   ├── preprocess.py             # Zero-to-NaN transformer & Scikit-Learn pipeline
│   ├── train.py                  # Model training, baseline evaluation & Joblib exporter
│   ├── predict.py                # Standalone prediction engine & risk categorizer
│   └── api.py                    # FastAPI server exposing POST /predict/diabetes
├── models/
│   ├── diabetes_model.joblib     # Serialized pipeline (Imputer + Scaler + RandomForest)
│   └── evaluation_report.json    # JSON report containing evaluation metrics & feature importances
├── requirements.txt              # Python dependency manifest
└── README.md                     # Technical documentation
```

---

## 📊 Dataset & Features

**Dataset**: Pima Indians Diabetes Database (768 patient samples, 9 variables).

| Feature Column | Description | Data Type | Range / Implausible Zeros |
|---|---|---|---|
| `Pregnancies` | Number of times pregnant | Integer | `0 - 17` (Valid zero) |
| `Glucose` | Plasma glucose concentration (2 hours in oral glucose tolerance test) | Float | `0 - 199` (0 = Implausible/Missing) |
| `BloodPressure` | Diastolic blood pressure (mm Hg) | Float | `0 - 122` (0 = Implausible/Missing) |
| `SkinThickness` | Triceps skin fold thickness (mm) | Float | `0 - 99` (0 = Implausible/Missing) |
| `Insulin` | 2-Hour serum insulin (mu U/ml) | Float | `0 - 846` (0 = Implausible/Missing) |
| `BMI` | Body mass index (weight in kg/(height in m)^2) | Float | `0 - 67.1` (0 = Implausible/Missing) |
| `DiabetesPedigreeFunction` | Genetic risk pedigree score | Float | `0.078 - 2.42` |
| `Age` | Age in years | Integer | `21 - 81` |
| **`Outcome`** | **Target variable (0 = Non-Diabetic, 1 = Diabetic)** | **Binary** | **`0` or `1`** |

---

## 🛠️ Data Preprocessing & Leakage Prevention

1. **Invalid Zero Handling**:
   - `Glucose`, `BloodPressure`, `SkinThickness`, `Insulin`, and `BMI` cannot physically be `0` in living patients.
   - Values equal to `0` in these columns are converted to `np.nan`.
2. **Median Imputation & Standardization**:
   - `SimpleImputer(strategy='median')` is fitted strictly on the training set to prevent data leakage.
   - `StandardScaler()` standardizes input features to zero mean and unit variance.
3. **Scikit-Learn Pipeline**:
   - All steps are encapsulated into a single unified Scikit-Learn `Pipeline`, serialized to disk via `joblib`.

---

## 🏋️ Model Training & Evaluation Results

A **Stratified 80/20 Train/Test Split** (`random_state=42`) was performed to maintain exact class proportion across splits.

### Baseline vs Primary Model Metrics

| Evaluation Metric | Baseline (Logistic Regression) | Selected Model (Random Forest Classifier) |
|---|---|---|
| **Accuracy** | 74.68% | **77.92%** |
| **Precision** | 68.00% | **72.55%** |
| **Recall (Sensitivity)** | 56.67% | **68.52%** |
| **F1-Score** | 61.82% | **70.48%** |
| **ROC-AUC** | 81.25% | **84.36%** |

> **Selection Rationale**: `RandomForestClassifier(n_estimators=100, max_depth=8)` was chosen because it achieves significantly higher **Recall (68.52% vs 56.67%)** and **F1-Score (70.48% vs 61.82%)**, drastically reducing False Negatives on diabetic patients while capturing non-linear interactions between Glucose, Insulin, and BMI.

---

## 🚀 How to Execute & Serve

### 1. Install Dependencies
```bash
pip install -r ml/requirements.txt
```

### 2. Train and Save the Model
```bash
python ml/src/train.py
```
*Outputs generated*:
- `ml/models/diabetes_model.joblib`
- `ml/models/evaluation_report.json`

### 3. Launch FastAPI Server
```bash
uvicorn ml.src.api:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🔌 API Documentation & Usage

### Endpoint: `POST /predict/diabetes`

#### Example Request Payload:
```json
{
  "pregnancies": 2,
  "glucose": 138.0,
  "blood_pressure": 72.0,
  "skin_thickness": 35.0,
  "insulin": 160.0,
  "bmi": 33.6,
  "diabetes_pedigree_function": 0.627,
  "age": 47
}
```

#### Example Response JSON:
```json
{
  "prediction": 1,
  "risk_probability": 0.7845,
  "risk_percentage": 78.5,
  "risk_level": "High Risk",
  "key_contributing_factors": [
    "Elevated BMI (>= 30.0)",
    "Age Category (>= 45 years)"
  ],
  "model_used": "RandomForestClassifier (Pima Indians Dataset)",
  "disclaimer": "EDUCATIONAL DEMONSTRATION ONLY: This risk score is generated by an artificial intelligence model for educational/project demonstration purposes and MUST NOT be used as a clinical diagnosis or medical advice."
}
```
