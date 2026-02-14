import shutil
import os
import re
import uuid
import sys
import logging
import secrets
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import settings
from services.extractor import DataExtractor
from services.intelligence import IntelligenceService
from services.pptx_builder import PPTXBuilder
from services.themes import get_all_themes
from services.presentation_styles import get_all_styles

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("SmartDeck")

# Security Constants (using settings)
# MAX_FILE_SIZE = settings.MAX_FILE_SIZE
# MAX_FILES_PER_REQUEST = settings.MAX_FILES_PER_REQUEST
# MAX_TOTAL_UPLOAD_SIZE = settings.MAX_TOTAL_UPLOAD_SIZE
# ALLOWED_EXTENSIONS = settings.ALLOWED_EXTENSIONS

app = FastAPI(title="Smart Presentation Generator", version="2.0.0")

# Configure Rate Limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Memory Store for Sessions
ACTIVE_SESSIONS = {}

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "img-src 'self' data: blob: https://fastapi.tiangolo.com; "
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; "
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
        "font-src 'self' https://fonts.gstatic.com;"
    )
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor. Por favor intenta más tarde."}
    )

UPLOAD_DIR = "uploads"
GENERATED_DIR = "generated_pptx"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(GENERATED_DIR, exist_ok=True)

# Initialize Services
GEMINI_API_KEY = settings.GEMINI_API_KEY
extractor = DataExtractor()
intelligence = IntelligenceService(api_key=GEMINI_API_KEY)
builder = PPTXBuilder()

logger.info("Backend v2.0 initialized")
logger.info(f"Gemini AI: {'ENABLED' if GEMINI_API_KEY else 'MOCK MODE (no API key)'}")

# =========================================================================
# Intelligent File Naming
# =========================================================================

GENERIC_NAMES = {
    "documento", "documento de texto", "nuevo documento", "sin titulo",
    "sin título", "hoja de calculo", "hoja de cálculo", "libro", "libro1",
    "hoja1", "documento1", "archivo", "nuevo", "copia", "datos", "data",
    "test", "prueba", "ejemplo", "sample", "temp", "tmp", "borrador",
    "document", "text document", "new document", "untitled", "untitled document",
    "spreadsheet", "workbook", "book1", "sheet1", "document1", "file",
    "new", "copy", "test_data", "test data", "draft",
    "img", "image", "scan", "photo", "screenshot", "captura",
}

def _is_generic_name(filename: str) -> bool:
    name = os.path.splitext(filename)[0].strip().lower()
    name = re.sub(r'[\s_\-]+', ' ', name).strip()
    if name in GENERIC_NAMES:
        return True
    if re.match(r'^[\d\s\-_\.]+$', name):
        return True
    if re.match(r'^(copia de|copy of)\s', name):
        return True
    if re.match(r'^.+\s*\(\d+\)$', name) and len(name) < 25:
        cleaned = re.sub(r'\s*\(\d+\)$', '', name)
        if cleaned in GENERIC_NAMES:
            return True
    return False

def _sanitize_for_filename(text: str) -> str:
    clean = re.sub(r'[^\w\s\-]', '', text)
    clean = re.sub(r'[\s_]+', '_', clean).strip('_')
    if len(clean) > 80:
        clean = clean[:80].rsplit('_', 1)[0]
    return clean or "SmartDeck_Presentation"

def generate_smart_filename(original_filenames: list, ai_title: str) -> str:
    meaningful_names = [f for f in original_filenames if not _is_generic_name(f)]
    if meaningful_names:
        base = os.path.splitext(meaningful_names[0])[0]
        clean = _sanitize_for_filename(base)
        result = f"SmartDeck_{clean}.pptx"
        if result != f"SmartDeck_{clean}.pptx":
            logger.info(f"[Naming] Using source filename: {result}")
    elif ai_title:
        clean = _sanitize_for_filename(ai_title)
        result = f"SmartDeck_{clean}.pptx"
        if result != f"SmartDeck_{clean}.pptx":
            logger.info(f"[Naming] Using AI-generated title: {result}")
    else:
        result = "SmartDeck_Presentation.pptx"
    return result

# =========================================================================
# API Endpoints
# =========================================================================

@app.get("/")
def read_root():
    return {
        "status": "ok",
        "message": "SmartDeck AI v2.0 - Intelligent Presentation Platform",
        "gemini_enabled": bool(GEMINI_API_KEY),
        "version": "2.0.0"
    }

@app.get("/themes")
def list_themes():
    """Return all available design themes"""
    return {"themes": get_all_themes()}

@app.get("/styles")
def list_styles():
    """Return all available presentation styles"""
    return {"styles": get_all_styles()}


# -------------------------------------------------------------------------
# MODE 1: Upload files → Analyze → Choose style → Generate
# -------------------------------------------------------------------------

@app.post("/analyze")
@limiter.limit(settings.RATE_LIMIT_ANALYZE)
async def analyze_content(request: Request, files: List[UploadFile] = File(...)):
    """
    Upload files, extract text, and analyze content type.
    Returns style suggestions based on content.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")

    if len(files) > settings.MAX_FILES_PER_REQUEST:
        logger.warning(f"Rejected request: too many files ({len(files)} > {settings.MAX_FILES_PER_REQUEST})")
        raise HTTPException(
            status_code=413,
            detail=f"Too many files. Maximum {settings.MAX_FILES_PER_REQUEST} files allowed."
        )

    total_upload_size = 0
    original_filenames = []

    # 1. Validate files
    for file in files:
        original_filenames.append(file.filename or "untitled")
        # Check Extension
        ext = os.path.splitext(file.filename or "")[1].lower()
        # Check Extension
        ext = os.path.splitext(file.filename or "")[1].lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            logger.warning(f"Rejected file {file.filename} (invalid extension: {ext})")
            raise HTTPException(
                status_code=415,
                detail=f"Tipo de archivo {ext} no permitido. Formatos aceptados: {', '.join(settings.ALLOWED_EXTENSIONS)}"
            )
        
        # Check Size
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)
        
        if size > settings.MAX_FILE_SIZE:
             logger.warning(f"Rejected file {file.filename} (size: {size} bytes > {settings.MAX_FILE_SIZE})")
             raise HTTPException(
                status_code=413,
                detail=f"File {file.filename} exceeds {settings.MAX_FILE_SIZE / (1024 * 1024):.0f}MB limit"
            )
        total_upload_size += size

    if total_upload_size > settings.MAX_TOTAL_UPLOAD_SIZE:
        logger.warning(f"Rejected request: total upload size ({total_upload_size} bytes > {settings.MAX_TOTAL_UPLOAD_SIZE})")
        raise HTTPException(
            status_code=413,
            detail=f"Total upload size exceeds {settings.MAX_TOTAL_UPLOAD_SIZE / (1024 * 1024):.0f}MB limit."
        )

    all_text = ""
    session_id = str(uuid.uuid4())
    logger.info(f"Starting analysis for session {session_id} with {len(files)} files")
    
    for file in files:
        file_path = os.path.join(UPLOAD_DIR, f"{session_id}_{file.filename}")
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            extracted_text = extractor.extract(file_path)
            all_text += f"\n\n--- Source: {file.filename} ---\n{extracted_text}"
        except Exception as e:
            logger.error(f"Error processing {file.filename}: {e}", exc_info=True)
            continue

    if not all_text:
        raise HTTPException(status_code=400, detail="No text could be extracted.")

    # Detect content type and suggest styles
    logger.info("Detecting content type...")
    analysis = intelligence.detect_content_type(all_text)

    # Save extracted text in session for later use
    session_path = os.path.join(UPLOAD_DIR, f"{session_id}_extracted.txt")
    with open(session_path, "w", encoding="utf-8") as f:
        f.write(all_text)

    # Create Session Token
    session_token = secrets.token_urlsafe(32)
    ACTIVE_SESSIONS[session_id] = session_token
    
    return {
        "session_id": session_id,
        "session_token": session_token,
        "filenames": original_filenames,
        "summary": analysis["summary"],
        "suggested_styles": analysis["suggested_styles"],
        "text_preview": all_text[:500] + "..." if len(all_text) > 500 else all_text
    }


@app.post("/generate")
@limiter.limit(settings.RATE_LIMIT_GENERATE)
async def generate_presentation(
    request: Request,
    files: List[UploadFile] = File(None),
    theme: Optional[str] = Form("corporate_navy"),
    style: Optional[str] = Form("executive"),
    session_id: Optional[str] = Form(None),
    session_token: Optional[str] = Form(None),
):
    """
    Generate presentation from uploaded files.
    If session_id is provided, uses previously analyzed text.
    """
    sid = session_id or str(uuid.uuid4())
    all_text = ""
    original_filenames = []

    # Try to load from previous session
    if session_id:
        # Strict Token Validation
        if session_id not in ACTIVE_SESSIONS:
            raise HTTPException(status_code=403, detail="Sesión expirada o inválida. Por favor sube tus archivos de nuevo.")
        
        if ACTIVE_SESSIONS[session_id] != session_token:
            logger.warning(f"Session hijack attempt? {session_id} token mismatch")
            raise HTTPException(status_code=403, detail="Token de sesión inválido.")
        
        session_path = os.path.join(UPLOAD_DIR, f"{session_id}_extracted.txt")
        if os.path.exists(session_path):
            with open(session_path, "r", encoding="utf-8") as f:
                all_text = f.read()
            logger.info(f"Loaded text from session {session_id}")

    # If no session text, process uploaded files
    if not all_text and files:
        for file in files:
            original_filenames.append(file.filename or "untitled")
            file_path = os.path.join(UPLOAD_DIR, f"{sid}_{file.filename}")
            try:
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                extracted_text = extractor.extract(file_path)
                all_text += f"\n\n--- Source: {file.filename} ---\n{extracted_text}"
            except Exception as e:
                logger.error(f"Error processing {file.filename}: {e}")
                continue

    if not all_text:
        raise HTTPException(status_code=400, detail="No text available. Upload files or provide a session_id.")

    # Analyze with selected style
    logger.info(f"Analyzing text (style: {style})...")
    structure_json = intelligence.analyze_and_structure(all_text, style_id=style)

    # Generate smart filename
    ai_title = structure_json.get("presentation_title", "")
    smart_name = generate_smart_filename(original_filenames, ai_title)

    # Build PPTX
    logger.info(f"Building PPTX (theme: {theme}, style: {style})...")
    internal_filename = f"SmartDeck_{sid}.pptx"
    pptx_path = builder.build(structure_json, internal_filename, theme_id=theme)

    return FileResponse(
        path=pptx_path,
        filename=smart_name,
        media_type='application/vnd.openxmlformats-officedocument.presentationml.presentation'
    )


# -------------------------------------------------------------------------
# MODE 2: Generate from prompt/context
# -------------------------------------------------------------------------

@app.post("/generate-from-prompt")
@limiter.limit(settings.RATE_LIMIT_GENERATE)
async def generate_from_prompt(
    request: Request,
    prompt: str = Form(...),
    theme: Optional[str] = Form("corporate_navy"),
    style: Optional[str] = Form("executive"),
):
    """
    Generate a presentation from a text prompt/context.
    No file upload required.
    """
    if not prompt or len(prompt.strip()) < 10:
        raise HTTPException(status_code=400, detail="Prompt must be at least 10 characters.")

    logger.info(f"Prompt generation request (style: {style})...")
    structure_json = intelligence.generate_from_prompt(prompt, style_id=style)

    # Use AI title for filename
    ai_title = structure_json.get("presentation_title", "Prompt_Presentation")
    smart_name = f"SmartDeck_{_sanitize_for_filename(ai_title)}.pptx"

    # Build PPTX
    logger.info(f"Building PPTX from prompt (theme: {theme}, style: {style})...")
    sid = str(uuid.uuid4())
    internal_filename = f"SmartDeck_{sid}.pptx"
    pptx_path = builder.build(structure_json, internal_filename, theme_id=theme)

    return FileResponse(
        path=pptx_path,
        filename=smart_name,
        media_type='application/vnd.openxmlformats-officedocument.presentationml.presentation'
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
