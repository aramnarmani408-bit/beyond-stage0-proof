const AppState = { messages: [], currentChat: 1 };

// Real content: family words from textbook answer #277 (Grade 4 English).
const quizWords = [["father", "پلار"], ["mother", "مور"], ["brother", "ورور"], ["sister", "خور"], ["son", "زوی"], ["daughter", "لور"]];

const quizState = { pos: 0, score: 0, lock: false };

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

async function askBeyond(question) {
    // Identity is answered LOCALLY, never by the model: the free model
    // claims OpenAI made it even when instructed otherwise (proven by
    // curl 2026-11-20 — it answered "زه د OpenAI لخوا ... جوړ شوی یم"
    // despite the BEYOND X instruction). The app states its own identity.
    if (isIdentityQuestion(question)) {
        setAction("ځواب ورکوم");
        addMessage("زه BEYOND X یم، د BEYOND AI جوړ کړی هوښیار مرستیال یم.", "ai");
        setAction("چمتو یم");
        return;
    }
    setAction("فکر کوم...");
    try {
        // The app NEVER calls a model directly. It talks to BEYOND's
        // gateway, which holds the keys server-side, routes through
        // BEYOND's Safety Net lanes in BEYOND's order, enforces
        // Pashto-first + the BEYOND X identity, and validates every
        // answer. The gateway applies its own system prompt — the app
        // sends the raw question, no prefix. (Pollinations was the
        // interim backend; the gateway switch landed 2026-11-20.)
        const resp = await fetch("https://beyond-build-gateway.aramnarmani408.workers.dev/api/v1/x/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: { text: question },
                preferences: { language: "ps", response_language: "ps", stream: false },
                context: { workspace: "chat" } })
        });
        if (!resp.ok) throw new Error("Network");
        const data = await resp.json();
        // Presentation layer: never render raw provider text. The
        // answer is shown ONLY if the gateway contract validates.
        if (!data || data.status !== "success" || !data.response
            || data.response.identity !== "beyondx"
            || typeof data.response.text !== "string"
            || data.response.text.length === 0) throw new Error("Bad response");
        setAction("ځواب ورکوم");
        addMessage(data.response.text, "ai");
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
    showQuizQuestion();
}

function showQuizQuestion() {
    const wordEl = document.getElementById("quizWord");
    const optionsEl = document.getElementById("quizOptions");
    const feedbackEl = document.getElementById("quizFeedback");
    const scoreEl = document.getElementById("quizScore");
    if (!wordEl || !optionsEl) return;
    if (feedbackEl) feedbackEl.textContent = "";
    if (scoreEl) scoreEl.textContent = quizState.score + "/" + quizWords.length;
    if (quizState.pos >= quizWords.length) {
        wordEl.textContent = "بشپړ شو!";
        if (feedbackEl) feedbackEl.textContent = quizState.score + "/" + quizWords.length;
        while (optionsEl.firstChild) optionsEl.removeChild(optionsEl.firstChild);
        return;
    }
    quizState.lock = false;
    wordEl.textContent = quizWords[quizState.pos][0];
    while (optionsEl.firstChild) optionsEl.removeChild(optionsEl.firstChild);
    const correct = quizWords[quizState.pos][1];
    const options = [correct];
    for (let i = 1; i <= 3; i++) {
        options.push(quizWords[(quizState.pos + i) % quizWords.length][1]);
    }
    // Deterministic rotation: the correct answer sits at a different
    // position each question (pos % 4) — varied, no randomness.
    const rot = quizState.pos % 4;
    for (let i = 0; i < 4; i++) {
        const opt = options[(i + rot) % 4];
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
    const correct = quizWords[quizState.pos][1];
    const feedbackEl = document.getElementById("quizFeedback");
    const scoreEl = document.getElementById("quizScore");
    if (chosen === correct) {
        quizState.score += 1;
        if (feedbackEl) feedbackEl.textContent = "سم دی ✓";
    } else {
        if (feedbackEl) feedbackEl.textContent = "غلط دی — سم ځواب: " + correct;
    }
    if (scoreEl) scoreEl.textContent = quizState.score + "/" + quizWords.length;
    quizState.pos += 1;
    setTimeout(showQuizQuestion, 1200);
}

const drawerBtn = document.getElementById("drawerBtn");
const drawer = document.getElementById("drawer");
const newChatBtn = document.getElementById("newChatBtn");
const chatArea = document.getElementById("chatArea");
const sendBtn = document.getElementById("sendBtn");
const askInput = document.getElementById("askInput");
const quizRestart = document.getElementById("quizRestart");
const tabs = document.querySelectorAll(".tab");

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

if (sendBtn) sendQuestion;
if (sendBtn) sendBtn.addEventListener("click", sendQuestion);
if (askInput) {
    askInput.addEventListener("keydown", e => {
        if (e.key === "Enter") sendQuestion();
    });
}

if (quizRestart) quizRestart.addEventListener("click", startQuiz);

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        if (tab.dataset.tab === "chat") {
            showPanel("chat");
        } else if (tab.dataset.tab === "school") {
            showPanel("school");
        } else {
            showToast("په راتلونکي پړاو کې راځي");
        }
    });
});

startQuiz();
setAction("چمتو یم");
