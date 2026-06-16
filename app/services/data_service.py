import httpx
import asyncio
import pandas as pd
import numpy as np
import math
from fastapi import HTTPException
from app.core.config import settings
from app.models.schemas import StockPrice, StockAnalysis


class DataService:
    def __init__(self):
        self.base_url = "https://www.alphavantage.co/query"
        self.api_key = settings.ALPHA_VANTAGE_API_KEY

    def _normalize_symbol(self, symbol: str) -> str:
        """
        Maps standard suffixes to Alpha Vantage specific ones.
        Yahoo Finance (.NS) -> Alpha Vantage (.BSE)
        Alpha Vantage often has better coverage for .BSE than .NSE.
        """
        s = symbol.upper()
        if s.endswith(".NS"):
            return s.replace(".NS", ".BSE")
        return s

    async def get_stock_data(self, symbol: str) -> StockPrice:
        """
        Fetches stock data from Alpha Vantage API.
        Uses GLOBAL_QUOTE for the latest price and OVERVIEW for metadata.
        """
        normalized_symbol = self._normalize_symbol(symbol)
        print(f"DEBUG: Starting async fetch for symbol: {symbol} (Mapped to: {normalized_symbol})")
        
        async with httpx.AsyncClient() as client:
            # Prepare requests
            quote_params = {
                "function": "GLOBAL_QUOTE",
                "symbol": normalized_symbol,
                "apikey": self.api_key
            }
            overview_params = {
                "function": "OVERVIEW",
                "symbol": normalized_symbol,
                "apikey": self.api_key
            }

            try:
                # Fetch both concurrently
                print(f"DEBUG: Requesting Alpha Vantage data for {normalized_symbol}...")
                responses = await asyncio.gather(
                    client.get(self.base_url, params=quote_params, timeout=10.0),
                    client.get(self.base_url, params=overview_params, timeout=10.0)
                )
                
                quote_resp, overview_resp = responses
                quote_resp.raise_for_status()
                overview_resp.raise_for_status()
                
                quote_data = quote_resp.json()
                overview_data = overview_resp.json()

                # Essential data check
                self._check_api_errors(quote_data, overview_data)
                
                quote = quote_data.get("Global Quote", {})
                if not quote or "05. price" not in quote:
                    raise HTTPException(status_code=404, detail=f"Stock symbol '{symbol}' (mapped to '{normalized_symbol}') not found or not supported by the data provider.")

                price = float(quote["05. price"])

                # Metadata handling with fallback for international stocks
                # OVERVIEW often fails for non-US symbols
                name = overview_data.get("Name")
                currency = overview_data.get("Currency")
                exchange = overview_data.get("Exchange")

                if not name or not currency:
                    # Fallback logic for Indian stocks
                    if normalized_symbol.endswith(".BSE") or normalized_symbol.endswith(".NSE"):
                        name = name or symbol.split(".")[0]
                        currency = currency or "INR"
                        exchange = exchange or ("NSE" if ".NSE" in normalized_symbol else "BSE")
                    else:
                        name = name or normalized_symbol
                        currency = currency or "USD"
                        exchange = exchange or "Unknown"

                return StockPrice(
                    symbol=symbol.upper(),
                    price=price,
                    currency=currency,
                    exchange=exchange,
                    short_name=name
                )

            except httpx.RequestError as exc:
                raise HTTPException(status_code=503, detail=f"API unavailable: {exc}")
            except Exception as e:
                if isinstance(e, HTTPException): raise e
                raise HTTPException(status_code=500, detail=str(e))

    async def get_stock_analysis(self, symbol: str) -> StockAnalysis:
        """
        Fetches historical data and calculates RSI, MA50, MA200, and Volatility.
        """
        normalized_symbol = self._normalize_symbol(symbol)
        print(f"DEBUG: Starting analysis for symbol: {symbol} (Mapped to: {normalized_symbol})")
        
        async with httpx.AsyncClient() as client:
            params = {
                "function": "TIME_SERIES_DAILY",
                "symbol": normalized_symbol,
                "outputsize": "full", # Required for 200-day MA
                "apikey": self.api_key
            }

            try:
                response = await client.get(self.base_url, params=params, timeout=15.0)
                response.raise_for_status()
                data = response.json()

                self._check_api_errors(data)

                time_series = data.get("Time Series (Daily)")
                if not time_series:
                    raise HTTPException(status_code=404, detail=f"No historical data found for '{symbol}'.")

                # Convert to DataFrame
                df = pd.DataFrame.from_dict(time_series, orient="index")
                df.columns = ["Open", "High", "Low", "Close", "Volume"]
                df = df.astype(float)
                df.index = pd.to_datetime(df.index)
                df = df.sort_index() # Newest last

                if len(df) < 200:
                    raise HTTPException(status_code=400, detail="Insufficient data for 200-day analysis.")

                # Calculations
                current_price = df["Close"].iloc[-1]
                ma50 = df["Close"].rolling(window=50).mean().iloc[-1]
                ma200 = df["Close"].rolling(window=200).mean().iloc[-1]
                
                # RSI Calculation (Standard 14-day)
                delta = df["Close"].diff()
                gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
                loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
                rs = gain / loss
                rsi = 100 - (100 / (1 + rs.iloc[-1]))

                # Volatility (Annualized std of daily returns)
                # Using 252 trading days for annualization
                daily_returns = df["Close"].pct_change()
                volatility = daily_returns.std() * math.sqrt(252) * 100 # In percentage

                # Signal logic
                if rsi < 30:
                    signal = "BUY"
                elif rsi > 70:
                    signal = "SELL"
                else:
                    signal = "HOLD"

                return StockAnalysis(
                    symbol=symbol.upper(),
                    current_price=round(float(current_price), 2),
                    rsi=round(float(rsi), 2),
                    ma50=round(float(ma50), 2),
                    ma200=round(float(ma200), 2),
                    volatility=round(float(volatility), 2),
                    signal=signal
                )

            except httpx.RequestError as exc:
                raise HTTPException(status_code=503, detail=f"API unavailable: {exc}")
            except Exception as e:
                if isinstance(e, HTTPException): raise e
                raise HTTPException(status_code=500, detail=str(e))

    def _check_api_errors(self, *data_dicts):
        for data in data_dicts:
            if "Note" in data:
                raise HTTPException(status_code=429, detail="API rate limit exceeded.")
            if "Error Message" in data:
                raise HTTPException(status_code=400, detail=f"API Error: {data['Error Message']}")
            if "Information" in data:
                # Often "Information" means the symbol doesn't exist or demo key limits
                if "Invalid API call" in data["Information"]:
                    raise HTTPException(status_code=400, detail="Invalid API call. Check symbol.")


data_service = DataService()
