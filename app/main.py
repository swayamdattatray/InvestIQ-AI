from fastapi import FastAPI, HTTPException
from app.core.config import settings
from app.models.schemas import HealthResponse, StockPrice, StockAnalysis
from app.services.data_service import data_service

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="ok", version=settings.VERSION)

@app.get("/stock/{symbol}", response_model=StockPrice)
async def get_stock(symbol: str):
    try:
        data = await data_service.get_stock_data(symbol)
        return data
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stock/{symbol}/analysis", response_model=StockAnalysis)
async def get_stock_analysis(symbol: str):
    try:
        data = await data_service.get_stock_analysis(symbol)
        return data
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
