from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List
import fitz  # PyMuPDF
import spacy
import re
import json
import os
from dotenv import load_dotenv
from groq import Groq

# ---------------------------------------
# ENV SETUP
# ---------------------------------------

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in .env file")

client = Groq(api_key=GROQ_API_KEY)

# ---------------------------------------
# FASTAPI INIT
# ---------------------------------------

app = FastAPI()

# Load NLP model
nlp = spacy.load("en_core_web_sm")

# ---------------------------------------
# PDF TEXT EXTRACTION
# ---------------------------------------

def extract_text_from_pdf(file_bytes):
    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text

# ---------------------------------------
# SMART RESUME PARSING
# ---------------------------------------

COMMON_SKILLS = [
    "python", "java", "c++", "javascript", "react",
    "node", "mongodb", "machine learning",
    "deep learning", "sql", "html", "css",
    "fastapi", "django", "flask", "tensorflow",
    "pytorch", "aws", "docker"
]

def extract_email(text):
    match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    return match.group(0) if match else None

def extract_name(text):
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text
    return None

def extract_skills(text):
    text_lower = text.lower()
    return list(set([skill for skill in COMMON_SKILLS if skill in text_lower]))

def extract_education(text):
    education_keywords = ["b.tech", "m.tech", "bachelor", "master", "phd"]
    text_lower = text.lower()
    return list(set([word for word in education_keywords if word in text_lower]))

def extract_experience_keywords(text):
    experience_words = ["intern", "experience", "worked", "project", "developer"]
    text_lower = text.lower()
    return list(set([word for word in experience_words if word in text_lower]))

def extract_basic_info(text):
    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "skills": extract_skills(text),
        "education_keywords": extract_education(text),
        "experience_keywords": extract_experience_keywords(text),
        "text_preview": text[:300]
    }

# ---------------------------------------
# RESUME PARSE ENDPOINT
# ---------------------------------------

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        text = extract_text_from_pdf(file_bytes)
        parsed_data = extract_basic_info(text)

        return {
            "message": "Resume parsed successfully",
            "data": parsed_data
        }

    except Exception as e:
        return {
            "message": "Resume parsing failed",
            "error": str(e)
        }

# ---------------------------------------
# AI QUESTION GENERATOR
# ---------------------------------------

class ResumeData(BaseModel):
    name: str | None = None
    email: str | None = None
    skills: List[str] = []
    education_keywords: List[str] = []
    experience_keywords: List[str] = []

@app.post("/generate-questions")
async def generate_questions(resume_data: ResumeData):
    try:
        prompt = f"""
You are an expert technical interviewer.

Generate 6 high-quality interview questions based on the candidate resume.

Candidate Details:
Name: {resume_data.name}
Skills: {resume_data.skills}
Education: {resume_data.education_keywords}
Experience Keywords: {resume_data.experience_keywords}

Rules:
- Generate 4 technical questions based on skills.
- Generate 2 behavioral questions.
- Make them realistic and slightly challenging.
- Return strictly valid JSON array only.
- No explanations.
- Format exactly like:

[
  {{"question": "Question text", "type": "technical"}},
  {{"question": "Question text", "type": "behavioral"}}
]
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a strict professional interviewer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )

        content = response.choices[0].message.content.strip()

        # Convert LLM string output to real JSON
        questions = json.loads(content)

        return {
            "message": "Questions generated successfully",
            "questions": questions
        }

    except Exception as e:
        return {
            "message": "Question generation failed",
            "error": str(e)
        }

class EvaluationRequest(BaseModel):
    questions: List[dict]

@app.post("/evaluate-interview")
async def evaluate_interview(data: EvaluationRequest):
    try:
        prompt = f"""
You are an expert technical interviewer.

Evaluate the following interview answers.

For each question:
- Give a score out of 10
- Give 2-3 lines feedback

Then give:
- Overall score (out of 10)
- Overall summary (4-5 lines)

Return strictly valid JSON only.
No explanations.
No markdown.
No extra text.

Format:

{{
  "evaluations": [
    {{
      "question": "...",
      "score": 8,
      "feedback": "..."
    }}
  ],
  "overall_score": 7.5,
  "overall_summary": "..."
}}

Interview Data:
{data.questions}
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a strict and fair evaluator."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
        )

        content = response.choices[0].message.content.strip()

        # 🔥 Extract JSON safely
        json_match = re.search(r"\{.*\}", content, re.DOTALL)

        if not json_match:
            raise ValueError("No valid JSON found in LLM response")

        json_content = json_match.group()

        evaluation = json.loads(json_content)

        return {
            "message": "Evaluation completed",
            "result": evaluation
        }

    except Exception as e:
        return {
            "message": "Evaluation failed",
            "error": str(e),
            "raw_response": content if 'content' in locals() else None
        }