"""
Database models and SQLite connection for AI Doctor Assistant.
Supports Patient and Doctor role management, Consultations storage, and HIPAA audit trails.
"""

import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(__file__), "medical_assistant.db")

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL, -- 'patient' or 'doctor'
        medical_title TEXT,
        created_at TEXT NOT NULL
    )
    """)
    
    # Consultations table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS consultations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        patient_name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        symptoms TEXT NOT NULL,
        duration TEXT,
        severity INTEGER DEFAULT 5,
        medical_history TEXT,
        allergies TEXT,
        medications TEXT,
        vitals_json TEXT,
        urgency_level TEXT NOT NULL, -- 'EMERGENCY', 'URGENT', 'ROUTINE'
        is_emergency BOOLEAN NOT NULL,
        structured_summary_json TEXT NOT NULL,
        formatted_text TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'REVIEWED'
        doctor_notes TEXT,
        reviewed_by TEXT,
        reviewed_at TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # Audit log table (HIPAA compliance)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT,
        action TEXT NOT NULL,
        resource_id TEXT,
        timestamp TEXT NOT NULL,
        ip_address TEXT
    )
    """)
    
    conn.commit()
    seed_initial_data(conn)
    conn.close()

def seed_initial_data(conn):
    cursor = conn.cursor()
    import bcrypt
    
    # Check if doctor exists
    cursor.execute("SELECT id FROM users WHERE email = 'doctor@hospital.org'")
    if not cursor.fetchone():
        hashed_doc = bcrypt.hashpw("Doctor123!".encode(), bcrypt.gensalt()).decode()
        hashed_pat = bcrypt.hashpw("Patient123!".encode(), bcrypt.gensalt()).decode()
        
        now = datetime.utcnow().isoformat()
        cursor.execute("""
        INSERT INTO users (email, password_hash, full_name, role, medical_title, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """, ("doctor@hospital.org", hashed_doc, "Dr. Sarah Mitchell, MD", "doctor", "Attending Physician, Internal Medicine", now))
        
        cursor.execute("""
        INSERT INTO users (email, password_hash, full_name, role, medical_title, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """, ("patient@health.org", hashed_pat, "James Wilson", "patient", None, now))

    # Pre-seed sample consultation from the architecture slide:
    cursor.execute("SELECT count(*) as cnt FROM consultations")
    if cursor.fetchone()["cnt"] == 0:
        now = datetime.utcnow().isoformat()
        from .ai_synthesis import synthesize_consultation_summary
        
        sample_synth = synthesize_consultation_summary(
            patient_name="James Wilson",
            age=52,
            gender="Male",
            symptoms="Nausea, Fatigue, moderate occipital Headache lasting 2 days",
            duration="2 days",
            severity=6,
            medical_history="Hypertension diagnosed 2018; Appendectomy surgery in 2021",
            allergies="Penicillin (severe hives & rash), Peanuts (mild reaction)",
            medications="Lisinopril 10mg daily, Metformin 500mg BID",
            vitals={"bp": "144/92", "hr": "78", "spo2": "98%"}
        )
        
        cursor.execute("""
        INSERT INTO consultations (
            patient_id, patient_name, age, gender, symptoms, duration, severity,
            medical_history, allergies, medications, vitals_json, urgency_level,
            is_emergency, structured_summary_json, formatted_text, status,
            doctor_notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            2,
            "James Wilson",
            52,
            "Male",
            "Nausea, Fatigue, moderate occipital Headache lasting 2 days",
            "2 days",
            6,
            "Hypertension diagnosed 2018; Appendectomy surgery in 2021",
            "Penicillin (severe hives & rash), Peanuts (mild reaction)",
            "Lisinopril 10mg daily, Metformin 500mg BID",
            json.dumps({"bp": "144/92", "hr": "78", "spo2": "98%"}),
            sample_synth["triage"]["urgency_level"],
            sample_synth["triage"]["is_emergency"],
            json.dumps(sample_synth["structured_summary"]),
            sample_synth["formatted_text"],
            "PENDING",
            None,
            now
        ))

    conn.commit()

# Run DB initialization
init_db()
