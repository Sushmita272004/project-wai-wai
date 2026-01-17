import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable Cross-Origin Resource Sharing for React

    # Initialize Groq Client
    client = Groq(
        api_key=os.environ.get("GROQ_API_KEY"),
    )

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify(status="ok"), 200

    @app.route("/api/generate-job", methods=["POST"])
    def generate_job():
        data = request.json
        
        # Extract inputs
        title = data.get('jobTitle')
        industry = data.get('industry')
        level = data.get('experienceLevel')
        skills = data.get('skills')
        culture = data.get('culture')
        special_reqs = data.get('specialRequirements', 'None')

        # Construct the Prompt based on Problem Statement 8 Requirements
        system_prompt = f"""
        You are an expert HR AI assistant. Generate a structured, ATS-friendly job description.
        
        Strict Output Structure:
        [Job Title] at [Company Placeholder]
        
        About the Role:
        [2-3 paragraph description]
        
        Key Responsibilities:
        - [5-7 bullet points based on {level} level and {skills}]
        
        Required Skills:
        - [List of must-have skills from: {skills}]
        
        Preferred Skills:
        - [List of 3-4 nice-to-have skills relevant to {industry}]
        
        Experience:
        - [Specific experience requirements for {level} level]
        
        What We Offer:
        - [3-5 benefits aligned with {culture} culture]
        
        About Company:
        [Short description for a {culture} company in {industry}]
        """

        user_prompt = f"""
        Create a job description for:
        Role: {title}
        Industry: {industry}
        Level: {level}
        Skills: {skills}
        Culture: {culture}
        Special Requirements: {special_reqs}
        """

        try:
            # UPDATED MODEL ID HERE
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                # Using the latest versatile model
                model="llama-3.3-70b-versatile",
            )
            
            generated_text = chat_completion.choices[0].message.content
            return jsonify({"success": True, "description": generated_text})

        except Exception as e:
            print(f"Error: {e}")
            return jsonify({"success": False, "error": str(e)}), 500

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="127.0.0.1", port=5000, debug=True)