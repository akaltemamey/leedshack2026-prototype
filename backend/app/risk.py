import numpy as np

def width_factor(width_km: float) -> float:
    """
    Map corridor width 5..100km -> 0..1 smoothly.
    """
    return float(np.log1p(width_km / 5.0) / np.log1p(100.0 / 5.0))

def label_from_risk(r: float) -> str:
    if r < 0.33:
        return "LOW"
    if r < 0.66:
        return "MEDIUM"
    return "HIGH"

def compute_risk(
    alt_bins: np.ndarray,
    density: np.ndarray,
    raw_max: float,
    target_alt_km: float,
    corridor_width_km: float,
) -> tuple[float, str, list[str], list[dict], list[dict]]:
    """
    Returns:
      overall_risk: float 0..1
      risk_label: "LOW"/"MEDIUM"/"HIGH"
      top_drivers: list[str]
      risk_by_altitude: list[{band_start,band_end,risk}]
      hotspots: list[{label,weight,altitude_band}]
    """
    centers = (alt_bins[:, 0] + alt_bins[:, 1]) / 2.0

    # altitude exposure weighting around target altitude
    sigma = 100.0  # km, controls how wide around target altitude contributes
    w_alt = np.exp(-0.5 * ((centers - target_alt_km) / sigma) ** 2)

    w_w = width_factor(corridor_width_km)

    # per-band contribution
    contrib = density * w_alt * (0.6 + 0.4 * w_w)

    overall = float(np.clip(float(contrib.sum()) / raw_max, 0.0, 1.0))
    label = label_from_risk(overall)

    risk_by_altitude = [
        {"band_start": float(a0), "band_end": float(a1), "risk": float(c)}
        for (a0, a1), c in zip(alt_bins, contrib)
    ]

    # Top drivers = top 3 bands by contribution
    idx = np.argsort(contrib)[::-1][:3]
    top_drivers: list[str] = []
    hotspots: list[dict] = []
    for i in idx:
        a0, a1 = alt_bins[i]
        band = f"{int(a0)}–{int(a1)} km"
        top_drivers.append(f"{band} altitude band contributes most (density × exposure).")
        hotspots.append(
            {
                "label": f"Altitude hotspot {band}",
                "weight": float(contrib[i]),
                "altitude_band": band,
            }
        )

    # A simple extra explanation hook
    if corridor_width_km >= 60 and len(top_drivers) < 3:
        top_drivers.append("Wide corridor increases exposure.")

    return overall, label, top_drivers[:3], risk_by_altitude, hotspots
