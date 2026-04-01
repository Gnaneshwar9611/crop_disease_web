# 🌿 Crop Saver — AI Crop Disease Prediction Platform

> An offline-capable, full-stack web application that diagnoses crop leaf diseases using deep learning — in seconds.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Diagnosis** | MobileNetV2-based `.h5` models predict disease from a single leaf photo |
| 📴 **Fully Offline** | Models run locally — no external API or internet needed for inference |
| 🌾 **4 Crops Supported** | Paddy (Rice), Chilli, Finger Millet (Ragi), Sugarcane |
| ⚡ **Fast & Async** | FastAPI + Uvicorn backend with async image processing |
| 🖥️ **Modern UI** | Responsive Next.js / React frontend with smooth animations |
| 🔒 **Confidence Scoring** | Every prediction includes a confidence % and top-3 results |

---

## 🛠️ Technology Stack

| Layer | Tech |
|---|---|
| **Frontend** | Next.js 16, React 19, Vanilla CSS |
| **Backend** | FastAPI, Uvicorn, Python 3.9+ |
| **ML / Inference** | TensorFlow 2.15, Keras, NumPy |
| **Image Processing** | Pillow (PIL) |

---

## 📂 Project Structure

```
CROP_prediction/
├── backend/
│   ├── main.py              # FastAPI app — endpoints & model loading
│   ├── utils.py             # Image preprocessing (MobileNetV2 pipeline)
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Backend environment variable template
│   └── models/              # ← Place your .h5 model files here
│       ├── chilli_model.h5
│       ├── rice_model.h5
│       ├── finger_millet_model.h5
│       └── sugarcane_model.h5
├── frontend/
│   ├── public/              # Static assets (favicon, etc.)
│   ├── src/
│   │   ├── app/             # Next.js App Router pages & global styles
│   │   │   ├── page.js      # Landing page (hero, how-it-works, footer)
│   │   │   ├── layout.js    # Root layout with SEO metadata
│   │   │   └── globals.css  # Global CSS design system
│   │   └── components/
│   │       └── DiseasePredictor.jsx  # Main prediction widget
│   ├── package.json         # Node.js dependencies & scripts
│   └── next.config.mjs      # Next.js configuration
├── .gitignore               # Ignored files
├── .env.example             # Environment variable reference
├── LICENSE                  # MIT License
└── README.md                # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.9 or higher — [python.org](https://python.org)
- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **Git** — [git-scm.com](https://git-scm.com)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Gnaneshwar9611/CROP_prediction.git
cd CROP_prediction
```

---

### 2. Set Up ML Models

The trained `.h5` model files must be present in `backend/models/` before starting the backend.

**Option A — Models included in the repo** (they are ~10 MB each, committed normally):
```
backend/models/chilli_model.h5         ✔
backend/models/rice_model.h5           ✔
backend/models/finger_millet_model.h5  ✔
backend/models/sugarcane_model.h5      ✔
```
No extra step needed — they clone with the project.

**Option B — Download separately** (if not in repo / using Git LFS):

Place the four `.h5` files manually into the `backend/models/` directory:
```
backend/
└── models/
    ├── chilli_model.h5
    ├── rice_model.h5
    ├── finger_millet_model.h5
    └── sugarcane_model.h5
```

---

### 3. Backend Setup

```bash
# Navigate to backend
cd backend

# Create & activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
```

✅ Backend running at: **http://127.0.0.1:8000**  
📋 API docs (Swagger UI): **http://127.0.0.1:8000/docs**  
🔍 Health check: **http://127.0.0.1:8000/health**

---

### 4. Frontend Setup

Open a **new terminal** (keep the backend terminal running):

```bash
# Navigate to frontend
cd frontend

# (Optional) Create environment variable file
# Copy .env.example to .env.local — edit if backend runs on a different port
copy ..\.env.example .env.local    # Windows
# cp ../.env.example .env.local    # macOS/Linux

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

✅ Frontend running at: **http://localhost:3000**

---

### 5. Use the Application

1. Open **http://localhost:3000** in your browser
2. Select a crop type (Paddy, Chilli, Finger Millet, or Sugarcane)
3. Upload a clear, close-up photo of the affected leaf
4. Click **Predict** — receive an instant diagnosis with confidence score

---

## 🌾 Supported Crops & Diseases

| Crop | Detectable Diseases |
|---|---|
| **Chilli** | Bacterial Spot, Cercospora Leaf Spot, Healthy, Leaf Curl, Leaf Spot, Powdery Mildew, Whitefly, Yellowish |
| **Paddy (Rice)** | Bacterial Leaf Blight, Blast, Brown Spot, Healthy, Leaf Scald, Tungro |
| **Finger Millet** | Blast, Healthy, Leaf Spot, Millet Rust, Mosaic Streak Virus, Wilt |
| **Sugarcane** | Healthy, Red Rot, Rust |

---

## 🔧 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Welcome / health ping |
| `/health` | GET | Model load status for all crops |
| `/predict` | POST | Submit crop + leaf image → get disease prediction |
| `/docs` | GET | Interactive Swagger UI |

**POST `/predict` — form fields:**
- `crop` — one of: `chilli`, `rice`, `finger_millet`, `sugarcane`
- `file` — image file (JPG / PNG / WebP, max ~10 MB)

**Example response:**
```json
{
  "crop": "rice",
  "disease": "Bacterial Leaf Blight",
  "confidence": 94.37,
  "top_predictions": [
    { "disease": "Bacterial Leaf Blight", "confidence": 94.37 },
    { "disease": "Blast", "confidence": 3.82 },
    { "disease": "Brown Spot", "confidence": 1.21 }
  ]
}
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` inside `frontend/` and adjust as needed:

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:8000` | Base URL for the FastAPI backend |

---

## 🔮 Future Improvements

- [ ] Add more crops (Tomato, Potato, Wheat)
- [ ] Include treatment recommendations per disease
- [ ] PWA support for mobile farmers (offline-first)
- [ ] Export prediction history as PDF/CSV
- [ ] Cloud deployment (Vercel + Render / Railway)

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

*Built with 💚 for smarter, healthier farming.*
