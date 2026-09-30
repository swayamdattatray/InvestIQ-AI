"""
AI Guide Service
Rule-based intelligent trading mentor for beginners.
Generates contextual explanations, lessons, and stock-specific guidance.
"""

from typing import Optional
from app.models.schemas import StockAnalysis


# ──────────────────────────────────────────────
# Trading Lessons for Beginners
# ──────────────────────────────────────────────

LESSONS = [
    {
        "id": 1,
        "title": "What is a Stock?",
        "category": "basics",
        "emoji": "📈",
        "difficulty": "beginner",
        "content": (
            "A stock represents a small piece of ownership in a company. "
            "When you buy a stock, you become a part-owner (shareholder) of that company. "
            "If the company does well, your stock value goes up. If it does poorly, it goes down.\n\n"
            "**Example:** If a company has 1,000 shares and you own 10, you own 1% of the company.\n\n"
            "**Key takeaway:** Buying a stock = betting that a company will grow in value over time."
        ),
    },
    {
        "id": 2,
        "title": "What is a Stock Price?",
        "category": "basics",
        "emoji": "💰",
        "difficulty": "beginner",
        "content": (
            "A stock price is the current cost of buying one share of a company. "
            "It changes every second during market hours based on supply and demand.\n\n"
            "**Price goes UP** when more people want to buy the stock (demand > supply).\n"
            "**Price goes DOWN** when more people want to sell (supply > demand).\n\n"
            "**Key takeaway:** Stock prices reflect what the market collectively believes a company is worth right now."
        ),
    },
    {
        "id": 3,
        "title": "What is RSI (Relative Strength Index)?",
        "category": "indicators",
        "emoji": "📊",
        "difficulty": "intermediate",
        "content": (
            "RSI is a number between 0 and 100 that measures how fast a stock's price has been moving.\n\n"
            "🟢 **RSI below 30** → The stock may be *oversold* (too cheap) — could be a buying opportunity.\n"
            "🔴 **RSI above 70** → The stock may be *overbought* (too expensive) — might drop soon.\n"
            "🟡 **RSI between 30-70** → The stock is in a *neutral* zone.\n\n"
            "**Think of it like a speedometer:** If a stock has been going up too fast (high RSI), "
            "it might need to slow down or reverse. If it's been falling too fast (low RSI), it might bounce back.\n\n"
            "**Key takeaway:** RSI helps you avoid buying at the peak or selling at the bottom."
        ),
    },
    {
        "id": 4,
        "title": "What are Moving Averages (MA)?",
        "category": "indicators",
        "emoji": "〰️",
        "difficulty": "intermediate",
        "content": (
            "A Moving Average smooths out price data to show the overall trend direction.\n\n"
            "📏 **MA 50 (50-day MA):** Average price over the last 50 days — shows *medium-term* trend.\n"
            "📏 **MA 200 (200-day MA):** Average price over the last 200 days — shows *long-term* trend.\n\n"
            "**Golden Cross** 🌟: When MA50 crosses ABOVE MA200 → Bullish signal (prices trending up).\n"
            "**Death Cross** 💀: When MA50 crosses BELOW MA200 → Bearish signal (prices trending down).\n\n"
            "**Simple rule:**\n"
            "- Price ABOVE both MAs → Uptrend (good for buying)\n"
            "- Price BELOW both MAs → Downtrend (be cautious)\n\n"
            "**Key takeaway:** Moving averages help you see the forest (trend) instead of the trees (daily noise)."
        ),
    },
    {
        "id": 5,
        "title": "What is Volatility?",
        "category": "risk",
        "emoji": "🌊",
        "difficulty": "intermediate",
        "content": (
            "Volatility measures how wildly a stock's price swings up and down.\n\n"
            "🟢 **Low volatility (< 15%):** Calm, steady price movement — safer but slower gains.\n"
            "🟡 **Medium volatility (15-30%):** Normal price swings — balanced risk/reward.\n"
            "🔴 **High volatility (> 30%):** Wild price swings — higher risk but potential for bigger gains.\n\n"
            "**Real-world analogy:** Low volatility is like a calm lake. High volatility is like a stormy sea. "
            "Both can get you to your destination, but one requires more skill to navigate.\n\n"
            "**Key takeaway:** Higher volatility = higher risk AND higher potential reward. "
            "Beginners should start with lower-volatility stocks."
        ),
    },
    {
        "id": 6,
        "title": "What are Support & Resistance Levels?",
        "category": "indicators",
        "emoji": "🏗️",
        "difficulty": "intermediate",
        "content": (
            "**Support** is a price level where a stock tends to stop falling and bounce back up. "
            "Think of it as a 'floor' that catches the price.\n\n"
            "**Resistance** is a price level where a stock tends to stop rising and pull back down. "
            "Think of it as a 'ceiling' that blocks the price.\n\n"
            "🟢 **Near support** → Might be a good entry point (price is near the floor).\n"
            "🔴 **Near resistance** → Might face difficulty going higher (price is near the ceiling).\n\n"
            "**Key takeaway:** Buy near support, be cautious near resistance. "
            "If price breaks through resistance, it often signals a strong upward move."
        ),
    },
    {
        "id": 7,
        "title": "What is a Sharpe Ratio?",
        "category": "risk",
        "emoji": "⚖️",
        "difficulty": "advanced",
        "content": (
            "The Sharpe Ratio tells you how much return you're getting for the risk you're taking.\n\n"
            "📊 **Sharpe > 1.0** → Good! You're being well-compensated for the risk.\n"
            "📊 **Sharpe 0 to 1.0** → Okay, but risk-reward isn't great.\n"
            "📊 **Sharpe < 0** → Bad! You're losing money after accounting for risk.\n\n"
            "**Analogy:** Imagine two jobs. Both pay the same salary, but one is dangerous. "
            "The Sharpe Ratio is like asking: 'Am I getting paid enough extra for the danger?'\n\n"
            "**Key takeaway:** A higher Sharpe Ratio means better risk-adjusted returns. "
            "Always compare Sharpe Ratios when choosing between investments."
        ),
    },
    {
        "id": 8,
        "title": "What is Max Drawdown?",
        "category": "risk",
        "emoji": "📉",
        "difficulty": "advanced",
        "content": (
            "Max Drawdown is the biggest peak-to-trough drop a stock has experienced. "
            "It answers: 'What's the WORST decline I could have suffered?'\n\n"
            "📉 **< 10% drawdown** → Relatively stable.\n"
            "📉 **10-20% drawdown** → Normal for most stocks.\n"
            "📉 **> 30% drawdown** → Very risky — the stock dropped by a third from its peak!\n\n"
            "**Why it matters:** If you invested $10,000 and the max drawdown is 30%, "
            "at some point your investment was worth only $7,000. "
            "Could you handle that without panic-selling?\n\n"
            "**Key takeaway:** Max Drawdown helps you understand the worst-case scenario "
            "and decide if you can emotionally handle the ride."
        ),
    },
    {
        "id": 9,
        "title": "What are BUY / SELL / HOLD Signals?",
        "category": "signals",
        "emoji": "🚦",
        "difficulty": "beginner",
        "content": (
            "These are AI-generated suggestions based on technical analysis:\n\n"
            "🟢 **BUY** → The indicators suggest the stock might go up. Could be a good time to buy.\n"
            "🔴 **SELL** → The indicators suggest the stock might go down. Consider selling or avoiding.\n"
            "🟡 **HOLD** → No strong signal either way. If you own it, keep it. If you don't, wait.\n\n"
            "⚠️ **IMPORTANT:** These signals are based on MATH, not magic! They analyze past price patterns "
            "using RSI and Moving Averages. They are NOT guarantees.\n\n"
            "**Golden rules for beginners:**\n"
            "1. Never invest based on a single signal\n"
            "2. Always do your own research on the company\n"
            "3. Never invest money you can't afford to lose\n"
            "4. Use paper trading to practice first!\n\n"
            "**Key takeaway:** Signals are helpful tools, but treat them as suggestions, not commands."
        ),
    },
    {
        "id": 10,
        "title": "What is Paper Trading?",
        "category": "basics",
        "emoji": "📝",
        "difficulty": "beginner",
        "content": (
            "Paper trading is practicing stock trading with fake (virtual) money. "
            "It's like a flight simulator for investing!\n\n"
            "**Why paper trade?**\n"
            "✅ Learn how trading works without losing real money\n"
            "✅ Test your strategies and see if they actually work\n"
            "✅ Build confidence before investing real money\n"
            "✅ Understand how emotions affect your decisions\n\n"
            "**On InvestIQ-AI**, you start with ₹10,00,000 virtual cash. "
            "You can buy and sell real stocks at real prices — but with zero financial risk.\n\n"
            "**Key takeaway:** Always paper trade for at least 3 months before investing real money. "
            "If you can't make money in paper trading, you won't make money in real trading."
        ),
    },
    {
        "id": 11,
        "title": "What is Backtesting?",
        "category": "strategy",
        "emoji": "🔬",
        "difficulty": "intermediate",
        "content": (
            "Backtesting means testing a trading strategy on PAST data to see how it would have performed.\n\n"
            "**How it works on InvestIQ-AI:**\n"
            "1. Choose a stock (e.g., AAPL)\n"
            "2. Set your strategy rules (RSI thresholds, MA periods)\n"
            "3. The system simulates buying/selling over the past year\n"
            "4. You see the results: total return, win rate, max drawdown\n\n"
            "⚠️ **WARNING:** Past performance does NOT guarantee future results! "
            "A strategy that worked last year might fail this year.\n\n"
            "**What to look for:**\n"
            "- Win rate > 50% → Strategy wins more than it loses\n"
            "- Sharpe ratio > 1 → Good risk-adjusted returns\n"
            "- Max drawdown < 15% → Manageable worst-case scenario\n\n"
            "**Key takeaway:** Backtesting helps you avoid terrible strategies, "
            "but a good backtest doesn't guarantee future success."
        ),
    },
    {
        "id": 12,
        "title": "5 Golden Rules for Beginner Investors",
        "category": "basics",
        "emoji": "🏆",
        "difficulty": "beginner",
        "content": (
            "**Rule 1: Never invest money you can't afford to lose.**\n"
            "Only invest money that you won't need for at least 5 years.\n\n"
            "**Rule 2: Diversify your portfolio.**\n"
            "Don't put all your money in one stock. Spread across different sectors.\n\n"
            "**Rule 3: Don't let emotions drive decisions.**\n"
            "Fear and greed are the enemies of good investing. Stick to your plan.\n\n"
            "**Rule 4: Start small and learn.**\n"
            "Begin with paper trading. Then invest small amounts. Increase as you learn.\n\n"
            "**Rule 5: Think long-term.**\n"
            "The stock market goes up over time. Short-term dips are normal. "
            "Patience is the most powerful investing tool.\n\n"
            "**Key takeaway:** Successful investing is boring. If it feels exciting, you're probably gambling."
        ),
    },
]

GLOSSARY = [
    {"term": "Bull Market", "definition": "A market where prices are rising or expected to rise. Think of a bull charging upward with its horns."},
    {"term": "Bear Market", "definition": "A market where prices are falling or expected to fall. Think of a bear swiping downward with its paw."},
    {"term": "Portfolio", "definition": "Your collection of all investments (stocks, bonds, etc.) that you own."},
    {"term": "Dividend", "definition": "A portion of a company's profit paid to shareholders, usually quarterly. Like earning interest on your investment."},
    {"term": "Market Cap", "definition": "Total value of a company's shares. Market Cap = Stock Price × Total Shares. Large cap = safer, Small cap = riskier."},
    {"term": "P/E Ratio", "definition": "Price-to-Earnings ratio. How much you pay for each rupee of profit. Lower P/E = cheaper stock (usually)."},
    {"term": "Stop-Loss", "definition": "An automatic sell order placed to limit losses. Example: 'Sell if price drops below ₹100' prevents bigger losses."},
    {"term": "IPO", "definition": "Initial Public Offering. When a private company first sells its shares to the public on a stock exchange."},
    {"term": "Blue Chip", "definition": "Large, well-established, financially sound companies with a history of reliable performance. E.g., Reliance, TCS."},
    {"term": "Liquidity", "definition": "How easily you can buy or sell a stock without affecting its price. High liquidity = easy to trade."},
    {"term": "Day Trading", "definition": "Buying and selling stocks within the same day. Very risky for beginners — over 90% of day traders lose money."},
    {"term": "SIP", "definition": "Systematic Investment Plan. Investing a fixed amount regularly (e.g., monthly). Great for beginners as it averages out risk."},
]


def get_all_lessons() -> list[dict]:
    return LESSONS


def get_glossary() -> list[dict]:
    return GLOSSARY


def get_lesson_by_id(lesson_id: int) -> dict | None:
    for lesson in LESSONS:
        if lesson["id"] == lesson_id:
            return lesson
    return None


def generate_stock_guidance(analysis: StockAnalysis) -> dict:
    """Generate beginner-friendly guidance for a specific stock analysis."""
    tips = []
    warnings = []
    explanation_parts = []

    symbol = analysis.symbol
    price = analysis.current_price
    rsi = analysis.rsi
    signal = analysis.signal
    volatility = analysis.volatility
    ma50 = analysis.ma50
    ma200 = analysis.ma200

    # Signal explanation
    if signal == "BUY":
        explanation_parts.append(
            f"📊 **AI Signal: BUY** — The technical indicators suggest {symbol} might be a good buying opportunity right now. "
            f"This doesn't mean it will definitely go up — it means the math-based patterns look favorable."
        )
        tips.append("Consider starting with a small position rather than going all-in.")
        tips.append("Set a stop-loss to protect yourself if the trade goes wrong.")
    elif signal == "SELL":
        explanation_parts.append(
            f"📊 **AI Signal: SELL** — The indicators suggest {symbol} might face downward pressure. "
            f"If you own this stock, you may want to consider your exit strategy. If you don't own it, it's probably not the best time to buy."
        )
        warnings.append("Don't panic sell if you're a long-term investor. Short-term signals don't always apply to long-term holdings.")
    else:
        explanation_parts.append(
            f"📊 **AI Signal: HOLD** — No strong buy or sell signal for {symbol} right now. "
            f"The stock is in a neutral zone. If you already own it, there's no urgent reason to sell. If you're looking to buy, you might want to wait for a clearer signal."
        )

    # RSI explanation
    if rsi < 30:
        explanation_parts.append(
            f"🟢 **RSI is {rsi} (Oversold)** — The stock has been falling a lot recently and might be 'too cheap'. "
            f"Historically, stocks that reach this level often bounce back. But 'oversold' doesn't mean 'guaranteed to go up'."
        )
    elif rsi > 70:
        explanation_parts.append(
            f"🔴 **RSI is {rsi} (Overbought)** — The stock has been rising quickly and might be 'too expensive' right now. "
            f"Stocks at this level sometimes pull back. Be careful about buying at these levels."
        )
        warnings.append("Buying when RSI is above 70 is risky — the stock may be due for a correction.")
    else:
        explanation_parts.append(
            f"🟡 **RSI is {rsi} (Neutral)** — The stock's momentum is neither too hot nor too cold. "
            f"This is the 'normal' zone where most stocks spend their time."
        )

    # Moving averages explanation
    if price > ma50 > ma200:
        explanation_parts.append(
            f"📈 **Trend: Strong Uptrend** — The price (₹{price}) is above both the 50-day (₹{ma50}) and 200-day (₹{ma200}) averages. "
            f"This is generally a healthy bullish pattern. The stock is trending upward in both medium and long term."
        )
    elif price < ma50 < ma200:
        explanation_parts.append(
            f"📉 **Trend: Strong Downtrend** — The price (₹{price}) is below both moving averages. "
            f"This suggests the stock is in a downtrend. Beginners should be very cautious here."
        )
        warnings.append("Buying stocks in a strong downtrend is like catching a falling knife — you might get hurt.")
    elif price > ma50 and price < ma200:
        explanation_parts.append(
            f"↗️ **Trend: Mixed** — The price is above the 50-day MA but below the 200-day MA. "
            f"The stock might be recovering from a dip. Watch for the 50-day to cross above the 200-day (Golden Cross) for confirmation."
        )
    else:
        explanation_parts.append(
            f"↘️ **Trend: Weakening** — The price is below the 50-day MA. "
            f"The short-term trend is down even if the longer-term might still be okay."
        )

    # Volatility explanation
    if volatility > 40:
        explanation_parts.append(
            f"🌊 **Volatility: {volatility}% (Very High)** — This stock's price swings A LOT. "
            f"It can move 2-3% or more in a single day. This is exciting but very risky for beginners."
        )
        warnings.append(f"With {volatility}% volatility, a ₹10,000 investment could swing ±₹{int(10000*volatility/100/16):,} in a single day!")
    elif volatility > 25:
        explanation_parts.append(
            f"🌊 **Volatility: {volatility}% (High)** — Expect noticeable daily price swings. "
            f"This level of volatility requires discipline and a stop-loss strategy."
        )
    elif volatility > 15:
        explanation_parts.append(
            f"🌊 **Volatility: {volatility}% (Moderate)** — Normal price movements. "
            f"This is a reasonable level of risk for most investors."
        )
    else:
        explanation_parts.append(
            f"🌊 **Volatility: {volatility}% (Low)** — Very steady price movement. "
            f"Good for beginners who want less excitement and more stability."
        )
        tips.append("Low-volatility stocks are great for building your confidence as a new investor.")

    # Risk level
    risk_level = analysis.risk_level
    if risk_level:
        if risk_level == "VERY HIGH":
            warnings.append("⚠️ This stock has a VERY HIGH risk level. Beginners should practice with paper trading first before considering this stock.")
        elif risk_level == "HIGH":
            warnings.append("This stock has HIGH risk. Only invest what you can afford to lose, and always use a stop-loss.")
        elif risk_level == "LOW":
            tips.append("This stock's LOW risk level makes it relatively more suitable for beginners.")

    # Support / Resistance
    support = analysis.support_level
    resistance = analysis.resistance_level
    if support and resistance:
        if price and support:
            dist_to_support_pct = round(((price - support) / price) * 100, 1)
            dist_to_resistance_pct = round(((resistance - price) / price) * 100, 1) if resistance > price else 0

            if dist_to_support_pct < 3:
                tips.append(f"Price is very close to support (₹{support}). Historically, this level has held — could be a good entry point.")
            if dist_to_resistance_pct < 3 and dist_to_resistance_pct > 0:
                warnings.append(f"Price is near resistance (₹{resistance}). It may struggle to go higher without strong momentum.")

    # General beginner tips
    tips.append("Use InvestIQ-AI's Paper Trading feature to practice before investing real money.")
    tips.append("Never invest more than 5-10% of your portfolio in a single stock.")

    return {
        "symbol": symbol,
        "signal": signal,
        "risk_level": risk_level or "UNKNOWN",
        "summary": explanation_parts[0] if explanation_parts else "",
        "detailed_analysis": "\n\n".join(explanation_parts),
        "tips": tips,
        "warnings": warnings,
        "recommended_lessons": _recommend_lessons(analysis),
    }


def _recommend_lessons(analysis: StockAnalysis) -> list[int]:
    """Recommend lesson IDs based on what the user is looking at."""
    recommended = [9]  # Always recommend signals lesson

    if analysis.rsi < 30 or analysis.rsi > 70:
        recommended.append(3)  # RSI lesson
    if analysis.volatility > 30:
        recommended.append(5)  # Volatility lesson
    if analysis.max_drawdown and analysis.max_drawdown > 15:
        recommended.append(8)  # Max drawdown lesson
    if analysis.sharpe_ratio is not None:
        recommended.append(7)  # Sharpe ratio lesson

    recommended.append(12)  # Golden rules
    recommended.append(10)  # Paper trading

    # Deduplicate while preserving order
    seen = set()
    unique = []
    for lid in recommended:
        if lid not in seen:
            seen.add(lid)
            unique.append(lid)
    return unique[:5]
