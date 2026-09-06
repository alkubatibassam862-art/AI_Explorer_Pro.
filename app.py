import os
import io
from flask import Flask, render_template, request, jsonify, send_file
from groq import Groq

app = Flask(__name__)

@app.route('/')
def home():
    try:
        public_url = request.host_url.rstrip('/')
        return render_template('index.html', public_url=public_url)
    except Exception as e:
        return f"Error loading template: {str(e)}", 500

@app.route('/qr')
def qr_code():
    try:
        import qrcode
        public_url = request.host_url.rstrip('/')
        img = qrcode.make(public_url)
        buf = io.BytesIO()
        img.save(buf, 'PNG')
        buf.seek(0)
        return send_file(buf, mimetype='image/png')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return jsonify({"answer": "عذراً، مفتاح API غير معرف في إعدادات البيئة."}), 500

    data = request.json or {}
    messages = data.get('messages', [])
    lang = data.get('language', 'ar')

    system_prompt = (
        "أنت مساعد ذكي ومختص في هندسة الذكاء الاصطناعي لمعرض تعليمتي. "
        "أجب باختصار ووضوح وبأسلوب احترافي مشجع."
    ) if lang == 'ar' else (
        "You are an AI Engineering Assistant for an educational exhibition. "
        "Answer concisely, clearly, and professionally."
    )

    formatted_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        formatted_messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", "")
        })

    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=formatted_messages,
            temperature=0.7,
            max_tokens=800
        )
        answer = response.choices[0].message.content
        return jsonify({"answer": answer})
    except Exception as e:
        print(f"Groq API Error: {str(e)}")
        return jsonify({"answer": f"حدث خطأ في الاتصال: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
