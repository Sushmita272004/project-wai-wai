# backend/main.py
import os
import json
import io
import re
import time
import base64
from pathlib import Path
from datetime import datetime, timedelta
import random
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from groq import Groq
from huggingface_hub import InferenceClient
from supabase import create_client, Client
import google.generativeai as genai
from google.generativeai import types 
import pdfplumber
import docx
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from enum import Enum

# ==========================================
# 0. ROBUST ENVIRONMENT LOADING
# ==========================================
BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
DATA_PATH = BASE_DIR / "data" / "skill_taxonomy.json"

load_dotenv(dotenv_path=ENV_PATH)

# Sanitize Keys
supabase_url = (os.environ.get("SUPABASE_URL") or "").strip()
supabase_key = (os.environ.get("SUPABASE_KEY") or "").strip()
groq_key = (os.environ.get("GROQ_API_KEY") or "").strip()
hf_token = (os.environ.get("HF_API_TOKEN") or "").strip()
gemini_key = (os.environ.get("GEMINI_API_KEY") or "").strip()

if not supabase_url or not supabase_key:
    print(f"❌ ERROR: Supabase keys missing in {ENV_PATH}")
else:
    print("✅ Supabase keys loaded.")

if not gemini_key:
    print("⚠️ WARNING: GEMINI_API_KEY is missing. Resume Analysis will fail.")
else:
    print("✅ Gemini API key loaded.")

# Load Skill Taxonomy
SKILL_TAXONOMY = {}
try:
    if DATA_PATH.exists():
        with open(DATA_PATH, "r") as f:
            SKILL_TAXONOMY = json.load(f)
        print("✅ Skill Taxonomy loaded.")
    else:
        print(f"⚠️ Warning: {DATA_PATH} not found. Using empty taxonomy.")
except Exception as e:
    print(f"❌ Error loading taxonomy: {e}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 1. CLIENT SETUP
# ==========================================

# Groq Client
groq_client = Groq(api_key=groq_key)

# Hugging Face Client
hf_client = InferenceClient(token=hf_token)

# Gemini Client
# FIX: Using genai.configure() instead of genai.Client() to resolve initialization error
gemini_client = None
if gemini_key:
    try:
        genai.configure(api_key=gemini_key)
        print("✅ Gemini API configured.")
    except Exception as e:
        print(f"⚠️ Gemini Init Failed: {e}")

# Supabase Client
try:
    if supabase_url and supabase_key:
        supabase: Client = create_client(supabase_url, supabase_key)
    else:
        raise ValueError("Supabase keys are empty")
except Exception as e:
    print(f"⚠️ Supabase Init Failed: {e}")
    supabase = None

# ==========================================
# 2. DATA MODELS
# ==========================================

class JobRequest(BaseModel):
    jobTitle: str
    industry: str = "Technology"
    experienceLevel: str = "Mid-Level"
    skills: str
    culture: str = "Corporate"
    specialRequirements: Optional[str] = "None"

class ProfileSaveRequest(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    education: str = ""
    skills: List[str] = []
    experience: List[str] = []
    projects: List[str] = []
    relevancy_score: int = 0
    confidence_scores: Dict[str, int] = {}
    job_description: str = ""

class GapAnalysisRequest(BaseModel):
    current_role: str
    current_skills: List[str]
    target_role: str
    job_description: str
    experience_years: int = 1

class PDFRequest(BaseModel):
    roadmap_data: Dict[str, Any]
    candidate_name: str

class NotificationType(str, Enum):
    JOB_MATCH = "JOB_MATCH"
    APPLICATION_STATUS = "APPLICATION_STATUS"
    EMPLOYER_MESSAGE = "EMPLOYER_MESSAGE"
    SKILL_RECOMMENDATION = "SKILL_RECOMMENDATION"
    INTERVIEW_REMINDER = "INTERVIEW_REMINDER"

class NotificationPriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class NotificationCreate(BaseModel):
    user_id: str
    type: NotificationType
    priority: NotificationPriority = NotificationPriority.MEDIUM
    data: Dict[str, Any] = {}

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    data: Dict[str, Any]
    priority: str
    read: bool
    created_at: str

class PreferencesUpdate(BaseModel):
    email_enabled: Optional[bool] = None
    push_enabled: Optional[bool] = None
    inapp_enabled: Optional[bool] = None
    frequency: Optional[str] = None

# ==========================================
# 3. HELPER FUNCTIONS
# ==========================================

def regex_fallback(text):
    """Last resort regex extraction if AI fails completely"""
    print("⚠️ Using Regex Fallback")
    data = {
        "name": "Candidate", "email": "", "phone": "",
        "skills": [], "experience": [], "projects": []
    }
    
    # Attempt to find name in first 5 lines (Smarter logic)
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    for i in range(min(5, len(lines))):
        line = lines[i]
        # Skip header words
        if any(k in line.lower() for k in ["resume", "cv", "curriculum", "page"]): continue
        # Name usually has no numbers and is reasonably short
        if 3 < len(line) < 50 and not any(c.isdigit() for c in line):
            data["name"] = line
            break

    # Email
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    if email_match: data["email"] = email_match.group(0)
    
    # Phone (Handles +91, spaces, dashes, brackets)
    phone_match = re.search(r'(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}', text)
    if phone_match: data["phone"] = phone_match.group(0).strip()
    
    return data

def extract_text_fallback(file_bytes, filename):
    """Basic text extraction for fallback relevancy check"""
    text = ""
    try:
        if filename.endswith(".pdf"):
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    text += (page.extract_text() or "") + "\n"
        elif filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                text += para.text + "\n"
    except: pass
    return text

def calculate_job_relevancy(resume_text, job_description):
    if not job_description or len(job_description.strip()) < 10: return 0
    resume_words = set(re.findall(r'\w+', resume_text.lower()))
    jd_words = set(re.findall(r'\w+', job_description.lower()))
    stop_words = {"and", "the", "to", "of", "in", "for", "with", "a", "an", "is"}
    jd_keywords = {w for w in jd_words if w not in stop_words and len(w) > 3}
    if not jd_keywords: return 0
    matches = resume_words.intersection(jd_keywords)
    raw_score = (len(matches) / len(jd_keywords)) * 100
    return min(100, int(raw_score * 1.5))

def normalize_skill(skill):
    return skill.lower().replace(".js", "").replace(" ", "")

# --- Fallback helpers when Gemini quota is exceeded ---
def extract_skills_from_jd_simple(jd_text: str) -> List[str]:
    """Simple keyword extractor for Job Description when AI is unavailable."""
    if not jd_text:
        return []
    text = jd_text.lower()
    stop = {
        "and","the","to","of","in","for","with","a","an","is","on","at","by",
        "or","as","be","are","your","you","our","we","will","have","has","from",
        "this","that","their","his","her","it","they","them","about","job","role",
        "description","responsibilities","requirements","skills"
    }
    tokens = re.findall(r"[a-zA-Z][a-zA-Z0-9+.#/-]{2,}", text)
    freq = {}
    for t in tokens:
        if t in stop or len(t) < 3:
            continue
        freq[t] = freq.get(t, 0) + 1
    # Sort by frequency then alphabetically for stability
    sorted_tokens = sorted(freq.items(), key=lambda x: (-x[1], x[0]))
    unique = []
    seen = set()
    for tok, _ in sorted_tokens:
        base = tok.strip('.').strip('-')
        if base not in seen:
            seen.add(base)
            unique.append(base)
        if len(unique) >= 15:
            break
    # Title-case for nicer display
    return [u.title() for u in unique]

def build_ai_data_fallback(missing_skills_context: List[str]) -> Dict[str, Any]:
    """Constructs a deterministic fallback analysis when AI calls fail."""
    # Basic phased roadmap using missing skills list
    phases = []
    chunk_size = max(1, len(missing_skills_context) // 3 or 1)
    for i in range(0, len(missing_skills_context), chunk_size):
        phase_index = len(phases) + 1
        phases.append({
            "phase": phase_index,
            "focus": "Close core gaps" if phase_index == 1 else ("Advance proficiency" if phase_index == 2 else "Build portfolio & interview prep"),
            "duration": "3-4 weeks" if phase_index == 1 else ("4-6 weeks" if phase_index == 2 else "2-3 weeks"),
            "skills_to_learn": missing_skills_context[i:i+chunk_size],
            "reasoning": "Prioritized by learning hours and role impact."
        })
    if not phases:
        phases = [{
            "phase": 1,
            "focus": "Polish resume & highlight achievements",
            "duration": "1-2 weeks",
            "skills_to_learn": [],
            "reasoning": "No critical gaps detected; focus on presentation."
        }]

    return {
        "readiness_score": 80,
        "readiness_reasoning": "Professional layout assumed; score focuses on visual readability and clarity.",
        "learning_roadmap": phases,
        "resume_improvements": [
            {
                "issue": "Lack of quantified impact",
                "suggestion": "Add metrics (%, $, time saved) to bullet points.",
                "example_rewrite": "Optimized ETL pipeline, reducing processing time by 35% and saving 10 hours/week."
            },
            {
                "issue": "Bullets too verbose",
                "suggestion": "Use action-result format with concise statements.",
                "example_rewrite": "Built React dashboard used by 50+ users; cut report time from 30m to 5m."
            }
        ],
        "alternative_paths": [
            {"role": "Business Analyst", "match_potential": "High", "conclusion": "Strong analytical and stakeholder skills map well."},
            {"role": "QA Engineer", "match_potential": "Medium", "conclusion": "Good attention to detail; add automation basics."}
        ],
        "salary_growth": {
            "current_estimated": "₹ 6–8 LPA",
            "potential_1_year": "₹ 8–12 LPA",
            "potential_3_year": "₹ 12–18 LPA",
            "insight": "Upskilling and quantified achievements drive salary growth."
        },
        "visualization_data": {
            "radar_chart": {"Technical": 75, "Soft_Skills": 80, "Leadership": 60, "Domain_Knowledge": 70, "ATS_Compliance": 85},
            "industry_keywords": ["Scalability", "Optimization", "Automation"]
        }
    }

# --- Rule-based resume text parsing (sections: Skills, Experience, Education, Projects) ---
def parse_resume_text(text: str) -> Dict[str, Any]:
    """Parse resume text to extract name/email/phone and sections.
    Returns dict with keys: name, email, phone, education, skills, experience, projects.
    """
    data = {
        "name": "Candidate",
        "email": "",
        "phone": "",
        "education": "",
        "skills": [],
        "experience": [],
        "projects": []
    }

    if not text:
        return data

    lines = [l.strip() for l in text.splitlines()]
    lines = [l for l in lines if l]

    # Name: first non-header reasonable line
    for i in range(min(5, len(lines))):
        l = lines[i]
        if any(k in l.lower() for k in ["resume", "curriculum", "cv", "page"]):
            continue
        if 3 < len(l) < 60 and not any(c.isdigit() for c in l):
            data["name"] = l
            break

    # Email and Phone
    email_match = re.search(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', text)
    if email_match:
        data["email"] = email_match.group(0)
    phone_match = re.search(r'(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}', text)
    if phone_match:
        data["phone"] = phone_match.group(0).strip()

    # Section detection
    sec_names = [
        ("skills", ["skills", "technical skills", "skills & tools"]),
        ("experience", ["experience", "work experience", "professional experience", "employment history"]),
        ("education", ["education", "academic background"]),
        ("projects", ["projects", "key projects", "personal projects"])
    ]

    indices = []
    for idx, l in enumerate(lines):
        low = l.lower().strip(':').strip()
        for key, variants in sec_names:
            if any(low.startswith(v) for v in variants):
                indices.append((idx, key))
                break

    indices.sort(key=lambda x: x[0])
    sections: Dict[str, List[str]] = {"skills": [], "experience": [], "education": [], "projects": []}

    for i, (start_idx, key) in enumerate(indices):
        end_idx = indices[i + 1][0] if i + 1 < len(indices) else len(lines)
        content = lines[start_idx + 1:end_idx]
        sections[key] = content

    # Parse skills (comma/semicolon separated or bullet lines)
    parsed_skills: List[str] = []
    for l in sections["skills"]:
        if not l:
            continue
        # bullets
        if l.startswith(('-', '*', '•')):
            l = l.lstrip('-*•').strip()
        # split by comma/semicolon
        parts = re.split(r"[,;]\s*", l)
        for p in parts:
            p = p.strip().strip('.')
            if p and len(p) > 1 and not p.lower().startswith("experience"):
                parsed_skills.append(p)
    # dedupe
    seen = set()
    uniq_skills = []
    for s in parsed_skills:
        ns = s
        if ns.lower() not in seen:
            seen.add(ns.lower())
            uniq_skills.append(ns)

    data["skills"] = uniq_skills

    # Parse experience (bullet lines or sentences)
    exp_items: List[str] = []
    for l in sections["experience"]:
        if not l:
            continue
        # capture bullets or role-company-date patterns
        if l.startswith(('-', '*', '•')):
            item = l.lstrip('-*•').strip()
            if item:
                exp_items.append(item)
        else:
            # detect Role @ Company (Dates)
            if re.search(r"@|\b(Inc\.|LLC|Ltd\.|Pvt\.|Technologies|Solutions)\b", l) or re.search(r"\b(\d{4})\b", l):
                exp_items.append(l)
            elif len(l) > 20:
                exp_items.append(l)

    # compact experience items
    data["experience"] = [e.strip() for e in exp_items if e.strip()]

    # Education: join lines until next section
    if sections["education"]:
        data["education"] = "; ".join(sections["education"]).strip()

    # Projects
    proj_items: List[str] = []
    for l in sections["projects"]:
        if not l:
            continue
        if l.startswith(('-', '*', '•')):
            proj_items.append(l.lstrip('-*•').strip())
        elif len(l) > 10:
            proj_items.append(l.strip())
    data["projects"] = proj_items

    return data

# ==========================================
# 4. MOCK ANALYTICS DATA (RESTORED)
# ==========================================

def generate_mock_analytics_data():
    """Generate comprehensive mock data for analytics dashboard"""
    sources = ["LinkedIn", "Naukri", "Indeed", "Referral", "Company Website", "Glassdoor"]
    statuses = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"]
    
    applications = []
    base_date = datetime.now() - timedelta(days=90)
    
    for i in range(500):
        days_offset = random.randint(0, 89)
        application_date = base_date + timedelta(days=days_offset)
        status = random.choices(statuses, weights=[30, 25, 20, 10, 8, 7])[0]
        source = random.choice(sources)
        quality_score = random.randint(45, 98)
        
        time_to_hire = None
        if status == "Hired":
            time_to_hire = random.randint(7, 35)
        
        applications.append({
            "id": i + 1,
            "job_id": random.randint(1, 10),
            "candidate_name": f"Candidate {i + 1}",
            "source": source,
            "status": status,
            "quality_score": quality_score,
            "application_date": application_date.isoformat(),
            "time_to_hire_days": time_to_hire
        })
    return applications

MOCK_APPLICATIONS = generate_mock_analytics_data()

# ==========================================
# 5. API ENDPOINTS
# ==========================================

@app.get("/health")
def health():
    return {"status": "FastAPI is running"}

# --- ANALYTICS ENDPOINTS (RESTORED) ---

@app.get("/analytics/overview")
def get_analytics_overview():
    thirty_days_ago = datetime.now() - timedelta(days=30)
    sixty_days_ago = datetime.now() - timedelta(days=60)
    
    recent_apps = [app for app in MOCK_APPLICATIONS if datetime.fromisoformat(app["application_date"]) >= thirty_days_ago]
    previous_apps = [app for app in MOCK_APPLICATIONS if sixty_days_ago <= datetime.fromisoformat(app["application_date"]) < thirty_days_ago]
    
    total_recent = len(recent_apps)
    total_previous = len(previous_apps)
    
    applications_change = "+100%"
    if total_previous > 0:
        change = ((total_recent - total_previous) / total_previous) * 100
        applications_change = f"{'+' if change >= 0 else ''}{int(change)}%"
    
    active_jobs = len(set(app["job_id"] for app in recent_apps))
    
    hired_apps = [app for app in recent_apps if app["status"] == "Hired" and app["time_to_hire_days"]]
    avg_time_to_hire = int(sum(app["time_to_hire_days"] for app in hired_apps) / len(hired_apps)) if hired_apps else 18
    
    offers = [app for app in recent_apps if app["status"] in ["Offer", "Hired"]]
    hired = [app for app in recent_apps if app["status"] == "Hired"]
    offer_acceptance_rate = int((len(hired) / len(offers)) * 100) if offers else 75
    
    source_counts = {}
    for app in recent_apps:
        source_counts[app["source"]] = source_counts.get(app["source"], 0) + 1
    top_source = max(source_counts, key=source_counts.get) if source_counts else "LinkedIn"
    
    return {
        "period": "last_30_days",
        "metrics": {
            "total_applications": total_recent,
            "applications_change": applications_change,
            "active_jobs": active_jobs,
            "avg_time_to_hire_days": avg_time_to_hire,
            "offer_acceptance_rate": offer_acceptance_rate,
            "top_source": top_source
        }
    }

@app.get("/analytics/pipeline")
def get_pipeline_data():
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_apps = [app for app in MOCK_APPLICATIONS if datetime.fromisoformat(app["application_date"]) >= thirty_days_ago]
    
    pipeline = {}
    for app in recent_apps:
        status = app["status"]
        pipeline[status] = pipeline.get(status, 0) + 1
    
    stages = ["Applied", "Screening", "Interview", "Offer", "Hired"]
    funnel_data = [{"stage": stage, "count": pipeline.get(stage, 0)} for stage in stages]
    return {"pipeline": funnel_data}

@app.get("/analytics/time-to-hire")
def get_time_to_hire():
    ninety_days_ago = datetime.now() - timedelta(days=90)
    weekly_data = {}
    for app in MOCK_APPLICATIONS:
        if app["status"] == "Hired" and app["time_to_hire_days"]:
            app_date = datetime.fromisoformat(app["application_date"])
            if app_date >= ninety_days_ago:
                week_key = app_date.strftime("%Y-W%U")
                if week_key not in weekly_data: weekly_data[week_key] = []
                weekly_data[week_key].append(app["time_to_hire_days"])
    
    time_series = []
    for week, times in sorted(weekly_data.items()):
        avg_time = sum(times) / len(times)
        time_series.append({"week": week, "avg_days": round(avg_time, 1)})
    return {"time_series": time_series}

@app.get("/analytics/source-effectiveness")
def get_source_effectiveness():
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_apps = [app for app in MOCK_APPLICATIONS if datetime.fromisoformat(app["application_date"]) >= thirty_days_ago]
    
    source_stats = {}
    for app in recent_apps:
        source = app["source"]
        if source not in source_stats:
            source_stats[source] = {"source": source, "applications": 0, "hired": 0, "avg_quality": []}
        source_stats[source]["applications"] += 1
        if app["status"] == "Hired": source_stats[source]["hired"] += 1
        source_stats[source]["avg_quality"].append(app["quality_score"])
    
    sources = []
    for source, stats in source_stats.items():
        avg_quality = sum(stats["avg_quality"]) / len(stats["avg_quality"])
        conversion_rate = (stats["hired"] / stats["applications"]) * 100 if stats["applications"] > 0 else 0
        sources.append({
            "source": source, "applications": stats["applications"], "hired": stats["hired"],
            "conversion_rate": round(conversion_rate, 1), "avg_quality_score": round(avg_quality, 1)
        })
    return {"sources": sorted(sources, key=lambda x: x["applications"], reverse=True)}

@app.get("/analytics/candidate-quality")
def get_candidate_quality():
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_apps = [app for app in MOCK_APPLICATIONS if datetime.fromisoformat(app["application_date"]) >= thirty_days_ago]
    
    buckets = {"40-50": 0, "51-60": 0, "61-70": 0, "71-80": 0, "81-90": 0, "91-100": 0}
    for app in recent_apps:
        score = app["quality_score"]
        if 40 <= score <= 50: buckets["40-50"] += 1
        elif 51 <= score <= 60: buckets["51-60"] += 1
        elif 61 <= score <= 70: buckets["61-70"] += 1
        elif 71 <= score <= 80: buckets["71-80"] += 1
        elif 81 <= score <= 90: buckets["81-90"] += 1
        elif 91 <= score <= 100: buckets["91-100"] += 1
    
    return {"distribution": [{"range": k, "count": v} for k, v in buckets.items()]}

@app.get("/analytics/jobs/{job_id}")
def get_job_analytics(job_id: int):
    job_apps = [app for app in MOCK_APPLICATIONS if app["job_id"] == job_id]
    if not job_apps: return {"error": "Job not found"}
    
    status_counts = {}
    for app in job_apps:
        status = app["status"]
        status_counts[status] = status_counts.get(status, 0) + 1
    
    hired_apps = [app for app in job_apps if app["status"] == "Hired" and app["time_to_hire_days"]]
    avg_time_to_hire = int(sum(app["time_to_hire_days"] for app in hired_apps) / len(hired_apps)) if hired_apps else 0
    avg_quality = sum(app["quality_score"] for app in job_apps) / len(job_apps)
    
    return {
        "job_id": job_id, "total_applications": len(job_apps), "status_breakdown": status_counts,
        "avg_time_to_hire_days": avg_time_to_hire, "avg_quality_score": round(avg_quality, 1), "hired_count": len(hired_apps)
    }

@app.get("/analytics/recent-applications")
def get_recent_applications():
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_apps = [app for app in MOCK_APPLICATIONS if datetime.fromisoformat(app["application_date"]) >= thirty_days_ago]
    sorted_apps = sorted(recent_apps, key=lambda x: x["application_date"], reverse=True)[:20]
    
    formatted = []
    for app in sorted_apps:
        formatted.append({
            "id": app["id"], "candidate": app["candidate_name"], "job_id": app["job_id"],
            "source": app["source"], "status": app["status"], "quality_score": app["quality_score"],
            "date": datetime.fromisoformat(app["application_date"]).strftime("%Y-%m-%d")
        })
    return {"applications": formatted}

# --- JOB GENERATOR ---
@app.post("/api/generate-job")
async def generate_job(request: JobRequest):
    try:
        system_prompt = "You are an expert HR AI. Generate a structured job description."
        user_prompt = f"Role: {request.jobTitle}, Skills: {request.skills}"
        completion = groq_client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            model="llama-3.3-70b-versatile",
        )
        return {"success": True, "description": completion.choices[0].message.content}
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

# --- RESUME PARSER (VISION ENHANCED) ---
@app.post("/api/parse-resume")
async def parse_resume(file: UploadFile = File(...), job_description: str = Form("")):
    try:
        # Read file bytes
        content = await file.read()
        # Force correct MIME type based on extension to satisfy Gemini
        filename_lower = file.filename.lower()
        if filename_lower.endswith(".pdf"):
            file_mime = "application/pdf"
        elif filename_lower.endswith((".jpg", ".jpeg")):
            file_mime = "image/jpeg"
        elif filename_lower.endswith(".png"):
            file_mime = "image/png"
        elif filename_lower.endswith(".webp"):
            file_mime = "image/webp"
        else:
            # Fallback to browser's content type or default
            file_mime = file.content_type or "application/pdf"
            
        print(f"📄 Processing File: {file.filename} as {file_mime}") # Debug print
        
        parsed_data = {}
        scores = {}
        raw_text_for_relevancy = ""

        # --- STRATEGY: GEMINI Vision for PDFs/Images, Rule-based for DOCX or when AI unavailable ---
        use_gemini = gemini_key and file_mime in ["application/pdf", "image/jpeg", "image/png", "image/webp"]
        if use_gemini:
            try:
                # Prepare content for Gemini
                extraction_prompt = """
                You are a highly accurate Resume Parser. 
                Look at the provided document image/pdf and extract the following details precisely.
                
                CRITICAL INSTRUCTIONS:
                1. **Name:** Look at the top of the first page. It is usually the largest text or bolded. Extract the full name.
                2. **Phone:** Extract phone number in any format (e.g., +91..., (123)...).
                3. **Email:** Extract email address.
                4. **Skills:** List all technical and soft skills found.
                5. **Experience:** List company names and roles.
                6. **Education:** List degree and university.
                
                Return ONLY valid JSON. No markdown formatting.
                {
                    "name": "string",
                    "email": "string",
                    "phone": "string",
                    "education": "string",
                    "skills": ["string"],
                    "experience": ["string"],
                    "projects": ["string"]
                }
                """

                # FIX: Use genai.GenerativeModel which works with genai.configure()
                model = genai.GenerativeModel('gemini-2.0-flash')
                file_data = {
                    "mime_type": file_mime,
                    "data": base64.standard_b64encode(content).decode("utf-8")
                }
                response = model.generate_content([
                    extraction_prompt,
                    file_data
                ])
                
                # Parse JSON
                clean_json = response.text.strip().replace("```json", "").replace("```", "")
                parsed_data = json.loads(clean_json)
                
                # Assign high confidence because Gemini Vision is reading it
                # If a field is present, we assume it's correct (95%)
                scores = {k: 95 if v else 0 for k,v in parsed_data.items()}
                
                # Also extract raw text from file for better keyword matching and to fill missing fields
                raw_text_for_relevancy = extract_text_fallback(content, filename_lower)
                if raw_text_for_relevancy:
                    text_parsed = parse_resume_text(raw_text_for_relevancy)
                    # Backfill missing arrays
                    if not parsed_data.get("skills"):
                        parsed_data["skills"] = text_parsed.get("skills", [])
                    if not parsed_data.get("experience"):
                        parsed_data["experience"] = text_parsed.get("experience", [])
                    if not parsed_data.get("education"):
                        parsed_data["education"] = text_parsed.get("education", "")
                    # Adjust confidence for backfilled fields
                    for key in ["skills", "experience", "education"]:
                        if key in text_parsed and text_parsed[key]:
                            scores[key] = min(scores.get(key, 50), 80)

            except Exception as e:
                print(f"\n❌ GEMINI CRITICAL ERROR: {e}") 
                print(f"   (This triggered the Regex Fallback)\n")
                
                # Fallback: robust text parsing
                raw_text_for_relevancy = extract_text_fallback(content, filename_lower)
                parsed_data = parse_resume_text(raw_text_for_relevancy)
                scores = {k: 60 if parsed_data.get(k) else 0 for k in ["name","email","phone","education","skills","experience","projects"]}
        else:
            # Rule-based parsing for DOCX or when Gemini isn't applicable
            raw_text_for_relevancy = extract_text_fallback(content, filename_lower)
            parsed_data = parse_resume_text(raw_text_for_relevancy)
            scores = {k: 60 if parsed_data.get(k) else 0 for k in ["name","email","phone","education","skills","experience","projects"]}

        # Calculate Relevancy
        # Use raw text if available, otherwise stringify the parsed JSON to check keywords
        text_for_relevancy = raw_text_for_relevancy if len(raw_text_for_relevancy) > 100 else str(parsed_data)
        relevancy_score = calculate_job_relevancy(text_for_relevancy, job_description)

        return {
            "extracted_data": parsed_data,
            "confidence_scores": scores,
            "relevancy_score": relevancy_score,
            "raw_text_snippet": text_for_relevancy[:500]
        }

    except Exception as e:
        print(f"Parse Error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/api/save-profile")
async def save_profile(profile: ProfileSaveRequest):
    if not supabase: return JSONResponse(status_code=500, content={"error": "Database error"})
    try:
        data = profile.model_dump()
        response = supabase.table("resumes").insert(data).execute()
        return {"success": True, "message": "Saved"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})


# --- NEW: SKILL GAP & RESUME COACHING V2 ---

@app.post("/api/analyze-gap")
async def analyze_gap(request: GapAnalysisRequest):
    if not gemini_key:
        return JSONResponse(status_code=500, content={"error": "Gemini API Key not configured"})

    try:
        # A. EXTRACT TARGET SKILLS
        extraction_prompt = f"""
        Analyze this Job Description and extract the top 15 essential technical skills.
        Return ONLY a JSON array of strings. Do NOT use asterisks.
        Job Description: {request.job_description[:3000]}
        """
        
        # Fallback extraction first (works without AI)
        target_skills = extract_skills_from_jd_simple(request.job_description)
        try:
            # Try AI refinement on top of fallback
            model = genai.GenerativeModel('gemini-2.5-flash')
            skill_response = model.generate_content(extraction_prompt)
            target_skills = json.loads(skill_response.text.strip().replace("```json", "").replace("```", ""))
        except Exception:
            # Keep fallback list
            pass

        # B. CALCULATE GAPS & LOOKUP HOURS (Taxonomy Integration)
        current_skills_norm = set(normalize_skill(s) for s in request.current_skills)
        missing_skills = []
        matching_skills = []
        missing_skills_context = [] 
        
        # Load Taxonomy for Learning Hours
        taxonomy_skills = SKILL_TAXONOMY.get("skills", {})

        for raw_skill in target_skills:
            if normalize_skill(raw_skill) in current_skills_norm:
                matching_skills.append(raw_skill)
            else:
                missing_skills.append(raw_skill)
                # Lookup Hours
                tax_data = taxonomy_skills.get(raw_skill, {})
                hours = tax_data.get("avg_learning_hours", "unknown")
                missing_skills_context.append(f"{raw_skill} ({hours} hours)")

        # C. COMPREHENSIVE ANALYSIS
        analysis_prompt = f"""
        You are an elite Career Strategist.
        
        Candidate Profile:
        - Role: {request.current_role}
        - Experience: {request.experience_years} years
        - Skills: {', '.join(request.current_skills)}
        
        Target Role: {request.target_role}
        Missing Skills (with learning time): {', '.join(missing_skills_context)}
        
        Generate a JSON response (Plain text only, NO asterisks).
        
        CRITICAL INSTRUCTIONS:
        1. **Readiness Score:** Evaluate primarily on **Visual Appeal, Ease of Reading, and Layout**. 
           - Does it look professional? Is it easy to scan? 
           - If the candidate has decent skills, the score should be **high (75-90%)**. 
           - Do NOT give low scores just for minor keyword misses.
        2. **Roadmap:** Use the provided learning hours to prioritize quick wins first.
        3. **Salary:** Use **Indian Rupee (₹ INR)** (e.g. ₹ 8 LPA).
        
        Structure:
        {{
            "readiness_score": integer (0-100),
            "readiness_reasoning": "string (Focus on the visual presentation and readability of the resume)",
            "learning_roadmap": [
                {{ "phase": 1, "focus": "string", "duration": "string", "skills_to_learn": ["string"], "reasoning": "string" }}
            ],
            "resume_improvements": [
                {{ "issue": "string", "suggestion": "string", "example_rewrite": "string" }}
            ],
            "alternative_paths": [
                {{ "role": "string", "match_potential": "High/Medium", "conclusion": "string" }}
            ],
            "salary_growth": {{
                "current_estimated": "string (in ₹)",
                "potential_1_year": "string (in ₹)",
                "potential_3_year": "string (in ₹)",
                "insight": "string"
            }},
            "visualization_data": {{
                "radar_chart": {{ "Technical": 0-100, "Soft_Skills": 0-100, "Leadership": 0-100, "Domain_Knowledge": 0-100, "ATS_Compliance": 0-100 }},
                "industry_keywords": ["string", "string", "string"]
            }}
        }}
        """
        
        ai_data = {}
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            ai_response = model.generate_content(analysis_prompt)
            ai_data = json.loads(ai_response.text.strip().replace("```json", "").replace("```", ""))
        except Exception as e:
            if "429" in str(e):
                # Respect retry hint but still be resilient if quota remains 0
                time.sleep(6)
                try:
                    model = genai.GenerativeModel('gemini-flash-latest')
                    ai_response = model.generate_content(analysis_prompt)
                    ai_data = json.loads(ai_response.text.strip().replace("```json", "").replace("```", ""))
                except Exception:
                    ai_data = build_ai_data_fallback(missing_skills_context)
            else:
                ai_data = build_ai_data_fallback(missing_skills_context)

        # D. ENRICHMENT
        enriched_missing = []
        for skill in missing_skills:
            tax_data = taxonomy_skills.get(skill, {}) 
            enriched_missing.append({
                "name": skill,
                "difficulty": tax_data.get("difficulty", "Unknown"),
                "avg_hours": tax_data.get("avg_learning_hours", 20),
                "category": tax_data.get("category", "General")
            })

        return {
            "analysis": {
                "matching_skills": matching_skills,
                "missing_skills": enriched_missing,
                "skill_gap_percentage": int((len(missing_skills) / len(target_skills)) * 100) if target_skills else 0,
                "readiness_score": ai_data.get("readiness_score", 80),
                "readiness_reasoning": ai_data.get("readiness_reasoning", "Professional and clean layout."),
            },
            "learning_roadmap": ai_data.get("learning_roadmap", []),
            "resume_improvements": ai_data.get("resume_improvements", []),
            "alternative_paths": ai_data.get("alternative_paths", []),
            "salary_growth": ai_data.get("salary_growth", {}),
            "visualization_data": ai_data.get("visualization_data", {}),
            "ats_tips": ai_data.get("industry_keywords", [])
        }

    except Exception as e:
        print(f"Gap Analysis Error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

# --- PDF GENERATION ENDPOINT ---
@app.post("/api/download-roadmap")
async def download_roadmap(request: PDFRequest):
    """Generates a downloadable PDF report"""
    try:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        story.append(Paragraph(f"Career Roadmap: {request.candidate_name}", styles['Title']))
        story.append(Spacer(1, 12))

        data = request.roadmap_data
        
        story.append(Paragraph(f"Readiness Score: {data['analysis']['readiness_score']}%", styles['Heading2']))
        story.append(Paragraph(data['analysis']['readiness_reasoning'], styles['Normal']))
        story.append(Spacer(1, 12))

        story.append(Paragraph("Action Plan:", styles['Heading2']))
        for step in data['learning_roadmap']:
            text = f"<b>Phase {step['phase']}: {step['focus']}</b><br/>Duration: {step['duration']}<br/>{step['reasoning']}"
            story.append(Paragraph(text, styles['Normal']))
            story.append(Spacer(1, 10))
            
        doc.build(story)
        buffer.seek(0)
        
        return StreamingResponse(
            buffer, 
            media_type="application/pdf", 
            headers={"Content-Disposition": f"attachment; filename=Career_Roadmap_{request.candidate_name}.pdf"}
        )

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# --- TEMPLATE ENGINE ---
def generate_notification_content(type: NotificationType, data: dict):
    """
    Simple template engine to generate Title and Message based on type.
    """
    templates = {
        NotificationType.JOB_MATCH: {
            "title": "New Job Match Found! 🎯",
            "message": "We found a {match_score}% match for {job_title} at {company}."
        },
        NotificationType.APPLICATION_STATUS: {
            "title": "Application Update 📄",
            "message": "Your application for {job_title} has moved to {status}."
        },
        NotificationType.EMPLOYER_MESSAGE: {
            "title": "New Message from Employer 💬",
            "message": "{company} sent you a message regarding {job_title}."
        },
        NotificationType.SKILL_RECOMMENDATION: {
            "title": "Skill Boost Recommended 🚀",
            "message": "Learn {skill} to increase your match score for {target_role} roles."
        },
        NotificationType.INTERVIEW_REMINDER: {
            "title": "Interview Reminder ⏰",
            "message": "You have an interview for {job_title} tomorrow at {time}."
        }
    }
    
    tmpl = templates.get(type, {"title": "New Notification", "message": "You have a new update."})
    
    # Safe formatting using .format()
    try:
        title = tmpl["title"]
        message = tmpl["message"].format(**data)
    except KeyError as e:
        # Fallback if data is missing keys
        message = tmpl["message"] + " (Details available)"
        
    return title, message

class ConnectionManager:
    def __init__(self):
        # Stores active connections: {user_id: WebSocket}
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"✅ User {user_id} connected via WebSocket")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"❌ User {user_id} disconnected")

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
                return True
            except Exception as e:
                print(f"⚠️ WebSocket Send Error: {e}")
                self.disconnect(user_id)
        return False

manager = ConnectionManager()

# --- ENDPOINTS ---

# ... (Place this near your other endpoints)

# 1. WEBSOCKET ENDPOINT
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive, listen for any client messages (optional heartbeat)
            data = await websocket.receive_text()
            # We mostly push FROM server, but we can log client pings
            print(f"📩 Msg from {user_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(user_id)

# 2. UPDATE EXISTING 'send_notification' to Broadcast Real-Time
@app.post("/notifications/send")
async def send_notification(notification: NotificationCreate):
    """
    Creates a notification, persists to DB, and PUSHES via WebSocket.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        # A. Logic to Check Preferences & Generate Content (Same as before)
        prefs_query = supabase.table("notification_preferences").select("*").eq("user_id", notification.user_id).execute()
        prefs = prefs_query.data[0] if prefs_query.data else {
            "email_enabled": True, "push_enabled": True, "inapp_enabled": True
        }

        title, message = generate_notification_content(notification.type, notification.data)

        # B. Persist to Database (System of Record)
        notif_data = {
            "user_id": notification.user_id,
            "type": notification.type.value,
            "title": title,
            "message": message,
            "data": notification.data,
            "priority": notification.priority.value,
            "read": False
        }
        
        insert_res = supabase.table("notifications").insert(notif_data).execute()
        new_notif = insert_res.data[0]
        
        # C. --- REAL-TIME PUSH (THE NEW PART) ---
        # If In-App is enabled, push instantly via WebSocket
        ws_sent = False
        if prefs.get("inapp_enabled", True):
            ws_payload = {
                "type": "NEW_NOTIFICATION",
                "notification": new_notif,
                "unread_count": 1 # You might want to fetch actual count here
            }
            ws_sent = await manager.send_personal_message(ws_payload, notification.user_id)

        # D. Mock Email/Push (Same as before)
        # ... (Your existing email logic)

        return {
            "success": True, 
            "notification_id": new_notif['id'], 
            "real_time_delivery": ws_sent
        }

    except Exception as e:
        print(f"Notification Error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/notifications/user/{user_id}")
async def get_user_notifications(user_id: str, page: int = 1, limit: int = 20):
    if not supabase: return []
    try:
        offset = (page - 1) * limit
        # Get notifications ordered by created_at desc
        response = supabase.table("notifications")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()
        return response.data
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/notifications/user/{user_id}/unread-count")
async def get_unread_count(user_id: str):
    if not supabase: return {"count": 0}
    try:
        # Supabase count requires head=True or separate query
        response = supabase.table("notifications")\
            .select("*", count="exact")\
            .eq("user_id", user_id)\
            .eq("read", False)\
            .execute()
        return {"count": response.count}
    except Exception as e:
        return {"count": 0}

@app.patch("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    if not supabase: return {"success": False}
    try:
        supabase.table("notifications").update({"read": True}).eq("id", notification_id).execute()
        return {"success": True}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/notifications/bulk-read")
async def mark_bulk_read(payload: Dict[str, Any]):
    # payload: { "notification_ids": ["id1", "id2"] }
    ids = payload.get("notification_ids", [])
    if not supabase or not ids: return {"success": False}
    try:
        supabase.table("notifications").update({"read": True}).in_("id", ids).execute()
        return {"success": True}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/notifications/user/{user_id}/preferences")
async def get_preferences(user_id: str):
    if not supabase: return {}
    try:
        res = supabase.table("notification_preferences").select("*").eq("user_id", user_id).single().execute()
        if not res.data:
            # Return defaults if no record exists
            return {"email_enabled": True, "push_enabled": True, "inapp_enabled": True, "frequency": "immediate"}
        return res.data
    except Exception as e:
        # single() raises error if not found, handle gracefully
        return {"email_enabled": True, "push_enabled": True, "inapp_enabled": True, "frequency": "immediate"}

@app.put("/notifications/user/{user_id}/preferences")
async def update_preferences(user_id: str, prefs: PreferencesUpdate):
    if not supabase: return {"success": False}
    try:
        # Check if exists, if not insert, else update (upsert)
        data = prefs.model_dump(exclude_unset=True)
        data["user_id"] = user_id
        
        supabase.table("notification_preferences").upsert(data).execute()
        return {"success": True}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)