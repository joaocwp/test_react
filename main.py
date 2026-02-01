
from fastapi import UploadFile, File, HTTPException, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal
import pandas as pd
import numpy as np
from io import StringIO
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Allow requests from React (important!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SumRequest(BaseModel):
    a: float
    b: float

@app.post("/sum")
def sum_numbers(data: SumRequest):
    return {
        "result": data.a + data.b
    }

class BootstrapRequest(BaseModel):
    sample: List[float] = Field(..., min_items=1)
    n_bootstrap: int = Field(10000, gt=0, le=100_000)
    statistic: Literal["mean", "median"] = "mean"


class BootstrapResponse(BaseModel):
    statistic: str
    n_bootstrap: int
    distribution: List[float]
    original_statistic: float


@app.post("/bootstrap", response_model=BootstrapResponse)
def bootstrap_distribution(data: BootstrapRequest):
    sample = np.array(data.sample)

    if len(sample) < 2:
        raise HTTPException(
            status_code=400,
            detail="Sample must contain at least two values"
        )

    # Choose statistic function
    if data.statistic == "mean":
        stat_func = np.mean
    elif data.statistic == "median":
        stat_func = np.median
    else:
        raise HTTPException(status_code=400, detail="Invalid statistic")

    # Original statistic
    original_value = float(stat_func(sample))

    # Bootstrap resampling
    bootstrap_dist = []
    n = len(sample)
    print('realizando', data.n_bootstrap, 'reamostragens')
    logger.info(f'realizando {data.n_bootstrap} reamostragens')
    for _ in range(data.n_bootstrap):
        resample = np.random.choice(sample, size=n, replace=True)
        bootstrap_dist.append(float(stat_func(resample)))

    return BootstrapResponse(
        statistic=data.statistic,
        n_bootstrap=data.n_bootstrap,
        distribution=bootstrap_dist,
        original_statistic=original_value,
    )

@app.post("/bootstrap/csv")
async def bootstrap_from_csv(
    file: UploadFile = File(...),
    column: str = "value",
    n_bootstrap: int = 1000,
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    contents = await file.read()
    csv_text = contents.decode("utf-8")

    try:
        df = pd.read_csv(StringIO(csv_text))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid CSV file")

    if column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Column '{column}' not found in CSV"
        )

    sample = df[column].dropna().to_numpy()

    if len(sample) < 2:
        raise HTTPException(
            status_code=400,
            detail="Not enough numeric values for bootstrap"
        )

    n = len(sample)
    bootstrap_dist = []

    for _ in range(n_bootstrap):
        resample = np.random.choice(sample, size=n, replace=True)
        bootstrap_dist.append(float(np.mean(resample)))

    return {
        "column": column,
        "n_bootstrap": n_bootstrap,
        "original_mean": float(np.mean(sample)),
        "distribution": bootstrap_dist,
    }

