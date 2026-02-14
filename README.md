# 🎯 SmartDeck AI - Executive Presentation Generator

Transform messy data into board-ready presentation decks using AI-powered synthesis.

![SmartDeck AI](https://img.shields.io/badge/AI-Gemini%201.5%20Pro-blue)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-purple)
![Backend](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python-green)

---

## ✨ Features

- 🤖 **AI-Powered Analysis**: Gemini 1.5 Pro extracts insights, calculates KPIs, and identifies trends
- 📊 **Smart Data Extraction**: Supports Excel, CSV, Word documents, and images
- 🎨 **Executive Design**: Professional PPTX output with premium layouts
- ⚡ **Real-time Processing**: Watch your presentation being synthesized
- 🔒 **Secure**: Bank-grade privacy, zero training data usage

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.9+ (for backend)
- **Gemini API Key** ([Get one free](https://aistudio.google.com/app/apikey))

### 1️⃣ Setup Backend

```powershell
cd backend

# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Configure API key
# Edit .env and add your GEMINI_API_KEY

# Start server
.\start.ps1
```

Backend will run on **<http://localhost:8000>**

### 2️⃣ Setup Frontend

```powershell
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will run on **<http://localhost:5173>**

---

## 🔑 Gemini API Setup

See [GEMINI_SETUP.md](./GEMINI_SETUP.md) for detailed instructions.

**Quick version:**

1. Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add to `backend/.env`:

   ```env
   GEMINI_API_KEY=AIzaSy...your_key_here
   ```

3. Restart backend

---

## 📖 How to Use

1. **Open** <http://localhost:5173/>
2. **Upload** your data files (Excel, CSV, Word, screenshots)
3. **Click** "Assemble Executive Deck"
4. **Wait** while AI analyzes your data (~10-30 seconds)
5. **Download** your professional PPTX presentation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  Premium UI • File Upload • Progress Tracking           │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────────────────────┐
│                  BACKEND (FastAPI)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Extractor   │→ │ Intelligence │→ │ PPTX Builder │  │
│  │ (Parse Data) │  │ (Gemini AI)  │  │ (Generate)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                  │
                  ▼
            ┌──────────┐
            │ Gemini   │
            │ 1.5 Pro  │
            └──────────┘
```

### Components

- **Extractor**: Parses Excel, CSV, Word, images → raw text
- **Intelligence**: Gemini AI analyzes data → structured JSON
- **PPTX Builder**: JSON → professional PowerPoint file

---

## 🎨 Design System

The frontend uses the **"Executive Nexus"** design theme:

- **Typography**: Lexend (headings) + Outfit (body)
- **Colors**: Deep blue (#020617) with electric blue accents (#2563eb) and gold highlights (#ca8a04)
- **Effects**: Glassmorphism, subtle animations, premium micro-interactions

---

## 📁 Project Structure

```
smart-presentation-generator/
├── backend/
│   ├── services/
│   │   ├── extractor.py       # Data extraction
│   │   ├── intelligence.py    # Gemini AI integration
│   │   └── pptx_builder.py    # PowerPoint generation
│   ├── main.py                # FastAPI server
│   ├── .env                   # API keys (create this)
│   └── start.ps1              # Quick start script
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Main application
│   │   ├── components/
│   │   │   └── UploadZone.tsx # File upload UI
│   │   ├── index.css          # Design system
│   │   └── App.css            # Animations
│   └── package.json
├── GEMINI_SETUP.md            # API setup guide
└── README.md                  # This file
```

---

## 🧪 Testing

### Mock Mode (No API Key)

- Generates a sample executive presentation
- Useful for UI testing without API costs

### Real Mode (With API Key)

- Analyzes your actual data
- Generates custom presentations based on content

---

## 🔧 Configuration

### Backend (.env)

```env
GEMINI_API_KEY=your_key_here
DEBUG=True
```

### Frontend

No configuration needed - connects to `http://localhost:8000` by default

---

## 💡 Tips for Best Results

1. **Upload structured data**: Excel/CSV with clear headers and numbers
2. **Include context**: Word docs with explanations help AI understand
3. **Mix formats**: Combine spreadsheets + notes for richer analysis
4. **Clear filenames**: Help AI understand what each file contains

---

## 🐛 Troubleshooting

### Backend won't start

```powershell
# Reinstall dependencies
pip install -r requirements.txt
```

### "MOCK MODE" despite having API key

- Check `.env` is in `backend/` folder
- Verify no extra spaces: `GEMINI_API_KEY=AIza...`
- Restart backend after editing `.env`

### Frontend connection error

- Ensure backend is running on port 8000
- Check CORS settings in `backend/main.py`

---

## 📚 Resources

- [Gemini API Docs](https://ai.google.dev/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React + Vite Guide](https://vitejs.dev/guide/)

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

**Built with ❤️ using Gemini 1.5 Pro, React, and FastAPI**
