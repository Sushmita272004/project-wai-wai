import requests
import json
import random

# ==========================================
# ⚠️ CRITICAL: MUST MATCH LOGIN EMAIL EXACTLY
# ==========================================
USER_EMAIL = "apurbsusobhit2509@gmail.com" 
# ==========================================

url = "http://127.0.0.1:5000/notifications/send"

# Define various test scenarios
scenarios = [
    {
        "type": "JOB_MATCH",
        "priority": "high",
        "data": {
            "job_title": "Senior Backend Developer",
            "company": "TechCorp",
            "match_score": 92
        }
    },
    {
        "type": "APPLICATION_STATUS",
        "priority": "medium",
        "data": {
            "job_title": "Frontend Engineer",
            "status": "Interview Scheduled",
            "next_steps": "Check your email for calendar invite"
        }
    },
    {
        "type": "INTERVIEW_REMINDER",
        "priority": "high",
        "data": {
            "job_title": "Full Stack Dev",
            "time": "10:00 AM IST",
            "link": "zoom.us/j/123456"
        }
    }
]

# Pick a random scenario
payload = random.choice(scenarios)
payload["user_id"] = USER_EMAIL

print(f"🚀 Sending {payload['type']} to {USER_EMAIL}...")

try:
    response = requests.post(url, json=payload)
    print("Status:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print("Error:", e)