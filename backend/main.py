# backend/main.py
import os
import json
import io
import re
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
from dotenv import load_dotenv
from groq import Groq
from huggingface_hub import InferenceClient
from supabase import create_client, Client
import pdfplumber
import docx

# ==========================================
# 0. ROBUST ENVIRONMENT LOADING
# ==========================================
BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)

# AUTO-FIX: Strip whitespace/newlines from keys to prevent "Invalid API Key" errors
supabase_url = (os.environ.get("SUPABASE_URL") or "").strip()
supabase_key = (os.environ.get("SUPABASE_KEY") or "").strip()
groq_key = (os.environ.get("GROQ_API_KEY") or "").strip()
hf_token = (os.environ.get("HF_API_TOKEN") or "").strip()

if not supabase_url or not supabase_key:
    print(f"❌ ERROR: Supabase keys missing or empty in {ENV_PATH}")
else:
    print("✅ Environment keys loaded and sanitized.")

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

# Supabase Client
try:
    if supabase_url and supabase_key:
        supabase: Client = create_client(supabase_url, supabase_key)
    else:
        raise ValueError("Keys are empty string")
except Exception as e:
    print(f"⚠️ Warning: Supabase client failed to initialize: {e}")
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

# ==========================================
# 3. HELPER FUNCTIONS
# ==========================================

def extract_text(file_bytes, filename):
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
    except Exception as e:
        print(f"Extraction Error: {e}")
    return text

def regex_fallback(text):
    print("⚠️ Using Regex Fallback")
    data = {
        "name": "Candidate",
        "email": "",
        "phone": "",
        "education": "Not found",
        "skills": ["Manual Verification Needed"],
        "experience": [],
        "projects": []
    }
    
    email_match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    if email_match: data["email"] = email_match.group(0)
    
    phone_match = re.search(r'(\+\d{1,3}[- ]?)?\d{10}', text)
    if phone_match: data["phone"] = phone_match.group(0)
    
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    if lines: data["name"] = lines[0]

    return data

def calculate_job_relevancy(resume_text, job_description):
    if not job_description or len(job_description.strip()) < 10:
        return 0
    
    resume_words = set(re.findall(r'\w+', resume_text.lower()))
    jd_words = set(re.findall(r'\w+', job_description.lower()))
    
    stop_words = {"and", "the", "to", "of", "in", "for", "with", "a", "an", "is", "on", "are", "will", "be", "that", "it", "as"}
    jd_keywords = {w for w in jd_words if w not in stop_words and len(w) > 3}
    
    if not jd_keywords:
        return 0

    matches = resume_words.intersection(jd_keywords)
    raw_score = (len(matches) / len(jd_keywords)) * 100
    return min(100, int(raw_score * 1.5)) 

# ==========================================
# 4. MOCK DATA GENERATORS FOR ANALYTICS
# ==========================================

from datetime import datetime, timedelta
import random

def generate_mock_analytics_data():
    """Generate comprehensive mock data for analytics dashboard"""
    sources = ["LinkedIn", "Naukri", "Indeed", "Referral", "Company Website", "Glassdoor"]
    statuses = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"]
    
    # Generate applications over 3 months
    applications = []
    base_date = datetime.now() - timedelta(days=90)
    
    for i in range(500):
        days_offset = random.randint(0, 89)
        application_date = base_date + timedelta(days=days_offset)
        
        status = random.choices(
            statuses, 
            weights=[30, 25, 20, 10, 8, 7]
        )[0]
        
        source = random.choice(sources)
        quality_score = random.randint(45, 98)
        
        # Calculate time to hire for hired candidates
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

# Global mock data
MOCK_APPLICATIONS = generate_mock_analytics_data()

# ==========================================
# 5. API ENDPOINTS
# ==========================================

@app.get("/health")
def health():
    return {"status": "FastAPI is running"}

@app.get("/analytics/overview")
def get_analytics_overview():
    """Get summary metrics for the last 30 days"""
    thirty_days_ago = datetime.now() - timedelta(days=30)
    sixty_days_ago = datetime.now() - timedelta(days=60)
    
    # Last 30 days
    recent_apps = [
        app for app in MOCK_APPLICATIONS 
        if datetime.fromisoformat(app["application_date"]) >= thirty_days_ago
    ]
    
    # Previous 30 days (for comparison)
    previous_apps = [
        app for app in MOCK_APPLICATIONS 
        if sixty_days_ago <= datetime.fromisoformat(app["application_date"]) < thirty_days_ago
    ]
    
    total_recent = len(recent_apps)
    total_previous = len(previous_apps)
    
    # Calculate change percentage
    if total_previous > 0:
        change = ((total_recent - total_previous) / total_previous) * 100
        applications_change = f"{'+' if change >= 0 else ''}{int(change)}%"
    else:
        applications_change = "+100%"
    
    # Active jobs
    active_jobs = len(set(app["job_id"] for app in recent_apps))
    
    # Average time to hire
    hired_apps = [app for app in recent_apps if app["status"] == "Hired" and app["time_to_hire_days"]]
    avg_time_to_hire = int(sum(app["time_to_hire_days"] for app in hired_apps) / len(hired_apps)) if hired_apps else 18
    
    # Offer acceptance rate
    offers = [app for app in recent_apps if app["status"] in ["Offer", "Hired"]]
    hired = [app for app in recent_apps if app["status"] == "Hired"]
    offer_acceptance_rate = int((len(hired) / len(offers)) * 100) if offers else 75
    
    # Top source
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
    """Get application funnel data"""
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_apps = [
        app for app in MOCK_APPLICATIONS 
        if datetime.fromisoformat(app["application_date"]) >= thirty_days_ago
    ]
    
    pipeline = {}
    for app in recent_apps:
        status = app["status"]
        pipeline[status] = pipeline.get(status, 0) + 1
    
    # Ensure all stages are present
    stages = ["Applied", "Screening", "Interview", "Offer", "Hired"]
    funnel_data = [{"stage": stage, "count": pipeline.get(stage, 0)} for stage in stages]
    
    return {"pipeline": funnel_data}

@app.get("/analytics/time-to-hire")
def get_time_to_hire():
    """Get average time to hire metrics over time"""
    ninety_days_ago = datetime.now() - timedelta(days=90)
    
    # Group by week
    weekly_data = {}
    for app in MOCK_APPLICATIONS:
        if app["status"] == "Hired" and app["time_to_hire_days"]:
            app_date = datetime.fromisoformat(app["application_date"])
            if app_date >= ninety_days_ago:
                week_key = app_date.strftime("%Y-W%U")
                if week_key not in weekly_data:
                    weekly_data[week_key] = []
                weekly_data[week_key].append(app["time_to_hire_days"])
    
    # Calculate averages
    time_series = []
    for week, times in sorted(weekly_data.items()):
        avg_time = sum(times) / len(times)
        time_series.append({
            "week": week,
            "avg_days": round(avg_time, 1)
        })
    
    return {"time_series": time_series}

@app.get("/analytics/source-effectiveness")
def get_source_effectiveness():
    """Get application sources breakdown"""
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_apps = [
        app for app in MOCK_APPLICATIONS 
        if datetime.fromisoformat(app["application_date"]) >= thirty_days_ago
    ]
    
    source_stats = {}
    for app in recent_apps:
        source = app["source"]
        if source not in source_stats:
            source_stats[source] = {
                "source": source,
                "applications": 0,
                "hired": 0,
                "avg_quality": []
            }
        source_stats[source]["applications"] += 1
        if app["status"] == "Hired":
            source_stats[source]["hired"] += 1
        source_stats[source]["avg_quality"].append(app["quality_score"])
    
    # Calculate averages and conversion rates
    sources = []
    for source, stats in source_stats.items():
        avg_quality = sum(stats["avg_quality"]) / len(stats["avg_quality"])
        conversion_rate = (stats["hired"] / stats["applications"]) * 100 if stats["applications"] > 0 else 0
        sources.append({
            "source": source,
            "applications": stats["applications"],
            "hired": stats["hired"],
            "conversion_rate": round(conversion_rate, 1),
            "avg_quality_score": round(avg_quality, 1)
        })
    
    return {"sources": sorted(sources, key=lambda x: x["applications"], reverse=True)}

@app.get("/analytics/candidate-quality")
def get_candidate_quality():
    """Get quality score distribution"""
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_apps = [
        app for app in MOCK_APPLICATIONS 
        if datetime.fromisoformat(app["application_date"]) >= thirty_days_ago
    ]
    
    # Create score buckets
    buckets = {
        "40-50": 0,
        "51-60": 0,
        "61-70": 0,
        "71-80": 0,
        "81-90": 0,
        "91-100": 0
    }
    
    for app in recent_apps:
        score = app["quality_score"]
        if 40 <= score <= 50:
            buckets["40-50"] += 1
        elif 51 <= score <= 60:
            buckets["51-60"] += 1
        elif 61 <= score <= 70:
            buckets["61-70"] += 1
        elif 71 <= score <= 80:
            buckets["71-80"] += 1
        elif 81 <= score <= 90:
            buckets["81-90"] += 1
        elif 91 <= score <= 100:
            buckets["91-100"] += 1
    
    distribution = [{"range": k, "count": v} for k, v in buckets.items()]
    
    return {"distribution": distribution}

@app.get("/analytics/jobs/{job_id}")
def get_job_analytics(job_id: int):
    """Get analytics for a specific job"""
    job_apps = [app for app in MOCK_APPLICATIONS if app["job_id"] == job_id]
    
    if not job_apps:
        return {"error": "Job not found"}
    
    # Status breakdown
    status_counts = {}
    for app in job_apps:
        status = app["status"]
        status_counts[status] = status_counts.get(status, 0) + 1
    
    # Time to hire
    hired_apps = [app for app in job_apps if app["status"] == "Hired" and app["time_to_hire_days"]]
    avg_time_to_hire = int(sum(app["time_to_hire_days"] for app in hired_apps) / len(hired_apps)) if hired_apps else 0
    
    # Quality metrics
    avg_quality = sum(app["quality_score"] for app in job_apps) / len(job_apps)
    
    return {
        "job_id": job_id,
        "total_applications": len(job_apps),
        "status_breakdown": status_counts,
        "avg_time_to_hire_days": avg_time_to_hire,
        "avg_quality_score": round(avg_quality, 1),
        "hired_count": len(hired_apps)
    }

@app.get("/analytics/recent-applications")
def get_recent_applications():
    """Get recent applications for table display"""
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_apps = [
        app for app in MOCK_APPLICATIONS 
        if datetime.fromisoformat(app["application_date"]) >= thirty_days_ago
    ]
    
    # Sort by date (most recent first) and limit to 20
    sorted_apps = sorted(recent_apps, key=lambda x: x["application_date"], reverse=True)[:20]
    
    # Format for frontend
    formatted = []
    for app in sorted_apps:
        formatted.append({
            "id": app["id"],
            "candidate": app["candidate_name"],
            "job_id": app["job_id"],
            "source": app["source"],
            "status": app["status"],
            "quality_score": app["quality_score"],
            "date": datetime.fromisoformat(app["application_date"]).strftime("%Y-%m-%d")
        })
    
    return {"applications": formatted}

@app.post("/api/generate-job")
async def generate_job(request: JobRequest):
    try:
        system_prompt = "You are an expert HR AI. Generate a structured job description."
        user_prompt = f"Role: {request.jobTitle}, Skills: {request.skills}, Experience: {request.experienceLevel}"
        
        completion = groq_client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            model="llama-3.3-70b-versatile",
        )
        return {"success": True, "description": completion.choices[0].message.content}
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

@app.post("/api/parse-resume")
async def parse_resume(
    file: UploadFile = File(...),
    job_description: str = Form("")
):
    try:
        content = await file.read()
        text = extract_text(content, file.filename.lower())
        
        if not text:
            return JSONResponse(status_code=400, content={"error": "Could not extract text from file."})

        # AI Parsing
        user_message = f"""
        Extract the following fields from the resume text below and return ONLY valid JSON.
        JSON Structure:
        {{
            "name": "string",
            "email": "string",
            "phone": "string",
            "education": "string",
            "skills": ["skill1", "skill2"],
            "experience": ["role1", "role2"],
            "projects": ["project1", "project2"]
        }}
        Resume Text: {text[:3500]} 
        """

        try:
            # Using Qwen 2.5 7B
            response = hf_client.chat_completion(
                messages=[{"role": "user", "content": user_message}],
                model="Qwen/Qwen2.5-7B-Instruct", 
                max_tokens=1000,
                temperature=0.1
            )
            clean_json = response.choices[0].message.content.strip().replace("```json", "").replace("```", "")
            parsed_data = json.loads(clean_json)
        except Exception as ai_error:
            print(f"AI Failed: {ai_error}")
            parsed_data = regex_fallback(text)

        # Confidence Scores
        scores = {}
        for key, value in parsed_data.items():
            if not value or (isinstance(value, list) and not value):
                scores[key] = 0 
            else:
                scores[key] = 85 if key in ["skills", "experience"] else 95
        
        if "@" not in parsed_data.get("email", ""): scores["email"] = 40

        relevancy_score = calculate_job_relevancy(text, job_description)

        return {
            "extracted_data": parsed_data,
            "confidence_scores": scores,
            "relevancy_score": relevancy_score
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/api/save-profile")
async def save_profile(profile: ProfileSaveRequest):
    if not supabase:
        return JSONResponse(status_code=500, content={"success": False, "error": "Database not connected"})

    try:
        data = profile.model_dump()
        response = supabase.table("resumes").insert({
            "name": data["name"],
            "email": data["email"],
            "phone": data["phone"],
            "education": data["education"],
            "skills": data["skills"],
            "experience": data["experience"],
            "projects": data["projects"],
            "relevancy_score": data["relevancy_score"],
            "confidence_scores": data["confidence_scores"],
            "job_description": data["job_description"]
        }).execute()
        
        print(f"✅ SAVED TO DB: {response}")
        return {"success": True, "message": "Profile saved to database"}

    except Exception as e:
        print(f"❌ DB ERROR: {e}") 
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)