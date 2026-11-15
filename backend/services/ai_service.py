import os
import json
import re
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from sqlalchemy.orm import Session
from models import BrandGuideline, BrandFact, Terminology, BrandToneVoice, ApprovedMessaging

class AIService:
    @staticmethod
    def get_api_key(custom_key: Optional[str] = None) -> Optional[str]:
        return custom_key or os.getenv("GEMINI_API_KEY")

    @classmethod
    def analyze_content(
        cls,
        content: str,
        category: str,
        target_audience: str,
        db: Session,
        workspace_id: int = 1,
        custom_api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Full brand compliance analysis against the active knowledge base.
        Tries Gemini API if key is available; falls back to the deterministic local governance engine.
        """
        # 1. Retrieve active knowledge base references
        guidelines = db.query(BrandGuideline).filter(BrandGuideline.workspace_id == workspace_id).all()
        facts = db.query(BrandFact).filter(BrandFact.workspace_id == workspace_id).all()
        terminologies = db.query(Terminology).filter(Terminology.workspace_id == workspace_id).all()
        tones = db.query(BrandToneVoice).filter(BrandToneVoice.workspace_id == workspace_id).all()
        messages = db.query(ApprovedMessaging).filter(ApprovedMessaging.workspace_id == workspace_id).all()

        api_key = cls.get_api_key(custom_api_key)

        # Attempt Gemini analysis if API key is provided
        if api_key:
            try:
                genai.configure(api_key=api_key)
                # Try 1.5-flash or 2.0-flash
                model = genai.GenerativeModel("gemini-1.5-flash")
                
                kb_context = {
                    "approved_facts": [
                        {"claim": f.claim, "approved_wording": f.approved_wording, "source": f.verification_source}
                        for f in facts
                    ],
                    "terminology_rules": [
                        {"term": t.term, "type": t.term_type, "replacement": t.replacement_suggestion, "rationale": t.rationale}
                        for t in terminologies
                    ],
                    "tone_guidelines": [
                        {"dimension": tv.dimension_name, "guidelines": tv.guidelines, "negative_examples": tv.negative_examples}
                        for tv in tones
                    ],
                    "approved_messaging": [
                        {"type": m.message_type, "title": m.title, "copy": m.approved_copy}
                        for m in messages
                    ],
                    "general_guidelines": [
                        {"category": g.category, "title": g.title, "content": g.content, "source": g.source_title}
                        for g in guidelines
                    ]
                }

                prompt = f"""
You are the AI engine of BrandCue AI, an intelligent enterprise brand governance platform.
Analyse the submitted content draft against the approved brand knowledge base provided below.

Strict Governance Rules:
1. Identify any tone violations, prohibited terms, outdated/inconsistent facts, unsupported promotional claims, or guideline conflicts.
2. For EVERY issue found:
   - Identify the exact problematic passage from the original text.
   - Explain why it is a concern and why it matters.
   - Assign severity: 'critical', 'high', 'medium', 'low', or 'needs_verification'.
   - Cite the exact supporting reference from the knowledge base (title and excerpt).
   - CRITICAL UNCERTAINTY RULE: If a promotional claim lacks supporting facts in the knowledge base, DO NOT declare it as definitely false. Mark it as 'needs_verification' with an uncertainty note stating that the claim is unsupported by current references and requires human verification.
   - Provide a safe recommended action.
   - Provide a smart correction suggestion (original sentence vs suggested replacement + rationale preserving original intent without inventing facts).
3. Compute an overall brand compliance score (0 to 100) and an executive summary.

KNOWLEDGE BASE:
{json.dumps(kb_context, indent=2)}

CONTENT TO ANALYSE:
Title/Category: {category} (Audience: {target_audience})
Text:
\"\"\"
{content}
\"\"\"

Respond ONLY with valid JSON conforming to this schema:
{{
  "compliance_score": 85,
  "summary": "Overall tone is professional, but contains 2 prohibited terms and 1 unsupported superlative claim.",
  "engine_used": "Gemini 1.5 Flash (Live AI)",
  "findings": [
    {{
      "category": "terminology | tone | unsupported_claim | outdated_fact | messaging | guideline",
      "issue_title": "Short descriptive title",
      "original_passage": "Exact substring from content",
      "explanation": "Why this is an issue",
      "severity": "critical | high | medium | low | needs_verification",
      "reference_title": "Title of the cited guideline or fact",
      "evidence_excerpt": "Relevant quote from the knowledge base",
      "uncertainty_note": "Uncertainty explanation or null",
      "recommended_action": "Actionable step for creator",
      "suggested_replacement": "Direct drop-in replacement sentence",
      "replacement_rationale": "Why this replacement is safer"
    }}
  ]
}}
"""
                response = model.generate_content(
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.2,
                        response_mime_type="application/json"
                    )
                )
                
                result_text = response.text.strip()
                parsed = json.loads(result_text)
                parsed["engine_used"] = "Google Gemini AI (Live)"
                return parsed
            except Exception as e:
                # Log and fallback gracefully
                print(f"[AIService] Gemini API call exception, falling back to Local Engine: {e}")

        # Local Governance Intelligence Engine
        return cls._local_governance_engine(
            content=content,
            category=category,
            target_audience=target_audience,
            guidelines=guidelines,
            facts=facts,
            terminologies=terminologies,
            tones=tones,
            messages=messages
        )

    @classmethod
    def _local_governance_engine(
        cls,
        content: str,
        category: str,
        target_audience: str,
        guidelines: List[BrandGuideline],
        facts: List[BrandFact],
        terminologies: List[Terminology],
        tones: List[BrandToneVoice],
        messages: List[ApprovedMessaging]
    ) -> Dict[str, Any]:
        """
        Deterministic, explainable rule and semantic evaluation engine.
        Evaluates terminology rules, unsupported claims, factual verification, and tone.
        """
        findings = []

        # 1. Terminology Checking (Prohibited terms)
        for term_obj in terminologies:
            if term_obj.term_type.lower() == "prohibited":
                # regex pattern matching word boundaries
                pattern = rf"\b{re.escape(term_obj.term)}\b"
                matches = list(re.finditer(pattern, content, re.IGNORECASE))
                for match in matches:
                    passage = content[max(0, match.start() - 25): min(len(content), match.end() + 25)].strip()
                    exact_term = match.group(0)
                    replacement = term_obj.replacement_suggestion or "approved alternative"
                    
                    # Construct smart replacement
                    sentence = cls._extract_sentence(content, match.start(), match.end())
                    suggested_sentence = re.sub(rf"\b{re.escape(exact_term)}\b", replacement, sentence, flags=re.IGNORECASE)

                    findings.append({
                        "category": "terminology",
                        "issue_title": f"Prohibited Term: '{exact_term}'",
                        "original_passage": exact_term,
                        "explanation": f"The term '{exact_term}' violates brand vocabulary standards. {term_obj.rationale or 'Use approved enterprise terminology.'}",
                        "severity": "high",
                        "reference_title": f"Brand Terminology Matrix: '{term_obj.term}'",
                        "evidence_excerpt": f"Prohibited: '{term_obj.term}'. Preferred alternative: '{term_obj.replacement_suggestion}'. Reason: {term_obj.rationale}",
                        "uncertainty_note": "Direct prohibited term match in approved knowledge base.",
                        "recommended_action": f"Replace '{exact_term}' with '{replacement}'.",
                        "suggested_replacement": suggested_sentence,
                        "replacement_rationale": f"Replaces prohibited vocabulary with '{replacement}', preserving message while adhering to brand terminology guidelines."
                    })

        # 2. Unsupported Superlative / Promotional Claims
        unsupported_patterns = [
            (r"\b(100%\s*(?:bug-free|uptime|foolproof|guarantee[a-z]*))\b", "Absolute Guarantee Claim", "critical"),
            (r"\b(best\s+in\s+the\s+(?:world|industry|market)|#1\s+(?:rated|platform|provider|cloud))\b", "Unsubstantiated '#1' Superlative Claim", "needs_verification"),
            (r"\b(unlimited\s+(?:bandwidth|storage|performance)|cheapest\s+(?:solution|option|price|pricing))\b", "Unverified Promotional Superlative", "high"),
            (r"\b(bulletproof|flawless|miracle)\b", "Colloquial Hyperbole", "medium"),
            (r"\b(destroys\s+competitors|crushes\s+the\s+competition)\b", "Aggressive Tone & Brand Voice Violation", "critical")
        ]

        for pattern, issue_title, severity in unsupported_patterns:
            matches = list(re.finditer(pattern, content, re.IGNORECASE))
            for match in matches:
                passage = match.group(0)
                sentence = cls._extract_sentence(content, match.start(), match.end())
                
                # Check if this claim has an approved fact in knowledge base
                has_fact = any(passage.lower() in f.claim.lower() or passage.lower() in f.approved_wording.lower() for f in facts)
                
                if not has_fact:
                    clean_replacement = cls._soften_claim(sentence, passage)
                    findings.append({
                        "category": "unsupported_claim" if severity != "critical" and "Voice" not in issue_title else "tone",
                        "issue_title": issue_title,
                        "original_passage": passage,
                        "explanation": f"The claim '{passage}' lacks supporting verification in the active brand facts database. In enterprise governance, unverified superlatives risk compliance and credibility.",
                        "severity": severity,
                        "reference_title": "Brand Messaging & Fact Verification Policy",
                        "evidence_excerpt": "All public-facing claims must be substantiated by official benchmarks, certified SLAs, or validated audit reports.",
                        "uncertainty_note": "IMPORTANT: Missing supporting evidence does not automatically imply false information. This claim is currently unsupported by supplied references and requires human verification.",
                        "recommended_action": "Substantiate with verified customer metrics or rephrase to approved factual terminology.",
                        "suggested_replacement": clean_replacement,
                        "replacement_rationale": "Softens unverified superlative to an evidence-based, professional statement that retains value proposition without legal or compliance exposure."
                    })

        # 3. Factual Inconsistency / Outdated Facts Check
        # Check specific numbers like SLA or founding year
        sla_matches = re.finditer(r"\b(99\.\d+%\s*uptime|100%\s*uptime)\b", content, re.IGNORECASE)
        for match in sla_matches:
            claimed_sla = match.group(0)
            # Find SLA fact
            sla_fact = next((f for f in facts if "sla" in f.claim.lower() or "uptime" in f.claim.lower()), None)
            if sla_fact and sla_fact.approved_wording.lower() not in claimed_sla.lower():
                sentence = cls._extract_sentence(content, match.start(), match.end())
                suggested = re.sub(re.escape(claimed_sla), "99.95% uptime SLA", sentence, flags=re.IGNORECASE)
                findings.append({
                    "category": "outdated_fact",
                    "issue_title": f"Inconsistent SLA Claim: '{claimed_sla}'",
                    "original_passage": claimed_sla,
                    "explanation": f"Claimed uptime '{claimed_sla}' contradicts the official verified SLA in the brand knowledge base.",
                    "severity": "critical",
                    "reference_title": f"Approved Brand Fact: {sla_fact.claim}",
                    "evidence_excerpt": sla_fact.approved_wording,
                    "uncertainty_note": "Verified discrepancy against official corporate SLA documentation.",
                    "recommended_action": f"Correct uptime claim to match official certified SLA ({sla_fact.approved_wording}).",
                    "suggested_replacement": suggested,
                    "replacement_rationale": f"Aligns operational metrics directly with the verified SLA '{sla_fact.approved_wording}'."
                })

        # Check Founding Date / Customer metrics
        founding_matches = re.finditer(r"\b(founded\s+in\s+\d{4}|since\s+\d{4})\b", content, re.IGNORECASE)
        for match in founding_matches:
            claimed_founding = match.group(0)
            founding_fact = next((f for f in facts if "founded" in f.claim.lower() or "established" in f.claim.lower()), None)
            if founding_fact and "2021" not in claimed_founding and "2021" in founding_fact.approved_wording:
                sentence = cls._extract_sentence(content, match.start(), match.end())
                suggested = re.sub(re.escape(claimed_founding), "founded in 2021", sentence, flags=re.IGNORECASE)
                findings.append({
                    "category": "outdated_fact",
                    "issue_title": f"Incorrect Founding Date: '{claimed_founding}'",
                    "original_passage": claimed_founding,
                    "explanation": f"Historical corporate fact '{claimed_founding}' does not match official brand timeline.",
                    "severity": "high",
                    "reference_title": f"Approved Brand Fact: {founding_fact.claim}",
                    "evidence_excerpt": founding_fact.approved_wording,
                    "uncertainty_note": "Direct discrepancy with registered corporate history.",
                    "recommended_action": "Update founding reference to 2021.",
                    "suggested_replacement": suggested,
                    "replacement_rationale": "Restores accurate historical reference per approved brand facts."
                })

        # 4. Tone & Voice Check
        informal_phrases = [
            (r"\b(gonna|wanna|kinda|super\s+cool|crazy\s+fast)\b", "Informal / Slang Phrasing", "medium"),
            (r"\b(you\s+guys|dude|check\s+this\s+out)\b", "Casual Colloquial Address", "medium")
        ]
        for pattern, issue_title, severity in informal_phrases:
            matches = list(re.finditer(pattern, content, re.IGNORECASE))
            for match in matches:
                passage = match.group(0)
                sentence = cls._extract_sentence(content, match.start(), match.end())
                suggested = sentence.replace(passage, "enterprise-grade" if "cool" in passage or "fast" in passage else "our clients")
                tone_ref = tones[0] if tones else None
                findings.append({
                    "category": "tone",
                    "issue_title": issue_title,
                    "original_passage": passage,
                    "explanation": f"The phrase '{passage}' diverges from the authoritative, professional voice expected in enterprise publications.",
                    "severity": severity,
                    "reference_title": f"Brand Voice Guideline: {tone_ref.dimension_name if tone_ref else 'Authoritative & Clear'}",
                    "evidence_excerpt": tone_ref.guidelines if tone_ref else "Maintain a confident, clear, and professional tone suitable for C-level and technical leaders.",
                    "uncertainty_note": "Tone assessment based on organizational style guide rules.",
                    "recommended_action": "Adopt a polished, enterprise tone suitable for external stakeholders.",
                    "suggested_replacement": suggested,
                    "replacement_rationale": "Elevates phrasing to match professional enterprise brand standards."
                })

        # Calculate Compliance Score
        deductions = {
            "critical": 25,
            "high": 15,
            "medium": 8,
            "low": 4,
            "needs_verification": 10
        }
        total_deduction = sum(deductions.get(f["severity"], 5) for f in findings)
        score = max(10, min(100, 100 - total_deduction))

        if not findings:
            summary = "Excellent brand alignment. Content demonstrates strong compliance with brand guidelines, approved facts, and preferred terminology."
        else:
            categories_count = {}
            for f in findings:
                categories_count[f["category"]] = categories_count.get(f["category"], 0) + 1
            cat_summary = ", ".join([f"{v} {k.replace('_', ' ')}" for k, v in categories_count.items()])
            summary = f"Identified {len(findings)} governance issues ({cat_summary}). Recommended revisions provided with direct evidence citations."

        return {
            "compliance_score": score,
            "summary": summary,
            "engine_used": "BrandCue Explainable Governance Engine (Local)",
            "findings": findings
        }

    @staticmethod
    def _extract_sentence(content: str, start: int, end: int) -> str:
        """Helper to extract the surrounding sentence for a given match."""
        # Find preceding punctuation or start of text
        prev_punct = max(content.rfind(".", 0, start), content.rfind("!", 0, start), content.rfind("?", 0, start), content.rfind("\n", 0, start))
        sentence_start = 0 if prev_punct == -1 else prev_punct + 1

        # Find following punctuation or end of text
        next_punct_candidates = [pos for pos in [content.find(".", end), content.find("!", end), content.find("?", end), content.find("\n", end)] if pos != -1]
        sentence_end = min(next_punct_candidates) + 1 if next_punct_candidates else len(content)

        sentence = content[sentence_start:sentence_end].strip()
        return sentence if sentence else content[start:end]

    @staticmethod
    def _soften_claim(sentence: str, passage: str) -> str:
        """Helper to safely replace hyperbolic or unverified claims."""
        replacements = {
            "100% bug-free": "rigorously tested and enterprise-resilient",
            "100% uptime": "high-availability architecture with 99.95% SLA",
            "foolproof": "fault-tolerant and dependable",
            "best in the world": "industry-leading and benchmark-validated",
            "best in the industry": "top-tier and peer-recognized",
            "#1 rated": "highly rated",
            "#1 platform": "trusted enterprise platform",
            "unlimited bandwidth": "high-capacity bandwidth",
            "unlimited storage": "scalable cloud storage",
            "cheapest solution": "cost-effective and high-ROI solution",
            "bulletproof": "highly resilient",
            "flawless": "rigorously validated",
            "miracle": "high-impact breakthrough",
            "destroys competitors": "outperforms legacy architectures"
        }
        for key, val in replacements.items():
            if key in passage.lower():
                return re.sub(re.escape(passage), val, sentence, flags=re.IGNORECASE)
        return re.sub(re.escape(passage), "industry-validated standard", sentence, flags=re.IGNORECASE)
