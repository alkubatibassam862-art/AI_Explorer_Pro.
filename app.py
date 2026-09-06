import os
import qrcode
import io
from flask import Flask, render_template_string, request, jsonify, send_file
from groq import Groq

app = Flask(__name__)

# استخدام مفتاح GROQ أو OpenAI تلقائياً
GROQ_API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

PUBLIC_URL = os.getenv("PUBLIC_URL", "https://ai-explorer-pro.onrender.com")

SYSTEM_PROMPT = """You are AI Explorer, an intelligent assistant created for an AI Engineering exhibition.
Your goal is to explain Artificial Intelligence, Machine Learning, Deep Learning, and AI Engineering concepts in a clear, concise, and engaging way.
Answer in the same language as the user's query (Arabic or English).
Keep answers structured, inspiring, and easy to read for exhibition visitors."""

@app.route("/")
def index():
    try:
        with open("index.html", "r", encoding="utf-8") as f:
            html_content = f.read()
        return render_template_string(html_content, public_url=PUBLIC_URL)
    except Exception as e:
        return f"Error loading index.html: {str(e)}", 500

@app.route("/qr")
def get_qr():
    qr = qrcode.QRCode(version=1, box_size=8, border=2)
    qr.add_data(PUBLIC_URL)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    img_io = io.BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    return send_file(img_io, mimetype='image/png')

@app.route("/api/chat", methods=["POST"])
def chat():
    if not client:
        return jsonify({"error": "GROQ_API_KEY is not configured in Environment Variables."}), 500

    data = request.json or {}
    user_messages = data.get("messages", [])

    formatted_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in user_messages:
        formatted_messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", "")
        })

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=formatted_messages,
            temperature=0.7,
            max_tokens=800
        )
        answer = response.choices[0].message.content
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))
