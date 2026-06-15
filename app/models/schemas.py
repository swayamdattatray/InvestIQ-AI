from pydantic import BaseModel
from typing import Optional

class StockPrice(BaseModel):
    symbol: str
    price: float
    currency: str
    exchange: str
    short_name: Optional[str] = None

class StockAnalysis(BaseModel):
    symbol: str
    current_price: float
    rsi: float
    ma50: float
    ma200: float
    volatility: float
    signal: str

class HealthResponse(BaseModel):
    status: str
    version: str
