const AppState = { messages: [], currentChat: 1 };

// Real content: family words from textbook answer #277 (Grade 4 English).
const quizWords = [["father", "پلار"], ["mother", "مور"], ["brother", "ورور"], ["sister", "خور"], ["son", "زوی"], ["daughter", "لور"]];

const quizState = { pos: 0, score: 0, lock: false,
    queue: [0, 1, 2, 3, 4, 5], weak: [], mode: "en-ps", revising: false,
    kind: "word", sentWeak: [] };

// Progress persistence (localStorage, guarded): position, score,
// weak words and mode survive closing + reopening the app — the
// WebView persists localStorage across restarts. If storage is
// unavailable the quiz still works, just without persistence.
const SCHOOL_KEY = "beyondx-school-v1";
function saveProgress() {
    try {
        if (typeof localStorage === "undefined") return;
        localStorage.setItem(SCHOOL_KEY, JSON.stringify({
            pos: quizState.pos, score: quizState.score,
            weak: quizState.weak, mode: quizState.mode,
            revising: quizState.revising, queue: quizState.queue,
            kind: quizState.kind, sentWeak: quizState.sentWeak
        }));
    } catch (e) { /* storage unavailable — the quiz still works */ }
}
function loadProgress() {
    try {
        if (typeof localStorage === "undefined") return false;
        const raw = localStorage.getItem(SCHOOL_KEY);
        if (!raw) return false;
        const s = JSON.parse(raw);
        if (!s || !Array.isArray(s.queue) || !Array.isArray(s.weak)) return false;
        quizState.pos = s.pos || 0;
        quizState.score = s.score || 0;
        quizState.weak = s.weak;
        quizState.mode = s.mode === "ps-en" ? "ps-en" : "en-ps";
        quizState.revising = s.revising === true;
        quizState.queue = s.queue;
        quizState.kind = s.kind === "sentence" ? "sentence" : "word";
        quizState.sentWeak = Array.isArray(s.sentWeak) ? s.sentWeak : [];
        return true;
    } catch (e) { return false; }
}

function setAction(text) {
    const el = document.getElementById("actionLine");
    if (el) el.textContent = text;
}

function addMessage(text, who) {
    const chatArea = document.getElementById("chatArea");
    if (!chatArea) return;
    const msg = document.createElement("div");
    msg.className = "msg " + who;
    msg.textContent = text;
    chatArea.appendChild(msg);
    chatArea.scrollTop = chatArea.scrollHeight;
    AppState.messages.push({ text, who });
}

function showToast(text) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = text;
    toast.style.display = "block";
    toast.style.opacity = "1";
    setTimeout(() => {
        toast.style.display = "none";
        toast.style.opacity = "0";
    }, 2500);
}

function isIdentityQuestion(q) {
    return q.indexOf("چا جوړ") !== -1 || q.indexOf("جوړ کړی") !== -1 || q.indexOf("جوړونکی") !== -1 || q.indexOf("ستا نوم") !== -1 || q.indexOf("څوک یې") !== -1;
}

// School is HIDDEN until asked (arman correction 2026-11-20):
// this trigger reveals the quiz on a school question. Offline OK.
function isSchoolRequest(q) {
    return q.indexOf("ښوونځی") !== -1 || q.indexOf("کوئز") !== -1 || q.indexOf("انګلیسي") !== -1 || q.indexOf("درس") !== -1 || q.indexOf("زده کړم") !== -1 || q.indexOf("زده کړه") !== -1;
}

// Guest session (gateway v5): the chat route needs a short-lived
// server-issued token (30 min). Fetched once, cached in memory
// (never in localStorage — a token must not outlive its session),
// refreshed on expiry or 401. NO secret lives in the app — the
// token comes from the gateway itself.
var sessionToken = null;
var sessionExpiry = 0;
async function ensureSession() {
    if (sessionToken && Date.now() < sessionExpiry - 30000) return sessionToken;
    const resp = await fetch("https://beyond-build-gateway.aramnarmani408.workers.dev/api/v1/x/session/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: "beyondx", app_version: "1.0.0", platform: "android" })
    });
    if (!resp.ok) throw new Error("Session");
    const data = await resp.json();
    if (!data || typeof data.access_token !== "string" || !data.access_token
        || typeof data.expires_in !== "number" || data.expires_in <= 0) throw new Error("Session");
    sessionToken = data.access_token;
    sessionExpiry = Date.now() + data.expires_in * 1000;
    return sessionToken;
}
async function xChat(question, token) {
    const resp = await fetch("https://beyond-build-gateway.aramnarmani408.workers.dev/api/v1/x/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ message: { text: question },
            preferences: { language: "ps", response_language: "ps", stream: false },
            context: { workspace: "chat" } })
    });
    if (resp.status === 401) throw new Error("Unauthorized");
    if (!resp.ok) throw new Error("Network");
    const data = await resp.json();
    // Never render raw provider text: show ONLY a contract-valid answer.
    if (!data || data.status !== "success" || !data.response
        || data.response.identity !== "beyondx"
        || typeof data.response.text !== "string"
        || data.response.text.length === 0) throw new Error("Bad response");
    return data.response.text;
}

async function askBeyond(question) {
    // Identity is answered LOCALLY, never by the model: the free model
    // claims OpenAI made it even when instructed otherwise (proven
    // 2026-11-20). The app states its own identity.
    if (isIdentityQuestion(question)) {
        setAction("ځواب ورکوم");
        addMessage("زه BEYOND X یم، د BEYOND AI جوړ کړی هوښیار مرستیال یم.", "ai");
        setAction("چمتو یم");
        return;
    }
    setAction("فکر کوم...");
    try {
        // The app NEVER calls a model directly. It talks to BEYOND's
        // gateway (keys server-side, Safety Net lanes, identity +
        // Pashto enforced, every answer validated). Raw question,
        // no prefix — the gateway applies its own system prompt.
        let token = await ensureSession();
        let text;
        try {
            text = await xChat(question, token);
        } catch (e) {
            // One refresh + one retry on 401, then the honest message.
            if (e.message !== "Unauthorized") throw e;
            sessionToken = null;
            sessionExpiry = 0;
            token = await ensureSession();
            text = await xChat(question, token);
        }
        setAction("ځواب ورکوم");
        addMessage(text, "ai");
    } catch (e) {
        addMessage("انټرنیټ نشته یا ځواب ونه رسېد — بیا هڅه وکړه", "ai");
    } finally {
        setAction("چمتو یم");
    }
}

function sendQuestion() {
    const input = document.getElementById("askInput");
    if (!input) return;
    const q = input.value.trim();
    if (!q) return;
    addMessage(q, "user");
    input.value = "";
    if (isSchoolRequest(q)) {
        showPanel("school");
        addMessage("د ښوونځي کوئز دې لپاره جوړ شو — لوبه وکړه!", "ai");
    }
    askBeyond(q);
}

function showPanel(name) {
    const chatPanel = document.getElementById("chatPanel");
    const schoolPanel = document.getElementById("schoolPanel");
    if (chatPanel) chatPanel.style.display = name === "chat" ? "flex" : "none";
    if (schoolPanel) schoolPanel.style.display = name === "school" ? "flex" : "none";
}

function startQuiz() {
    quizState.pos = 0;
    quizState.score = 0;
    quizState.lock = false;
    quizState.queue = [0, 1, 2, 3, 4, 5];
    quizState.revising = false;
    quizState.kind = "word";
    saveProgress();
    showQuizQuestion();
}

// Sentence-completion quiz data: the 87 textbook words that have a
// verbatim example sentence (vocab.js, generated from the verified
// extraction). Guarded — the word quiz works without it.
function vocabItems() {
    if (typeof VOCAB === "undefined" || !Array.isArray(VOCAB)) return [];
    return VOCAB;
}
function startSentenceQuiz() {
    const items = vocabItems();
    const feedbackEl = document.getElementById("quizFeedback");
    if (items.length === 0) {
        if (feedbackEl) feedbackEl.textContent = "د جملو لغتونه نشته";
        return;
    }
    quizState.pos = 0;
    quizState.score = 0;
    quizState.lock = false;
    quizState.queue = items.map(function (it, i) { return i; });
    quizState.revising = false;
    quizState.kind = "sentence";
    saveProgress();
    showQuizQuestion();
}
// Distractors: words from the same chapter first, then others.
function sentenceOptions(idx) {
    const items = vocabItems();
    const correct = items[idx].en;
    const ch = items[idx].chapter;
    const pool = [];
    for (let i = 0; i < items.length; i++) {
        if (i !== idx && items[i].chapter === ch) pool.push(items[i].en);
    }
    for (let i = 0; i < items.length && pool.length < 3; i++) {
        if (i !== idx && items[i].chapter !== ch) pool.push(items[i].en);
    }
    const options = [correct].concat(pool.slice(0, 3));
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = options[i]; options[i] = options[j]; options[j] = t;
    }
    return options;
}

// Revision queue: the words the learner got wrong, re-presented
// until they answer them right. The weak list is the mastery
// record — it survives restarts (saved with the progress).
function startRevision() {
    const feedbackEl = document.getElementById("quizFeedback");
    const weakList = quizState.kind === "sentence" ? quizState.sentWeak : quizState.weak;
    if (weakList.length === 0) {
        if (feedbackEl) feedbackEl.textContent = "کمزورې کلمې نشته — ټولې زده شوې!";
        return;
    }
    quizState.pos = 0;
    quizState.score = 0;
    quizState.lock = false;
    quizState.queue = weakList.slice();
    quizState.revising = true;
    saveProgress();
    showQuizQuestion();
}

// Direction toggle: English→Pashto (default) or Pashto→English
// (the reverse exercise — the same real words, the other way).
function toggleMode() {
    if (quizState.kind !== "word") return; // direction is for the word quiz only
    quizState.mode = quizState.mode === "en-ps" ? "ps-en" : "en-ps";
    const modeBtn = document.getElementById("modeBtn");
    if (modeBtn) modeBtn.textContent = quizState.mode === "en-ps" ? "↔ پښتو ← انګلیسي" : "↔ انګلیسي ← پښتو";
    startQuiz();
}

function showQuizQuestion() {
    const wordEl = document.getElementById("quizWord");
    const optionsEl = document.getElementById("quizOptions");
    const feedbackEl = document.getElementById("quizFeedback");
    const scoreEl = document.getElementById("quizScore");
    const resultEl = document.getElementById("quizResult");
    if (!wordEl || !optionsEl) return;
    if (feedbackEl) feedbackEl.textContent = "";
    if (resultEl) resultEl.textContent = "";
    if (scoreEl) scoreEl.textContent = quizState.score + "/" + quizState.queue.length;
    if (quizState.pos >= quizState.queue.length) {
        wordEl.textContent = "بشپړ شو!";
        const total = quizState.queue.length;
        const pct = total > 0 ? Math.round(quizState.score / total * 100) : 0;
        if (feedbackEl) feedbackEl.textContent = quizState.score + "/" + total;
        if (resultEl) {
            let r = "پایله: " + pct + "%";
            const weakList = quizState.kind === "sentence" ? quizState.sentWeak : quizState.weak;
            if (weakList.length > 0) {
                const names = weakList.map(function (i) {
                    return quizState.kind === "sentence" ? vocabItems()[i].en : quizWords[i][0];
                });
                r += " — کمزورې کلمې: " + names.join("، ");
            } else {
                r += " — ټولې کلمې زده شوې!";
            }
            resultEl.textContent = r;
        }
        while (optionsEl.firstChild) optionsEl.removeChild(optionsEl.firstChild);
        saveProgress();
        return;
    }
    quizState.lock = false;
    const modeBtn = document.getElementById("modeBtn");
    if (modeBtn) modeBtn.style.display = quizState.kind === "sentence" ? "none" : "";
    const idx = quizState.queue[quizState.pos];
    let prompt, options;
    if (quizState.kind === "sentence") {
        // Sentence completion: the verbatim example with the word
        // blanked out; the learner picks the missing word.
        const item = vocabItems()[idx];
        prompt = item.example.replace(new RegExp(item.en, "i"), "___");
        wordEl.style.fontSize = "18px";
        options = sentenceOptions(idx);
    } else {
        const pair = quizWords[idx];
        const promptCol = quizState.mode === "en-ps" ? 0 : 1;
        const answerCol = 1 - promptCol;
        prompt = pair[promptCol];
        wordEl.style.fontSize = "";
        const correct = pair[answerCol];
        options = [correct];
        for (let i = 1; i <= 3; i++) {
            options.push(quizWords[(idx + i) % quizWords.length][answerCol]);
        }
        // Randomized option order (ChatGPT stage-2 acceptance): the
        // correct answer is not in a predictable position.
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const t = options[i]; options[i] = options[j]; options[j] = t;
        }
    }
    wordEl.textContent = prompt;
    while (optionsEl.firstChild) optionsEl.removeChild(optionsEl.firstChild);
    for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        const btn = document.createElement("button");
        btn.className = "quiz-opt";
        btn.textContent = opt;
        btn.addEventListener("click", function () { answerQuiz(opt); });
        optionsEl.appendChild(btn);
    }
}

function answerQuiz(chosen) {
    if (quizState.lock) return;
    quizState.lock = true;
    const idx = quizState.queue[quizState.pos];
    let correct;
    if (quizState.kind === "sentence") {
        correct = vocabItems()[idx].en;
    } else {
        const answerCol = quizState.mode === "en-ps" ? 1 : 0;
        correct = quizWords[idx][answerCol];
    }
    const weakList = quizState.kind === "sentence" ? quizState.sentWeak : quizState.weak;
    const feedbackEl = document.getElementById("quizFeedback");
    const scoreEl = document.getElementById("quizScore");
    if (chosen === correct) {
        quizState.score += 1;
        if (feedbackEl) feedbackEl.textContent = "سم دی ✓";
        // A weak word answered right is no longer weak.
        const w = weakList.indexOf(idx);
        if (w !== -1) weakList.splice(w, 1);
    } else {
        if (feedbackEl) feedbackEl.textContent = "غلط دی — سم ځواب: " + correct;
        if (weakList.indexOf(idx) === -1) weakList.push(idx);
    }
    if (scoreEl) scoreEl.textContent = quizState.score + "/" + quizState.queue.length;
    quizState.pos += 1;
    saveProgress();
    setTimeout(showQuizQuestion, 1200);
}

const drawerBtn = document.getElementById("drawerBtn");
const drawer = document.getElementById("drawer");
const newChatBtn = document.getElementById("newChatBtn");
const chatArea = document.getElementById("chatArea");
const sendBtn = document.getElementById("sendBtn");
const askInput = document.getElementById("askInput");
const quizRestart = document.getElementById("quizRestart");
const reviseBtn = document.getElementById("reviseBtn");
const modeBtn = document.getElementById("modeBtn");
const wordBtn = document.getElementById("wordBtn");
const sentBtn = document.getElementById("sentBtn");
const backChat = document.getElementById("backChat");

if (drawerBtn && drawer) {
    drawerBtn.addEventListener("click", () => drawer.classList.toggle("open"));
}

if (newChatBtn && chatArea) {
    newChatBtn.addEventListener("click", () => {
        while (chatArea.firstChild) chatArea.removeChild(chatArea.firstChild);
        AppState.messages = [];
        AppState.currentChat++;
        setAction("چمتو یم");
    });
}

if (sendBtn) sendBtn.addEventListener("click", sendQuestion);
if (askInput) {
    askInput.addEventListener("keydown", e => {
        if (e.key === "Enter") sendQuestion();
    });
}

if (quizRestart) quizRestart.addEventListener("click", startQuiz);

if (reviseBtn) reviseBtn.addEventListener("click", startRevision);

if (modeBtn) modeBtn.addEventListener("click", toggleMode);

if (wordBtn) wordBtn.addEventListener("click", startQuiz);

if (sentBtn) {
    sentBtn.addEventListener("click", startSentenceQuiz);
    if (vocabItems().length === 0) sentBtn.style.display = "none";
}

if (backChat) backChat.addEventListener("click", () => showPanel("chat"));

// Resume saved progress if there is any; otherwise start fresh.
if (!loadProgress()) startQuiz();
else if (quizState.kind === "sentence" && vocabItems().length === 0) startQuiz();
else showQuizQuestion();
setAction("چمتو یم");
