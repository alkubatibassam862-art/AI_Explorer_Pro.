import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
    try {
        const { messages, language } = req.body;

        // توجيهات صارمة للذكاء الاصطناعي للإجابة باختصار وبدون رموز
        const systemPrompt = language === 'en' 
            ? "You are a concise AI assistant. Give short, direct, simple answers without long paragraphs. Strictly DO NOT use markdown symbols like **, ##, or bullet points unless absolutely necessary."
            : "أنت مساعد ذكاء اصطناعي مختصر جداً. أجب بشكل مباشر وبسيط وبدون كلام طويل. يمنع منعاً باتاً استخدام الرموز والتنسيقات مثل ** أو ## أو القوائم الطويلة إلا للضرورة القصوى.";

        const formattedMessages = [
            { role: "system", content: systemPrompt },
            ...(messages || [])
        ];

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: formattedMessages
            })
        });

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "عذراً، حدث خطأ أثناء المعالجة.";

        // تنظيف الرد من الرموز الزائدة لضمان عدم ظهورها
        const cleanReply = reply.replace(/\*\*/g, '').replace(/###?/g, '');

        res.json({ answer: cleanReply });
    } catch (error) {
        res.status(500).json({ answer: "تعذر الاتصال بالسيرفر." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
