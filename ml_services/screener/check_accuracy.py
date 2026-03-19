# autism_train_fixed.py
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

# -----------------------------
# Load Dataset
# -----------------------------
print("Loading dataset...")
data = pd.read_csv("Autism_Data.csv")

print("\nOriginal Dataset Columns:", list(data.columns))

# -----------------------------
# Preprocessing
# -----------------------------

# Convert categorical values
data['Sex'] = data['Sex'].map({'m': 1, 'f': 0})
data['Jauundice'] = data['Jauundice'].map({'yes': 1, 'no': 0})
data['Family_ASD'] = data['Family_ASD'].map({'yes': 1, 'no': 0})

# Features (⚠️ removed 'Score' to avoid leakage)
feature_columns = [
    'A1','A2','A3','A4','A5','A6','A7','A8','A9','A10',
    'Age','Sex','Jauundice','Family_ASD'
]
X = data[feature_columns]
y = data['Class']

print("\n✅ Final features prepared:", list(X.columns))

# -----------------------------
# Class Distribution
# -----------------------------
print("Class distribution:\n", y.value_counts())

# -----------------------------
# Train-Test Split
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# -----------------------------
# Train Model with Class Balancing
# -----------------------------
print("\nTraining model with class_weight='balanced' ...")
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=None,
    random_state=42,
    class_weight="balanced"
)
model.fit(X_train, y_train)

# Save the model
joblib.dump(model, "autism_model.pkl")
print("\n✅ Model saved to autism_model.pkl")

# -----------------------------
# Test Predictions
# -----------------------------
print("\nMaking predictions on test set...")
y_pred = model.predict(X_test)

print("\n✅ Test Accuracy:", round((y_pred == y_test).mean() * 100, 2), "%")
print("\nDetailed Report:")
print(classification_report(y_test, y_pred, target_names=["NO (Class 0)", "YES (Class 1)"]))
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# -----------------------------
# Cross Validation
# -----------------------------
print("\nPerforming 5-Fold Cross Validation...")
cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
print("\n✅ Cross-Validation Accuracy: {:.2f}%".format(cv_scores.mean() * 100))
