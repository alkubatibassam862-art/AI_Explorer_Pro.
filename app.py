import os
import io
import qrcode
from flask import Flask, render_template, request, jsonify, send_file
from groq import Groq

app = Flask(__name__)

# جلب مفتاح Groq من المتغيرات
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

client = None
if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)

@app.route('/')
def home():
    # جلب رابط الموقع تلقائياً لإظهاره في الصفحة والـ QR
    public_url = request.host_url.rstrip('/')
    return render_template('index.html', public_url=public_url)

@app.route('/qr')
def qr_code():
    public_url = request.host_url.rstrip('/')
    img = qrcode.make(public_url)
    buf = io.BytesIO()
    img.save(buf, 'PNG')
    buf.seek(0)
    return send_file(buf, mimetype='image/png')

@app.route('/api/chat', methods=['POST'])
def chat():
    if not client:
        return jsonify({"answer": "عذراً، الخدمة غير متاحة حالياً. يرجى المحاولة لاحقاً."}), 500

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
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",  # نموذج سريع ودقيق جداً من Groq
            messages=formatted_messages,
            temperature=0.7,
            max_tokens=800
        )
        answer = response.choices[0].message.content
        return jsonify({"answer": answer})
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return jsonify({"answer": "عذراً، حدث انقطاع مؤقت في الاتصال بالخادم. يرجى المحاولة بعد لحظات."}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
