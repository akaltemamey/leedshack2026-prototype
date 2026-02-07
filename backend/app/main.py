from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .schemas import RiskRequest, RiskResponse
from .data import load_density_csv, compute_raw_max
from .risk import compute_risk

app = FastAPI(title="Launch Risk API", version="0.1.0")

# Hackathon default: allow all origins (you can tighten later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load density table once at startup
ALT_BINS, DENSITY = load_density_csv("data/debris_density_by_alt.csv")
RAW_MAX = compute_raw_max(DENSITY)

# Preset launch sites
LAUNCH_SITES = [
    {"name": "Cape Canaveral", "lat": 28.396837, "lon": -80.605659},
    {"name": "Vandenberg", "lat": 34.742, "lon": -120.572},
    {"name": "Baikonur", "lat": 45.965, "lon": 63.305},
    {"name": "Kourou", "lat": 5.239, "lon": -52.768},
]

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/metadata")
def metadata():
    return {
        "launch_sites": LAUNCH_SITES,
        "altitude_bins": [{"start": float(a0), "end": float(a1)} for a0, a1 in ALT_BINS],
        "dataset_timestamp": "demo",
    }

@app.post("/risk", response_model=RiskResponse)
def risk(req: RiskRequest):
    overall, label, drivers, risk_by_alt, hotspots = compute_risk(
        ALT_BINS,
        DENSITY,
        RAW_MAX,
        target_alt_km=req.target_altitude_km,
        corridor_width_km=req.corridor_width_km,
    )

    # inclination_deg and launch_datetime_utc are accepted but not used in MVP scoring yet.
    # This is intentional for a fast, interpretable baseline.

    return {
        "overall_risk": overall,
        "risk_label": label,
        "top_drivers": drivers,
        "risk_by_altitude": risk_by_alt,
        "hotspots": hotspots,
        "overlays": None,
    }
