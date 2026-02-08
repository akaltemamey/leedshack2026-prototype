import openmeteo_requests
import requests_cache
import pandas as pd
import numpy as np
import xgboost as xgb
from retry_requests import retry
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import accuracy_score, classification_report

# ==========================================
# CONFIGURATION
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

def get_historical_weather(site_name, lat, lon, start_year=2020, end_year=2023):
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat, "longitude": lon,
        "start_date": f"{start_year}-01-01", "end_date": f"{end_year}-12-31",
        "hourly": ["temperature_2m", "dew_point_2m", "precipitation", "cloud_cover", 
                   "wind_speed_10m", "wind_direction_10m", "wind_speed_100m", 
                   "wind_direction_100m", "cape", "lifted_index"]
    }
    
    print(f"📡 Fetching data for {site_name}...")
    try:
        responses = openmeteo.weather_api(url, params=params)
        response = responses[0]
    except Exception as e:
        print(f"❌ API Error: {e}")
        return pd.DataFrame()

    hourly = response.Hourly()
    hourly_data = {"date": pd.date_range(
        start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
        end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
        freq=pd.Timedelta(seconds=hourly.Interval()),
        inclusive="left"
    )}
    
    variables = ["temperature_2m", "dew_point_2m", "precipitation", "cloud_cover", 
                 "wind_speed_10m", "wind_direction_10m", "wind_speed_100m", 
                 "wind_direction_100m", "cape", "lifted_index"]
    
    for i, var in enumerate(variables):
        try:
            hourly_data[var] = hourly.Variables(i).ValuesAsNumpy()
        except:
            hourly_data[var] = np.zeros(len(hourly_data["date"]))

    return pd.DataFrame(data=hourly_data)

def engineer_features(df):
    if df.empty: return df
    df = df.fillna(0)
    df['wind_shear_mag'] = df['wind_speed_100m'] - df['wind_speed_10m']
    df['wind_shear_dir'] = np.abs(df['wind_direction_100m'] - df['wind_direction_10m'])
    df['instability_index'] = df['cape'] * -df['lifted_index'] 
    df['dew_point_dep'] = df['temperature_2m'] - df['dew_point_2m']
    df['hour_sin'] = np.sin(2 * np.pi * df['date'].dt.hour / 24)
    df['hour_cos'] = np.cos(2 * np.pi * df['date'].dt.hour / 24)
    df['month_sin'] = np.sin(2 * np.pi * df['date'].dt.month / 12)
    return df

def apply_launch_criteria(df, site_name):
    if df.empty: return df
    wind_violation = (df['wind_speed_10m'] > 10) 
    rain_violation = df['precipitation'] > 0.1
    lightning_violation = (df['cape'] > 500) | (df['lifted_index'] < -2)
    
    if site_name == "Baikonur":
        temp_violation = df['temperature_2m'] < -20
    else:
        temp_violation = False

    df['target_nogo'] = (wind_violation | rain_violation | lightning_violation | temp_violation).astype(int)
    return df

def train_launch_model(df, site_name):
    print(f"\n🚀 Training Model for {site_name}...")
    if df.empty: return None

    features = ['hour_sin', 'hour_cos', 'month_sin', 'temperature_2m', 'dew_point_dep',
                'wind_speed_10m', 'wind_shear_mag', 'cape', 'lifted_index']
    
    X = df[features]
    y = df['target_nogo']
    
    if len(y.unique()) < 2:
        print(f"⚠️ Only one class found. Skipping.")
        return None

    split_idx = int(len(df) * 0.8)
    X_train, y_train = X.iloc[:split_idx], y.iloc[:split_idx]
    
    num_neg, num_pos = np.sum(y_train == 0), np.sum(y_train == 1)
    if num_pos == 0: return None
        
    model = xgb.XGBClassifier(n_estimators=100, learning_rate=0.05, max_depth=5,
                              scale_pos_weight=num_neg/num_pos, eval_metric='logloss')
    model.fit(X_train, y_train)
    return model

# Add this new function to weather_model.py

def get_forecast_weather(site_name, lat, lon):
    """
    Fetches the 7-day forecast from Open-Meteo for a specific site.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": [
            "temperature_2m", "dew_point_2m", "precipitation", 
            "cloud_cover", "wind_speed_10m", "wind_direction_10m",
            "wind_speed_100m", "wind_direction_100m", 
            "cape", "lifted_index"
        ]
    }
    
    print(f"🔮 Fetching FORECAST for {site_name}...")
    try:
        responses = openmeteo.weather_api(url, params=params)
        response = responses[0]
    except Exception as e:
        print(f"❌ Forecast API Error: {e}")
        return pd.DataFrame()

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
        except:
            hourly_data[var] = np.zeros(len(hourly_data["date"]))

    return pd.DataFrame(data=hourly_data)
# ==========================================
# 1. HELPER: LONG-RANGE CLIMATOLOGY (FIXED)
# ==========================================
def get_climatology_weather(site_name, lat, lon, target_date):
    """
    Creates a 'Typical Day' profile.
    FIX: Reduced range to 2020-2023 to prevent API timeouts.
    """
    # 1. Fetch history (Reduced to 4 years for stability)
    print(f"📜 Fetching Climatology for {site_name} (2020-2023)...")
    
    # We use the same function as training, which we know works
    try:
        df_hist = get_historical_weather(site_name, lat, lon, start_year=2020, end_year=2023)
    except Exception as e:
        print(f"❌ Climatology API Failed: {e}")
        return pd.DataFrame()
    
    if df_hist.empty:
        print("❌ Climatology DataFrame is empty.")
        return pd.DataFrame()

    # 2. Filter: Find matching months and hours
    # (e.g., If target is August 10th at 14:00, get all Aug 14:00s)
    target_month = target_date.month
    target_hour = target_date.hour
    
    # Create time features for filtering
    df_hist['month'] = df_hist['date'].dt.month
    df_hist['hour'] = df_hist['date'].dt.hour
    
    # Filter mask
    mask = (df_hist['month'] == target_month) & (df_hist['hour'] == target_hour)
    
    if not mask.any():
        print(f"⚠️ No exact matches for Month {target_month} Hour {target_hour}. Using Monthly Average.")
        # Fallback: Just average the whole month if hour is missing
        mask = (df_hist['month'] == target_month)
    
    # 3. Calculate Average Conditions
    # numeric_only=True prevents error with date column
    clim_avg = df_hist[mask].mean(numeric_only=True).to_frame().T
    
    # 4. Attach the requested date so feature engineering works
    clim_avg['date'] = target_date
    
    return clim_avg