var retryEl = null;
var stopBtn = null;
// The demo-row pool + rotation counter (neon2.js is at the push limit).
var DEMO_KEY = "beyondx-demo-v1";
var DEMO_POOL = ["د الفاتحې سورت وښیه", "زما د موبایل روغتیا وګوره", "انګلیسي زده کړم", "یو انځور جوړ کړه: غرونه", "۵ + ۳ څومره کېږي؟", "«سلام» په انګلیسي څه کېږي؟", "یو پروګرام ولیکه چې «سلام» چاپ کړي", "زما بیټرۍ څومره ده؟", "یو کوئز جوړ کړه", "د پښتو یو کتاب ولټوه", "«سلام» په غږ واوره", "یو ساده لوبه جوړ کړه"];
function demoCount() {
    try {
        if (typeof localStorage === "undefined") return 0;
        var n = parseInt(localStorage.getItem(DEMO_KEY) || "0", 10);
        return isNaN(n) ? 0 : n;
    } catch (e) { return 0; }
}
function hideRetry() {
    if (!retryEl) return;
    const chatArea = document.getElementById("chatArea");
    if (chatArea) { try { chatArea.removeChild(retryEl); } catch (e) {} }
    retryEl = null;
}
// Phase 2 hooks (avatar.js).
function gs(s) { if (typeof setGenState === "function") setGenState(s); }
function maybeWow() { if (typeof laeIsFirstAnswer === "function" && laeIsFirstAnswer() && typeof wowShow === "function") wowShow(); }
function showRetry() {
    const chatArea = document.getElementById("chatArea");
    if (!chatArea || retryEl) return;
    const b = document.createElement("button");
    b.textContent = "بیا هڅه وکړه";
    b.addEventListener("click", function () {
        hideRetry();
        if (AppState.lastQuestion) askBeyond(AppState.lastQuestion);
    });
    chatArea.appendChild(b);
    retryEl = b;
}
async function askBeyond(question) {
    AppState.lastQuestion = question;
    // L.A.E. local handling first — no gateway call for these.
    if (typeof laeCommand === "function" && laeCommand(question)) return;
    // Phase 2: customization.
    if (typeof customCommand === "function" && customCommand(question)) return;
    if (isIdentityQuestion(question)) {
        setAction("ځواب ورکوم");
        addMessage("زه BEYOND X یم، د ارمان جوړ کړی هوښیار مرستیال یم.", "ai");
        // REQ-ANSWER-007: the identity answer counts as the first answer.
        maybeWow();
        if (typeof laeMarkAnswered === "function") laeMarkAnswered();
        setAction("چمتو یم");
        return;
    }
    setAction("فکر کوم...");
    gs("generating");
    chatState.status = "busy";
    if (stopBtn) stopBtn.style.display = "block";
    renderXcore();
    try {
        let token = await ensureSession();
        let text;
        try {
            text = await xChat(question, token);
        } catch (e) {
            if (e.message !== "Unauthorized") throw e;
            sessionToken = null;
            sessionExpiry = 0;
            token = await ensureSession();
            text = await xChat(question, token);
        }
        setAction("ځواب ورکوم");
        // L.A.E.: math answers are composed by the engine; else plain.
        var laeDone = false;
        if (typeof laeShow === "function") laeDone = laeShow(question, text);
        if (!laeDone) {
            addMessage(text, "ai");
            if (typeof universeOffer === "function") universeOffer(question, text);
        }
        // The first answer (math or not) is now given.
        maybeWow();
        if (typeof laeMarkAnswered === "function") laeMarkAnswered();
        if (typeof afterAnswer === "function") afterAnswer();
        chatState.status = "ready";
        gs("completed");
    } catch (e) {
        chatState.status = "failed";
        var wasStopped = chatStopped;
        if (chatStopped) {
            chatStopped = false;
            chatState.status = "ready";
            addMessage("ځواب ودرېد", "ai");
        } else if (e.message === "RateLimit") {
            recordError("rate_limit", 429);
            addMessage("ډېرې غوښتنې وشوې — لږ وروسته بیا هڅه وکړه", "ai");
        } else if (e.message === "Timeout") {
            recordError("timeout", 0);
            addMessage("ځواب وځنډېد — بیا هڅه وکړه", "ai");
        } else {
            recordError(e.message === "Session" ? "session" : e.message === "Bad response" ? "bad_contract" : "network", 0);
            addMessage("انټرنیټ نشته یا ځواب ونه رسېد — بیا هڅه وکړه", "ai");
        }
        if (wasStopped) gs("paused"); else gs("failed");
        showRetry();
    } finally {
        if (stopBtn) stopBtn.style.display = "none";
        if (typeof genStateIs === "function" && genStateIs("generating")) gs("idle");
        setAction("چمتو یم");
        renderXcore();
    }
}
