import os
import io
import json
import socket

import qrcode
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request, send_file, send_from_directory
from openai import OpenAI

load_dotenv()

# تعديل ربط مجلد static بشكل صريح مع Flask
app = Flask(__name__, template_folder='.', static_folder='static', static_url_path='/static')

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
TEXT_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6-luna").strip()
REALTIME_MODEL = os.getenv("REALTIME_MODEL", "gpt-realtime-2.1").strip()
PUBLIC_URL = os.getenv("PUBLIC_URL", "").strip().rstrip("/")
PORT = int(os.getenv("PORT", "5000"))

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is missing. Add it to your .env file.")

client = OpenAI(api_key=OPENAI_API_KEY)

SYSTEM_PROMPT = """
You are AI Explorer, the official educational AI assistant for a university exhibition.
Your goal is to make visitors curious about Artificial Intelligence and AI Engineering while
remaining accurate, balanced, friendly, and understandable.

You can explain Artificial Intelligence, AI Engineering, Machine Learning, Deep Learning,
Neural Networks, Generative AI, Large Language Models, Computer Vision, Natural Language
Processing, Robotics, Data Science, Python, mathematics for AI, statistics, ethics, safety,
careers, university study paths, research, projects, and real-world applications.

Language behavior:
- Reply in the same language the visitor uses.
- Support Arabic, English, mixed Arabic-English, Arabizi, informal Arabic, abbreviations,
  repeated letters, missing hamzas, common keyboard mistakes, and ordinary English spelling mistakes.
- Silently correct obvious spelling mistakes when the meaning is clear.
- If a typo has more than one plausible meaning, ask a short clarification question.
- If the visitor switches language, switch naturally too.

Answer behavior:
- Start with the direct answer.
- Then explain simply.
- Use practical examples when useful.
- Avoid unnecessary jargon. Define technical terms briefly.
- If the visitor asks whether AI can take jobs, give a balanced answer:
  AI can automate some tasks, transform some jobs, reduce demand for some roles, and create
  new roles. The impact depends on the task, occupation, industry, country, and time.
  Emphasize that learning to work with AI is increasingly valuable.
- Never claim that AI will definitely replace all jobs or definitely replace no jobs.
- Do not invent statistics, university policies, prices, or current product facts.
- For current AI news, product releases, model availability, prices, or recent events in text mode,
  use the available web search tool when appropriate.
- Keep cybersecurity assistance defensive, legal, and educational.
- Do not use emojis unless the visitor explicitly asks for them.
- For voice conversations, sound natural, warm, concise, and conversational.
"""

def local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def base_url():
    if PUBLIC_URL:
        return PUBLIC_URL
    return f"http://{local_ip()}:{PORT}"

@app.get("/")
def index():
    return render_template(
        "index.html",
        public_url=base_url(),
        text_model=TEXT_MODEL,
        realtime_model=REALTIME_MODEL,
    )

@app.get("/qr")
def qr():
    image = qrcode.make(base_url())
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)
    return send_file(buffer, mimetype="image/png", max_age=0)

@app.get("/health")
def health():
    return jsonify({"status": "ok"})

# دعم الملفات المباشرة ومجلد static بنفس الوقت لمنع أي أخطاء 404
@app.get('/style.css')
def serve_css():
    return send_from_directory('static', 'style.css')

@app.get('/app.js')
def serve_js():
    return send_from_directory('static', 'app.js')

@app.get('/static/<path:filename>')
def serve_static_files(filename):
    return send_from_directory('static', filename)

@app.post("/api/chat")
def chat():
    data = request.get_json(silent=True) or {}
    messages = data.get("messages", [])
    language = data.get("language", "en")
    language = "ar" if language == "ar" else "en"

    if not isinstance(messages, list):
        return jsonify({"error": "Invalid messages format."}), 400

    cleaned = []
    for item in messages[-20:]:
        if not isinstance(item, dict):
            continue
        role = item.get("role")
        content = str(item.get("content", "")).strip()
        if role in {"user", "assistant"} and content:
            cleaned.append({"role": role, "content": content[:8000]})

    if not cleaned:
        return jsonify({"error": "No message was provided."}), 400

    try:
        response = client.responses.create(
            model=TEXT_MODEL,
            instructions=SYSTEM_PROMPT + ("\n\nThe interface language is Arabic. Reply in Arabic unless the visitor explicitly asks to switch to another language." if language == "ar" else "\n\nThe interface language is English. Reply in English unless the visitor explicitly asks to switch to another language."),
            input=cleaned,
            tools=[{"type": "web_search"}],
            store=False,
        )
        return jsonify({"answer": (response.output_text or "").strip()})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

@app.post("/api/realtime/session")
def realtime_session():
    data = request.get_json(silent=True) or {}
    sdp = str(data.get("sdp", "")).strip()
    language = data.get("language", "en")
    language = "ar" if language == "ar" else "en"

    if not sdp:
        return jsonify({"error": "Missing SDP offer."}), 400

    session = {
        "type": "realtime",
        "model": REALTIME_MODEL,
        "instructions": SYSTEM_PROMPT + ("\n\nThe interface language is Arabic. Speak Arabic and respond in Arabic unless the visitor explicitly asks to switch languages." if language == "ar" else "\n\nThe interface language is English. Speak English and respond in English unless the visitor explicitly asks to switch languages."),
        "audio": {
            "input": {
                "turn_detection": {
                    "type": "server_vad",
                    "threshold": 0.5,
                    "prefix_padding_ms": 300,
                    "silence_duration_ms": 500,
                    "create_response": True,
                    "interrupt_response": True
                },
                "transcription": {
                    "model": "gpt-4o-transcribe"
                }
            },
            "output": {
                "voice": "marin"
            }
        },
        "output_modalities": ["audio"],
        "max_output_tokens": 1200
    }

    try:
        response = requests.post(
            "https://api.openai.com/v1/realtime/calls",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            files={
                "sdp": (None, sdp, "application/sdp"),
                "session": (None, json.dumps(session), "application/json")
            },
            timeout=30
        )

        if not response.ok:
            print(f"Realtime API error {response.status_code}: {response.text}")
            friendly = (
                "تعذر تشغيل المحادثة الصوتية الآن. تأكد من صلاحية الميكروفون والاتصال بالإنترنت ثم حاول مرة أخرى."
                if language == "ar"
                else
                "Voice chat could not be started right now. Check microphone permission and internet access, then try again."
            )
            return jsonify({"error": friendly}), response.status_code

        return response.text, 201, {"Content-Type": "application/sdp"}
    except requests.RequestException as exc:
        print(f"Realtime connection error: {exc}")
        friendly = (
            "تعذر الاتصال بالمحادثة الصوتية الآن. حاول مرة أخرى."
            if language == "ar"
            else
            "The voice connection could not be started. Please try again."
        )
        return jsonify({"error": friendly}), 502

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=False)
