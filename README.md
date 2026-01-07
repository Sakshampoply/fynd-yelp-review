# Fynd AI Intern Assessment - Intelligent Feedback System

This repository contains the solution for the Fynd AI Intern Assessment. It is a comprehensive project that demonstrates the use of Large Language Models (LLMs) for sentiment analysis, real-time web technologies, and modern full-stack development.

## 🚀 Live Demo

> **Note:** The backend is hosted on Render’s free tier. If the service has been idle, the first request may fail while the server restarts. Please wait 1–3 minutes and retry. The application is fully functional thereafter.

- **Frontend (Vercel)**: https://fynd-yelp-review.vercel.app
- **Backend (Render)**: https://fynd-backend-crvz.onrender.com/
- **API Documentation**: https://fynd-backend-crvz.onrender.com/docs

---

## 📂 Project Structure

The project is divided into three main components:

| Component               | Directory         | Description                                                                                         |
| ----------------------- | ----------------- | --------------------------------------------------------------------------------------------------- |
| **Task 1: AI Analysis** | Root (`.ipynb`)   | A Jupyter Notebook employing various prompting strategies to predict star ratings from review text. |
| **Task 2: Frontend**    | `task2_frontend/` | A Next.js application providing a user submission form and a real-time admin dashboard.             |
| **Task 2: Backend**     | `task2_web_app/`  | A FastAPI server handling Review CRUD, AI processing, and Server-Sent Events (SSE).                 |

---

## 🛠️ Tech Stack

### **Frontend**

- **Framework**: [Next.js 14+ (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Visualization**: [Recharts](https://recharts.org/) (for Analytics Charts)
- **Real-time**: Native `EventSource` API for Server-Sent Events (SSE)

### **Backend**

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: PostgreSQL (via Render)
- **ORM**: SQLAlchemy
- **AI Model**: Google Gemini 1.5 Flash (via `google-genai` SDK)
- **Deployment**: Render (Web Service + Managed Postgres)

### **Data Science (Task 1)**

- **Notebook**: Jupyter
- **Libraries**: Pandas, Scikit-learn, Matplotlib
- **Approaches**: Zero-shot, Few-shot, React/Role-based Prompting

---

## ✨ Key Features & Functionality

### 1. Task 1: Rating Prediction (Notebook)

Comparison of three prompting strategies to classify Yelp reviews:

- **Zero-Shot**: Direct classification.
- **Few-Shot**: Providing 3 static examples to guide the model.
- **Role-Based**: Setting a "Food Critic" persona for the model.
- **Outcome**: Generates an accuracy comparison chart and validates JSON output formatting.

> **Note on Model Usage**: The evaluation loop was computed using the **gemma-3-27b** model to accommodate Gemini free tier rate limits. The main application (Task 2) utilizes **gemini-2.5-flash** for superior performance. This difference in models (specifically using Gemma for the notebook) explains why the evaluation results may appear similar across different prompting strategies.

### 2. Task 2: Full Stack Application

#### **User Dashboard (`/`)**

- Simple, clean interface for customers to submit feedback.
- Inputs: Business Name, Rating (1-5 stars), Review Text.
- Validation: Prevents submission of empty or invalid data.

#### **Admin Dashboard (`/admin`)**

- **Real-Time Feed**: Uses **Server-Sent Events (SSE)** to push new reviews to the dashboard instantly without page reloads (replacing traditional polling).
- **Analytics Visualization**:
  - **Rating Distribution**: Bar chart showing count of reviews per star rating.
  - **Sentiment Analysis**: Pie chart showing positive/negative/neutral breakdown.
- **Filtering & Search**:
  - Filter reviews by star rating.
  - Real-time text search by Business Name.
- **AI Integration**: Every submitted review is processed by the backend to verify the sentiment match with the star rating (simulated or operational based on prompt).

---

## ⚙️ Local Setup Instructions

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL (Local or Cloud URL)
- Google Gemini API Key

### 1. Backend Setup

```bash
cd task2_web_app

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "GEMINI_API_KEY=your_key_here" > .env
# Optional: Add DATABASE_URL if using a specific local DB

# Run Server
uvicorn app.main:app --reload
```

Server will start at `http://127.0.0.1:8000`.

### 2. Frontend Setup

```bash
cd task2_frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" > .env.local

# Run Dev Server
npm run dev
```

Client will start at `http://localhost:3000`.

---

## ☁️ Deployment

### Backend (Render)

- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Env Vars**: `DATABASE_URL` (Auto-provided), `GEMINI_API_KEY`, `PYTHON_VERSION`.

### Frontend (Vercel)

- **Framework Preset**: Next.js
- **Root Directory**: `task2_frontend`
- **Env Vars**: `NEXT_PUBLIC_API_URL` (Set to your Render backend URL **without** trailing slash).

---

## 📝 License

This project is created for the Fynd AI Internship Assessment.
