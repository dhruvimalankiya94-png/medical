"""
Model Training & Evaluation Script for Diabetes Risk Prediction.

Performs:
1. Stratified Train/Test split.
2. Preprocessing pipeline fitting.
3. Baseline (Logistic Regression) vs Primary (Random Forest Classifier) comparison.
4. Comprehensive evaluation (Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix).
5. Model serialization to joblib format.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix
)
from sklearn.pipeline import Pipeline

from preprocess import load_raw_dataset, prepare_features_and_target, build_preprocessor, ALL_FEATURE_COLUMNS


def train_and_evaluate():
    # Resolve paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_path = os.path.join(base_dir, 'dataset', 'diabetes.csv')
    models_dir = os.path.join(base_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)

    print(f"[+] Loading dataset from: {dataset_path}")
    df = load_raw_dataset(dataset_path)

    X, y = prepare_features_and_target(df)
    print(f"[+] Features shape: {X.shape}, Target distribution: Positive={y.sum()}, Negative={(y==0).sum()}")

    # Stratified Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"[+] Train set: {X_train.shape[0]} samples | Test set: {X_test.shape[0]} samples")

    # 1. BASELINE MODEL: Logistic Regression
    baseline_pipeline = Pipeline([
        ('preprocessor', build_preprocessor()),
        ('classifier', LogisticRegression(random_state=42, max_iter=1000))
    ])
    baseline_pipeline.fit(X_train, y_train)
    y_pred_baseline = baseline_pipeline.predict(X_test)
    y_proba_baseline = baseline_pipeline.predict_proba(X_test)[:, 1]

    baseline_metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred_baseline)),
        "precision": float(precision_score(y_test, y_pred_baseline)),
        "recall": float(recall_score(y_test, y_pred_baseline)),
        "f1_score": float(f1_score(y_test, y_pred_baseline)),
        "roc_auc": float(roc_auc_score(y_test, y_proba_baseline)),
        "confusion_matrix": confusion_matrix(y_test, y_pred_baseline).tolist()
    }

    # 2. PRIMARY MODEL: Random Forest Classifier
    rf_pipeline = Pipeline([
        ('preprocessor', build_preprocessor()),
        ('classifier', RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=42
        ))
    ])
    rf_pipeline.fit(X_train, y_train)
    y_pred_rf = rf_pipeline.predict(X_test)
    y_proba_rf = rf_pipeline.predict_proba(X_test)[:, 1]

    rf_metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred_rf)),
        "precision": float(precision_score(y_test, y_pred_rf)),
        "recall": float(recall_score(y_test, y_pred_rf)),
        "f1_score": float(f1_score(y_test, y_pred_rf)),
        "roc_auc": float(roc_auc_score(y_test, y_proba_rf)),
        "confusion_matrix": confusion_matrix(y_test, y_pred_rf).tolist()
    }

    # Feature Importances from Random Forest
    rf_model = rf_pipeline.named_steps['classifier']
    feature_importances = dict(zip(ALL_FEATURE_COLUMNS, rf_model.feature_importances_.round(4).tolist()))

    print("\n" + "="*50)
    print(" MODEL EVALUATION SUMMARY ")
    print("="*50)
    print("Metric                 | Baseline (LogReg) | Selected (Random Forest)")
    print("-" * 65)
    print(f"Accuracy               | {baseline_metrics['accuracy']:.4f}            | {rf_metrics['accuracy']:.4f}")
    print(f"Precision              | {baseline_metrics['precision']:.4f}            | {rf_metrics['precision']:.4f}")
    print(f"Recall (Sensitivity)   | {baseline_metrics['recall']:.4f}            | {rf_metrics['recall']:.4f}")
    print(f"F1-Score               | {baseline_metrics['f1_score']:.4f}            | {rf_metrics['f1_score']:.4f}")
    print(f"ROC-AUC                | {baseline_metrics['roc_auc']:.4f}            | {rf_metrics['roc_auc']:.4f}")
    print("="*50)

    # Save final model
    model_save_path = os.path.join(models_dir, 'diabetes_model.joblib')
    joblib.dump(rf_pipeline, model_save_path)
    print(f"[+] Final Random Forest Pipeline saved to: {model_save_path}")

    # Save evaluation report JSON
    report = {
        "model_type": "RandomForestClassifier",
        "n_estimators": 100,
        "max_depth": 8,
        "test_split_ratio": 0.20,
        "random_state": 42,
        "baseline_logistic_regression": baseline_metrics,
        "random_forest_metrics": rf_metrics,
        "feature_importances": feature_importances,
        "selection_rationale": "Random Forest was selected due to superior Recall (sensitivity) and F1-score on clinical positive cases, alongside non-linear interaction modeling for Glucose, Insulin, and BMI metrics."
    }

    report_save_path = os.path.join(models_dir, 'evaluation_report.json')
    with open(report_save_path, 'w') as f:
        json.dump(report, f, indent=2)
    print(f"[+] Evaluation report saved to: {report_save_path}")

    return rf_pipeline, report


if __name__ == '__main__':
    train_and_evaluate()
