from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


# ──────────────────────────────────────────────
# Existing Schemas
# ──────────────────────────────────────────────

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
    # Enhanced risk metrics
    max_drawdown: Optional[float] = None
    sharpe_ratio: Optional[float] = None
    beta: Optional[float] = None
    risk_level: Optional[str] = None
    support_level: Optional[float] = None
    resistance_level: Optional[float] = None


class HealthResponse(BaseModel):
    status: str
    version: str


# ──────────────────────────────────────────────
# Paper Trading Schemas
# ──────────────────────────────────────────────

class TradeAction(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


class PaperTradeRequest(BaseModel):
    symbol: str
    action: TradeAction
    quantity: int = Field(gt=0)


class HoldingInfo(BaseModel):
    symbol: str
    quantity: int
    avg_price: float
    current_price: float
    invested_value: float
    current_value: float
    pnl: float
    pnl_percent: float


class TradeRecord(BaseModel):
    id: int
    symbol: str
    action: str
    quantity: int
    price: float
    total_value: float
    timestamp: str


class PaperTradeResponse(BaseModel):
    message: str
    trade: TradeRecord


class PortfolioResponse(BaseModel):
    cash_balance: float
    invested_value: float
    current_value: float
    total_value: float
    total_pnl: float
    total_pnl_percent: float
    holdings: List[HoldingInfo]


class TradeHistoryResponse(BaseModel):
    trades: List[TradeRecord]
    total_trades: int


# ──────────────────────────────────────────────
# Backtesting Schemas
# ──────────────────────────────────────────────

class BacktestRequest(BaseModel):
    initial_capital: float = Field(default=1000000, gt=0)
    rsi_buy_threshold: float = Field(default=30, ge=0, le=100)
    rsi_sell_threshold: float = Field(default=70, ge=0, le=100)
    ma_short_period: int = Field(default=50, gt=0)
    ma_long_period: int = Field(default=200, gt=0)


class BacktestTrade(BaseModel):
    date: str
    action: str
    price: float
    shares: int
    value: float
    portfolio_value: float


class BacktestResult(BaseModel):
    symbol: str
    strategy: str
    initial_capital: float
    final_value: float
    total_return_pct: float
    max_drawdown_pct: float
    win_rate_pct: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    sharpe_ratio: float
    best_trade_pct: float
    worst_trade_pct: float
    trades: List[BacktestTrade]
