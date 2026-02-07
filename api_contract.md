# API Contract (MVP)

Base URL (local): `http://localhost:8000`

---

## GET /health

### Response
```json
{ "ok": true }
GET /metadata
Response
{
  "launch_sites": [
    { "name": "Cape Canaveral", "lat": 28.396837, "lon": -80.605659 },
    { "name": "Vandenberg", "lat": 34.742, "lon": -120.572 },
    { "name": "Baikonur", "lat": 45.965, "lon": 63.305 },
    { "name": "Kourou", "lat": 5.239, "lon": -52.768 }
  ],
  "altitude_bins": [
    { "start": 200, "end": 250 },
    { "start": 250, "end": 300 }
  ],
  "dataset_timestamp": "demo"
}
POST /risk
Request
{
  "launch_site": { "name": "Cape Canaveral", "lat": 28.396837, "lon": -80.605659 },
  "target_altitude_km": 550,
  "inclination_deg": 51.6,
  "corridor_width_km": 50,
  "launch_datetime_utc": "2026-02-07T12:00:00Z"
}
Response
{
  "overall_risk": 0.62,
  "risk_label": "MEDIUM",
  "top_drivers": [
    "550–600 km altitude band contributes most (density × exposure).",
    "500–550 km altitude band contributes most (density × exposure).",
    "600–650 km altitude band contributes most (density × exposure)."
  ],
  "risk_by_altitude": [
    { "band_start": 200, "band_end": 250, "risk": 0.01 },
    { "band_start": 250, "band_end": 300, "risk": 0.02 }
  ],
  "hotspots": [
    { "label": "Altitude hotspot 550–600 km", "weight": 0.12, "altitude_band": "550–600 km" }
  ],
  "overlays": null
}
POST /compare (optional)
Request
{
  "scenarioA": {
    "launch_site": { "name": "Cape Canaveral", "lat": 28.396837, "lon": -80.605659 },
    "target_altitude_km": 550,
    "inclination_deg": 51.6,
    "corridor_width_km": 50,
    "launch_datetime_utc": "2026-02-07T12:00:00Z"
  },
  "scenarioB": {
    "launch_site": { "name": "Cape Canaveral", "lat": 28.396837, "lon": -80.605659 },
    "target_altitude_km": 520,
    "inclination_deg": 51.6,
    "corridor_width_km": 30,
    "launch_datetime_utc": "2026-02-07T14:00:00Z"
  }
}
Response
{
  "delta_risk": -0.08,
  "delta_percent": -12.3,
  "reasons": [
    "Scenario B reduces risk.",
    "Corridor width changed.",
    "Target altitude changed."
  ],
  "resultA": {
    "overall_risk": 0.62,
    "risk_label": "MEDIUM",
    "top_drivers": [],
    "risk_by_altitude": [],
    "hotspots": [],
    "overlays": null
  },
  "resultB": {
    "overall_risk": 0.54,
    "risk_label": "MEDIUM",
    "top_drivers": [],
    "risk_by_altitude": [],
    "hotspots": [],
    "overlays": null
  }
}

---

# ✅ 你现在的截图里为什么会“跑到代码框里”
因为你的 `GET /health` 的 JSON 代码块：
```md
```json
{ "ok": true }
