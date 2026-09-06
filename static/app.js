document.addEventListener("DOMContentLoaded", () => {
    const messages = document.getElementById("messages");
    const composer = document.getElementById("composer");
    const messageInput = document.getElementById("messageInput");
    const languageButton = document.getElementById("languageButton");
    const newChatButton = document.getElementById("newChatButton");
    const askButton = document.getElementById("askButton");

    let currentLang = "en";
    let chatHistory = [];

    const translations = {
        en: {
            brandSubtitle: "AI ENGINEERING EXPERIENCE",
            heroEyebrow: "ARTIFICIAL INTELLIGENCE",
            heroTitle: 'Ask AI.<br><span>Understand AI.</span><br>Build the future.',
            heroText: "Explore Artificial Intelligence through interactive questions, real examples, and intelligent responses.",
            askButton: "Ask a question",
            statusText: "Ready",
            orbLabel: "AI READY",
            featureOneTitle: "Ask anything",
            featureOneText: "From “What is AI?” to advanced AI Engineering questions.",
            featureTwoTitle: "Instant Answers",
            featureTwoText: "Get fast, practical, and clear technical explanations.",
            featureThreeTitle: "Learn by examples",
            featureThreeText: "See how AI connects to jobs, medicine, cars, business, and daily life.",
            liveExperienceLabel: "LIVE EXPERIENCE",
            chatTitle: "Your AI conversation",
            modePill: "TEXT MODE",
            assistantSubtitle: "AI Engineering Assistant",
            connectionText: "Online",
            welcomeTitle: "What would you like to discover?",
            welcomeText: "Type a question or select a prompt below to get started.",
            inputPlaceholder: "Ask anything about AI...",
            sendButton: "Send",
            takeAILabel: "TAKE AI WITH YOU",
            qrTitle: "Scan. Open. Talk.",
            qrText: "Visitors can scan this QR code with any phone and open the AI Explorer experience.",
            qrNote: "For the exhibition, visitors can scan to try the app on their phones.",
            footerLabel: "AI Engineering Exhibition Experience",
            langButtonText: "العربية"
        },
        ar: {
            brandSubtitle: "تجربة هندسة الذكاء الاصطناعي",
            heroEyebrow: "الذكاء الاصطناعي",
            heroTitle: 'اسأل الذكاء.<br><span>افهم الذكاء.</span><br>وابنِ المستقبل.',
            heroText: "اكتشف الذكاء الاصطناعي من خلال الأسئلة والأمثلة الواقعية والإجابات التفاعلية.",
            askButton: "اسأل سؤالاً",
            statusText: "جاهز",
            orbLabel: "الذكاء جاهز",
            featureOneTitle: "اسأل عن أي شيء",
            featureOneText: "من سؤال: ما هو الذكاء الاصطناعي؟ إلى أسئلة متقدمة في هندسة الذكاء الاصطناعي.",
            featureTwoTitle: "إجابات فورية",
            featureTwoText: "احصل على الشروح الفنية السريعة والعملية والواضحة.",
            featureThreeTitle: "تعلم بالأمثلة",
            featureThreeText: "شاهد كيف يرتبط الذكاء الاصطناعي بالوظائف والطب والسيارات والأعمال والحياة اليومية.",
            liveExperienceLabel: "تجربة مباشرة",
            chatTitle: "محادثتك مع الذكاء الاصطناعي",
            modePill: "الوضع النصي",
            assistantSubtitle: "مساعد هندسة الذكاء الاصطناعي",
            connectionText: "متصل",
            welcomeTitle: "ماذا تريد أن تكتشف؟",
            welcomeText: "اسأل سؤالاً أو اكتب رسالة واختبر الإجابة الفورية.",
            inputPlaceholder: "اسأل أي شيء عن الذكاء الاصطناعي...",
            sendButton: "إرسال",
            takeAILabel: "خذ الذكاء معك",
            qrTitle: "امسح. افتح. جرب.",
            qrText: "يمكن للزوار مسح رمز QR من أي هاتف وفتح التجربة مباشرة.",
            qrNote: "في المعرض، يمكن للزوار المسح لتجربة التطبيق على هواتفهم.",
            footerLabel: "تجربة معرض هندسة الذكاء الاصطناعي",
            langButtonText: "English"
        }
    };

    function updateLanguage(lang) {
        currentLang = lang;
        const t = translations[lang];
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

        for (const [id, value] of Object.entries(t)) {
            const el = document.getElementById(id);
            if (el) {
                if (id === "heroTitle") el.innerHTML = value;
                else el.textContent = value;
            }
        }
        if (languageButton) languageButton.textContent = t.langButtonText;
        if (messageInput) messageInput.placeholder = t.inputPlaceholder;
    }

    if (languageButton) {
        languageButton.addEventListener("click", () => {
            updateLanguage(currentLang === "en" ? "ar" : "en");
        });
    }

    if (askButton) {
        askButton.addEventListener("click", () => {
            messageInput.focus();
            messageInput.scrollIntoView({ behavior: "smooth" });
        });
    }

    if (newChatButton) {
        newChatButton.addEventListener("click", () => {
            chatHistory = [];
            messages.innerHTML = `
                <div class="welcome-card" id="welcomeCard">
                    <div class="welcome-icon">AI</div>
                    <div>
                        <h3 id="welcomeTitle">${translations[currentLang].welcomeTitle}</h3>
                        <p id="welcomeText">${translations[currentLang].welcomeText}</p>
                    </div>
                </div>`;
        });
    }

    document.querySelectorAll(".quick-prompts button").forEach(btn => {
        btn.addEventListener("click", () => {
            const q = btn.getAttribute("data-question");
            if (q) sendMessage(q);
        });
    });

    if (composer) {
        composer.addEventListener("submit", (e) => {
            e.preventDefault();
            const text = messageInput.value.trim();
            if (text) {
                sendMessage(text);
                messageInput.value = "";
            }
        });
    }

    async function sendMessage(text) {
        const welcome = document.getElementById("welcomeCard");
        if (welcome) welcome.remove();

        appendMessage("user", text);
        chatHistory.push({ role: "user", content: text });

        const loadingId = appendMessage("assistant", "...");

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: chatHistory, language: currentLang })
            });
            const data = await res.json();
            const loadingEl = document.getElementById(loadingId);

            if (data.answer) {
                if (loadingEl) loadingEl.textContent = data.answer;
                chatHistory.push({ role: "assistant", content: data.answer });
            } else {
                if (loadingEl) loadingEl.textContent = "Error: " + (data.error || "Failed to respond");
            }
        } catch (err) {
            const loadingEl = document.getElementById(loadingId);
            if (loadingEl) loadingEl.textContent = "Connection error. Please try again.";
        }
    }

    function appendMessage(role, content) {
        const msgDiv = document.createElement("div");
        const id = "msg-" + Date.now();
        msgDiv.id = id;
        msgDiv.className = `message ${role}-message`;
        msgDiv.textContent = content;
        messages.appendChild(msgDiv);
        messages.scrollTop = messages.scrollHeight;
        return id;
    }
});
