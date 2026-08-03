import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import os

# Create ml directory if it doesn't exist
os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)

def generate_mock_data(n_samples=5000):
    np.random.seed(42)
    
    # Healthy Baseline
    age = np.random.randint(18, 80, n_samples)
    gender = np.random.randint(0, 2, n_samples) # 0: Female, 1: Male
    fever = np.zeros(n_samples, dtype=int)
    cough = np.zeros(n_samples, dtype=int)
    headache = np.zeros(n_samples, dtype=int)
    body_pain = np.zeros(n_samples, dtype=int)
    chest_pain = np.zeros(n_samples, dtype=int)
    frequent_urination = np.zeros(n_samples, dtype=int)
    
    blood_pressure = np.random.normal(120, 10, n_samples).astype(int) # Systolic
    blood_sugar = np.random.normal(90, 15, n_samples).astype(int)
    heart_rate = np.random.normal(72, 8, n_samples).astype(int)
    bmi = np.random.normal(24, 3, n_samples)
    
    labels = np.zeros(n_samples, dtype=int) # 0 = Healthy
    
    # Inject Disease Patterns
    for i in range(n_samples):
        chance = np.random.rand()
        if chance < 0.25:
            # Flu (1)
            labels[i] = 1
            fever[i] = 1
            cough[i] = 1
            body_pain[i] = np.random.choice([0, 1], p=[0.2, 0.8])
            headache[i] = np.random.choice([0, 1], p=[0.3, 0.7])
            heart_rate[i] += 15 # slightly elevated
        elif chance < 0.5:
            # Heart Disease Risk (2)
            labels[i] = 2
            chest_pain[i] = 1
            blood_pressure[i] = np.random.normal(150, 15) # High BP
            bmi[i] = np.random.normal(32, 4) # Higher BMI
            age[i] = np.random.randint(45, 80) # Older
        elif chance < 0.75:
            # Diabetes (3)
            labels[i] = 3
            frequent_urination[i] = 1
            blood_sugar[i] = np.random.normal(180, 40) # High Glucose
            bmi[i] = np.random.normal(30, 5) # Higher BMI

    df = pd.DataFrame({
        'age': age,
        'gender': gender,
        'fever': fever,
        'cough': cough,
        'headache': headache,
        'body_pain': body_pain,
        'chest_pain': chest_pain,
        'frequent_urination': frequent_urination,
        'blood_pressure': blood_pressure,
        'blood_sugar': blood_sugar,
        'heart_rate': heart_rate,
        'bmi': bmi,
        'target': labels
    })
    
    return df

def train_and_save_model():
    print("Generating mock dataset...")
    df = generate_mock_data(10000)
    
    X = df.drop('target', axis=1)
    y = df['target']
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale numerical features (we'll scale all for simplicity here, though RF doesn't strictly need it, it's good practice)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest
    print("Training Random Forest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    acc = model.score(X_test_scaled, y_test)
    print(f"Model Accuracy on Test Set: {acc * 100:.2f}%")
    
    # Save artifacts
    model_path = os.path.join(os.path.dirname(__file__), 'rf_model.pkl')
    scaler_path = os.path.join(os.path.dirname(__file__), 'scaler.pkl')
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    print(f"Model saved to {model_path}")
    print(f"Scaler saved to {scaler_path}")

if __name__ == "__main__":
    train_and_save_model()
