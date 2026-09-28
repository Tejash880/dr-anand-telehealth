"""
Real-time Emergency Red-Flag Triage Engine.
Scans patient complaints, symptoms, and medical background against critical triage protocols (AHA, ASA, WAO).
Immediately flags life-threatening conditions to activate the Critical System Response Trigger.
"""

from typing import Dict, Any, List
import re

# Critical Red-Flag Patterns
EMERGENCY_PATTERNS = [
    {
        "type": "CARDIAC_EMERGENCY",
        "name": "Suspected Acute Coronary Syndrome / Myocardial Infarction",
        "patterns": [
            r"\b(chest\s*pain|chest\s*pressure|chest\s*tightness|crushing\s*chest)\b",
            r"\b(radiat(ing|es)?\s*(to\s*)?(left\s*arm|jaw|neck|back))\b",
            r"\b(heart\s*attack|cardiac\s*arrest)\b"
        ],
        "require_multiple": False,
        "warning_message": "Symptoms suggest potential acute coronary syndrome or myocardial infarction. Immediate emergency medical care is essential.",
        "action": "Immediate 911 / 112 EMS dispatch. Do not drive to hospital alone. Chew aspirin 324mg if not allergic and conscious."
    },
    {
        "type": "STROKE_EMERGENCY",
        "name": "Suspected Acute Stroke / TIA (FAST Criteria)",
        "patterns": [
            r"\b(slurr(ed|ing)\s*speech|can('?t|not)\s*speak|trouble\s*talking|loss\s*of\s*speech)\b",
            r"\b(face\s*droop(ing)?|facial\s*numbness|facial\s*asymmetry|crooked\s*smile)\b",
            r"\b(arm\s*weakness|can('?t|not)\s*lift\s*arm|arm\s*drift|one\s*sided\s*weakness|paralysis)\b",
            r"\b(sudden\s*blindness|sudden\s*loss\s*of\s*vision|vision\s*loss)\b",
            r"\b(stroke)\b"
        ],
        "require_multiple": False,
        "warning_message": "Sudden neurological deficits detected matching FAST stroke criteria. Time to treatment is critical for brain tissue preservation.",
        "action": "Call 911 / 112 immediately. Note exact time symptoms began. Do not eat, drink, or take medications."
    },
    {
        "type": "ANAPHYLAXIS_EMERGENCY",
        "name": "Severe Anaphylaxis / Airway Compromise",
        "patterns": [
            r"\b(throat\s*(closing|tight|swelling)|swollen\s*(tongue|lips|throat))\b",
            r"\b(can('?t|not)\s*breathe|severe\s*shortness\s*of\s*breath|stridor|gasping)\b",
            r"\b(anaphylaxis|anaphylactic)\b"
        ],
        "require_multiple": False,
        "warning_message": "Signs of life-threatening anaphylaxis or acute airway obstruction detected.",
        "action": "Administer intramuscular epinephrine (EpiPen) immediately if available into outer thigh. Call 911 / 112 without delay."
    },
    {
        "type": "SEVERE_RESPIRATORY_FAILURE",
        "name": "Acute Respiratory Distress / Cyanosis",
        "patterns": [
            r"\b(blue\s*lips|turning\s*blue|cyanosis)\b",
            r"\b(suffocating|cannot\s*catch\s*breath|unable\s*to\s*speak\s*full\s*sentences)\b"
        ],
        "require_multiple": False,
        "warning_message": "Severe respiratory distress with potential oxygen deprivation detected.",
        "action": "Sit upright, call 911 / 112 immediately. Ensure open airway."
    },
    {
        "type": "SEPSIS_EMERGENCY",
        "name": "Suspected Sepsis / Severe Systemic Deterioration",
        "patterns": [
            r"\b(high\s*fever|fever\s*over\s*104)\b.*?\b(confusion|disorient(ed)?|unresponsive|lethargic)\b",
            r"\b(confusion|disorient(ed)?)\b.*?\b(high\s*fever|severe\s*shivering)\b"
        ],
        "require_multiple": False,
        "warning_message": "Combination of altered mental status and systemic infection signs indicates possible sepsis.",
        "action": "Immediate emergency room evaluation required for intravenous antibiotics and fluids."
    }
]

# Urgent (Non-immediate emergency, but requires priority same-day evaluation)
URGENT_PATTERNS = [
    r"\b(fever\s*over\s*102|fever\s*>|severe\s*abdominal\s*pain|vomiting\s*blood|black\s*stool|head\s*injury|fainting|syncope)\b"
]

def evaluate_emergency_triage(
    symptoms: str,
    medical_history: str = "",
    allergies: str = "",
    medications: str = ""
) -> Dict[str, Any]:
    """
    Evaluates inputs in real-time and produces triage urgency classification.
    """
    combined_text = f"{symptoms} {medical_history} {allergies} {medications}".lower()
    
    detected_red_flags: List[Dict[str, str]] = []
    
    # Check Emergency Patterns
    for emg in EMERGENCY_PATTERNS:
        for pat in emg["patterns"]:
            if re.search(pat, combined_text, re.IGNORECASE):
                detected_red_flags.append({
                    "code": emg["type"],
                    "title": emg["name"],
                    "description": emg["warning_message"],
                    "action": emg["action"]
                })
                break

    # If any emergency flags found
    if detected_red_flags:
        return {
            "is_emergency": True,
            "urgency_level": "EMERGENCY",
            "badge_color": "rose",
            "alert_title": "CRITICAL SYSTEM RESPONSE TRIGGER: URGENT WARNING",
            "headline": "High-risk, potentially life-threatening symptoms identified.",
            "subheadline": "Redirecting immediately to Emergency Services & Nearest Hospital.",
            "red_flags": detected_red_flags,
            "emergency_contacts": [
                {"name": "Emergency Services", "number": "911", "country": "US / International EMS", "type": "ambulance"},
                {"name": "Emergency Hotline (EU/UK/IN)", "number": "112", "country": "Global Standard", "type": "ambulance"},
                {"name": "National Poison Control", "number": "1-800-222-1222", "country": "US", "type": "poison"},
                {"name": "Crisis / Mental Health Hotline", "number": "988", "country": "US / Canada", "type": "mental"}
            ],
            "requires_immediate_dispatch": True
        }
    
    # Check Urgent Patterns
    is_urgent = False
    for pat in URGENT_PATTERNS:
        if re.search(pat, combined_text, re.IGNORECASE):
            is_urgent = True
            break
            
    if is_urgent:
        return {
            "is_emergency": False,
            "urgency_level": "URGENT",
            "badge_color": "amber",
            "alert_title": "Priority Clinical Triage Notice",
            "headline": "Symptoms require prompt medical evaluation within 12-24 hours.",
            "subheadline": "Consultation summary flagged for expedited doctor review.",
            "red_flags": [],
            "emergency_contacts": [],
            "requires_immediate_dispatch": False
        }

    return {
        "is_emergency": False,
        "urgency_level": "ROUTINE",
        "badge_color": "emerald",
        "alert_title": "Standard Clinical Intake",
        "headline": "No acute emergency red flags identified.",
        "subheadline": "Proceeding with comprehensive AI synthesis for doctor consultation.",
        "red_flags": [],
        "emergency_contacts": [],
        "requires_immediate_dispatch": False
    }
