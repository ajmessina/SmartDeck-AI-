# 🎯 Sistema de Nombrado Inteligente de Archivos

## ✨ Funcionalidad

SmartDeck AI ahora genera nombres de archivo **inteligentes y significativos** para tus presentaciones exportadas, eliminando nombres genéricos como "SmartDeck_Presentation_abc123.pptx".

---

## 🧠 Cómo Funciona

### **Escenario 1: Archivo con Nombre Significativo**

**Entrada:**

- Usuario sube: `Q1_2025_Marketing_Results.txt`

**Salida:**

- Descarga como: `SmartDeck_Q1_2025_Marketing_Results.pptx`

✅ **El sistema preserva el nombre original del archivo**

---

### **Escenario 2: Archivo con Nombre Genérico**

**Entrada:**

- Usuario sube: `Documento de texto.txt`

**Salida:**

- La IA analiza el contenido y genera el título: "Revenue Grew 75% to $6.6M in Q4 2024"
- Descarga como: `SmartDeck_Revenue_Grew_75_to_66M_in_Q4_2024.pptx`

✅ **El sistema usa el título generado por la IA**

---

## 📋 Nombres Genéricos Detectados

El sistema detecta automáticamente más de **30 patrones de nombres genéricos** en español e inglés:

### Español

- `Documento`, `Documento de texto`, `Nuevo documento`
- `Sin título`, `Hoja de cálculo`, `Libro1`, `Hoja1`
- `Archivo`, `Datos`, `Prueba`, `Ejemplo`, `Borrador`
- `Copia de [cualquier cosa]`

### English

- `Document`, `Text document`, `New document`, `Untitled`
- `Spreadsheet`, `Workbook`, `Book1`, `Sheet1`
- `File`, `Data`, `Test`, `Sample`, `Draft`
- `Copy of [anything]`

### Patrones Auto-generados

- Solo números: `123456.txt`
- UUIDs: `a1b2c3d4-e5f6.docx`
- Versiones: `Document (1).txt`, `Archivo (2).xlsx`

---

## 🔧 Implementación Técnica

### Backend (`main.py`)

```python
def generate_smart_filename(original_filenames: list, ai_title: str) -> str:
    # 1. Filtrar nombres genéricos
    meaningful_names = [f for f in original_filenames if not _is_generic_name(f)]
    
    # 2. Si hay nombres significativos, usar el primero
    if meaningful_names:
        base = os.path.splitext(meaningful_names[0])[0]
        clean = _sanitize_for_filename(base)
        return f"SmartDeck_{clean}.pptx"
    
    # 3. Si todos son genéricos, usar título de la IA
    elif ai_title:
        clean = _sanitize_for_filename(ai_title)
        return f"SmartDeck_{clean}.pptx"
    
    # 4. Fallback
    else:
        return "SmartDeck_Presentation.pptx"
```

### Frontend (`App.tsx`)

```typescript
// Extraer nombre del archivo desde Content-Disposition header
const contentDisposition = response.headers['content-disposition'];
let filename = 'SmartDeck_Presentation.pptx';
if (contentDisposition) {
  const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  if (filenameMatch && filenameMatch[1]) {
    filename = filenameMatch[1].replace(/['"]/g, '');
  }
}
setDownloadFilename(filename);
```

---

## 🧪 Archivos de Prueba Incluidos

### 1. **Documento de texto.txt** (Nombre genérico)

- Contenido: Datos de negocio Q4 2024
- Resultado esperado: `SmartDeck_Revenue_Grew_75_to_66M_in_Q4_2024.pptx`

### 2. **Q1_2025_Marketing_Results.txt** (Nombre significativo)

- Contenido: Resultados de campaña de marketing
- Resultado esperado: `SmartDeck_Q1_2025_Marketing_Results.pptx`

### 3. **test_data.txt** (Nombre genérico)

- Contenido: Datos de ejemplo
- Resultado esperado: Usa el título generado por la IA

---

## ✅ Beneficios

1. **Organización Automática**: Los archivos descargados tienen nombres descriptivos
2. **Sin Intervención Manual**: El usuario no necesita renombrar nada
3. **Inteligencia Contextual**: La IA entiende el contenido y genera nombres apropiados
4. **Compatibilidad**: Nombres seguros para todos los sistemas operativos
5. **Límite de Longitud**: Máximo 80 caracteres para evitar problemas

---

## 🎯 Casos de Uso

### Caso 1: Presentación de Ventas Mensual

- **Sube**: `Ventas_Enero_2025.xlsx`
- **Descarga**: `SmartDeck_Ventas_Enero_2025.pptx`

### Caso 2: Reporte Ejecutivo Trimestral

- **Sube**: `Documento1.docx` (genérico)
- **IA genera**: "Q4 2024 Executive Business Review"
- **Descarga**: `SmartDeck_Q4_2024_Executive_Business_Review.pptx`

### Caso 3: Análisis de Mercado

- **Sube**: `Market_Analysis_Tech_Sector.txt`
- **Descarga**: `SmartDeck_Market_Analysis_Tech_Sector.pptx`

---

## 🚀 Cómo Probar

1. **Inicia el sistema**:

   ```powershell
   .\START.ps1
   ```

2. **Prueba con nombre genérico**:
   - Sube `Documento de texto.txt`
   - Observa el nombre del archivo descargado

3. **Prueba con nombre significativo**:
   - Sube `Q1_2025_Marketing_Results.txt`
   - Verifica que preserva el nombre original

4. **Observa los logs del backend**:

   ```
   [Naming] Using source filename: SmartDeck_Q1_2025_Marketing_Results.pptx
   ```

   o

   ```
   [Naming] Using AI-generated title: SmartDeck_Revenue_Grew_75_to_66M.pptx
   ```

---

## 📝 Notas Técnicas

- **Sanitización**: Elimina caracteres especiales (`/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`)
- **Normalización**: Convierte espacios múltiples en guiones bajos únicos
- **Truncado**: Limita a 80 caracteres, cortando en el último guión bajo
- **Encoding**: UTF-8 compatible, funciona en Windows, macOS y Linux

---

**¡El sistema está listo para usar!** 🎉
