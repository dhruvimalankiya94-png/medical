"""
Data Preprocessing Module for Diabetes Risk Prediction.

This module handles:
1. Identification of medically implausible zero values in Glucose, BloodPressure, SkinThickness, Insulin, and BMI.
2. Replacement of zero values with NaN to avoid biasing statistical estimators.
3. Creation of a reproducible Scikit-Learn Preprocessing Pipeline (Imputer + Scaler).
"""

import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler

# Columns where 0 indicates a missing/invalid medical reading rather than a true zero
ZERO_INVALID_COLUMNS = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
ALL_FEATURE_COLUMNS = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']
TARGET_COLUMN = 'Outcome'


class ZeroToNaNTransformer(BaseEstimator, TransformerMixin):
    """
    Custom Scikit-Learn Transformer to replace 0 with NaN in specified clinical feature columns.
    Ensures zero-replacement is incorporated cleanly inside Scikit-Learn Pipelines.
    """
    def __init__(self, zero_columns=None):
        self.zero_columns = zero_columns if zero_columns is not None else ZERO_INVALID_COLUMNS

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_copy = X.copy() if isinstance(X, pd.DataFrame) else pd.DataFrame(X, columns=ALL_FEATURE_COLUMNS)
        for col in self.zero_columns:
            if col in X_copy.columns:
                X_copy[col] = X_copy[col].replace(0, np.nan)
        return X_copy


def load_raw_dataset(csv_path: str) -> pd.DataFrame:
    """
    Loads raw CSV dataset into a Pandas DataFrame.
    """
    df = pd.read_csv(csv_path)
    return df


def prepare_features_and_target(df: pd.DataFrame):
    """
    Splits DataFrame into feature matrix X and target vector y.
    X: Health metrics (Pregnancies, Glucose, BP, SkinThickness, Insulin, BMI, DPF, Age)
    y: Diabetes Outcome (0 = Negative, 1 = Positive)
    """
    X = df[ALL_FEATURE_COLUMNS].copy()
    y = df[TARGET_COLUMN].copy()
    return X, y


def build_preprocessor() -> Pipeline:
    """
    Builds the Scikit-Learn preprocessing pipeline combining:
    1. ZeroToNaNTransformer (replaces implausible zeros with NaN)
    2. SimpleImputer (median imputation fitted on training data to prevent data leakage)
    3. StandardScaler (z-score normalization for numerical features)
    """
    return Pipeline([
        ('zero_to_nan', ZeroToNaNTransformer(zero_columns=ZERO_INVALID_COLUMNS)),
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
