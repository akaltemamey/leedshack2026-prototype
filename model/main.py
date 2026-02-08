from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager
import pandas as pd
import numpy as np
from datetime import datetime
import pytz
import traceback

# IMPORT FROM NEIGHBORING FILE
from weather_model import (
    get_historical_weather, 
    engineer_features, 
    apply_launch_criteria, 
    train_launch_model,
    get_forecast_weather, 
    SITES
)

# Global Store
models = {}
history_cache = {}  # <--- NEW: Stores data so we don't need to re-download it

# ==========================================
# 1. APP LIFECYCLE (Startup)
# ==========================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🌍 WARMING UP: Downloading data & training models...")
    
    for site, coords in SITES.items():
        try:
            print(f"   ⬇️ Downloading history for {site}...")
            # 1. Get Data ONCE
            df = get_historical_weather(site, coords['lat'], coords['lon'], start_year=2020, end_year=2023)
            
            if not df.empty:
                # 2. Save to Cache for Climatology use later
                history_cache[site] = df.copy() 
                
                # 3. Train Model
                df = engineer_features(df)
                df = apply_launch_criteria(df, site)
                model = train_launch_model(df, site)
                
                if model:
                    models[site] = model
                    print(f"   ✅ {site} Ready.")
                else:
                    print(f"   ⚠️ {site} Training Failed.")
            else:
                print(f"   ❌ {site} No data returned.")
                
        except Exception as e:
            print(f"   ❌ Critical failure for {site}: {e}")
            
    yield
    models.clear()
    history_cache.clear()

app = FastAPI(lifespan=lifespan)

# ==========================================
# 2. HELPER: MEMORY-BASED CLIMATOLOGY
# ==========================================
def get_climatology_from_memory(site_name, target_date):
    """
    Calculates typical weather using the data we ALREADY have in memory.
    Zero API calls = Zero errors.
    """
    # 1. Get data from cache
    if site_name not in history_cache:
        print(f"❌ Site {site_name} not in history cache.")
        return pd.DataFrame()
        
    df_hist = history_cache[site_name].copy()
    
    # 2. Filter for matching Month and Hour
    # (e.g. Find all "August 14:00" rows in the history)
    target_month = target_date.month
    target_hour = target_date.hour
    
    # Create temp columns for filtering
    df_hist['month'] = df_hist['date'].dt.month
    df_hist['hour'] = df_hist['date'].dt.hour
    
    mask = (df_hist['month'] == target_month) & (df_hist['hour'] == target_hour)
    
    # Fallback: If no exact hour match, use the whole month average
    if not mask.any():
        mask = (df_hist['month'] == target_month)
        
    if not mask.any():
        return pd.DataFrame() # No data for this month at all

    # 3. Calculate Average
    clim_avg = df_hist[mask].mean(numeric_only=True).to_frame().T
    
    # 4. Set the date to the REQUESTED future date
    clim_avg['date'] = target_date
    
    return clim_avg

# ==========================================
# 3. ENDPOINTS
# ==========================================
class PredictionRequest(BaseModel):
    site_name: str
    target_time: str = None  # Receive as string to handle formats safely

@app.get("/")
def home():
    return {"message": "Rocket Weather API Online 🚀", "sites": list(SITES.keys())}

@app.post("/predict_launch")
async def predict_launch(request: PredictionRequest):
    site_name = request.site_name
    
    # 1. Validate
    if site_name not in SITES:
        raise HTTPException(404, f"Site not found. Options: {list(SITES.keys())}")
    if site_name not in models:
        raise HTTPException(503, "Model is not ready. Check server logs.")

    # 2. Parse Date
    try:
        if request.target_time:
            # Parse string to timestamp
            target_ts = pd.Timestamp(request.target_time).round('h')
            # Force UTC if missing timezone
            if target_ts.tzinfo is None:
                target_ts = target_ts.tz_localize('UTC')
        else:
            target_ts = pd.Timestamp.now(tz='UTC').round('h') + pd.Timedelta(hours=1)
    except ValueError:
        raise HTTPException(400, "Invalid date format. Use ISO format (e.g., 2026-08-07T14:00:00)")

    # 3. Logic Switch (Short vs Long Range)
    now = pd.Timestamp.now(tz='UTC')
    days_diff = (target_ts - now).days
    
    model = models[site_name]
    coords = SITES[site_name]
    prediction_type = "Real-Time Forecast 🌤️"
    
    try:
        if days_diff <= 7 and days_diff >= -1:
            # --- SHORT RANGE (Forecast API) ---
            df_forecast = get_forecast_weather(site_name, coords['lat'], coords['lon'])
            
            if df_forecast.empty:
                raise HTTPException(500, "Forecast API returned no data.")
            
            df_forecast = engineer_features(df_forecast)
            
            # Match date
            df_forecast['date'] = pd.to_datetime(df_forecast['date'], utc=True)
            row = df_forecast[df_forecast['date'] == target_ts]
            
            if row.empty:
                # If exact hour missing, take nearest available
                row = df_forecast.iloc[[0]] 
                prediction_type += " (Nearest Hour Used)"
        else:
            # --- LONG RANGE (Memory Climatology) ---
            prediction_type = "Historical Climatology 📅"
            row = get_climatology_from_memory(site_name, target_ts)
            
            if row.empty:
                raise HTTPException(500, f"No historical data found for {target_ts.month_name()}.")
            
            # Engineer features on the synthetic row
            row = engineer_features(row)

        # 4. Predict
        # Ensure we have the right columns
        X_input = row[model.feature_names_in_]
        
        pred_class = model.predict(X_input)[0]
        pred_prob = model.predict_proba(X_input)[0][1]
        
        # Get wind speed
        wind_val = float(row['wind_speed_10m'].values[0])
        
        # Generate Reason
        reason = "Conditions look good."
        if pred_class == 1:
            if wind_val > 10: reason = "High Winds (>10 m/s)"
            elif row['cape'].values[0] > 500: reason = "Atmospheric Instability"
            else: reason = "General Weather Violation"

        return {
            "site": site_name,
            "timestamp": str(target_ts),
            "prediction_type": prediction_type,
            "status": "NO-GO 🛑" if pred_class == 1 else "GO 🚀",
            "probability": round(float(pred_prob) * 100, 1),
            "reason": reason,
            "wind_speed": round(wind_val, 2)
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, f"Prediction Error: {str(e)}")