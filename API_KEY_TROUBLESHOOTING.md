# 🔑 Cómo Obtener una API Key Válida de Gemini

## Problema Detectado

Tu API key actual está siendo rechazada por Google con el error:

```
API key not valid. Please pass a valid API key.
```

## ✅ Solución: Crear una Nueva API Key

### Paso 1: Ve a Google AI Studio

Abre tu navegador y ve a: **<https://aistudio.google.com/app/apikey>**

### Paso 2: Inicia Sesión

- Usa tu cuenta de Google
- Acepta los términos de servicio si es la primera vez

### Paso 3: Crear API Key

**Opción A: Crear en Proyecto Nuevo**

1. Haz clic en **"Create API key"**
2. Selecciona **"Create API key in new project"**
3. Espera unos segundos
4. Copia la API key (empieza con `AIza...`)

**Opción B: Usar Proyecto Existente**

1. Haz clic en **"Create API key"**
2. Selecciona un proyecto existente de Google Cloud
3. Copia la API key generada

### Paso 4: Verificar Permisos

Asegúrate de que:

- ✅ La API de Generative Language esté habilitada
- ✅ No haya restricciones de IP
- ✅ La cuota no esté agotada

### Paso 5: Actualizar en SmartDeck

1. Abre: `backend\.env`
2. Reemplaza la línea 12 con tu nueva API key:

   ```
   GEMINI_API_KEY=AIzaSy...tu_nueva_key_aqui
   ```

3. Guarda el archivo

### Paso 6: Reiniciar Backend

```powershell
# Detén el servidor actual (Ctrl+C)
# Luego reinicia:
cd backend
.\venv\Scripts\python.exe main.py
```

Deberías ver:

```
[SmartDeck] Backend initialized
[Gemini AI] ENABLED
```

Y cuando generes una presentación, verás:

```
[Gemini] Analyzing with Gemini AI...
[Gemini] Generated 9 slides with Gemini AI
```

## 🔍 Verificar que Funciona

1. Sube un archivo en la aplicación
2. Genera una presentación
3. Revisa los logs del backend
4. Si ves `[Gemini] Generated X slides`, ¡funciona!
5. Si ves `[Gemini] Falling back to MOCK`, la API key sigue sin funcionar

## 🆘 Troubleshooting

### Error: "API key not valid"

- ✅ Verifica que copiaste la key completa (sin espacios)
- ✅ Asegúrate de que no haya `#` al inicio de la línea
- ✅ Reinicia el backend después de cambiar el .env

### Error: "Quota exceeded"

- ✅ Espera unas horas o crea un nuevo proyecto
- ✅ Revisa tu cuota en: <https://console.cloud.google.com/>

### Error: "Permission denied"

- ✅ Habilita la API de Generative Language en Google Cloud Console
- ✅ Verifica que tu cuenta tenga permisos

## 📚 Enlaces Útiles

- **Crear API Key**: <https://aistudio.google.com/app/apikey>
- **Documentación**: <https://ai.google.dev/docs>
- **Límites y Cuotas**: <https://ai.google.dev/pricing>

---

**Nota**: Las API keys de Gemini son gratuitas con límites generosos. No necesitas tarjeta de crédito para empezar.
