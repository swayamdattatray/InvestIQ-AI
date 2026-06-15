# InvestIQ-AI

A Python-based AI project for investment analysis.

## Setup Instructions

### 1. Create a Virtual Environment
```bash
python -m venv venv
```

### 2. Activate the Virtual Environment
- **Windows:**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **macOS/Linux:**
  ```bash
  source venv/bin/activate
  ```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
python -m app.main
```

The server will start at `http://127.0.0.1:8000`.

## API Endpoints

- **Health Check:** [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- **Stock Price:** `http://127.0.0.1:8000/stock/{symbol}` (e.g., `/stock/AAPL`)
- **Interactive API Docs (Swagger):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
