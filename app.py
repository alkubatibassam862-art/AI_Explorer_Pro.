import os
import io
from flask import Flask, render_template, request, jsonify, send_file
from groq import Groq

app = Flask(__name__, template_folder='.', static_folder='.')

@app.route('/')
def home():
    try:
        public_url = request.host_url.rstrip('/')
        return render_template('index.html', public_url=public_url)
    except Exception as e:
        return f"Error loading index.html: {str(e)}", 500

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

    # تعليمات صارمة لاختصار الردود وتجاهل الأخطاء الإملائية
    system_prompt = (
        "أنت مساعد ذكي ومختص في هندسة الذكاء الاصطناعي في معرض تعليمتي. "
        "قواعد الإجابة الصارمة:\n"
        "1. أجب باختصار شديد جداً (فقرة واحدة فقط أو نقاط بسيطة).\n"
        "2. لا تستخدم الجداول، الرموز المعقدة، التنسيقات العريضة الشديدة، أو الشفرات التي تشوه النص.\n"
        "3. افهم السؤال حتى لو احتوى على أخطاء إملائية أو لغوية أو كان بلهجة عامية (عربي أو إنجليزي).\n"
        "4. اجعل الأسلوب ممتعاً، فخماً، ومفهوماً للجميع."
    ) if lang == 'ar' else (
        "You are an AI Engineering Assistant for an educational exhibition. "
        "Strict rules:\n"
        "1. Answer VERY concisely (1 short paragraph or simple bullet points).\n"
        "2. Do NOT use tables, markdown borders, or complex formatting symbols.\n"
        "3. Ignore any spelling or grammatical errors in the user query (Arabic/English).\n"
        "4. Be friendly, elegant, and clear."
    )

    formatted_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        formatted_messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", "")
        })

    client = Groq(api_key=api_key.strip())

    models_to_try = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "openai/gpt-oss-20b"
    ]

    last_error = None
    for model_name in models_to_try:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=formatted_messages,
                temperature=0.6,
                max_tokens=400
            )
            answer = response.choices[0].message.content
            return jsonify({"answer": answer})
        except Exception as e:
            last_error = str(e)
            print(f"Failed with model {model_name}: {last_error}")
            continue

    return jsonify({"answer": f"حدث خطأ في الاتصال: {last_error}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
