import openmeteo_requests
import requests_cache
import pandas as pd
import numpy as np
import xgboost as xgb
from retry_requests import retry
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import accuracy_score, precision_score, classification_report

# ==========================================
# 1. CONFIGURATION & SITES
# ==========================================
SITES = {
    "Cape_Canaveral": {"lat": 28.3922, "lon": -80.6077, "code": "KXMR"},
    "Vandenberg":     {"lat": 34.7420, "lon": -120.5724, "code": "KVBG"},
    "Baikonur":       {"lat": 45.9646, "lon": 63.3052, "code": "UAOO"},
    "Kourou":         {"lat": 5.2360,  "lon": -52.7754, "code": "SOOS"}
}

# Setup the Open-Meteo API client
cache_session = requests_cache.CachedSession('.cache', expire_after=-1)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

# ==========================================
# 2. DATA ACQUISITION ENGINE
# ==========================================
def get_historical_weather(site_name, lat, lon, start_year=2020, end_year=2023):
    url = "https://archive-api.open-meteo.com/v1/archive"
    
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": f"{start_year}-01-01",
        "end_date": f"{end_year}-12-31",
        "hourly": [
            "temperature_2m", "dew_point_2m", "precipitation", 
            "cloud_cover", "wind_speed_10m", "wind_direction_10m",
            "wind_speed_100m", "wind_direction_100m", 
            "cape", "lifted_index" 
        ]
    }
    
    print(f"📡 Fetching data for {site_name}...")
    try:
        responses = openmeteo.weather_api(url, params=params)
        response = responses[0]
    except Exception as e:
        print(f"❌ API Error: {e}")
        return pd.DataFrame() # Return empty DF on failure

    # Process hourly data
    hourly = response.Hourly()
    hourly_data = {"date": pd.date_range(
        start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
        end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
        freq=pd.Timedelta(seconds=hourly.Interval()),
        inclusive="left"
    )}
    
    variables = [
        "temperature_2m", "dew_point_2m", "precipitation", 
        "cloud_cover", "wind_speed_10m", "wind_direction_10m",
        "wind_speed_100m", "wind_direction_100m", "cape", "lifted_index"
    ]
    
    for i, var in enumerate(variables):
        try:
            hourly_data[var] = hourly.Variables(i).ValuesAsNumpy()
        except IndexError:
            # If API doesn't return a variable (e.g. CAPE missing), fill with 0
            print(f"⚠️ Warning: Variable '{var}' missing from API. Filling with 0.")
            hourly_data[var] = np.zeros(len(hourly_data["date"]))

    df = pd.DataFrame(data=hourly_data)
    return df

# ==========================================
# 3. PHYSICS-BASED FEATURE ENGINEERING
# ==========================================
def engineer_features(df):
    if df.empty:
        return df

    # Fill NaNs with 0 instead of dropping rows to preserve data
    df = df.fillna(0)
    
    # A. Wind Shear Proxy
    df['wind_shear_mag'] = df['wind_speed_100m'] - df['wind_speed_10m']
    df['wind_shear_dir'] = np.abs(df['wind_direction_100m'] - df['wind_direction_10m'])
    
    # B. Stability
    df['instability_index'] = df['cape'] * -df['lifted_index'] 
    
    # C. Fog / Icing Risk
    df['dew_point_dep'] = df['temperature_2m'] - df['dew_point_2m']
    
    # D. Time Encoding
    df['hour_sin'] = np.sin(2 * np.pi * df['date'].dt.hour / 24)
    df['hour_cos'] = np.cos(2 * np.pi * df['date'].dt.hour / 24)
    df['month_sin'] = np.sin(2 * np.pi * df['date'].dt.month / 12)
    
    return df

# ==========================================
# 4. LABELING (THE "GO / NO-GO" LOGIC)
# ==========================================
def apply_launch_criteria(df, site_name):
    if df.empty: return df

    # Base constraints
    # TEMPORARY: Low wind threshold (5 m/s) to ensure we get some "NO-GO"s for testing
    wind_violation = (df['wind_speed_10m'] > 5) 
    
    rain_violation = df['precipitation'] > 0.1
    lightning_violation = (df['cape'] > 500) | (df['lifted_index'] < -2)
    
    if site_name == "Baikonur":
        temp_violation = df['temperature_2m'] < -20
    else:
        temp_violation = False

    df['target_nogo'] = (wind_violation | rain_violation | lightning_violation).astype(int)
    
    return df

# ==========================================
# 5. MODEL TRAINING
# ==========================================
def train_launch_model(df, site_name):
    print(f"\n🚀 Training Model for {site_name}...")
    
    if df.empty:
        print("❌ CRITICAL ERROR: DataFrame is empty. Cannot train.")
        return None

    features = [
        'hour_sin', 'hour_cos', 'month_sin',
        'temperature_2m', 'dew_point_dep',
        'wind_speed_10m', 'wind_shear_mag',
        'cape', 'lifted_index'
    ]
    
    X = df[features]
    y = df['target_nogo']
    
    # Safety Check: Do we have both 0 and 1?
    if len(y.unique()) < 2:
        print(f"⚠️ Data only contains class {y.unique()[0]}. Skipping training.")
        return None

    split_idx = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    # Calculate scale weight safely
    num_neg = np.sum(y_train == 0)
    num_pos = np.sum(y_train == 1)
    
    if num_pos == 0:
        print("⚠️ No positive examples in training set.")
        return None
        
    ratio = float(num_neg) / float(num_pos)

    model = xgb.XGBClassifier(
        n_estimators=100, learning_rate=0.05, max_depth=5,
        scale_pos_weight=ratio, eval_metric='logloss'
    )
    
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    print(f"--- Results for {site_name} ---")
    print(f"Accuracy: {accuracy_score(y_test, preds):.2f}")
    print(classification_report(y_test, preds))
    
    return model

# ==========================================
# MAIN EXECUTION
# ==========================================
if __name__ == "__main__":
    site = "Cape_Canaveral"
    coords = SITES[site]
    
    # 1. Get Data
    df = get_historical_weather(site, coords['lat'], coords['lon'])
    
    # 2. Engineer Features
    df = engineer_features(df)
    
    # 3. Create Targets
    df = apply_launch_criteria(df, site)
    
    # 4. Train Model
    model = train_launch_model(df, site)
    
    # 5. Predict (ONLY if model exists)
    if model is not None and not df.empty:
        latest_conditions = df.iloc[[-1]].copy()
        
        # Ensure we only use the features the model knows
        pred_features = latest_conditions[model.feature_names_in_]
        
        prediction = model.predict(pred_features)
        prob = model.predict_proba(pred_features)[0][1]
        
        print(f"\n🔮 Prediction for next slot: {'NO-GO 🛑' if prediction[0]==1 else 'GO 🚀'}")
        print(f"Probability of Violation: {prob:.1%}")
    else:
        print("\n❌ Could not generate prediction due to training errors.")