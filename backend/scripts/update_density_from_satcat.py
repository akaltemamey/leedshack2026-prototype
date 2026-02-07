# backend/scripts/update_density_from_satcat.py
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime, timezone

SATCAT_URL = "https://celestrak.org/pub/satcat.csv"

def main(
    out_path: str = "backend/data/debris_density_by_alt.csv",
    bin_km: int = 50,
    alt_min: int = 200,
    alt_max: int = 1200,
    include_types=("DEB", "R/B"),  # Count debris + rocket bodies only; add "PAY" if you want all objects
):
    df = pd.read_csv(SATCAT_URL)

    # Keep Earth-orbiting objects that are still in orbit (DECAY_DATE is empty) and have orbital parameters
    df = df[df["ORBIT_CENTER"].eq("EA")]
    df = df[df["DECAY_DATE"].isna()]
    df = df[df["ORBIT_TYPE"].eq("ORB")]

    # Filter by object type: DEB (debris), R/B (rocket body), PAY (payload)
    df = df[df["OBJECT_TYPE"].isin(include_types)]

    # Estimate mean altitude (km) using apogee/perigee
    df = df.dropna(subset=["APOGEE", "PERIGEE"])
    df["mean_alt_km"] = (df["APOGEE"].astype(float) + df["PERIGEE"].astype(float)) / 2.0

    # Filter by altitude range
    df = df[(df["mean_alt_km"] >= alt_min) & (df["mean_alt_km"] <= alt_max)]

    # Bin counts by altitude
    bins = np.arange(alt_min, alt_max + bin_km, bin_km, dtype=float)
    labels = list(zip(bins[:-1], bins[1:]))
    df["bin"] = pd.cut(df["mean_alt_km"], bins=bins, right=False, labels=range(len(labels)))

    counts = df.groupby("bin").size().reindex(range(len(labels)), fill_value=0).astype(float)

    # Normalize to 0..1 (keeps the risk model stable)
    maxc = float(counts.max()) if float(counts.max()) > 0 else 1.0
    density = counts / maxc

    out_rows = []
    for i, (a0, a1) in enumerate(labels):
        out_rows.append({"alt_start_km": a0, "alt_end_km": a1, "density": float(density.iloc[i])})

    out = pd.DataFrame(out_rows)
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    out.to_csv(out_path, index=False)

    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"Wrote {out_path} (dataset_timestamp={stamp}, n_objects={len(df)})")

if __name__ == "__main__":
    main()
