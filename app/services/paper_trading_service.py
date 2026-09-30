"""
Paper Trading Service
In-memory simulated portfolio with virtual cash for paper trading.
"""

import threading
from datetime import datetime, timezone
from typing import Dict, List

from fastapi import HTTPException

from app.models.schemas import (
    HoldingInfo,
    PaperTradeRequest,
    PaperTradeResponse,
    PortfolioResponse,
    TradeHistoryResponse,
    TradeRecord,
)

STARTING_CASH = 1_000_000.0  # ₹10,00,000


class _Holding:
    __slots__ = ("symbol", "quantity", "total_cost")

    def __init__(self, symbol: str):
        self.symbol = symbol
        self.quantity = 0
        self.total_cost = 0.0

    @property
    def avg_price(self) -> float:
        return self.total_cost / self.quantity if self.quantity > 0 else 0.0


class PaperTradingService:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._cash: float = STARTING_CASH
        self._holdings: Dict[str, _Holding] = {}
        self._trades: List[TradeRecord] = []
        self._next_id: int = 1

    # ── public api ──────────────────────────────

    def execute_trade(
        self, req: PaperTradeRequest, current_price: float
    ) -> PaperTradeResponse:
        symbol = req.symbol.strip().upper()
        total_value = round(current_price * req.quantity, 2)

        with self._lock:
            if req.action.value == "BUY":
                return self._buy(symbol, req.quantity, current_price, total_value)
            else:
                return self._sell(symbol, req.quantity, current_price, total_value)

    def get_portfolio(
        self, price_lookup: dict[str, float]
    ) -> PortfolioResponse:
        with self._lock:
            holdings_info: list[HoldingInfo] = []
            invested_value = 0.0
            current_value = 0.0

            for sym, h in self._holdings.items():
                if h.quantity <= 0:
                    continue
                cp = price_lookup.get(sym, h.avg_price)
                inv = round(h.total_cost, 2)
                cur = round(cp * h.quantity, 2)
                pnl = round(cur - inv, 2)
                pnl_pct = round((pnl / inv) * 100, 2) if inv else 0.0

                invested_value += inv
                current_value += cur

                holdings_info.append(
                    HoldingInfo(
                        symbol=sym,
                        quantity=h.quantity,
                        avg_price=round(h.avg_price, 2),
                        current_price=round(cp, 2),
                        invested_value=inv,
                        current_value=cur,
                        pnl=pnl,
                        pnl_percent=pnl_pct,
                    )
                )

            total_val = round(self._cash + current_value, 2)
            total_pnl = round(total_val - STARTING_CASH, 2)
            total_pnl_pct = round((total_pnl / STARTING_CASH) * 100, 2)

            return PortfolioResponse(
                cash_balance=round(self._cash, 2),
                invested_value=round(invested_value, 2),
                current_value=round(current_value, 2),
                total_value=total_val,
                total_pnl=total_pnl,
                total_pnl_percent=total_pnl_pct,
                holdings=holdings_info,
            )

    def get_history(self) -> TradeHistoryResponse:
        with self._lock:
            return TradeHistoryResponse(
                trades=list(reversed(self._trades)),
                total_trades=len(self._trades),
            )

    def reset(self) -> dict:
        with self._lock:
            self._cash = STARTING_CASH
            self._holdings.clear()
            self._trades.clear()
            self._next_id = 1
            return {
                "message": "Portfolio reset successfully",
                "cash_balance": self._cash,
            }

    # ── private helpers ─────────────────────────

    def _buy(
        self, symbol: str, qty: int, price: float, total: float
    ) -> PaperTradeResponse:
        if total > self._cash:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient cash. Required: ₹{total:,.2f}, Available: ₹{self._cash:,.2f}",
            )

        self._cash -= total

        if symbol not in self._holdings:
            self._holdings[symbol] = _Holding(symbol)

        h = self._holdings[symbol]
        h.total_cost += total
        h.quantity += qty

        trade = self._record_trade(symbol, "BUY", qty, price, total)
        return PaperTradeResponse(
            message=f"Bought {qty} shares of {symbol} at ₹{price:,.2f}",
            trade=trade,
        )

    def _sell(
        self, symbol: str, qty: int, price: float, total: float
    ) -> PaperTradeResponse:
        h = self._holdings.get(symbol)
        if not h or h.quantity < qty:
            available = h.quantity if h else 0
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient shares. Required: {qty}, Available: {available}",
            )

        cost_per_share = h.avg_price
        h.total_cost -= cost_per_share * qty
        h.quantity -= qty
        self._cash += total

        if h.quantity == 0:
            h.total_cost = 0.0

        trade = self._record_trade(symbol, "SELL", qty, price, total)
        return PaperTradeResponse(
            message=f"Sold {qty} shares of {symbol} at ₹{price:,.2f}",
            trade=trade,
        )

    def _record_trade(
        self, symbol: str, action: str, qty: int, price: float, total: float
    ) -> TradeRecord:
        trade = TradeRecord(
            id=self._next_id,
            symbol=symbol,
            action=action,
            quantity=qty,
            price=round(price, 2),
            total_value=round(total, 2),
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        self._trades.append(trade)
        self._next_id += 1
        return trade


paper_trading_service = PaperTradingService()
