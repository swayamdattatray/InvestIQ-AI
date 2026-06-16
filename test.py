import yfinance as yf

for symbol in ["RELIANCE.NS", "TCS.NS", "INFY.NS", "IBM"]:
    print(f"\nTesting {symbol}")

    ticker = yf.Ticker(symbol)
    hist = ticker.history(period="1mo")

    print("Rows:", len(hist))

    if hist.empty:
        print("No data returned")
    else:
        print(hist.tail())