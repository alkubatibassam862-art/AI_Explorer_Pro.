import os
import io
import socket
import qrcode
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request, send_file, send_from_directory
from openai import OpenAI

load_dotenv()

# تهيئة تطبيق فلاسك مع السماح بالقراءة المباشرة للمجلدات
app = Flask(__name__, template_folder='.', static_folder='static', static_url_path='/static')

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
TEXT_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()
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
- Support Arabic, English, mixed Arabic-English, Arabizi, informal Arabic, common keyboard mistakes, and spelling mistakes.
- Silently correct obvious spelling mistakes when the meaning is clear.
- If the visitor switches language, switch naturally too.

Answer behavior:
- Start with the direct answer.
- Then explain simply.
- Use practical examples when useful.
- Avoid unnecessary jargon. Define technical terms briefly.
- Keep responses engaging, accurate, and concise for exhibition visitors.
- Do not use emojis unless the visitor explicitly asks for them.
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

# دمج التغذية المباشرة لملفات الـ CSS والـ JS للتأكد من وصول المتصفح لها دائماً
@app.get('/style.css')
def serve_css_root():
    if os.path.exists('style.css'):
        return send_from_directory('.', 'style.css')
    return send_from_directory('static', 'style.css')

@app.get('/app.js')
def serve_js_root():
    if os.path.exists('app.js'):
        return send_from_directory('.', 'app.js')
    return send_from_directory('static', 'app.js')

@app.get('/static/style.css')
def serve_css_static():
    if os.path.exists('static/style.css'):
        return send_from_directory('static', 'style.css')
    return send_from_directory('.', 'style.css')

@app.get('/static/app.js')
def serve_js_static():
    if os.path.exists('static/app.js'):
        return send_from_directory('static', 'app.js')
    return send_from_directory('.', 'app.js')

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
        response = client.chat.completions.create(
            model=TEXT_MODEL,
            messages=[{"role": "system", "content": SYSTEM_PROMPT}] + cleaned,
            temperature=0.7,
        )
        answer = response.choices[0].message.content
        return jsonify({"answer": answer.strip()})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=False)
