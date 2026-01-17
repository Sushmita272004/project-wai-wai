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
# 4. API ENDPOINTS
# ==========================================

@app.get("/health")
def health():
    return {"status": "FastAPI is running"}

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