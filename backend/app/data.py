import pandas as pd
import numpy as np

def load_density_csv(path: str) -> tuple[np.ndarray, np.ndarray]:
    """
    Returns:
      alt_bins: shape (n,2) float array, [[start,end],...]
      density: shape (n,) float array
    """
    df = pd.read_csv(path)
    alt_bins = df[["alt_start_km", "alt_end_km"]].to_numpy(float)
    density = df["density"].to_numpy(float)
    return alt_bins, density

def compute_raw_max(density: np.ndarray) -> float:
    """
    A stable normalizer so overall_risk is always in [0,1].
    We assume max exposure weight and max corridor width factor.
    """
    raw_max = float((density * (0.6 + 0.4 * 1.0)).sum())
    return max(raw_max, 1e-9)
