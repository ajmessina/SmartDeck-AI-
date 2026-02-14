# 🚀 SmartDeck AI - Guía de Inicio Rápido

## ⚡ Inicio Rápido (Opción Más Fácil)

### **Opción 1: Usar el Script de Inicio Automático**

1. **Haz doble clic** en `START.ps1` (en la raíz del proyecto)
   - O ejecuta en PowerShell:

     ```powershell
     .\START.ps1
     ```

2. **Espera** unos segundos mientras se inician backend y frontend

3. **El navegador se abrirá automáticamente** en <http://localhost:5173>

4. **¡Listo!** Ya puedes usar SmartDeck AI

---

### **Opción 2: Inicio Manual (Dos Terminales)**

#### **Terminal 1 - Backend:**

```powershell
cd "c:\Users\Corebii\Documents\Desarrollos Antigravity\smart-presentation-generator\backend"
.\venv\Scripts\python.exe main.py
```

Deberías ver:

```text
[SmartDeck] Backend initialized
[Gemini AI] ENABLED
INFO: Uvicorn running on http://0.0.0.0:8000
```

#### **Terminal 2 - Frontend:**

```powershell
cd "c:\Users\Corebii\Documents\Desarrollos Antigravity\smart-presentation-generator\frontend"
npm run dev
```

Deberías ver:

```text
VITE ready in XXX ms
Local: http://localhost:5173/
```

---

## 🛑 Detener el Sistema

### **Opción 1: Script Automático**

```powershell
.\STOP.ps1
```

### **Opción 2: Manual**

- En cada terminal, presiona `Ctrl + C`

---

## 🧪 Probar la Aplicación

1. **Abre** <http://localhost:5173/>

2. **Sube un archivo**:
   - Usa `test_data.txt` (en la raíz del proyecto)
   - O cualquier Excel, CSV, Word que tengas

3. **Haz clic** en "Assemble Executive Deck"

4. **Observa los logs** del backend:
   - ✅ **Si funciona**: `[Gemini] Generated X slides with Gemini AI`
   - ❌ **Si falla**: `[Gemini] Falling back to MOCK response`

5. **Descarga** la presentación generada

---

## 🔄 Cambiar entre Modo REAL y MOCK

### **Activar Gemini AI (REAL):**

1. Abre `backend\.env`
2. Asegúrate de que la línea 12 NO tenga `#`:

   ```ini
   GEMINI_API_KEY=your_api_key_here
   ```

3. Reinicia el backend

### **Desactivar Gemini AI (MOCK):**

1. Abre `backend\.env`
2. Agrega `#` al inicio de la línea 12:

   ```ini
   # GEMINI_API_KEY=your_api_key_here
   ```

3. Reinicia el backend

---

## 📊 Verificar Estado

### **Backend:**

```powershell
curl http://localhost:8000/
```

Respuesta esperada:

```json
{
  "status": "ok",
  "message": "Smart Presentation Generator API Ready",
  "gemini_enabled": true
}
```

### **Frontend:**

Abre <http://localhost:5173/> en tu navegador

---

## 🐛 Troubleshooting

### **Error: "Puerto 8000 ya en uso"**

```powershell
# Detén el proceso anterior
Get-Process -Name python | Where-Object {$_.Path -like "*smart-presentation-generator*"} | Stop-Process -Force
```

### **Error: "Puerto 5173 ya en uso"**

```powershell
# Detén el proceso anterior
Get-Process -Name node | Where-Object {$_.CommandLine -like "*vite*"} | Stop-Process -Force
```

### **Backend no inicia:**

```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### **Frontend no inicia:**

```powershell
cd frontend
npm install
```

---

## 📁 Estructura de Archivos

```text
smart-presentation-generator/
├── START.ps1              ← Inicia todo automáticamente
├── STOP.ps1               ← Detiene todo
├── test_data.txt          ← Archivo de prueba
├── backend/
│   ├── .env               ← Configuración de API key
│   ├── main.py            ← Servidor FastAPI
│   └── venv/              ← Entorno virtual Python
├── frontend/
│   ├── src/
│   │   ├── App.tsx        ← Aplicación React
│   │   └── components/    ← Componentes UI
│   └── package.json
└── generated_pptx/        ← Presentaciones generadas
```

---

## 🎯 Comandos Útiles

| Acción | Comando |
| -------- | --------- |
| Iniciar todo | `.\START.ps1` |
| Detener todo | `.\STOP.ps1` |
| Solo backend | `cd backend; .\venv\Scripts\python.exe main.py` |
| Solo frontend | `cd frontend; npm run dev` |
| Ver estado | `curl http://localhost:8000/` |

---

## 🔑 Estado Actual de Gemini

- ✅ **API Key**: Configurada
- ✅ **Modelo**: `gemini-1.5-pro`
- ✅ **Estado**: ENABLED

Para verificar en tiempo real, observa los logs del backend cuando generes una presentación.

---

**¡Todo listo para usar!** 🚀
