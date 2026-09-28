"""
Verified Medical Knowledge Base for RAG (Retrieval-Augmented Generation).
Grounded strictly in verified clinical guidelines from WHO, CDC, AHA/ACC, and NICE.
No hallucinations - verified docs only.
"""

from typing import List, Dict, Any

VERIFIED_MEDICAL_GUIDELINES: List[Dict[str, Any]] = [
    {
        "id": "RAG-EMG-001",
        "title": "Emergency Red Flags: Acute Coronary Syndrome (ACS) & Myocardial Infarction",
        "category": "Cardiovascular Emergencies",
        "organization": "American Heart Association (AHA) / ACC",
        "keywords": ["chest pain", "pressure", "jaw pain", "left arm", "diaphoresis", "sweating", "shortness of breath", "heart attack", "coronary"],
        "is_emergency": True,
        "content": (
            "Clinical Protocol for Suspected Acute Coronary Syndrome: "
            "Any adult presenting with retrosternal chest discomfort (pressure, tightness, burning) lasting > 15 minutes, "
            "especially when radiating to the left arm, neck, jaw, or back, accompanied by unexplained diaphoresis, nausea, "
            "or dyspnea, must be treated as an immediate emergency. Direct consultation is contraindicated; immediate "
            "transportation via EMS (call 911 / 112) to an emergency facility capable of percutaneous coronary intervention (PCI) "
            "and 12-lead ECG within 10 minutes of arrival is required. Administer chewable aspirin 324 mg unless actively bleeding or allergic."
        ),
        "contraindications": ["Do not administer nitroglycerin if patient has taken PDE-5 inhibitors in last 24-48 hours."],
        "suggested_actions": ["Immediate EMS dispatch", "Chewable Aspirin 324mg if no allergy", "12-lead ECG", "Continuous cardiac monitoring"]
    },
    {
        "id": "RAG-EMG-002",
        "title": "Emergency Red Flags: Acute Ischemic Stroke & TIA (FAST Criteria)",
        "category": "Neurological Emergencies",
        "organization": "American Stroke Association (ASA) / NICE",
        "keywords": ["slurred speech", "facial droop", "arm weakness", "sudden numbness", "loss of vision", "confusion", "stroke", "fast"],
        "is_emergency": True,
        "content": (
            "Clinical Protocol for Acute Neurological Deficits / Stroke (FAST Protocol): "
            "Face: Unilateral facial asymmetry or droop. Arms: Inability to maintain bilateral arm elevation (arm drift). "
            "Speech: Slurred, dysarthric, or aphasic speech. Time: Critical intervention window (< 4.5 hours for IV thrombolysis/tPA, "
            "< 24 hours for mechanical thrombectomy). Immediate activation of code stroke protocol and urgent CT/MRI brain. "
            "Do not allow patient to ingest food, fluids, or oral medications due to high aspiration risk."
        ),
        "contraindications": ["Strict NPO (nothing by mouth)", "Do not lower blood pressure precipitously unless > 220/120 mmHg without tPA."],
        "suggested_actions": ["Emergency room redirection", "Non-contrast head CT", "Establish time of last known normal (LKN)"]
    },
    {
        "id": "RAG-EMG-003",
        "title": "Emergency Red Flags: Anaphylaxis and Acute Airway Compromise",
        "category": "Allergy & Immunology Emergencies",
        "organization": "World Allergy Organization (WAO)",
        "keywords": ["anaphylaxis", "throat tightness", "stridor", "swelling", "hives", "wheezing", "difficulty breathing", "allergic reaction", "peanut", "penicillin"],
        "is_emergency": True,
        "content": (
            "Clinical Protocol for Anaphylaxis: "
            "Rapid onset (minutes to hours) of mucocutaneous symptoms (urticaria, flushing, angioedema of lips/tongue/uvula) "
            "plus respiratory compromise (dyspnea, bronchospasm, stridor) or reduced blood pressure / end-organ dysfunction. "
            "First-line treatment is intramuscular epinephrine (0.3 - 0.5 mg of 1:1000 in anterolateral thigh) repeated every 5-15 min "
            "if inadequate response. Antihistamines and corticosteroids are adjunctive and must never delay epinephrine."
        ),
        "contraindications": ["Never delay epinephrine administration", "Do not allow patient to sit up or stand suddenly if hypotensive."],
        "suggested_actions": ["Intramuscular Epinephrine immediately", "High-flow oxygen", "Recumbent position with legs elevated", "Immediate ER transport"]
    },
    {
        "id": "RAG-CLN-001",
        "title": "Hypertension Assessment & Headache Presentation (Non-Emergency)",
        "category": "Internal Medicine / Cardiology",
        "organization": "Joint National Committee (JNC-8) / AHA",
        "keywords": ["hypertension", "high blood pressure", "headache", "fatigue", "dizziness", "lisinopril", "amlodipine"],
        "is_emergency": False,
        "content": (
            "Clinical Management of Elevated Blood Pressure with Mild Headache: "
            "Differentiate between Hypertensive Urgency (BP > 180/120 without acute end-organ damage) and Hypertensive Emergency "
            "(BP > 180/120 WITH acute end-organ signs such as encephalopathy, retinal hemorrhages, acute kidney injury, or pulmonary edema). "
            "Patients with known hypertension taking ACE inhibitors (e.g., Lisinopril) reporting mild tension-type or occipital headache "
            "should have serial blood pressure measurements, medication adherence review, and basic metabolic panel (electrolytes, BUN, creatinine). "
            "Evaluate for secondary causes if refractory to dual therapy."
        ),
        "contraindications": ["Avoid rapid BP reduction with sublingual nifedipine (risk of cerebral ischemia)."],
        "suggested_actions": ["Serial BP check in both arms", "Funduscopic examination", "Serum creatinine and potassium check", "Adherence check"]
    },
    {
        "id": "RAG-DRUG-001",
        "title": "Pharmacology Review: ACE Inhibitors (Lisinopril) Interactions & Precautions",
        "category": "Pharmacology & Drug Safety",
        "organization": "FDA / European Medicines Agency (EMA)",
        "keywords": ["lisinopril", "ace inhibitor", "potassium", "angioedema", "cough", "nsaid", "ibuprofen", "creatinine"],
        "is_emergency": False,
        "content": (
            "Clinical Pharmacology Guide for Lisinopril: "
            "Mechanism: Angiotensin Converting Enzyme inhibitor used for hypertension and heart failure. "
            "Black Box Warning: Fetal toxicity in pregnancy. "
            "Critical Drug Interactions: "
            "1. NSAIDs (e.g., Ibuprofen, Naproxen): Attenuates antihypertensive effect and drastically increases acute kidney injury risk (triple whammy with diuretics). "
            "2. Potassium supplements & Potassium-sparing diuretics (Spironolactone): High risk of life-threatening hyperkalemia. "
            "Key Adverse Effects: Persistent dry non-productive cough (in ~10% of patients due to bradykinin accumulation; switch to ARB if intolerable). "
            "Angioedema of face/lips/tongue can occur at any time during therapy and requires permanent discontinuation."
        ),
        "contraindications": ["History of ACEi-induced angioedema", "Concomitant sacubitril/valsartan within 36 hours", "Pregnancy"],
        "suggested_actions": ["Monitor serum potassium and renal function baseline and periodically", "Advise against concurrent high-dose NSAID use"]
    },
    {
        "id": "RAG-DRUG-002",
        "title": "Pharmacology Review: Metformin Interactions, Lactic Acidosis & Contrast Media",
        "category": "Pharmacology & Drug Safety",
        "organization": "American Diabetes Association (ADA)",
        "keywords": ["metformin", "diabetes", "blood sugar", "contrast", "lactic acidosis", "gastrointestinal", "nausea"],
        "is_emergency": False,
        "content": (
            "Clinical Pharmacology Guide for Metformin (Biguanide): "
            "Primary indication: Type 2 Diabetes Mellitus. "
            "Primary adverse effects: Gastrointestinal intolerance (nausea, diarrhea, abdominal cramping), minimized by taking with meals or using extended-release (ER). "
            "Rare but fatal risk: Lactic acidosis, especially in patients with acute renal impairment (eGFR < 30 mL/min/1.73m²), severe sepsis, or excessive alcohol intake. "
            "Radiological Contrast Precaution: Metformin must be held at the time of or prior to iodinated contrast procedures in patients with eGFR 30-60 mL/min and withheld for 48 hours post-procedure until renal function is confirmed stable."
        ),
        "contraindications": ["Severe renal impairment (eGFR < 30)", "Acute or chronic metabolic acidosis", "Severe hypoxia or sepsis"],
        "suggested_actions": ["Assess annual eGFR and Vitamin B12 levels", "Reinforce meal-time administration for GI tolerance"]
    },
    {
        "id": "RAG-ALLRG-001",
        "title": "Penicillin Allergy Cross-Reactivity & Alternative Antimicrobials",
        "category": "Allergy & Antimicrobial Stewardship",
        "organization": "Infectious Diseases Society of America (IDSA)",
        "keywords": ["penicillin", "amoxicillin", "ampicillin", "allergy", "rash", "cephalosporin", "cross-reactivity", "anaphylaxis"],
        "is_emergency": False,
        "content": (
            "Penicillin Allergy Evaluation Protocol: "
            "Over 90% of patients with reported penicillin allergy do not possess true IgE-mediated hypersensitivity upon formal testing. "
            "However, if history includes documented severe cutaneous adverse reactions (SCARs, SJS/TEN), anaphylaxis, or airway swelling, "
            "all beta-lactams (penicillins, ampicillin, amoxicillin/clavulanate) are strictly contraindicated. "
            "Cross-reactivity with 3rd/4th generation cephalosporins (e.g., Ceftriaxone, Cefepime) is low (< 2%), but caution is required. "
            "First-generation cephalosporins (Cephalexin) share side-chain similarities and should be avoided in confirmed IgE penicillin allergies. "
            "Alternative classes include macrolides (Azithromycin), fluoroquinolones, or clindamycin."
        ),
        "contraindications": ["Avoid all penicillin-class antibiotics", "Avoid first-generation cephalosporins if severe IgE reaction"],
        "suggested_actions": ["Tag patient record with specific reaction details (mild exanthem vs anaphylaxis)", "Recommend allergy testing if de-labeling indicated"]
    },
    {
        "id": "RAG-CLN-002",
        "title": "Gastrointestinal Symptoms: Nausea, Fatigue & Dehydration Evaluation",
        "category": "Gastroenterology / General Medicine",
        "organization": "American Gastroenterological Association (AGA)",
        "keywords": ["nausea", "vomiting", "fatigue", "dehydration", "gastritis", "diarrhea", "abdominal pain"],
        "is_emergency": False,
        "content": (
            "Clinical Assessment of Subacute Nausea and Fatigue: "
            "Onset, dietary triggers, and temporal relationship to medication ingestion must be characterized. "
            "Evaluate for red flags: hematemesis ('coffee-ground' emesis), melena (black tarry stools), severe localized right lower quadrant pain, "
            "orthostatic dizziness, or inability to retain fluids for > 24 hours. "
            "Check medication list: Metformin, NSAIDs, GLP-1 agonists, and antibiotics frequently induce nausea. "
            "Hydration status evaluation includes capillary refill, mucosal moisture, skin turgor, and orthostatic vital signs."
        ),
        "contraindications": ["Avoid empiric antiemetics without examining abdomen to rule out acute surgical abdomen or obstruction."],
        "suggested_actions": ["Check orthostatic vitals", "Comprehensive metabolic panel (electrolytes & renal panel)", "Medication timeline correlation"]
    }
]
