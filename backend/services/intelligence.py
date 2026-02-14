from google import genai
from google.genai import types
import json
import time
import logging
from services.presentation_styles import get_style_prompt_modifier, detect_best_styles

logger = logging.getLogger(__name__)


class IntelligenceService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key
        if api_key:
            self.client = genai.Client(api_key=api_key)
            self.model_name = 'gemini-2.0-flash'
        else:
            self.client = None
            self.model_name = None

    # =========================================================================
    # SLIDE TYPE DEFINITIONS (shared across all methods)
    # =========================================================================

    SLIDE_TYPES_SPEC = """
    === AVAILABLE SLIDE TYPES (use at least 4 different types) ===

    TYPE 1 - "title_slide" (use exactly once, as first slide):
    {{
        "type": "title_slide",
        "title": "The Big Headline Insight",
        "subtitle": "Supporting context line"
    }}

    TYPE 2 - "executive_summary" (use for key takeaways, 3-4 bullets in card layout):
    {{
        "type": "executive_summary",
        "title": "Revenue Exceeded All Targets in Q4",
        "bullet_points": ["Short insight 1", "Short insight 2", "Short insight 3", "Short insight 4"],
        "speaker_notes": "talking points"
    }}

    TYPE 3 - "metrics_slide" (use for KPIs, showing big numbers as cards):
    {{
        "type": "metrics_slide",
        "title": "Key Performance Indicators Beat Targets",
        "metrics": [
            {{"value": "$6.6M", "label": "Total Revenue", "change": "+75% YoY"}},
            {{"value": "95%", "label": "Customer Retention", "change": "+2pts vs Q3"}},
            {{"value": "150", "label": "New Customers", "change": "+25% vs Q3"}},
            {{"value": "$14K", "label": "Avg Deal Size", "change": "+17% YoY"}}
        ],
        "speaker_notes": "talking points"
    }}

    TYPE 4 - "content_slide" (standard bullets for analysis):
    {{
        "type": "content_slide",
        "title": "Action-Oriented Insight Title",
        "bullet_points": ["Insight with data", "Another with context", "Third point"],
        "speaker_notes": "talking points"
    }}

    TYPE 5 - "two_column" (for before/after, pros/cons, comparison):
    {{
        "type": "two_column",
        "title": "Strengths Outweigh Challenges",
        "left_title": "Strengths",
        "right_title": "Challenges",
        "left_points": ["Point A", "Point B", "Point C"],
        "right_points": ["Challenge 1", "Challenge 2", "Challenge 3"],
        "speaker_notes": "talking points"
    }}

    TYPE 6 - "section_divider" (bold transition between sections):
    {{
        "type": "section_divider",
        "title": "Strategic Recommendations",
        "subtitle": "Actionable next steps for Q1 2025"
    }}

    TYPE 7 - "challenges_slide" (risks/challenges with warning style):
    {{
        "type": "challenges_slide",
        "title": "Three Risks Require Immediate Attention",
        "bullet_points": ["Risk 1 with specifics", "Risk 2 with impact", "Risk 3"],
        "speaker_notes": "talking points"
    }}
    """

    # =========================================================================
    # MODE 1: Analyze uploaded files
    # =========================================================================

    def analyze_and_structure(self, raw_text: str, style_id: str = "executive") -> dict:
        """Analyze uploaded data and generate a structured presentation."""
        if not self.api_key:
            logger.warning("No API key found - using MOCK response")
            return self._mock_response()

        logger.info(f"Analyzing with Gemini AI (style: {style_id})...")

        style_modifier = get_style_prompt_modifier(style_id)

        prompt = f"""
        You are an ELITE business intelligence analyst and presentation designer.

        Transform the raw data below into a professional presentation.

        CRITICAL RULE: DETECT the language of the RAW DATA below (English or Spanish).
        ALL GENERATED CONTENT (Titles, subtitles, bullet points, metrics labels, speaker notes) MUST BE IN THE SAME LANGUAGE AS THE RAW DATA.

        CRITICAL RULE: Include a 'SOURCES' slide at the end listing the filenames found in the raw data markers (--- Source: filename ---).

        === DESIGN RULES ===

        1. ACTION-ORIENTED TITLES: State the conclusion, not topic.
        2. Keep bullets SHORT: max 12 words each, max 5 bullets per slide.
        3. Be SPECIFIC: exact numbers, percentages, comparisons.
        4. Use VARIETY of slide types. DO NOT use only content_slide.
        5. Total: 8-12 slides. Every slide must have speaker_notes.

        {style_modifier}

        {self.SLIDE_TYPES_SPEC}

        === RAW DATA ===

        {raw_text[:50000]}

        === OUTPUT ===

        Return ONLY valid JSON:
        {{
            "presentation_title": "Main insight title",
            "slides": [ ... slide objects ... ]
        }}
        """

        return self._call_gemini(prompt)

    # =========================================================================
    # MODE 2: Generate from user prompt/context
    # =========================================================================

    def generate_from_prompt(self, user_prompt: str, style_id: str = "executive") -> dict:
        """Generate a presentation from a user-written prompt or context."""
        if not self.api_key:
            logger.warning("No API key found - using MOCK response")
            return self._mock_prompt_response(user_prompt)

        logger.info(f"Generating from prompt (style: {style_id})...")

        style_modifier = get_style_prompt_modifier(style_id)

        prompt = f"""
        You are an ELITE presentation designer and business storyteller.

        A user wants you to CREATE a professional presentation based on their instructions.
        You must INVENT realistic, well-structured content that fulfills their request.
        Use plausible data, metrics, and insights that fit the context they describe.

        CRITICAL RULE: DETECT the language of the USER'S REQUEST below.
        ALL GENERATED CONTENT MUST BE IN THE SAME LANGUAGE AS THE USER'S REQUEST.

        === USER'S REQUEST ===

        {user_prompt}

        === YOUR TASK ===

        1. Understand WHAT the user wants to present
        2. Create REALISTIC content with specific numbers, metrics, and insights
        3. Structure it as a professional presentation with 8-12 slides
        4. Follow the presentation style guidelines below

        === DESIGN RULES ===

        1. ACTION-ORIENTED TITLES: State the conclusion, not topic.
        2. Keep bullets SHORT: max 12 words each, max 5 bullets per slide.
        3. Be SPECIFIC: invent realistic numbers, percentages, comparisons.
        4. Use VARIETY of slide types. DO NOT use only content_slide.
        5. Every slide must have speaker_notes.

        {style_modifier}

        {self.SLIDE_TYPES_SPEC}

        === OUTPUT ===

        Return ONLY valid JSON:
        {{
            "presentation_title": "Main insight title",
            "slides": [ ... slide objects ... ]
        }}
        """

        return self._call_gemini(prompt)

    # =========================================================================
    # MODE 3: Detect content type and suggest styles
    # =========================================================================

    def detect_content_type(self, raw_text: str) -> dict:
        """Analyze uploaded text and suggest the best presentation styles."""
        # Use keyword-based detection (works without API key)
        style_suggestions = detect_best_styles(raw_text)

        # If we have an API key, also get an AI-powered summary
        summary = ""
        if self.api_key:
            try:
                summary_prompt = f"""
                Analyze this data in ONE short paragraph (max 3 sentences).
                Describe: What type of data is this? What is it about? What would be the best way to present it?
                Answer in Spanish.

                DATA:
                {raw_text[:5000]}
                """
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=summary_prompt
                )
                summary = response.text.strip()
                logger.info(f"Content analysis: {summary[:100]}...")
            except Exception as e:
                logger.error(f"Content detection error: {e}")
                summary = "Análisis de contenido disponible."
        else:
            summary = "Sube tu archivo y la IA analizará el mejor formato para tu presentación."

        return {
            "summary": summary,
            "suggested_styles": style_suggestions,
        }

    # =========================================================================
    # Gemini API Call
    # =========================================================================

    def _call_gemini(self, prompt: str) -> dict:
        """Make a call to Gemini API and parse JSON response."""
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.4,
                    response_mime_type="application/json"
                )
            )
            result = json.loads(response.text)
            logger.info(f"Generated {len(result.get('slides', []))} slides")
            return result
        except Exception as e:
            logger.error(f"Error: {e}")
            logger.warning("Falling back to MOCK response")
            return self._mock_response()

    # =========================================================================
    # Mock Responses
    # =========================================================================

    def _mock_response(self):
        """Mock response with varied slide types"""
        time.sleep(2)
        return {
            "presentation_title": "Q3 2024 Executive Business Review",
            "slides": [
                {
                    "type": "title_slide",
                    "title": "Revenue Grew 18% to $45.2M, Beating Target by $3.5M",
                    "subtitle": "Q3 2024 Executive Business Review"
                },
                {
                    "type": "executive_summary",
                    "title": "Four Key Wins Define Q3 Performance",
                    "bullet_points": [
                        "Revenue: $45.2M (+18% YoY), beat target by $3.5M",
                        "Margins: Operating margin reached 24%, up from 19%",
                        "Customers: NPS hit 72, retention climbed to 96%",
                        "Expansion: Launched in 3 new European markets"
                    ],
                    "speaker_notes": "Lead with the revenue beat to set positive tone."
                },
                {
                    "type": "metrics_slide",
                    "title": "All Key Metrics Exceeded Targets",
                    "metrics": [
                        {"value": "$45.2M", "label": "Q3 Revenue", "change": "+18% YoY"},
                        {"value": "24%", "label": "Operating Margin", "change": "+5pts vs Q2"},
                        {"value": "96%", "label": "Customer Retention", "change": "+3pts vs Q2"},
                        {"value": "72", "label": "Net Promoter Score", "change": "Highest ever"},
                        {"value": "$42K", "label": "Avg Contract Value", "change": "+18% YoY"},
                        {"value": "89%", "label": "Recurring Revenue", "change": "+5pts vs Q2"}
                    ],
                    "speaker_notes": "Use this slide as an at-a-glance dashboard."
                },
                {
                    "type": "content_slide",
                    "title": "Enterprise Segment Drove 62% of Revenue",
                    "bullet_points": [
                        "Enterprise: $28M (+25% YoY), now 62% of total",
                        "SMB segment: $12.5M (+5% YoY), stable",
                        "New product line: $4.7M in first full quarter",
                        "Recurring revenue: 89%, up from 84%"
                    ],
                    "speaker_notes": "Enterprise is the growth engine."
                },
                {
                    "type": "content_slide",
                    "title": "Operational Leverage Expanded Margins 500bps",
                    "bullet_points": [
                        "Operating margin: 24% (target: 21%)",
                        "CAC efficiency: $0.42 per $1 LTV",
                        "R&D shipped 3 major features vs 2 planned",
                        "G&A reduced to 12% of revenue (from 15%)"
                    ],
                    "speaker_notes": "Margin expansion from efficiency, not cuts."
                },
                {
                    "type": "section_divider",
                    "title": "Risks & Challenges",
                    "subtitle": "Three areas requiring strategic attention"
                },
                {
                    "type": "challenges_slide",
                    "title": "Three Risks Require Immediate Action",
                    "bullet_points": [
                        "Competition: 2 new entrants in core market",
                        "Sales cycle: Lengthened to 47 days (+24%)",
                        "SMB churn: 8% in <$10K accounts (target: 5%)",
                        "Hiring gap: 12 of 18 engineering hires filled"
                    ],
                    "speaker_notes": "Be transparent. Sales cycle fix underway."
                },
                {
                    "type": "two_column",
                    "title": "Strengths Position Us to Address Challenges",
                    "left_title": "Strengths",
                    "right_title": "Actions Needed",
                    "left_points": [
                        "Enterprise growth at 25% YoY",
                        "Best-in-class NPS of 72",
                        "Strong margins at 24%",
                        "89% recurring revenue"
                    ],
                    "right_points": [
                        "Hire 5 senior AEs by Nov 1",
                        "Launch competitive response ($2M)",
                        "Implement automated SMB onboarding",
                        "Accelerate engineering hiring"
                    ],
                    "speaker_notes": "Frame challenges as opportunities."
                },
                {
                    "type": "content_slide",
                    "title": "Five Strategic Priorities for Q4",
                    "bullet_points": [
                        "Double enterprise sales capacity: 5 new AEs",
                        "Launch competitive response: $2M budget",
                        "Ship AI features to widen product moat",
                        "Automate SMB onboarding to reduce churn",
                        "Expand partner channel: 10 new partners"
                    ],
                    "speaker_notes": "All priorities are funded."
                },
                {
                    "type": "metrics_slide",
                    "title": "Q4 Targets: Path to $200M ARR",
                    "metrics": [
                        {"value": "$52M", "label": "Q4 Revenue Target", "change": "+15% vs Q3"},
                        {"value": "$175M", "label": "Full Year 2024", "change": "vs $170M target"},
                        {"value": "28%", "label": "Target Op. Margin", "change": "+4pts vs Q3"},
                        {"value": "$200M", "label": "ARR Milestone", "change": "By Q1 2025"}
                    ],
                    "speaker_notes": "$200M ARR milestone positions us for Series C."
                }
            ]
        }

    def _mock_prompt_response(self, user_prompt: str):
        """Mock response for prompt-based generation"""
        time.sleep(2)
        return {
            "presentation_title": "Presentación Generada desde Prompt",
            "slides": [
                {
                    "type": "title_slide",
                    "title": "AI-Generated Strategic Presentation",
                    "subtitle": f"Based on: {user_prompt[:80]}..."
                },
                {
                    "type": "executive_summary",
                    "title": "Key Points from Your Request",
                    "bullet_points": [
                        "Content generated based on your context",
                        "AI-structured for maximum impact",
                        "Professional formatting applied",
                        "Ready for executive review"
                    ],
                    "speaker_notes": "This was generated from a user prompt in mock mode."
                },
                {
                    "type": "metrics_slide",
                    "title": "Projected Impact Metrics",
                    "metrics": [
                        {"value": "3x", "label": "Expected ROI", "change": "Year 1"},
                        {"value": "40%", "label": "Efficiency Gain", "change": "vs Current"},
                        {"value": "$2.5M", "label": "Cost Savings", "change": "Annual"},
                        {"value": "95%", "label": "Success Rate", "change": "Industry Avg: 68%"}
                    ],
                    "speaker_notes": "Mock metrics for demonstration."
                },
                {
                    "type": "content_slide",
                    "title": "Strategic Recommendations",
                    "bullet_points": [
                        "Phase 1: Foundation and quick wins",
                        "Phase 2: Scale and optimize",
                        "Phase 3: Expand and innovate",
                        "Timeline: 6-12 months to full deployment"
                    ],
                    "speaker_notes": "Connect Gemini API for real AI-generated content."
                },
                {
                    "type": "section_divider",
                    "title": "Next Steps",
                    "subtitle": "Connect your Gemini API key for full AI generation"
                }
            ]
        }
