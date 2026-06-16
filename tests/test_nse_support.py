import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException
from app.services.data_service import DataService

@pytest.mark.asyncio
async def test_get_stock_data_nse_mapping():
    service = DataService()
    
    # Mocking httpx.AsyncClient.get
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        # Mock responses
        mock_quote_resp = MagicMock()
        mock_quote_resp.status_code = 200
        mock_quote_resp.json.return_value = {
            "Global Quote": {
                "01. symbol": "RELIANCE.BSE",
                "05. price": "2500.00"
            }
        }
        mock_quote_resp.raise_for_status.return_value = None
        
        mock_overview_resp = MagicMock()
        mock_overview_resp.status_code = 200
        mock_overview_resp.json.return_value = {} # Empty for NSE/BSE
        mock_overview_resp.raise_for_status.return_value = None
        
        mock_get.side_effect = [mock_quote_resp, mock_overview_resp]
        
        result = await service.get_stock_data("RELIANCE.NS")
        
        assert result.symbol == "RELIANCE.NS"
        assert result.price == 2500.00
        assert result.currency == "INR"
        assert result.exchange == "BSE"
        assert result.short_name == "RELIANCE"
        
        # Verify mapping
        called_symbols = [call.kwargs["params"]["symbol"] for call in mock_get.call_args_list]
        assert "RELIANCE.BSE" in called_symbols

@pytest.mark.asyncio
async def test_get_stock_data_us_stock():
    service = DataService()
    
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_quote_resp = MagicMock()
        mock_quote_resp.status_code = 200
        mock_quote_resp.json.return_value = {
            "Global Quote": {
                "01. symbol": "IBM",
                "05. price": "140.00"
            }
        }
        mock_quote_resp.raise_for_status.return_value = None
        
        mock_overview_resp = MagicMock()
        mock_overview_resp.status_code = 200
        mock_overview_resp.json.return_value = {
            "Name": "International Business Machines",
            "Currency": "USD",
            "Exchange": "NYSE"
        }
        mock_overview_resp.raise_for_status.return_value = None
        
        mock_get.side_effect = [mock_quote_resp, mock_overview_resp]
        
        result = await service.get_stock_data("IBM")
        
        assert result.symbol == "IBM"
        assert result.price == 140.00
        assert result.currency == "USD"
        assert result.exchange == "NYSE"
        assert result.short_name == "International Business Machines"

@pytest.mark.asyncio
async def test_get_stock_analysis_nse_mapping():
    service = DataService()
    
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        
        # Generate dummy time series data (200+ days)
        time_series = {}
        from datetime import datetime, timedelta
        for i in range(250):
            date = (datetime(2023, 1, 1) + timedelta(days=i)).strftime("%Y-%m-%d")
            time_series[date] = {
                "1. open": "100", "2. high": "110", "3. low": "90", "4. close": str(100 + i), "5. volume": "1000"
            }
            
        mock_resp.json.return_value = {
            "Meta Data": {"2. Symbol": "RELIANCE.BSE"},
            "Time Series (Daily)": time_series
        }
        mock_resp.raise_for_status.return_value = None
        mock_get.return_value = mock_resp
        
        result = await service.get_stock_analysis("RELIANCE.NS")
        
        assert result.symbol == "RELIANCE.NS"
        assert mock_get.call_args.kwargs["params"]["symbol"] == "RELIANCE.BSE"
