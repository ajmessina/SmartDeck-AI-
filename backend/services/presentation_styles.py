"""
Presentation Style System for SmartDeck AI

Defines different presentation "personalities" that influence:
- How the AI structures and writes the content
- The tone, language, and visual approach
- The slide types and flow recommended
"""


PRESENTATION_STYLES = {
    "executive": {
        "id": "executive",
        "name": "Ejecutivo Formal",
        "description": "Presentación de directorio. Lenguaje corporativo, datos precisos, recomendaciones estratégicas.",
        "icon": "briefcase",
        "tone": "formal",
        "keywords": ["revenue", "profit", "margin", "growth", "strategy", "board",
                     "ingresos", "ganancia", "margen", "crecimiento", "estrategia", "directorio",
                     "quarterly", "annual", "trimestral", "anual", "KPI", "OKR"],
        "prompt_modifier": """
PRESENTATION STYLE: EXECUTIVE FORMAL
- Language: Board-level corporate. Third person. No contractions.
- Tone: Authoritative, data-driven, strategic.
- Titles: State the conclusion with numbers. E.g. "Revenue Grew 24% to $45M, Exceeding Target"
- Bullets: Short, precise. Max 8 words. Every bullet has a number or metric.
- Structure: Executive Summary → KPIs → Deep Dive → Risks → Recommendations → Outlook
- Visual: Use metrics_slide for KPIs. Use two_column for comparisons. Formal section_dividers.
- Speaker Notes: Include board-ready talking points and anticipated questions.
""",
    },
    "sales": {
        "id": "sales",
        "name": "Ventas & Comercial",
        "description": "Pitch de ventas persuasivo. Enfocado en beneficios, ROI y call-to-action.",
        "icon": "trending-up",
        "tone": "persuasive",
        "keywords": ["sales", "customer", "deal", "pipeline", "conversion", "lead",
                     "ventas", "cliente", "negocio", "pipeline", "conversión", "prospecto",
                     "price", "pricing", "discount", "proposal", "precio", "propuesta",
                     "roi", "value", "benefit", "valor", "beneficio"],
        "prompt_modifier": """
PRESENTATION STYLE: SALES & COMMERCIAL
- Language: Persuasive, benefit-oriented. Second person ("you will gain...").
- Tone: Confident, energetic, outcome-focused.
- Titles: Focus on BENEFITS and RESULTS. E.g. "Cut Costs 40% While Doubling Output"
- Bullets: Lead with the benefit, then the proof. Use power words.
- Structure: Hook/Problem → Solution → Proof Points → ROI/Value → Social Proof → Call to Action
- Visual: Bold metrics_slide for ROI figures. Use two_column for Before/After, Problem/Solution.
- Speaker Notes: Include objection handling and closing techniques.
""",
    },
    "financial": {
        "id": "financial",
        "name": "Análisis Financiero",
        "description": "Análisis profundo con métricas financieras, tendencias y proyecciones.",
        "icon": "bar-chart",
        "tone": "analytical",
        "keywords": ["financial", "budget", "forecast", "cash flow", "balance", "income",
                     "financiero", "presupuesto", "pronóstico", "flujo de caja", "balance",
                     "expense", "cost", "investment", "gasto", "costo", "inversión",
                     "EBITDA", "P&L", "ROE", "ROA", "ratio", "debt", "equity"],
        "prompt_modifier": """
PRESENTATION STYLE: FINANCIAL ANALYSIS
- Language: Technical financial terminology. Precise and objective.
- Tone: Analytical, evidence-based, measured.
- Titles: Include specific financial metrics. E.g. "EBITDA Margin Expanded 320bps to 28.4%"
- Bullets: Always include exact figures, ratios, and YoY/QoQ comparisons.
- Structure: Financial Highlights → P&L Analysis → Balance Sheet → Cash Flow → Ratios → Forecast
- Visual: Heavy use of metrics_slide for financial KPIs. Two_column for period comparisons.
- Speaker Notes: Include calculation methodology and data source references.
""",
    },
    "product": {
        "id": "product",
        "name": "Presentación de Producto",
        "description": "Showcase de producto. Features, beneficios, roadmap y feedback de usuarios.",
        "icon": "box",
        "tone": "innovative",
        "keywords": ["product", "feature", "launch", "roadmap", "user", "UX", "design",
                     "producto", "característica", "lanzamiento", "usuario", "diseño",
                     "feedback", "review", "rating", "beta", "MVP", "sprint",
                     "adoption", "engagement", "retention", "adopción"],
        "prompt_modifier": """
PRESENTATION STYLE: PRODUCT PRESENTATION
- Language: Modern, tech-savvy. Mix of technical and accessible.
- Tone: Innovative, enthusiastic, user-centric.
- Titles: Feature-benefit pairs. E.g. "AI-Powered Search Reduced Lookup Time 5x"
- Bullets: Feature → Benefit → Proof (user data or testimonial).
- Structure: Vision → Problem → Solution (Demo) → Key Features → User Feedback → Roadmap → Next Steps
- Visual: Use executive_summary for feature highlights. Metrics for adoption data.
- Speaker Notes: Include demo talking points and user story references.
""",
    },
    "informal": {
        "id": "informal",
        "name": "Informal & Creativo",
        "description": "Tono casual y cercano. Ideal para equipos internos, brainstorming y updates.",
        "icon": "smile",
        "tone": "casual",
        "keywords": ["team", "update", "brainstorm", "ideas", "fun", "creative",
                     "equipo", "actualización", "ideas", "creativo", "casual",
                     "sprint", "retro", "standup", "weekly", "semanal",
                     "progress", "status", "progreso", "estado"],
        "prompt_modifier": """
PRESENTATION STYLE: INFORMAL & CREATIVE
- Language: Casual, first person plural ("we achieved", "our team").
- Tone: Friendly, approachable, celebratory.
- Titles: Conversational but clear. E.g. "We Crushed Our Q3 Goals 🎯"
- Bullets: Short and punchy. Use everyday language. Include emojis ✅ 🚀 📊 💡.
- Structure: TL;DR → What Happened → Wins → Learnings → What's Next → Open Discussion
- Visual: Fewer formal metrics. More content_slides with engaging copy. Fun section_dividers.
- Speaker Notes: Include conversation starters and discussion prompts.
""",
    },
}


def detect_best_styles(text: str) -> list:
    """
    Analyze text content and return ranked presentation styles
    based on keyword matching and content analysis.
    Returns list of style dicts with match_score and reason.
    """
    text_lower = text.lower()
    results = []

    for style_id, style in PRESENTATION_STYLES.items():
        matches = []
        for kw in style["keywords"]:
            if kw.lower() in text_lower:
                matches.append(kw)

        score = len(matches)
        if score > 0:
            # Build a human-readable reason
            top_keywords = matches[:5]
            reason = f"Detectado: {', '.join(top_keywords)}"
        else:
            reason = "Estilo disponible"

        results.append({
            "id": style_id,
            "name": style["name"],
            "description": style["description"],
            "icon": style["icon"],
            "match_score": score,
            "reason": reason,
            "is_recommended": score >= 3,
        })

    # Sort by score descending
    results.sort(key=lambda x: x["match_score"], reverse=True)

    # If nothing matched well, mark executive as recommended by default
    if not any(r["is_recommended"] for r in results):
        for r in results:
            if r["id"] == "executive":
                r["is_recommended"] = True
                r["reason"] = "Estilo recomendado por defecto"
                break

    return results


def get_style_prompt_modifier(style_id: str) -> str:
    """Get the prompt modifier for a given presentation style"""
    style = PRESENTATION_STYLES.get(style_id, PRESENTATION_STYLES["executive"])
    return style["prompt_modifier"]


def get_all_styles() -> list:
    """Return all styles for frontend display"""
    return [
        {
            "id": s["id"],
            "name": s["name"],
            "description": s["description"],
            "icon": s["icon"],
            "tone": s["tone"],
        }
        for s in PRESENTATION_STYLES.values()
    ]
