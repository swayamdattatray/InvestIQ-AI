import pytest
import asyncio
import pandas as pd
from unittest.mock import MagicMock, patch
from app.services.data_service import DataService

@pytest.mark.asyncio
async def test_get_stock_data_nse():
    service = DataService()
    
    # Mock yf.Ticker
    with patch("yfinance.Ticker") as mock_ticker_class:
        mock_ticker = MagicMock()
        mock_ticker_class.return_value = mock_ticker
        
        # Mock .info
        mock_ticker.info = {
            "shortName": "Reliance Industries Limited",
            "currentPrice": 2500.00,
            "currency": "INR",
            "exchange": "NSE"
        }
        
        # Mock .history for good measure (though info should be tried first)
        mock_ticker.history.return_value = pd.DataFrame({
            "Close": [2500.00]
        }, index=pd.to_datetime(["2024-01-01"]))
        
        result = await service.get_stock_data("RELIANCE.NS")
        
        assert result.symbol == "RELIANCE.NS"
        assert result.price == 2500.00
        assert result.currency == "INR"
        assert result.exchange == "NSE"
        assert "Reliance" in result.short_name

@pytest.mark.asyncio
async def test_get_stock_data_us_stock():
    service = DataService()
    
    with patch("yfinance.Ticker") as mock_ticker_class:
        mock_ticker = MagicMock()
        mock_ticker_class.return_value = mock_ticker
        
        mock_ticker.info = {
            "shortName": "International Business Machines",
            "currentPrice": 140.00,
            "currency": "USD",
            "exchange": "NYSE"
        }
        
        result = await service.get_stock_data("IBM")
        
        assert result.symbol == "IBM"
        assert result.price == 140.00
        assert result.currency == "USD"
        assert result.short_name == "International Business Machines"

@pytest.mark.asyncio
async def test_get_stock_analysis_logic():
    service = DataService()
    
    with patch("yfinance.Ticker") as mock_ticker_class:
        mock_ticker = MagicMock()
        mock_ticker_class.return_value = mock_ticker
        
        # Create dummy history data (250 days)
        data = {
            "Close": [100.0 + i for i in range(250)]
        }
        df = pd.DataFrame(data, index=pd.date_range(start="2023-01-01", periods=250))
        mock_ticker.history.return_value = df
        
        result = await service.get_stock_analysis("RELIANCE.NS")
        
        assert result.symbol == "RELIANCE.NS"
        assert result.current_price == 349.0  # 100 + 249
        assert result.rsi is not None
        assert result.ma50 is not None
        assert result.ma200 is not None
        assert result.volatility is not None
        assert result.signal in ["BUY", "SELL", "HOLD"]
