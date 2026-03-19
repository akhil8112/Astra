import pandas as pd
import joblib
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    make_scorer
)
from sklearn.preprocessing import StandardScaler, LabelEncoder
from imblearn.over_sampling import SMOTE
from sklearn.pipeline import Pipeline

# ---------------- Load dataset ----------------
df = pd.read_excel("Clean_Dataset_Autism.xlsx")

# Features (drop target column)
X = df.drop(columns=["Class"])
X = pd.get_dummies(X, drop_first=True)  # One-hot encode categorical

# Encode target (NO/YES → 0/1)
le = LabelEncoder()
y = le.fit_transform(df["Class"])   # 'NO' -> 0, 'YES' -> 1

# ---------------- Train/Test split ----------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# Handle imbalance with SMOTE
smote = SMOTE(random_state=42)
X_train_res, y_train_res = smote.fit_resample(X_train, y_train)

# ---------------- Build pipeline ----------------
pipeline = Pipeline([
    ("scaler", StandardScaler()),  
    ("rf", RandomForestClassifier(class_weight="balanced", random_state=42))
])

# Hyperparameter tuning grid
param_grid = {
    "rf__n_estimators": [100, 200, 300],
    "rf__max_depth": [None, 10, 20],
    "rf__min_samples_split": [2, 5, 10],
    "rf__min_samples_leaf": [1, 2, 4]
}

# F1 scorer
f1_scorer = make_scorer(f1_score, pos_label=1)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
grid = GridSearchCV(
    pipeline,
    param_grid,
    cv=cv,
    scoring=f1_scorer,
    n_jobs=-1,
    verbose=1
)

# ---------------- Train best model ----------------
grid.fit(X_train_res, y_train_res)
best_model = grid.best_estimator_

# ---------------- Evaluation ----------------
y_pred = best_model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, pos_label=1)
recall = recall_score(y_test, y_pred, pos_label=1)
f1 = f1_score(y_test, y_pred, pos_label=1)

print("\n🔹 Model Performance Metrics")
print(f"Accuracy  : {accuracy:.4f}")
print(f"Precision : {precision:.4f}")
print(f"Recall    : {recall:.4f}")
print(f"F1-score  : {f1:.4f}")

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=le.classes_))
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

# ---------------- Probability-based Risk Mapping ----------------
y_proba = best_model.predict_proba(X_test)[:, 1]  # P(Class=1 → Autism)

def proba_to_risk(p, low=0.33, high=0.66):
    if p < low:
        return "No Autism"
    elif p < high:
        return "Medium Risk"
    else:
        return "High Risk"

risk_pred_equal = [proba_to_risk(p) for p in y_proba]

low_thr = np.percentile(y_proba, 33)
high_thr = np.percentile(y_proba, 66)

def proba_to_risk_dynamic(p, low=low_thr, high=high_thr):
    if p < low:
        return "No Autism"
    elif p < high:
        return "Medium Risk"
    else:
        return "High Risk"

risk_pred_dynamic = [proba_to_risk_dynamic(p) for p in y_proba]

print("\nEqual-Split Thresholds (0.33 / 0.66)")
print(pd.Series(risk_pred_equal).value_counts())

print("\nData-Driven Thresholds (33rd / 66th percentiles)")
print(f"Low threshold = {low_thr:.3f}, High threshold = {high_thr:.3f}")
print(pd.Series(risk_pred_dynamic).value_counts())

# ---------------- Save artifacts ----------------
joblib.dump(best_model, "autism_model.pkl")
joblib.dump(list(X.columns), "autism_features.pkl")
joblib.dump(le, "autism_label_encoder.pkl")
joblib.dump({"low_thr": float(low_thr), "high_thr": float(high_thr)}, "autism_thresholds.pkl")

print("\n✅ Model trained & saved with accuracy/precision metrics + probability-based risk mapping!")
