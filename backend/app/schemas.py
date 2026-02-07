from pydantic import BaseModel, Field
from typing import List, Literal, Optional

class LaunchSite(BaseModel):
    name: str
    lat: float
    lon: float

class RiskRequest(BaseModel):
    launch_site: LaunchSite
    target_altitude_km: float = Field(ge=200, le=1200)
    inclination_deg: float = Field(ge=0, le=180)
    corridor_width_km: float = Field(ge=5, le=100)
    launch_datetime_utc: str  # ISO8601 string

class AltBandRisk(BaseModel):
    band_start: float
    band_end: float
    risk: float

class Hotspot(BaseModel):
    label: str
    weight: float
    altitude_band: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None

class RiskResponse(BaseModel):
    overall_risk: float
    risk_label: Literal["LOW", "MEDIUM", "HIGH"]
    top_drivers: List[str]
    risk_by_altitude: List[AltBandRisk]
    hotspots: List[Hotspot]
    overlays: Optional[dict] = None
