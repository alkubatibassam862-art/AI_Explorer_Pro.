const state = {
    language: localStorage.getItem("aiExplorerLanguage") || "ar",
    messages: [],
    waiting: false,
    realtime: {
        pc: null,
        dc: null,
        localStream: null,
        active: false
    }
};

const el = (id) => document.getElementById(id);

const translations = {
    en: {
        languageButton: "العربية",
        installApp: "Install App",
        brandSubtitle: "AI ENGINEERING EXPERIENCE",
        heroEyebrow: "ARTIFICIAL INTELLIGENCE",
        orbReady: "AI READY",
        liveExperience: "LIVE EXPERIENCE",
        mic: "MIC",
        takeAI: "TAKE AI WITH YOU",
        newChat: "New Chat",
        heroTitle: "Ask AI.<br><span>Understand AI.</span><br>Build the future.",
        heroText: "Explore Artificial Intelligence through conversation, voice, real examples, and interactive answers.",
        talkButton: "Talk to AI",
        askButton: "Ask a question",
        ready: "Ready",
        featureOneTitle: "Ask anything",
        featureOneText: "From “What is AI?” to advanced AI Engineering questions.",
        featureTwoTitle: "Speak naturally",
        featureTwoText: "Use your microphone and have a real-time voice conversation.",
        featureThreeTitle: "Learn by examples",
        featureThreeText: "See how AI connects to jobs, medicine, cars, business, and daily life.",
        chatTitle: "Your AI conversation",
        textMode: "TEXT MODE",
        assistantSubtitle: "AI Engineering Assistant",
        online: "Online",
        welcomeTitle: "What would you like to discover?",
        welcomeText: "Ask a question, type a message, or start a voice conversation.",
        inputPlaceholder: "Ask anything about AI...",
        send: "Send",
        voiceTitle: "Talk to AI like a conversation.",
        voiceText: "Press the microphone, speak naturally, pause when you finish, and AI Explorer will answer with a live voice response.",
        startVoice: "Start voice",
        endConversation: "End conversation",
        microphoneHint: "Microphone permission is required the first time.",
        voiceOff: "VOICE OFF",
        voiceReady: "VOICE READY",
        listening: "LISTENING",
        speaking: "AI SPEAKING",
        qrTitle: "Scan. Open. Talk.",
        qrText: "Visitors can scan this QR code with any phone and open the AI Explorer experience.",
        qrNote: "For the exhibition, use a public HTTPS URL so visitors do not need to be on the same Wi-Fi network.",
        textModePill: "TEXT MODE",
        voiceModePill: "VOICE MODE",
        thinking: "Thinking...",
        connectionError: "Connection error. Please try again.",
        voiceError: "Voice chat could not be started right now. Please check microphone permission and internet access, then try again.",
        realTimeVoice: "REAL-TIME VOICE",
        exhibitionLabel: "AI Engineering Exhibition Experience",
        quickQuestions: [
            ["What is AI?", "What is Artificial Intelligence? Explain it simply."],
            ["Can AI take jobs?", "Can Artificial Intelligence take people's jobs? Give me a balanced explanation with examples."],
            ["AI vs ML vs DL", "What is the difference between AI, Machine Learning, and Deep Learning?"],
            ["What can I build?", "What can I build as a beginner AI Engineering student?"],
            ["AI careers", "What careers can I have after studying AI Engineering?"]
        ]
    },
    ar: {
        languageButton: "English",
        installApp: "تثبيت التطبيق",
        brandSubtitle: "تجربة هندسة الذكاء الاصطناعي",
        heroEyebrow: "الذكاء الاصطناعي",
        orbReady: "الذكاء جاهز",
        liveExperience: "تجربة مباشرة",
        mic: "ميكروفون",
        takeAI: "خذ الذكاء الاصطناعي معك",
        newChat: "محادثة جديدة",
        heroTitle: "اسأل الذكاء.<br><span>افهم الذكاء.</span><br>وابنِ المستقبل.",
        heroText: "اكتشف الذكاء الاصطناعي من خلال المحادثة والصوت والأمثلة الواقعية والإجابات التفاعلية.",
        talkButton: "تحدث مع AI",
        askButton: "اسأل سؤالاً",
        ready: "جاهز",
        featureOneTitle: "اسأل عن أي شيء",
        featureOneText: "من سؤال: ما هو الذكاء الاصطناعي؟ إلى أسئلة متقدمة في هندسة الذكاء الاصطناعي.",
        featureTwoTitle: "تحدث بشكل طبيعي",
        featureTwoText: "استخدم الميكروفون وتحدث مع الذكاء الاصطناعي في الوقت الحقيقي.",
        featureThreeTitle: "تعلم بالأمثلة",
        featureThreeText: "شاهد كيف يرتبط الذكاء الاصطناعي بالوظائف والطب والسيارات والأعمال والحياة اليومية.",
        chatTitle: "محادثتك مع الذكاء الاصطناعي",
        textMode: "الوضع النصي",
        assistantSubtitle: "مساعد هندسة الذكاء الاصطناعي",
        online: "متصل",
        welcomeTitle: "ماذا تريد أن تكتشف؟",
        welcomeText: "اسأل سؤالاً أو اكتب رسالة أو ابدأ محادثة صوتية.",
        inputPlaceholder: "اسأل أي شيء عن الذكاء الاصطناعي...",
        send: "إرسال",
        voiceTitle: "تحدث مع الذكاء الاصطناعي كمحادثة حقيقية.",
        voiceText: "اضغط على الميكروفون وتحدث بشكل طبيعي، وعندما تتوقف سيجيبك AI Explorer بصوت مباشر.",
        startVoice: "ابدأ الصوت",
        endConversation: "إنهاء المحادثة",
        microphoneHint: "سيطلب المتصفح إذن استخدام الميكروفون في المرة الأولى.",
        voiceOff: "الصوت متوقف",
        voiceReady: "الصوت جاهز",
        listening: "يستمع الآن",
        speaking: "AI يتحدث",
        qrTitle: "امسح. افتح. تحدث.",
        qrText: "يستطيع الزوار مسح رمز QR من أي هاتف وفتح تجربة AI Explorer.",
        textModePill: "الوضع النصي",
        voiceModePill: "الوضع الصوتي",
        thinking: "يفكر...",
        connectionError: "حدث خطأ في الاتصال. حاول مرة أخرى.",
        voiceError: "تعذر تشغيل المحادثة الصوتية الآن. تحقق من صلاحية الميكروفون والاتصال بالإنترنت ثم حاول مرة أخرى.",
        realTimeVoice: "الصوت في الوقت الحقيقي",
        exhibitionLabel: "تجربة معرض هندسة الذكاء الاصطناعي",
        quickQuestions: [
            ["ما هو الذكاء الاصطناعي؟", "ما هو الذكاء الاصطناعي؟ اشرحه لي ببساطة."],
            ["هل سيأخذ الذكاء الاصطناعي الوظائف؟", "هل يستطيع الذكاء الاصطناعي أخذ وظائف البشر؟ أعطني شرحاً متوازناً مع أمثلة."],
            ["الذكاء الاصطناعي مقابل تعلم الآلة والتعلم العميق", "ما الفرق بين الذكاء الاصطناعي وتعلم الآلة والتعلم العميق؟"],
            ["ماذا أستطيع أن أبني؟", "ماذا أستطيع أن أبني كطالب مبتدئ في هندسة الذكاء الاصطناعي؟"],
            ["وظائف الذكاء الاصطناعي", "ما الوظائف والمسارات المهنية التي أستطيع العمل فيها بعد دراسة هندسة الذكاء الاصطناعي؟"]
        ]
    }
};

function t(key) {
    return translations[state.language][key] || key;
}

function setLanguage(language) {
    state.language = language;
    localStorage.setItem("aiExplorerLanguage", language);
    document.body.classList.toggle("rtl", language === "ar");
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

    el("languageButton").textContent = t("languageButton");
    el("installAppButton").textContent = t("installApp");
    el("brandSubtitle").textContent = t("brandSubtitle");
    el("heroEyebrow").textContent = t("heroEyebrow");
    el("orbLabel").textContent = t("orbReady");
    el("liveExperienceLabel").textContent = t("liveExperience");
    el("takeAILabel").textContent = t("takeAI");
    el("voiceMessageButton").textContent = t("mic");
    el("micSymbol").textContent = t("mic");
    el("newChatButton").textContent = t("newChat");
    el("heroTitle").innerHTML = t("heroTitle");
    el("heroText").textContent = t("heroText");
    el("talkButton").textContent = t("talkButton");
    el("askButton").textContent = t("askButton");
    el("statusText").textContent = t("ready");
    el("featureOneTitle").textContent = t("featureOneTitle");
    el("featureOneText").textContent = t("featureOneText");
    el("featureTwoTitle").textContent = t("featureTwoTitle");
    el("featureTwoText").textContent = t("featureTwoText");
    el("featureThreeTitle").textContent = t("featureThreeTitle");
    el("featureThreeText").textContent = t("featureThreeText");
    el("chatTitle").textContent = t("chatTitle");
    el("modePill").textContent = state.realtime.active ? t("voiceModePill") : t("textModePill");
    el("assistantSubtitle").textContent = t("assistantSubtitle");
    el("connectionText").textContent = t("online");
    el("welcomeTitle").textContent = t("welcomeTitle");
    el("welcomeText").textContent = t("welcomeText");
    el("messageInput").placeholder = t("inputPlaceholder");
    el("sendButton").textContent = t("send");
    el("voiceTitle").textContent = t("voiceTitle");
    el("voiceText").textContent = t("voiceText");
    el("voiceButtonText").textContent = state.realtime.active ? t("voiceReady") : t("startVoice");
    el("voiceStopButton").textContent = t("endConversation");
    el("voiceHint").textContent = t("microphoneHint");
    el("voiceState").textContent = state.realtime.active ? t("voiceReady") : t("voiceOff");
    el("qrTitle").textContent = t("qrTitle");
    el("qrText").textContent = t("qrText");
    el("qrNote").textContent = t("qrNote");
    el("realTimeVoiceLabel").textContent = t("realTimeVoice");
    el("footerLabel").textContent = t("exhibitionLabel");
    document.querySelectorAll(".quick-prompts button").forEach((button, index) => {
        const question = t("quickQuestions")[index];
        if (question) {
            button.textContent = question[0];
            button.dataset.question = question[1];
        }
    });
}

function addMessage(role, content) {
    const wrapper = document.createElement("div");
    wrapper.className = `message ${role}`;

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = content;

    const meta = document.createElement("div");
    meta.className = "message-meta";
    meta.textContent = role === "user" ? (state.language === "ar" ? "أنت" : "YOU") : "AI EXPLORER";

    wrapper.appendChild(bubble);
    wrapper.appendChild(meta);
    el("messages").appendChild(wrapper);
    el("messages").scrollTop = el("messages").scrollHeight;
}

function addTyping() {
    const wrapper = document.createElement("div");
    wrapper.className = "message assistant";
    wrapper.id = "typingMessage";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble typing";
    bubble.innerHTML = "<span></span><span></span><span></span>";

    wrapper.appendChild(bubble);
    el("messages").appendChild(wrapper);
    el("messages").scrollTop = el("messages").scrollHeight;
}

function removeTyping() {
    const item = el("typingMessage");
    if (item) item.remove();
}

async function sendText(text) {
    const clean = text.trim();
    if (!clean || state.waiting) return;

    state.waiting = true;
    el("messageInput").value = "";
    el("sendButton").disabled = true;
    el("statusText").textContent = t("thinking");

    const welcome = el("welcomeCard");
    if (welcome) welcome.remove();

    state.messages.push({ role: "user", content: clean });
    addMessage("user", clean);
    addTyping();

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: state.messages, language: state.language })
        });

        const data = await response.json();
        removeTyping();

        if (!response.ok) {
            throw new Error(data.error || t("connectionError"));
        }

        const answer = data.answer || t("connectionError");
        state.messages.push({ role: "assistant", content: answer });
        addMessage("assistant", answer);
    } catch (error) {
        removeTyping();
        addMessage("assistant", error.message || t("connectionError"));
    } finally {
        state.waiting = false;
        el("sendButton").disabled = false;
        el("statusText").textContent = t("ready");
    }
}

async function startVoice() {
    if (state.realtime.active) return;

    let stream = null;
    let pc = null;

    try {
        if (!window.isSecureContext && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
            throw new Error(t("voiceError"));
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error(t("voiceError"));
        }

        stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });

        pc = new RTCPeerConnection();
        const dc = pc.createDataChannel("oai-events");
        const remoteAudio = el("remoteAudio");

        pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                remoteAudio.srcObject = event.streams[0];
                remoteAudio.play().catch(() => {});
            }
        };

        pc.onconnectionstatechange = () => {
            if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
                setVoiceVisual(false, t("voiceOff"));
            }
        };

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        dc.onopen = () => {
            state.realtime.active = true;
            state.realtime.pc = pc;
            state.realtime.dc = dc;
            state.realtime.localStream = stream;
            setVoiceVisual(true, t("voiceReady"));
            el("modePill").textContent = t("voiceModePill");
            el("statusText").textContent = t("voiceReady");
        };

        dc.onmessage = (event) => {
            try {
                handleRealtimeEvent(JSON.parse(event.data));
            } catch (_) {
                return;
            }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const response = await fetch("/api/realtime/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sdp: pc.localDescription.sdp, language: state.language })
        });

        if (!response.ok) {
            await response.text();
            throw new Error(t("voiceError"));
        }

        const answer = await response.text();
        await pc.setRemoteDescription({ type: "answer", sdp: answer });
    } catch (error) {
        console.error("Voice error:", error);
        if (stream) stream.getTracks().forEach((track) => track.stop());
        if (pc) {
            try { pc.close(); } catch (_) {}
        }
        state.realtime.pc = null;
        state.realtime.dc = null;
        state.realtime.localStream = null;
        state.realtime.active = false;
        setVoiceVisual(false, t("voiceOff"));
        el("statusText").textContent = t("voiceError");
    }
}
function handleRealtimeEvent(event) {
    if (event.type === "input_audio_buffer.speech_started") {
        setVoiceVisual(true, t("listening"));
    }

    if (event.type === "input_audio_buffer.speech_stopped") {
        setVoiceVisual(true, t("voiceReady"));
    }

    if (event.type === "response.created") {
        setVoiceVisual(true, t("speaking"));
    }

    if (event.type === "response.audio_transcript.done") {
        const transcript = event.transcript || "";
        if (transcript.trim()) {
            const welcome = el("welcomeCard");
            if (welcome) welcome.remove();
            addMessage("assistant", transcript.trim());
        }
    }

    if (event.type === "conversation.item.input_audio_transcription.completed") {
        const transcript = event.transcript || "";
        if (transcript.trim()) {
            const welcome = el("welcomeCard");
            if (welcome) welcome.remove();
            addMessage("user", transcript.trim());
        }
    }

    if (event.type === "error") {
        console.error("Realtime event error:", event);
        stopVoice();
        el("statusText").textContent = t("voiceError");
    }
}

function stopVoice() {
    const realtime = state.realtime;

    if (realtime.dc) {
        try { realtime.dc.close(); } catch (_) {}
    }

    if (realtime.pc) {
        try { realtime.pc.close(); } catch (_) {}
    }

    if (realtime.localStream) {
        realtime.localStream.getTracks().forEach((track) => track.stop());
    }

    realtime.pc = null;
    realtime.dc = null;
    realtime.localStream = null;
    realtime.active = false;

    setVoiceVisual(false, t("voiceOff"));
    el("modePill").textContent = t("textModePill");
    el("statusText").textContent = t("ready");
}

function setVoiceVisual(active, label) {
    el("voiceOrb").classList.toggle("active", active);
    el("voiceState").textContent = label;
    el("voiceButtonText").textContent = active ? t("voiceReady") : t("startVoice");
}

function resetChat() {
    state.messages = [];
    el("messages").innerHTML = `
        <div class="welcome-card" id="welcomeCard">
            <div class="welcome-icon">AI</div>
            <div>
                <h3 id="welcomeTitle">${t("welcomeTitle")}</h3>
                <p id="welcomeText">${t("welcomeText")}</p>
            </div>
        </div>
    `;
    el("messageInput").value = "";
    el("statusText").textContent = t("ready");
}

el("languageButton").addEventListener("click", () => {
    setLanguage(state.language === "en" ? "ar" : "en");
});

el("newChatButton").addEventListener("click", resetChat);

el("askButton").addEventListener("click", () => {
    el("messageInput").focus();
    document.querySelector(".experience").scrollIntoView({ behavior: "smooth", block: "start" });
});

el("talkButton").addEventListener("click", () => {
    document.querySelector(".voice-section").scrollIntoView({ behavior: "smooth", block: "center" });
    if (!state.realtime.active) startVoice();
});

el("composer").addEventListener("submit", (event) => {
    event.preventDefault();
    sendText(el("messageInput").value);
});

el("voiceMessageButton").addEventListener("click", () => {
    if (state.realtime.active) stopVoice();
    else startVoice();
});

el("voiceMainButton").addEventListener("click", () => {
    if (state.realtime.active) stopVoice();
    else startVoice();
});

el("voiceStopButton").addEventListener("click", stopVoice);

document.querySelectorAll(".quick-prompts button").forEach((button) => {
    button.addEventListener("click", () => sendText(button.dataset.question));
});

setLanguage(state.language);


let deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    const installButton = el("installAppButton");
    if (installButton) installButton.hidden = false;
});

const installButton = el("installAppButton");
if (installButton) {
    installButton.addEventListener("click", async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        installButton.hidden = true;
    });
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("/static/service-worker.js").catch(() => {}));
}
