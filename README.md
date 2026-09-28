# Dr. Anand Medical Care & Telehealth Portal

A clinical outpatient consultation and telehealth web platform providing automated clinical evaluations, structured prescription slips, drug-safety validation, dosage scheduling, and interactive follow-up medical Q&A with attending physician Dr. Anand, MD.

---

## Key Features

- **Clinical Symptom Evaluation & Diagnostics:** In-depth triage evaluation for acute conditions with duration and severity assessment.
- **Official Prescription Slip Generation (Rx):** Exact condition-specific medications, dosage strengths, administration instructions, and RxNorm cross-references.
- **Visual Dosage Schedule (Clock Matrix):** Interactive morning, afternoon, evening, and night pill-taking tracker with dosage compliance confirmation.
- **Nutrition & Dietary Guidance:** Curated food pairing recommendations, hydration targets, and dietary contraindications.
- **Clinical Contraindication & Allergy Guard:** Automated cross-checking against patient allergies, medical history, and pre-existing medications.
- **Interactive Multi-Turn Physician Follow-up Q&A:** Continuous conversation with Dr. Anand, MD remembering previous inquiries and providing non-repetitive, context-aware answers.
- **Voice Capabilities:**
  - **Speech-to-Text (Microphone):** Live voice question dictation.
  - **Physician Voice Audio Playback:** High-clarity audio reading of doctor answers in a calm, authoritative male physician tone.
- **Instant Clinical Inquiry Shortcuts:** One-tap chips for common patient concerns (food/milk safety, missed doses, caffeine/alcohol, exercise clearance, expected recovery duration).

---

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, Uvicorn, Pydantic, HTTPX
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Audio & Speech:** Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
- **Deployment:** Docker (multi-stage build), Cloud Run, Render, Railway, Vercel

---

## Local Development

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## Production Deployment

### Option A: Docker (Self-Hosted / Render / Railway)
The included multi-stage `Dockerfile` compiles the frontend into static assets and serves both the API and the React SPA unified on a single port.
```bash
docker build -t dr-anand-telehealth .
docker run -p 8080:8080 -e PORT=8080 -e GEMINI_API_KEY=your_key dr-anand-telehealth
```

### Option B: Deploy to Render / Railway via GitHub
1. Connect this GitHub repository to [Render](https://render.com) or [Railway](https://railway.app).
2. Choose **Web Service** and select **Docker** as runtime (or Python for backend + static site for frontend).
3. Set Environment Variable: `GEMINI_API_KEY=your_key`.
4. Deploy!
