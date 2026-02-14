# 🚀 SmartDeck AI - Configuración de Gemini API

## 📋 Pasos para Conectar la API de Gemini

### 1️⃣ Obtener tu API Key de Google AI Studio

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Create API Key"** o **"Get API Key"**
4. Copia la API key generada (empieza con `AIza...`)

### 2️⃣ Configurar la API Key en el Backend

1. Abre el archivo `.env` en la carpeta `backend/`
2. Reemplaza `your_api_key_here` con tu API key real:

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

1. Guarda el archivo

### 3️⃣ Iniciar el Backend

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python main.py
```

Deberías ver:

```
🚀 SmartDeck Backend initialized
🤖 Gemini AI: ✅ ENABLED
```

Si ves `⚠️ MOCK MODE`, significa que la API key no se cargó correctamente.

---

## 🧪 Probar la Integración

1. **Inicia el frontend** (en otra terminal):

   ```powershell
   cd frontend
   npm run dev
   ```

2. **Abre** <http://localhost:5173/>

3. **Sube archivos** (Excel, CSV, Word, o imágenes)

4. **Haz clic en "Assemble Executive Deck"**

5. La IA de Gemini analizará tus datos y generará una presentación profesional

---

## 🔍 Verificar que Funciona

### Modo MOCK (sin API key)

- Genera una presentación de ejemplo predefinida
- Útil para probar la interfaz sin gastar créditos de API

### Modo REAL (con API key)

- Gemini analiza tus datos reales
- Extrae insights, calcula KPIs, y genera narrativas ejecutivas
- Crea presentaciones personalizadas basadas en tu contenido

---

## 💡 Consejos

- **Límites de API**: Gemini tiene cuotas gratuitas generosas, pero revisa los [límites](https://ai.google.dev/pricing)
- **Seguridad**: NUNCA subas el archivo `.env` a Git (ya está en `.gitignore`)
- **Calidad de datos**: Mejores datos = mejores presentaciones. Sube archivos con información clara y estructurada

---

## 🐛 Troubleshooting

### "MOCK MODE" aparece aunque tengo API key

1. Verifica que el archivo `.env` esté en `backend/.env` (no en la raíz)
2. Asegúrate de que no haya espacios extra: `GEMINI_API_KEY=AIza...` (sin espacios)
3. Reinicia el servidor backend después de editar `.env`

### Error "API key not valid"

1. Verifica que la API key sea correcta
2. Asegúrate de que la API de Gemini esté habilitada en tu proyecto de Google Cloud
3. Revisa que no haya expirado o sido revocada

### El backend no inicia

```powershell
# Reinstala dependencias
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

---

## 📚 Recursos

- [Documentación de Gemini API](https://ai.google.dev/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [Límites y Precios](https://ai.google.dev/pricing)
