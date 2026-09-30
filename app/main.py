from fastapi import FastAPI, HTTPException
from app.core.config import settings
from app.models.schemas import (
    HealthResponse,
    StockPrice,
    StockAnalysis,
    PaperTradeRequest,
    PaperTradeResponse,
    PortfolioResponse,
    TradeHistoryResponse,
    BacktestRequest,
    BacktestResult,
)
from app.services.data_service import data_service
from app.services.paper_trading_service import paper_trading_service
from app.services.backtest_service import run_backtest
from app.services import ai_guide_service
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# Health & Stock Endpoints (existing)
# ──────────────────────────────────────────────

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


# ──────────────────────────────────────────────
# Paper Trading Endpoints
# ──────────────────────────────────────────────

@app.post("/paper-trade/execute", response_model=PaperTradeResponse)
async def execute_paper_trade(req: PaperTradeRequest):
    try:
        price_data = await data_service.get_stock_data(req.symbol)
        result = paper_trading_service.execute_trade(req, price_data.price)
        return result
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/paper-trade/portfolio", response_model=PortfolioResponse)
async def get_paper_portfolio():
    try:
        holdings = paper_trading_service.get_history()
        symbols = set()
        for t in holdings.trades:
            symbols.add(t.symbol)

        price_map = {}
        for sym in symbols:
            try:
                sd = await data_service.get_stock_data(sym)
                price_map[sym] = sd.price
            except Exception:
                pass

        return paper_trading_service.get_portfolio(price_map)
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/paper-trade/history", response_model=TradeHistoryResponse)
async def get_paper_history():
    return paper_trading_service.get_history()


@app.post("/paper-trade/reset")
async def reset_paper_portfolio():
    return paper_trading_service.reset()


# ──────────────────────────────────────────────
# Backtesting Endpoint
# ──────────────────────────────────────────────

@app.post("/backtest/{symbol}", response_model=BacktestResult)
async def backtest_stock(symbol: str, req: BacktestRequest = None):
    if req is None:
        req = BacktestRequest()
    try:
        normalized = symbol.strip().upper()
        candles = await data_service._fetch_daily_candles(normalized)
        result = run_backtest(candles, req)
        result.symbol = normalized
        return result
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
# AI Guide Endpoints
# ──────────────────────────────────────────────

@app.get("/ai-guide/lessons")
async def get_lessons():
    return ai_guide_service.get_all_lessons()


@app.get("/ai-guide/lessons/{lesson_id}")
async def get_lesson(lesson_id: int):
    lesson = ai_guide_service.get_lesson_by_id(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@app.get("/ai-guide/glossary")
async def get_glossary():
    return ai_guide_service.get_glossary()


@app.get("/ai-guide/explain/{symbol}")
async def explain_stock(symbol: str):
    try:
        analysis = await data_service.get_stock_analysis(symbol)
        guidance = ai_guide_service.generate_stock_guidance(analysis)
        return guidance
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
