import asyncio
import pandas as pd
import numpy as np
import math
import requests
from fastapi import HTTPException
from app.core.config import settings
from app.models.schemas import StockPrice, StockAnalysis


class DataService:
    def __init__(self):
        """
        Switched to Alpha Vantage as the primary data provider.
        Uses settings.ALPHA_VANTAGE_API_KEY for authentication.
        """
        self.api_key = settings.ALPHA_VANTAGE_API_KEY
        self.base_url = "https://www.alphavantage.co/query"

    def _fetch_from_alpha_vantage(self, params: dict):
        """
        Helper to make synchronous requests to Alpha Vantage with error handling.
        """
        params["apikey"] = self.api_key
        try:
            response = requests.get(self.base_url, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()
            
            # Check for Alpha Vantage specific rate limiting message
            if "Note" in data:
                print(f"DEBUG: [Alpha Vantage] Rate limit hit: {data['Note']}")
                raise HTTPException(status_code=429, detail="Alpha Vantage rate limit exceeded. Standard API limit is 5 requests per minute.")
            
            # Check for Error Message (Invalid symbol/API call)
            if "Error Message" in data:
                print(f"DEBUG: [Alpha Vantage] API Error: {data['Error Message']}")
                raise HTTPException(status_code=404, detail="Stock symbol not found or invalid API call.")
                
            return data
        except requests.exceptions.RequestException as e:
            print(f"DEBUG: [Alpha Vantage] Request exception: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to connect to Alpha Vantage: {str(e)}")

    async def get_stock_data(self, symbol: str) -> StockPrice:
        """
        Fetches real-time stock price using Alpha Vantage GLOBAL_QUOTE.
        """
        print(f"\nDEBUG: [get_stock_data] Requested symbol: {symbol}")
        
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": symbol
        }
        
        try:
            data = await asyncio.to_thread(self._fetch_from_alpha_vantage, params)
            quote = data.get("Global Quote", {})
            
            if not quote or "05. price" not in quote:
                print(f"DEBUG: [get_stock_data] No quote data found for {symbol}")
                raise HTTPException(status_code=404, detail=f"Stock symbol '{symbol}' not found or no price data available.")

            price = float(quote.get("05. price", 0))
            print(f"DEBUG: [get_stock_data] Price found: {price}")

            # Alpha Vantage doesn't provide currency/exchange in GLOBAL_QUOTE.
            # We determine it based on symbol suffix or default to US markets.
            currency = "USD"
            exchange = "US"
            name = symbol.upper()
            
            if symbol.upper().endswith(".NS"):
                currency = "INR"
                exchange = "NSE"
            elif symbol.upper().endswith(".BSE"):
                currency = "INR"
                exchange = "BSE"

            return StockPrice(
                symbol=symbol.upper(),
                price=price,
                currency=currency,
                exchange=exchange,
                short_name=name
            )

        except Exception as e:
            print(f"DEBUG: [get_stock_data] Error for {symbol}: {str(e)}")
            if isinstance(e, HTTPException): raise e
            raise HTTPException(status_code=500, detail=str(e))

    async def get_stock_analysis(self, symbol: str) -> StockAnalysis:
        """
        Calculates RSI, MA50, MA200, and Volatility using historical data from Alpha Vantage.
        """
        print(f"\nDEBUG: [get_stock_analysis] Requested symbol: {symbol}")
        
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": symbol,
            "outputsize": "full" # Needed for MA200
        }
        
        try:
            data = await asyncio.to_thread(self._fetch_from_alpha_vantage, params)
            time_series = data.get("Time Series (Daily)", {})
            
            if not time_series:
                print(f"DEBUG: [get_stock_analysis] No historical data found for {symbol}")
                raise HTTPException(status_code=404, detail=f"No historical data found for '{symbol}'.")

            print(f"DEBUG: [get_stock_analysis] Received {len(time_series)} days of data")

            # Convert to DataFrame
            df = pd.DataFrame.from_dict(time_series, orient='index', dtype=float)
            df.index = pd.to_datetime(df.index)
            df.sort_index(inplace=True)
            
            # Rename columns to standard names
            df.rename(columns={
                "1. open": "Open",
                "2. high": "High",
                "3. low": "Low",
                "4. close": "Close",
                "5. volume": "Volume"
            }, inplace=True)

            current_price = df["Close"].iloc[-1]
            
            # Calculations
            ma50 = df["Close"].rolling(window=50).mean().iloc[-1] if len(df) >= 50 else current_price
            ma200 = df["Close"].rolling(window=200).mean().iloc[-1] if len(df) >= 200 else current_price
            
            # RSI Calculation (14-day)
            delta = df["Close"].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            rsi_val = 100 - (100 / (1 + rs.iloc[-1])) if not rs.empty and rs.iloc[-1] != -1 else 50.0
            
            # Handle potential NaN RSI
            rsi = float(rsi_val) if not np.isnan(rsi_val) else 50.0

            # Volatility (Annualized)
            daily_returns = df["Close"].pct_change().dropna()
            volatility = daily_returns.std() * math.sqrt(252) * 100 if not daily_returns.empty else 0.0

            print(f"DEBUG: [get_stock_analysis] Calculations for {symbol}:")
            print(f"      - Price: {current_price:.2f}")
            print(f"      - RSI: {rsi:.2f}")
            print(f"      - MA50: {ma50:.2f}")
            print(f"      - MA200: {ma200:.2f}")
            print(f"      - Volatility: {volatility:.2f}%")

            # Signal logic
            if rsi < 30:
                signal = "BUY"
            elif rsi > 70:
                signal = "SELL"
            else:
                signal = "HOLD"
            
            print(f"DEBUG: [get_stock_analysis] Resulting signal: {signal}")

            return StockAnalysis(
                symbol=symbol.upper(),
                current_price=round(float(current_price), 2),
                rsi=round(float(rsi), 2),
                ma50=round(float(ma50), 2),
                ma200=round(float(ma200), 2),
                volatility=round(float(volatility), 2),
                signal=signal
            )

        except Exception as e:
            print(f"DEBUG: [get_stock_analysis] Error for {symbol}: {str(e)}")
            if isinstance(e, HTTPException): raise e
            raise HTTPException(status_code=500, detail=str(e))


data_service = DataService()
