# InvestIQ-AI Frontend

Modern, production-quality React frontend for AI-powered investment intelligence.

## Features
- **Premium Dark Theme:** Glassmorphism UI with Tailwind CSS.
- **Cinematic Landing Page:** High-fidelity animations with Framer Motion.
- **Live Analysis:** Real-time stock data and technical indicators.
- **AI Signals:** Pulse-animated Buy/Hold/Sell recommendations.
- **Interactive Charts:** Financial visualizations with Recharts.
- **Responsive Design:** Optimized for all screen sizes.

## Tech Stack
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React
- **API:** Axios

## Getting Started

### 1. Prerequisites
Ensure you have Node.js (v18+) and npm installed.
Ensure the FastAPI backend is running on `http://localhost:8000`.

### 2. Installation
The dependencies are already initialized in this environment, but if you are moving this to a new machine:
```bash
cd frontend
npm install
```

### 3. Running the App
Start the development server:
```bash
npm run dev
```

### 4. Configuration
Environment variables can be set in `.env`:
```
VITE_API_URL=http://localhost:8000
```
