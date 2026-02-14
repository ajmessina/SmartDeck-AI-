import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { UploadZone } from './components/UploadZone';
import {
  Sparkles,
  Check,
  Loader2,
  Download,
  Zap,
  Globe,
  Shield,
  RefreshCw,
  Cpu,
  Layers,
  ChevronRight,
  Palette,
  Upload,
  PenTool,
  Briefcase,
  TrendingUp,
  BarChart,
  Box,
  Smile,
  ArrowLeft,
  Send,
  FileText,
  Star,
} from 'lucide-react';
import axios from 'axios';
import './App.css';

/* ====================================================================
   TYPE DEFINITIONS
   ==================================================================== */

interface DesignTheme {
  id: string;
  name: string;
  description: string;
  colors: string[];
}

interface PresentationStyle {
  id: string;
  name: string;
  description: string;
  icon: string;
  match_score?: number;
  reason?: string;
  is_recommended?: boolean;
}

/* ====================================================================
   CONSTANTS
   ==================================================================== */

const DESIGN_THEMES: DesignTheme[] = [
  { id: "corporate_navy", name: "Corporate Navy", description: "Classic executive", colors: ["#1a1a2e", "#14b8a6", "#f8fafc"] },
  { id: "midnight_blue", name: "Midnight Blue", description: "Deep blue accents", colors: ["#0f172a", "#3b82f6", "#f1f5f9"] },
  { id: "emerald_pro", name: "Emerald Pro", description: "Sophisticated green", colors: ["#1a2e1a", "#10b981", "#f0fdf4"] },
  { id: "sunset_warm", name: "Sunset Warm", description: "Bold warm tones", colors: ["#451a03", "#f97316", "#fff7ed"] },
  { id: "royal_purple", name: "Royal Purple", description: "Premium purple", colors: ["#2e1065", "#a855f7", "#faf5ff"] },
  { id: "monochrome_minimal", name: "Monochrome", description: "Black & white", colors: ["#18181b", "#71717a", "#fafafa"] },
];

const STYLE_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  "briefcase": Briefcase,
  "trending-up": TrendingUp,
  "bar-chart": BarChart,
  "box": Box,
  "smile": Smile,
};

const DEFAULT_STYLES: PresentationStyle[] = [
  { id: "executive", name: "Ejecutivo Formal", description: "Presentación de directorio, datos precisos.", icon: "briefcase" },
  { id: "sales", name: "Ventas & Comercial", description: "Pitch persuasivo con ROI.", icon: "trending-up" },
  { id: "financial", name: "Análisis Financiero", description: "Métricas financieras y tendencias.", icon: "bar-chart" },
  { id: "product", name: "Presentación de Producto", description: "Features, beneficios y roadmap.", icon: "box" },
  { id: "informal", name: "Informal & Creativo", description: "Casual para equipos internos.", icon: "smile" },
];

/* ====================================================================
   APP COMPONENT
   ==================================================================== */

function App() {
  // Flow: mode_select → upload/prompt → analyzing → style_select → processing → done
  const [step, setStep] = useState<
    'mode_select' | 'upload' | 'prompt_input' | 'analyzing' | 'style_select' | 'processing' | 'done'
  >('mode_select');

  const [files, setFiles] = useState<File[]>([]);
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('corporate_navy');
  const [selectedStyle, setSelectedStyle] = useState('executive');
  const [statusMessage, setStatusMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState('SmartDeck_Presentation.pptx');

  // Analysis state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [contentSummary, setContentSummary] = useState('');
  const [suggestedStyles, setSuggestedStyles] = useState<PresentationStyle[]>([]);
  const [inputMode, setInputMode] = useState<'file' | 'prompt'>('file');
  const [consentGiven, setConsentGiven] = useState(false);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  /* ------------------------------------------------------------------
     STEP 1: Analyze uploaded files
  ------------------------------------------------------------------ */
  const analyzeFiles = async () => {
    if (files.length === 0) return;
    setStep('analyzing');
    setStatusMessage("Analizando contenido...");

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await axios.post('http://localhost:8000/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSessionId(response.data.session_id);
      setSessionToken(response.data.session_token);
      setContentSummary(response.data.summary);
      setSuggestedStyles(response.data.suggested_styles);
      setStep('style_select');

    } catch (error) {
      console.error(error);
      setStep('upload');

      if (axios.isAxiosError(error)) {
        if (error.response?.data?.detail) {
          toast.error(error.response.data.detail);
        } else if (!error.response) {
          toast.error("⚠️ Servidor no disponible. Verifica que backend esté corriendo.");
        } else {
          toast.error("Error desconocido al analizar archivos.");
        }
      } else {
        toast.error("Error inesperado en la aplicación.");
      }
    }
  };

  /* ------------------------------------------------------------------
     STEP 2A: Generate from files (with style)
  ------------------------------------------------------------------ */
  const generateFromFiles = async () => {
    setStep('processing');
    setStatusMessage("Generando presentación...");

    const formData = new FormData();
    if (sessionId) {
      formData.append('session_id', sessionId);
      if (sessionToken) formData.append('session_token', sessionToken);
    } else {
      files.forEach(file => formData.append('files', file));
    }
    formData.append('theme', selectedTheme);
    formData.append('style', selectedStyle);

    try {
      const response = await axios.post('http://localhost:8000/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          if (pct < 25) setStatusMessage("Extrayendo insights clave...");
          else if (pct < 50) setStatusMessage("IA diseñando narrativa...");
          else if (pct < 75) setStatusMessage("Construyendo slides ejecutivos...");
          else setStatusMessage("Finalizando presentación...");
        }
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = 'SmartDeck_Presentation.pptx';
      if (contentDisposition) {
        const m = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (m?.[1]) filename = m[1].replace(/['"]/g, '');
      }
      setDownloadFilename(filename);
      setDownloadUrl(window.URL.createObjectURL(new Blob([response.data])));
      setStep('done');

    } catch (error) {
      console.error(error);
      setStep('style_select');

      if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
        // Blob error responses need to be read as text
        const blobReader = new FileReader();
        blobReader.onload = () => {
          try {
            const json = JSON.parse(blobReader.result as string);
            toast.error(json.detail || "Error al generar.");
          } catch {
            toast.error("Error al generar la presentación.");
          }
        };
        blobReader.readAsText(error.response.data);
      } else if (axios.isAxiosError(error) && !error.response) {
        toast.error("⚠️ Servidor desconectado durante la generación.");
      } else {
        toast.error("Error al generar la presentación. Intenta de nuevo.");
      }
    }
  };

  /* ------------------------------------------------------------------
     STEP 2B: Generate from prompt
  ------------------------------------------------------------------ */
  const generateFromPrompt = async () => {
    if (userPrompt.trim().length < 10) {
      alert("El prompt debe tener al menos 10 caracteres.");
      return;
    }

    setStep('processing');
    setStatusMessage("IA generando contenido desde tu prompt...");

    const formData = new FormData();
    formData.append('prompt', userPrompt);
    formData.append('theme', selectedTheme);
    formData.append('style', selectedStyle);

    try {
      const response = await axios.post('http://localhost:8000/generate-from-prompt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          if (pct < 30) setStatusMessage("IA inventando contenido profesional...");
          else if (pct < 60) setStatusMessage("Estructurando slides con tu estilo...");
          else setStatusMessage("Finalizando presentación PPTX...");
        }
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = 'SmartDeck_Prompt.pptx';
      if (contentDisposition) {
        const m = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (m?.[1]) filename = m[1].replace(/['"]/g, '');
      }
      setDownloadFilename(filename);
      setDownloadUrl(window.URL.createObjectURL(new Blob([response.data])));
      setStep('done');

    } catch (error) {
      console.error(error);
      setStep('prompt_input');

      if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
        const blobReader = new FileReader();
        blobReader.onload = () => {
          try {
            const json = JSON.parse(blobReader.result as string);
            toast.error(json.detail || "Error en prompt.");
          } catch {
            toast.error("Error al generar desde prompt.");
          }
        };
        blobReader.readAsText(error.response.data);
      } else if (axios.isAxiosError(error) && !error.response) {
        toast.error("⚠️ Servidor desconectado.");
      } else {
        toast.error("Error al generar desde prompt.");
      }
    }
  };

  /* ------------------------------------------------------------------
     RESET
  ------------------------------------------------------------------ */
  const resetAll = () => {
    setStep('mode_select');
    setFiles([]);
    setUserPrompt('');
    setSelectedStyle('executive');
    setSessionId(null);
    setSessionToken(null);
    setContentSummary('');
    setSuggestedStyles([]);
    setDownloadUrl(null);
    setDownloadFilename('SmartDeck_Presentation.pptx');
    setConsentGiven(false);
  };

  /* ====================================================================
     RENDER
  ==================================================================== */
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
        },
      }} />

      {/* ================================================================
          NAVIGATION
      ================================================================ */}
      <nav style={{
        position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        width: '90%', maxWidth: '1400px', zIndex: 50,
        background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '9999px',
        padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          onClick={resetAll}>
          <div style={{
            background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.75rem',
            boxShadow: '0 0 20px var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '-0.02em', margin: 0 }}>
            SmartDeck <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.875rem' }}>AI</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            v2.0
          </span>
          {step !== 'mode_select' && (
            <button onClick={resetAll} style={{
              padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9999px',
              cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}>
              <ArrowLeft style={{ width: '0.8rem', height: '0.8rem' }} /> Inicio
            </button>
          )}
        </div>
      </nav>

      <main style={{ flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '8rem 1.5rem 5rem' }}>

        {/* ================================================================
            STEP: MODE SELECT
        ================================================================ */}
        {step === 'mode_select' && (
          <div className="animate-fade-in-up" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '3rem' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.375rem 1rem', borderRadius: '9999px',
                background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(202, 138, 4, 0.2)',
                color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 'bold',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem'
              }}>
                <Zap style={{ width: '0.75rem', height: '0.75rem', fill: 'var(--accent)' }} />
                AI-Powered Presentation Engine
              </div>
              <h2 style={{
                fontFamily: 'var(--font-heading)', fontSize: '3.5rem', fontWeight: '800',
                lineHeight: '1.1', letterSpacing: '-0.03em', margin: '0 0 1rem 0'
              }}>
                ¿Cómo quieres crear tu <span className="heading-gradient">presentación</span>?
              </h2>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '36rem', margin: '0 auto' }}>
                Elige entre subir tus datos o describir lo que necesitas. La IA se encarga del resto.
              </p>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem',
              maxWidth: '900px', margin: '0 auto 3rem'
            }}>
              {/* FILE UPLOAD MODE */}
              <button
                onClick={() => { setInputMode('file'); setStep('upload'); }}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '1.5rem',
                  padding: '3rem 2rem', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.3s', display: 'flex', flexDirection: 'column', gap: '1.25rem',
                  color: 'white', position: 'relative', overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 20px 60px var(--primary-glow)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  background: 'rgba(37, 99, 235, 0.15)', padding: '1rem', borderRadius: '1rem',
                  width: 'fit-content',
                }}>
                  <Upload style={{ width: '2rem', height: '2rem', color: 'var(--primary)' }} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
                    Subir Archivos
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                    Sube Excel, CSV, Word o TXT. La IA analiza tus datos, detecta el tipo de contenido y sugiere el mejor formato de presentación.
                  </p>
                </div>
                <div style={{
                  display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem'
                }}>
                  {['.xlsx', '.csv', '.docx', '.txt', '.pdf'].map(ext => (
                    <span key={ext} style={{
                      padding: '0.2rem 0.6rem', fontSize: '0.65rem', fontWeight: '700',
                      background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)',
                      borderRadius: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>{ext}</span>
                  ))}
                </div>
              </button>

              {/* PROMPT MODE */}
              <button
                onClick={() => { setInputMode('prompt'); setStep('prompt_input'); }}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '1.5rem',
                  padding: '3rem 2rem', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.3s', display: 'flex', flexDirection: 'column', gap: '1.25rem',
                  color: 'white', position: 'relative', overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(202, 138, 4, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  background: 'rgba(202, 138, 4, 0.15)', padding: '1rem', borderRadius: '1rem',
                  width: 'fit-content',
                }}>
                  <PenTool style={{ width: '2rem', height: '2rem', color: 'var(--accent)' }} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
                    Escribir un Prompt
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                    Describe lo que necesitas y la IA genera todo el contenido: datos, métricas, insights y slides profesionales.
                  </p>
                </div>
                <div style={{
                  display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem'
                }}>
                  {['Ventas', 'Reportes', 'Producto', 'Estrategia'].map(tag => (
                    <span key={tag} style={{
                      padding: '0.2rem 0.6rem', fontSize: '0.65rem', fontWeight: '700',
                      background: 'rgba(202, 138, 4, 0.1)', color: 'var(--accent)',
                      borderRadius: '0.5rem', letterSpacing: '0.05em'
                    }}>{tag}</span>
                  ))}
                </div>
              </button>
            </div>

            {/* Bottom features */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
              maxWidth: '900px', margin: '0 auto'
            }} className="animate-fade-in-up delay-300">
              {[
                { icon: Cpu, label: "AI Engine", sub: "Gemini 2.5 Flash" },
                { icon: Palette, label: "6 Temas", sub: "Diseño Premium" },
                { icon: Layers, label: "5 Estilos", sub: "Detectados por IA" },
                { icon: Shield, label: "Privacidad", sub: "Zero Data Logging" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '0.75rem', alignItems: 'center',
                  background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '0.75rem', borderRadius: '0.75rem',
                }}>
                  <item.icon style={{ width: '1rem', height: '1rem', color: 'var(--text-muted)', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 'bold', margin: 0 }}>{item.label}</p>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', margin: 0 }}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================
            STEP: FILE UPLOAD
        ================================================================ */}
        {step === 'upload' && (
          <div className="animate-fade-in-up" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: '800',
                letterSpacing: '-0.02em', margin: '0 0 0.75rem 0'
              }}>
                Sube tus <span className="heading-gradient">datos</span>
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>
                La IA analizará tu contenido y sugerirá el mejor estilo de presentación.
              </p>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.05)', padding: '2rem', borderRadius: '2rem',
            }}>
              <UploadZone onFilesSelected={handleFilesSelected} />
            </div>

            <div className="animate-fade-in-up" style={{ marginTop: '1.5rem' }}>
              <div style={{
                marginBottom: '1rem', padding: '1rem',
                border: '1px solid var(--border)', borderRadius: '1rem',
                background: 'rgba(30, 41, 59, 0.5)'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    style={{ marginTop: '0.25rem', accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Acepto que mis archivos sean procesados por SmartDeck AI y enviados a Google Gemini API para análisis.
                    Los datos serán eliminados automáticamente después de 24 horas.{' '}
                    <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                      Ver Política de Privacidad
                    </a>
                  </span>
                </label>
              </div>

              {files.length > 0 && (
                <button
                  onClick={analyzeFiles}
                  disabled={!consentGiven}
                  className={`btn-primary shine-effect ${!consentGiven ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{
                    width: '100%', fontSize: '1.1rem', padding: '1.25rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                    boxShadow: consentGiven ? '0 20px 40px var(--primary-glow)' : 'none',
                    opacity: consentGiven ? 1 : 0.5,
                    pointerEvents: consentGiven ? 'auto' : 'none',
                  }}
                >
                  <Cpu style={{ width: '1.25rem', height: '1.25rem' }} />
                  Analizar Contenido
                  <ChevronRight style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================================================================
            STEP: PROMPT INPUT
        ================================================================ */}
        {step === 'prompt_input' && (
          <div className="animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: '800',
                letterSpacing: '-0.02em', margin: '0 0 0.75rem 0'
              }}>
                Describe tu <span className="heading-gradient">presentación</span>
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>
                Cuéntale a la IA qué necesitas. Ella generará todo el contenido profesional.
              </p>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.05)', padding: '2rem', borderRadius: '2rem',
            }}>
              <textarea
                maxLength={5000}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder={"Ejemplo: Necesito una presentación sobre los resultados de ventas del Q4 2024.\nNuestro equipo superó las metas en un 20%, con $8.5M en revenue.\nLos principales mercados fueron LATAM y Europa.\nQuiero incluir las proyecciones para 2025 y los desafíos del equipo."}
                style={{
                  width: '100%', minHeight: '200px', background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1rem',
                  padding: '1.25rem', fontSize: '1rem', color: 'white', resize: 'vertical',
                  fontFamily: 'var(--font-body)', lineHeight: '1.6',
                  outline: 'none', transition: 'border-color 0.3s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: userPrompt.length > 4500 ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {userPrompt.length} / 5000 caracteres • Mínimo 10
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {['💼 Ventas Q4', '📊 Financial Review', '🚀 Product Launch', '👥 Team Update'].map(sug => (
                    <button key={sug} onClick={() => setUserPrompt(prev => prev + (prev ? '\n' : '') + sug.substring(2))}
                      style={{
                        padding: '0.3rem 0.6rem', fontSize: '0.65rem', fontWeight: '600',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '0.5rem', color: 'var(--text-muted)', cursor: 'pointer',
                        transition: 'all 0.2s', whiteSpace: 'nowrap'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                    >{sug}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Style + Theme + Generate for prompt mode */}
            {userPrompt.trim().length >= 10 && (
              <div className="animate-fade-in-up" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Style Selector */}
                <StyleSelector
                  styles={DEFAULT_STYLES}
                  selected={selectedStyle}
                  onSelect={setSelectedStyle}
                  showScores={false}
                />

                {/* Theme Selector */}
                <ThemeSelector
                  themes={DESIGN_THEMES}
                  selected={selectedTheme}
                  onSelect={setSelectedTheme}
                />

                <div style={{
                  marginBottom: '1rem', padding: '1rem',
                  border: '1px solid var(--border)', borderRadius: '1rem',
                  background: 'rgba(30, 41, 59, 0.5)'
                }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      style={{ marginTop: '0.25rem', accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      Acepto que mi prompt sea procesado por SmartDeck AI y enviado a Google Gemini API.
                      Los datos serán eliminados automáticamente después de 24 horas.{' '}
                      <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                        Ver Política de Privacidad
                      </a>
                    </span>
                  </label>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateFromPrompt}
                  disabled={!consentGiven}
                  className={`btn-primary shine-effect ${!consentGiven ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{
                    width: '100%', fontSize: '1.1rem', padding: '1.25rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                    boxShadow: consentGiven ? '0 20px 40px var(--primary-glow)' : 'none',
                    opacity: consentGiven ? 1 : 0.5,
                    pointerEvents: consentGiven ? 'auto' : 'none',
                  }}
                >
                  <Send style={{ width: '1.25rem', height: '1.25rem' }} />
                  Generar Presentación con IA
                  <ChevronRight style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Estilo: {DEFAULT_STYLES.find(s => s.id === selectedStyle)?.name} • Tema: {DESIGN_THEMES.find(t => t.id === selectedTheme)?.name}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================================================================
            STEP: ANALYZING (spinner)
        ================================================================ */}
        {step === 'analyzing' && (
          <div style={{
            minHeight: '50vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center'
          }}>
            <div style={{ position: 'relative', marginBottom: '2rem' }} className="animate-float">
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(37, 99, 235, 0.2)', padding: '2rem', borderRadius: '50%',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute', inset: 0, borderTop: '2px solid var(--primary)',
                  borderRadius: '50%', animation: 'spin-slow 3s linear infinite'
                }} />
                <FileText style={{ width: '3rem', height: '3rem', color: 'var(--primary)' }} />
              </div>
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: '700', margin: '0 0 0.75rem 0' }}>
              Analizando tu contenido
            </h3>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>
              La IA está leyendo tus archivos y detectando el mejor formato...
            </p>
          </div>
        )}

        {/* ================================================================
            STEP: STYLE SELECT (after analysis)
        ================================================================ */}
        {step === 'style_select' && (
          <div className="animate-fade-in-up" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: '800',
                letterSpacing: '-0.02em', margin: '0 0 0.75rem 0'
              }}>
                ¿Qué tipo de <span className="heading-gradient">presentación</span> necesitas?
              </h2>
              {contentSummary && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(37, 99, 235, 0.15)', borderRadius: '1rem',
                  padding: '1rem 1.5rem', maxWidth: '600px', margin: '0 auto',
                  fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <Cpu style={{ width: '1rem', height: '1rem', color: 'var(--primary)', flexShrink: 0, marginTop: '0.2rem' }} />
                    <span>{contentSummary}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Styles */}
            <StyleSelector
              styles={suggestedStyles.length > 0 ? suggestedStyles : DEFAULT_STYLES}
              selected={selectedStyle}
              onSelect={setSelectedStyle}
              showScores={suggestedStyles.length > 0}
            />

            {/* Theme */}
            <div style={{ marginTop: '1.5rem' }}>
              <ThemeSelector
                themes={DESIGN_THEMES}
                selected={selectedTheme}
                onSelect={setSelectedTheme}
              />
            </div>

            {/* Generate Button */}
            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={generateFromFiles}
                className="btn-primary shine-effect"
                style={{
                  width: '100%', fontSize: '1.1rem', padding: '1.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  boxShadow: '0 20px 40px var(--primary-glow)',
                }}
              >
                <Sparkles style={{ width: '1.25rem', height: '1.25rem' }} />
                Generar Presentación
                <ChevronRight style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Estilo: {(suggestedStyles.length > 0 ? suggestedStyles : DEFAULT_STYLES).find(s => s.id === selectedStyle)?.name} • Tema: {DESIGN_THEMES.find(t => t.id === selectedTheme)?.name}
              </p>
            </div>
          </div>
        )}

        {/* ================================================================
            STEP: PROCESSING
        ================================================================ */}
        {step === 'processing' && (
          <div style={{
            minHeight: '60vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            maxWidth: '48rem', margin: '0 auto'
          }}>
            <div style={{ position: 'relative', marginBottom: '3rem' }} className="animate-float">
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(37, 99, 235, 0.2)',
                filter: 'blur(60px)', borderRadius: '50%', transform: 'scale(1.5)'
              }} />
              <div style={{
                position: 'relative', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(37, 99, 235, 0.2)', padding: '2.5rem', borderRadius: '50%'
              }}>
                <div style={{
                  position: 'absolute', inset: 0, borderTop: '2px solid var(--primary)',
                  borderRadius: '50%', animation: 'spin-slow 3s linear infinite'
                }} />
                <Cpu style={{ width: '4rem', height: '4rem', color: 'var(--primary)' }} />
              </div>
            </div>

            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
              {inputMode === 'prompt' ? 'Generando desde tu Prompt' : 'Sintetizando Presentación'}
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              {inputMode === 'prompt'
                ? 'La IA está creando contenido profesional desde tu descripción.'
                : 'La IA está transformando tus datos en slides ejecutivos.'}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '2.5rem', fontWeight: '600' }}>
              {(suggestedStyles.length > 0 ? suggestedStyles : DEFAULT_STYLES).find(s => s.id === selectedStyle)?.name} • {DESIGN_THEMES.find(t => t.id === selectedTheme)?.name}
            </p>

            <div style={{
              width: '100%', background: 'rgba(255, 255, 255, 0.05)', height: '0.5rem',
              borderRadius: '9999px', overflow: 'hidden', marginBottom: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{
                height: '100%', background: 'var(--primary)', transition: 'width 0.5s ease-out',
                boxShadow: '0 0 15px var(--primary-glow)',
                width: statusMessage.includes("Finaliz") ? '95%' : statusMessage.includes("Construyendo") || statusMessage.includes("Estructurand") ? '70%' : statusMessage.includes("diseñand") || statusMessage.includes("inventand") ? '45%' : '20%'
              }} />
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.05)', padding: '0.75rem 1.5rem',
              borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.75rem'
            }}>
              <Loader2 style={{ width: '1rem', height: '1rem', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: '500', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {statusMessage}
              </span>
            </div>
          </div>
        )}

        {/* ================================================================
            STEP: DONE
        ================================================================ */}
        {step === 'done' && (
          <div style={{
            minHeight: '60vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            maxWidth: '56rem', margin: '0 auto'
          }} className="animate-fade-in-up">
            <div style={{ marginBottom: '2rem', position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(34, 197, 94, 0.1)',
                filter: 'blur(50px)', borderRadius: '50%'
              }} />
              <div style={{
                position: 'relative', background: 'rgba(34, 197, 94, 0.1)',
                border: '2px solid rgba(34, 197, 94, 0.2)', padding: '2rem', borderRadius: '50%',
              }}>
                <Check style={{ width: '4rem', height: '4rem', color: '#4ade80' }} />
              </div>
            </div>

            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.75rem', fontWeight: '800', marginBottom: '0.75rem' }}>
              ¡Presentación Lista!
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Generada con estilo <strong style={{ color: 'var(--primary)' }}>
                {(suggestedStyles.length > 0 ? suggestedStyles : DEFAULT_STYLES).find(s => s.id === selectedStyle)?.name}
              </strong> y tema <strong style={{ color: 'var(--primary)' }}>
                {DESIGN_THEMES.find(t => t.id === selectedTheme)?.name}
              </strong>
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
              📄 {downloadFilename}
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }} className="animate-fade-in-up delay-200">
              {downloadUrl && (
                <a href={downloadUrl} download={downloadFilename}
                  className="btn-primary shine-effect"
                  style={{
                    padding: '1.1rem 2.5rem', fontSize: '1.15rem', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}
                >
                  <Download style={{ width: '1.25rem', height: '1.25rem' }} />
                  Descargar Presentación
                </a>
              )}

              <button onClick={resetAll}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.1rem 2rem',
                  borderRadius: '9999px', fontWeight: 'bold', cursor: 'pointer',
                  fontSize: '1.05rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  transition: 'all 0.3s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)'; }}
              >
                <RefreshCw style={{ width: '1rem', height: '1rem', color: 'var(--text-muted)' }} />
                Nueva Presentación
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{
        width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: 0.5 }}>
          <Globe style={{ width: '1rem', height: '1rem' }} />
          <Shield style={{ width: '1rem', height: '1rem' }} />
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', margin: 0 }}>
          © 2025 SmartDeck AI v2.0 — Intelligent Presentation Platform
        </p>
      </footer>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}


/* ======================================================================
   SUB-COMPONENTS
====================================================================== */

function StyleSelector({ styles, selected, onSelect, showScores }: {
  styles: PresentationStyle[];
  selected: string;
  onSelect: (id: string) => void;
  showScores: boolean;
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Layers style={{ width: '1rem', height: '1rem', color: 'var(--primary)' }} />
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Estilo de Presentación
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
        {styles.map(style => {
          const IconComp = STYLE_ICONS[style.icon] || Briefcase;
          const isSelected = selected === style.id;
          return (
            <button
              key={style.id}
              onClick={() => onSelect(style.id)}
              style={{
                background: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: isSelected ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '1rem', padding: '1rem', cursor: 'pointer',
                textAlign: 'left', transition: 'all 0.25s', position: 'relative',
                display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'white'
              }}
              onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  background: isSelected ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255,255,255,0.05)',
                  padding: '0.5rem', borderRadius: '0.5rem'
                }}>
                  <IconComp style={{ width: '1.1rem', height: '1.1rem', color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }} />
                </div>
                {style.is_recommended && (
                  <span style={{
                    padding: '0.15rem 0.5rem', fontSize: '0.55rem', fontWeight: '800',
                    background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80',
                    borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    <Star style={{ width: '0.5rem', height: '0.5rem', display: 'inline', verticalAlign: 'middle', marginRight: '0.2rem' }} />
                    Recomendado
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700' }}>{style.name}</p>
              <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {style.description}
              </p>
              {showScores && style.reason && (
                <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--primary)', fontWeight: '600' }}>
                  {style.reason}
                </p>
              )}
              {isSelected && (
                <div style={{
                  position: 'absolute', top: '6px', right: '6px',
                  width: '18px', height: '18px', background: 'var(--primary)', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check style={{ width: '10px', height: '10px', color: 'white' }} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}


function ThemeSelector({ themes, selected, onSelect }: {
  themes: DesignTheme[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)',
      padding: '1rem', borderRadius: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Palette style={{ width: '1rem', height: '1rem', color: 'var(--primary)' }} />
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Tema Visual
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
        {themes.map(theme => {
          const isSelected = selected === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => onSelect(theme.id)}
              style={{
                background: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: isSelected ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '0.6rem', padding: '0.6rem', cursor: 'pointer',
                transition: 'all 0.25s', position: 'relative',
              }}
              onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <div style={{ display: 'flex', gap: '2px', height: '20px', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.3rem' }}>
                <div style={{ flex: 2, background: theme.colors[0], borderRadius: '3px 0 0 3px' }} />
                <div style={{ flex: 1, background: theme.colors[1] }} />
                <div style={{ flex: 1, background: theme.colors[2], borderRadius: '0 3px 3px 0', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: '700', color: isSelected ? 'white' : 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                {theme.name}
              </p>
              {isSelected && (
                <div style={{
                  position: 'absolute', top: '4px', right: '4px',
                  width: '14px', height: '14px', background: 'var(--primary)', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check style={{ width: '8px', height: '8px', color: 'white' }} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}


export default App;
