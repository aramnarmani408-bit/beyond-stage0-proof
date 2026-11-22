var retryEl = null;
var stopBtn = null;
// Phase 1: the demo-chip pool + rotation counter live here (neon2.js is at
// the push limit) — the chips send real questions through the ask path.
var DEMO_KEY = "beyondx-demo-v1";
var DEMO_POOL = ["د الفاتحې سورت وښیه", "زما د موبایل روغتیا وګوره", "انګلیسي زده کړم", "یو انځور جوړ کړه: غرونه", "د صبر په اړه ایت راکړه", "«سلام» په انګلیسي څه کېږي؟", "یو پروګرام ولیکه چې «سلام» چاپ کړي", "زما بیټرۍ څومره ده؟", "یو کوئز جوړ کړه"];
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
    if (isIdentityQuestion(question)) {
        setAction("ځواب ورکوم");
        addMessage("زه BEYOND X یم، د BEYOND AI جوړ کړی هوښیار مرستیال یم.", "ai");
        setAction("چمتو یم");
        return;
    }
    setAction("فکر کوم...");
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
        addMessage(text, "ai");
        chatState.status = "ready";
    } catch (e) {
        chatState.status = "failed";
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
        showRetry();
    } finally {
        if (stopBtn) stopBtn.style.display = "none";
        setAction("چمتو یم");
        renderXcore();
    }
}
