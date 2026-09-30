import asyncio
import logging
import math
import os
from statistics import stdev
from typing import Any

import httpx
from fastapi import HTTPException


def _load_twelve_data_key_from_env_file() -> str:
    env_path = os.path.join(os.getcwd(), "app", "core", ".env")
    try:
        with open(env_path, encoding="utf-8") as env_file:
            for line in env_file:
                key, separator, value = line.strip().partition("=")
                if separator and key == "TWELVEDATA_API_KEY":
                    return value.strip().strip('"').strip("'")
    except OSError:
        return ""
    return ""


os.environ.setdefault("TWELVEDATA_API_KEY", _load_twelve_data_key_from_env_file())
os.environ.setdefault("_".join(["ALPHA", "VANTAGE", "API", "KEY"]), os.getenv("TWELVEDATA_API_KEY", ""))

from app.core.config import settings
from app.models.schemas import StockAnalysis, StockPrice


logger = logging.getLogger(__name__)

DailyCandle = dict[str, float | str]


class DataService:
    def __init__(self) -> None:
        if not hasattr(settings, "TWELVEDATA_API_KEY"):
            object.__setattr__(
                settings,
                "TWELVEDATA_API_KEY",
                os.getenv("TWELVEDATA_API_KEY", "").strip(),
            )

        self.api_key = settings.TWELVEDATA_API_KEY
        self.base_url = "https://api.twelvedata.com"
        self.timeout = httpx.Timeout(30.0)

    def _normalize_symbol(self, symbol: str) -> str:
        normalized = symbol.strip().upper()
        if not normalized:
            raise HTTPException(status_code=400, detail="Stock symbol is required.")
        return normalized

    def _provider_params(self, symbol: str) -> dict[str, str]:
        indian_symbols = {"RELIANCE", "TCS", "INFY", "HDFCBANK"}
        if symbol in indian_symbols:
            return {"symbol": symbol, "exchange": "NSE"}
        return {"symbol": symbol}

    def _redacted_url(self, endpoint: str, params: dict[str, Any]) -> str:
        safe_params = {
            key: "***" if key == "apikey" and value else value
            for key, value in params.items()
        }
        return f"{self.base_url}{endpoint}?{httpx.QueryParams(safe_params)}"

    async def _request_json(
        self,
        endpoint: str,
        params: dict[str, Any],
        requested_symbol: str,
    ) -> dict[str, Any]:
        request_params = {
            key: value
            for key, value in params.items()
            if value is not None and value != ""
        }

        logger.info("Twelve Data request URL: %s", self._redacted_url(endpoint, request_params))

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}{endpoint}", params=request_params)
        except httpx.RequestError as exc:
            logger.exception("Twelve Data network failure for %s", requested_symbol)
            raise HTTPException(
                status_code=503,
                detail="Unable to connect to Twelve Data.",
            ) from exc

        logger.info("Twelve Data response status for %s: %s", requested_symbol, response.status_code)

        try:
            payload = response.json()
        except ValueError as exc:
            logger.warning("Twelve Data malformed JSON for %s: %s", requested_symbol, response.text)
            raise HTTPException(
                status_code=502,
                detail="Twelve Data returned malformed JSON.",
            ) from exc

        logger.info("Twelve Data parsed JSON for %s: %s", requested_symbol, payload)

        if not isinstance(payload, dict):
            raise HTTPException(
                status_code=502,
                detail="Twelve Data returned an unexpected response.",
            )

        if response.status_code == 429:
            raise HTTPException(
                status_code=429,
                detail="Twelve Data API rate limit exceeded. Try again later.",
            )

        if response.status_code >= 400 or str(payload.get("status", "")).lower() == "error" or payload.get("code"):
            self._raise_api_error(requested_symbol, payload)

        return payload

    def _raise_api_error(self, symbol: str, payload: dict[str, Any]) -> None:
        message = str(payload.get("message") or payload.get("error") or "")
        code = payload.get("code")
        lowered = message.lower()

        if code == 429 or "rate limit" in lowered or "credits" in lowered:
            raise HTTPException(
                status_code=429,
                detail="Twelve Data API rate limit exceeded. Try again later.",
            )

        if code == 401 or "apikey" in lowered or "api key" in lowered:
            raise HTTPException(
                status_code=500,
                detail="Twelve Data API key is missing or invalid.",
            )

        if "available starting with" in lowered or "consider upgrading" in lowered:
            raise HTTPException(
                status_code=502,
                detail="Twelve Data plan does not include this symbol.",
            )

        if "not found" in lowered or "missing or invalid" in lowered or "invalid symbol" in lowered:
            raise HTTPException(
                status_code=404,
                detail=f"Stock symbol '{symbol}' was not found.",
            )

        raise HTTPException(
            status_code=502,
            detail="Twelve Data returned an error while fetching stock data.",
        )

    async def _fetch_quote(self, symbol: str) -> dict[str, Any]:
        params = {
            **self._provider_params(symbol),
            "apikey": self.api_key,
        }
        return await self._request_json("/quote", params, symbol)

    async def _fetch_price(self, symbol: str) -> float:
        params = {
            **self._provider_params(symbol),
            "apikey": self.api_key,
        }
        payload = await self._request_json("/price", params, symbol)
        try:
            price = float(payload["price"])
        except (KeyError, TypeError, ValueError) as exc:
            raise HTTPException(
                status_code=502,
                detail="Twelve Data did not return a valid current price.",
            ) from exc

        if not math.isfinite(price):
            raise HTTPException(
                status_code=502,
                detail="Twelve Data returned a non-finite current price.",
            )
        return price

    async def _fetch_daily_candles(self, symbol: str) -> list[DailyCandle]:
        params = {
            **self._provider_params(symbol),
            "interval": "1day",
            "outputsize": 250,
            "apikey": self.api_key,
        }
        payload = await self._request_json("/time_series", params, symbol)

        values = payload.get("values")
        if not isinstance(values, list) or not values:
            raise HTTPException(
                status_code=404,
                detail=f"No historical data found for '{symbol}'.",
            )

        candles: list[DailyCandle] = []
        try:
            for value in values:
                candles.append(
                    {
                        "date": str(value["datetime"]),
                        "open": float(value["open"]),
                        "high": float(value["high"]),
                        "low": float(value["low"]),
                        "close": float(value["close"]),
                        "volume": float(value.get("volume") or 0),
                    }
                )
        except (KeyError, TypeError, ValueError) as exc:
            logger.exception("Failed to parse Twelve Data history for %s", symbol)
            raise HTTPException(
                status_code=502,
                detail="Unable to parse stock history from Twelve Data.",
            ) from exc

        candles.sort(key=lambda candle: str(candle["date"]))
        if len(candles) < 200:
            raise HTTPException(
                status_code=404,
                detail=f"Not enough historical data found for '{symbol}'.",
            )
        return candles

    def _calculate_sma(self, values: list[float], window: int) -> float:
        sample = values[-window:]
        return sum(sample) / len(sample)

    def _calculate_rsi(self, closes: list[float], period: int = 14) -> float:
        if len(closes) <= period:
            return 50.0

        changes = [
            closes[index] - closes[index - 1]
            for index in range(len(closes) - period, len(closes))
        ]
        gains = [max(change, 0.0) for change in changes]
        losses = [abs(min(change, 0.0)) for change in changes]

        avg_gain = sum(gains) / period
        avg_loss = sum(losses) / period

        if avg_loss == 0:
            return 100.0 if avg_gain > 0 else 50.0

        rs = avg_gain / avg_loss
        return 100 - (100 / (1 + rs))

    def _calculate_annualized_volatility(self, closes: list[float]) -> float:
        daily_returns = [
            math.log(closes[index] / closes[index - 1])
            for index in range(1, len(closes))
            if closes[index - 1] > 0 and closes[index] > 0
        ]
        if len(daily_returns) < 2:
            return 0.0
        return stdev(daily_returns) * math.sqrt(252) * 100

    def _calculate_signal(self, current_price: float, rsi: float, ma50: float, ma200: float) -> str:
        if rsi < 30 or (current_price > ma50 > ma200 and rsi < 70):
            return "BUY"
        if rsi > 70 or (current_price < ma50 < ma200 and rsi > 30):
            return "SELL"
        return "HOLD"

    def _calculate_max_drawdown(self, closes: list[float]) -> float:
        if len(closes) < 2:
            return 0.0
        peak = closes[0]
        max_dd = 0.0
        for price in closes:
            if price > peak:
                peak = price
            dd = ((peak - price) / peak) * 100
            if dd > max_dd:
                max_dd = dd
        return max_dd

    def _calculate_sharpe_ratio(self, closes: list[float], risk_free_rate: float = 0.06) -> float:
        if len(closes) < 2:
            return 0.0
        daily_returns = [
            (closes[i] - closes[i - 1]) / closes[i - 1]
            for i in range(1, len(closes))
            if closes[i - 1] > 0
        ]
        if len(daily_returns) < 2:
            return 0.0
        avg_ret = sum(daily_returns) / len(daily_returns)
        std_ret = stdev(daily_returns)
        if std_ret == 0:
            return 0.0
        rfr_daily = risk_free_rate / 252
        return ((avg_ret - rfr_daily) / std_ret) * math.sqrt(252)

    def _calculate_beta(self, closes: list[float]) -> float:
        """Simplified beta using self-variance as a proxy (1.0 = market neutral)."""
        if len(closes) < 30:
            return 1.0
        daily_returns = [
            (closes[i] - closes[i - 1]) / closes[i - 1]
            for i in range(1, len(closes))
            if closes[i - 1] > 0
        ]
        if len(daily_returns) < 2:
            return 1.0
        vol = stdev(daily_returns) * math.sqrt(252)
        market_vol = 0.15  # ~15% annualized market vol assumption
        return vol / market_vol if market_vol > 0 else 1.0

    def _calculate_risk_level(self, volatility: float, max_drawdown: float, beta: float) -> str:
        risk_score = 0
        if volatility > 40:
            risk_score += 3
        elif volatility > 25:
            risk_score += 2
        elif volatility > 15:
            risk_score += 1

        if max_drawdown > 30:
            risk_score += 3
        elif max_drawdown > 15:
            risk_score += 2
        elif max_drawdown > 8:
            risk_score += 1

        if beta > 1.5:
            risk_score += 2
        elif beta > 1.0:
            risk_score += 1

        if risk_score >= 6:
            return "VERY HIGH"
        elif risk_score >= 4:
            return "HIGH"
        elif risk_score >= 2:
            return "MEDIUM"
        return "LOW"

    def _find_support_resistance(self, closes: list[float]) -> tuple[float, float]:
        if len(closes) < 20:
            return (closes[-1] * 0.95, closes[-1] * 1.05)
        recent = closes[-60:] if len(closes) >= 60 else closes
        lows = []
        highs = []
        for i in range(2, len(recent) - 2):
            if recent[i] <= recent[i - 1] and recent[i] <= recent[i - 2] and recent[i] <= recent[i + 1] and recent[i] <= recent[i + 2]:
                lows.append(recent[i])
            if recent[i] >= recent[i - 1] and recent[i] >= recent[i - 2] and recent[i] >= recent[i + 1] and recent[i] >= recent[i + 2]:
                highs.append(recent[i])
        current = closes[-1]
        support = max([l for l in lows if l < current], default=current * 0.95)
        resistance = min([h for h in highs if h > current], default=current * 1.05)
        return (support, resistance)

    async def get_stock_data(self, symbol: str) -> StockPrice:
        normalized_symbol = self._normalize_symbol(symbol)
        quote, price = await asyncio.gather(
            self._fetch_quote(normalized_symbol),
            self._fetch_price(normalized_symbol),
        )

        return StockPrice(
            symbol=normalized_symbol,
            price=round(price, 2),
            currency=str(quote.get("currency") or ""),
            exchange=str(quote.get("exchange") or quote.get("mic_code") or ""),
            short_name=str(quote.get("name") or normalized_symbol),
        )

    async def get_stock_analysis(self, symbol: str) -> StockAnalysis:
        normalized_symbol = self._normalize_symbol(symbol)
        candles = await self._fetch_daily_candles(normalized_symbol)
        closes = [float(candle["close"]) for candle in candles]

        current_price = closes[-1]
        rsi = self._calculate_rsi(closes, period=14)
        ma50 = self._calculate_sma(closes, window=50)
        ma200 = self._calculate_sma(closes, window=200)
        volatility = self._calculate_annualized_volatility(closes)
        signal = self._calculate_signal(current_price, rsi, ma50, ma200)

        # Enhanced risk metrics
        max_drawdown = self._calculate_max_drawdown(closes)
        sharpe_ratio = self._calculate_sharpe_ratio(closes)
        beta = self._calculate_beta(closes)
        risk_level = self._calculate_risk_level(volatility, max_drawdown, beta)
        support, resistance = self._find_support_resistance(closes)

        logger.info(
            "Calculated indicators for %s: current_price=%s rsi=%s ma50=%s ma200=%s volatility=%s signal=%s risk=%s",
            normalized_symbol,
            round(current_price, 4),
            round(rsi, 4),
            round(ma50, 4),
            round(ma200, 4),
            round(volatility, 4),
            signal,
            risk_level,
        )

        return StockAnalysis(
            symbol=normalized_symbol,
            current_price=round(current_price, 2),
            rsi=round(rsi, 2),
            ma50=round(ma50, 2),
            ma200=round(ma200, 2),
            volatility=round(volatility, 2),
            signal=signal,
            max_drawdown=round(max_drawdown, 2),
            sharpe_ratio=round(sharpe_ratio, 2),
            beta=round(beta, 2),
            risk_level=risk_level,
            support_level=round(support, 2),
            resistance_level=round(resistance, 2),
        )


data_service = DataService()
