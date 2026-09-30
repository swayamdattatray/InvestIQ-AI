"""
Backtest Service
Runs simulated trading strategies on historical candle data.
"""

import math
from statistics import stdev
from typing import List

from app.models.schemas import BacktestRequest, BacktestResult, BacktestTrade


DailyCandle = dict[str, float | str]


def _calculate_rsi(closes: list[float], period: int = 14) -> list[float]:
    """Return RSI value for each index (NaN-padded for early indices)."""
    rsi_values = [50.0] * len(closes)
    if len(closes) <= period:
        return rsi_values

    for i in range(period, len(closes)):
        changes = [closes[j] - closes[j - 1] for j in range(i - period + 1, i + 1)]
        gains = [max(c, 0.0) for c in changes]
        losses = [abs(min(c, 0.0)) for c in changes]
        avg_gain = sum(gains) / period
        avg_loss = sum(losses) / period
        if avg_loss == 0:
            rsi_values[i] = 100.0 if avg_gain > 0 else 50.0
        else:
            rs = avg_gain / avg_loss
            rsi_values[i] = 100 - (100 / (1 + rs))

    return rsi_values


def _calculate_sma(closes: list[float], window: int) -> list[float | None]:
    """Return SMA value for each index (None for early indices)."""
    result: list[float | None] = [None] * len(closes)
    for i in range(window - 1, len(closes)):
        result[i] = sum(closes[i - window + 1 : i + 1]) / window
    return result


def run_backtest(
    candles: List[DailyCandle],
    params: BacktestRequest,
) -> dict:
    """Execute backtest and return raw result dict."""
    closes = [float(c["close"]) for c in candles]
    dates = [str(c["date"]) for c in candles]

    rsi_values = _calculate_rsi(closes, period=14)
    ma_short = _calculate_sma(closes, params.ma_short_period)
    ma_long = _calculate_sma(closes, params.ma_long_period)

    capital = params.initial_capital
    shares = 0
    entry_price = 0.0
    trades: list[BacktestTrade] = []
    portfolio_values: list[float] = []
    trade_returns: list[float] = []

    start_index = max(params.ma_long_period, 14)

    for i in range(start_index, len(closes)):
        price = closes[i]
        current_portfolio = capital + shares * price
        portfolio_values.append(current_portfolio)

        if ma_short[i] is None or ma_long[i] is None:
            continue

        rsi = rsi_values[i]
        sma_s = ma_short[i]
        sma_l = ma_long[i]

        # BUY signal
        if shares == 0:
            is_buy = (rsi < params.rsi_buy_threshold) or (
                price > sma_s > sma_l and rsi < params.rsi_sell_threshold
            )
            if is_buy:
                shares = int(capital // price)
                if shares > 0:
                    cost = shares * price
                    capital -= cost
                    entry_price = price
                    trades.append(
                        BacktestTrade(
                            date=dates[i],
                            action="BUY",
                            price=round(price, 2),
                            shares=shares,
                            value=round(cost, 2),
                            portfolio_value=round(capital + shares * price, 2),
                        )
                    )

        # SELL signal
        elif shares > 0:
            is_sell = (rsi > params.rsi_sell_threshold) or (
                price < sma_s < sma_l and rsi > params.rsi_buy_threshold
            )
            if is_sell:
                proceeds = shares * price
                capital += proceeds
                ret = ((price - entry_price) / entry_price) * 100
                trade_returns.append(ret)
                trades.append(
                    BacktestTrade(
                        date=dates[i],
                        action="SELL",
                        price=round(price, 2),
                        shares=shares,
                        value=round(proceeds, 2),
                        portfolio_value=round(capital, 2),
                    )
                )
                shares = 0
                entry_price = 0.0

    # Close any open position at last price
    if shares > 0 and closes:
        last_price = closes[-1]
        proceeds = shares * last_price
        capital += proceeds
        ret = ((last_price - entry_price) / entry_price) * 100
        trade_returns.append(ret)
        trades.append(
            BacktestTrade(
                date=dates[-1],
                action="SELL (CLOSE)",
                price=round(last_price, 2),
                shares=shares,
                value=round(proceeds, 2),
                portfolio_value=round(capital, 2),
            )
        )
        shares = 0

    final_value = capital
    total_return = ((final_value - params.initial_capital) / params.initial_capital) * 100

    # Max drawdown
    max_drawdown = 0.0
    if portfolio_values:
        peak = portfolio_values[0]
        for v in portfolio_values:
            if v > peak:
                peak = v
            dd = ((peak - v) / peak) * 100
            if dd > max_drawdown:
                max_drawdown = dd

    # Win rate
    winning = [r for r in trade_returns if r > 0]
    losing = [r for r in trade_returns if r <= 0]
    win_rate = (len(winning) / len(trade_returns) * 100) if trade_returns else 0.0

    # Sharpe ratio (annualized, risk-free rate = 6% for India)
    sharpe = 0.0
    if len(portfolio_values) > 1:
        daily_returns = []
        for j in range(1, len(portfolio_values)):
            if portfolio_values[j - 1] > 0:
                daily_returns.append(
                    (portfolio_values[j] - portfolio_values[j - 1]) / portfolio_values[j - 1]
                )
        if len(daily_returns) > 1:
            avg_ret = sum(daily_returns) / len(daily_returns)
            std_ret = stdev(daily_returns)
            if std_ret > 0:
                risk_free_daily = 0.06 / 252
                sharpe = ((avg_ret - risk_free_daily) / std_ret) * math.sqrt(252)

    best_trade = max(trade_returns) if trade_returns else 0.0
    worst_trade = min(trade_returns) if trade_returns else 0.0

    return BacktestResult(
        symbol="",  # will be filled by caller
        strategy=f"RSI({params.rsi_buy_threshold}/{params.rsi_sell_threshold}) + MA({params.ma_short_period}/{params.ma_long_period})",
        initial_capital=round(params.initial_capital, 2),
        final_value=round(final_value, 2),
        total_return_pct=round(total_return, 2),
        max_drawdown_pct=round(max_drawdown, 2),
        win_rate_pct=round(win_rate, 2),
        total_trades=len(trade_returns),
        winning_trades=len(winning),
        losing_trades=len(losing),
        sharpe_ratio=round(sharpe, 2),
        best_trade_pct=round(best_trade, 2),
        worst_trade_pct=round(worst_trade, 2),
        trades=trades,
    )
