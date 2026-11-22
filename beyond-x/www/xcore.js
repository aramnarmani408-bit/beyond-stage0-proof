const gatewayState = { status: "connecting", checkedAt: 0 };
const chatState = { status: "ready" };
const HEALTH_URL = "https://beyond-build-gateway.aramnarmani408.workers.dev/health";
const HEALTH_STALE_MS = 120000;
const HEALTH_POLL_MS = 60000;
var CHAT_TIMEOUT_MS = 60000;
function setChatTimeout(ms) { CHAT_TIMEOUT_MS = ms; }
function isChatReady() {
    return gatewayState.status === "online" && chatState.status !== "failed";
}
function renderXcore() {
    const line = document.getElementById("xcoreLine");
    const dot = document.getElementById("statusDot");
    let gw = gatewayState.status;
    if (gw !== "connecting" && Date.now() - gatewayState.checkedAt > HEALTH_STALE_MS) gw = "unknown";
    const gwLabel = gw === "online" ? "آنلاین" : gw === "degraded" ? "کمزوری" : gw === "offline" ? "آفلاین" : gw === "connecting" ? "نښلول کېږي" : "نامعلوم";
    let chatLabel = "چمتو";
    if (chatState.status === "busy") chatLabel = "بوخت";
    else if (!isChatReady()) chatLabel = chatState.status === "failed" ? "ناکام شو" : "نشته";
    if (line) line.textContent = "ګیټوې: " + gwLabel + " • چټ: " + chatLabel;
    if (dot) dot.style.background = gw === "online" ? "#00FF88" : gw === "degraded" ? "#FFC107" : gw === "connecting" ? "#00F5FF" : "#FF4444";
    if (typeof renderNeon === "function") renderNeon();
}
async function checkGateway() {
    gatewayState.status = "connecting";
    renderXcore();
    try {
        const resp = await fetch(HEALTH_URL);
        const data = await resp.json();
        gatewayState.checkedAt = Date.now();
        gatewayState.status = (resp.ok && data && (data.ok === true || data.status === "ok")) ? "online" : "degraded";
    } catch (e) {
        gatewayState.checkedAt = Date.now();
        gatewayState.status = "offline";
    }
    renderXcore();
    return gatewayState.status;
}

// Phase 1: jump-to-latest (ui.js is at the push limit).
var jumpBtn = null;
function onChatScroll() {
    var a = document.getElementById("chatArea");
    if (!a || !jumpBtn) return;
    jumpBtn.style.display = a.scrollHeight - a.scrollTop - (a.clientHeight || 0) > 120 ? "block" : "none";
}
function jumpToLatest() {
    var a = document.getElementById("chatArea");
    if (!a) return;
    a.scrollTop = a.scrollHeight;
    if (jumpBtn) jumpBtn.style.display = "none";
}
// Phase 1: history-row rendering (answer.js is at the push limit too).
function miniBtn(text, fn) {
    var b = document.createElement("button");
    b.textContent = text;
    b.style.background = "transparent";
    b.style.color = "#94A3B8";
    b.style.border = "0";
    b.style.padding = "4px";
    b.style.cursor = "pointer";
    b.addEventListener("click", fn);
    return b;
}
function chatRowEl(c) {
    var li = document.createElement("li");
    li.className = "chat";
    var main = document.createElement("div");
    var t = document.createElement("div");
    t.textContent = (c.pinned ? "★ " : "") + (c.title || chatTitleOf(c, 0));
    if (c.id === AppState.convId) t.style.color = "#00F5FF";
    main.appendChild(t);
    var last = chatLastMsg(c);
    if (last) {
        var l = document.createElement("div");
        l.textContent = last;
        l.style.color = "#94A3B8";
        main.appendChild(l);
    }
    main.addEventListener("click", function () { switchChat(c.id); });
    li.appendChild(main);
    var acts = document.createElement("div");
    acts.appendChild(miniBtn("📌", function () { chatPin(c.id); }));
    acts.appendChild(miniBtn("✎", function () { chatRenameStart(c.id, li, main); }));
    acts.appendChild(miniBtn("📦", function () { chatArchive(c.id); }));
    acts.appendChild(miniBtn(chatDeleteArm === c.id ? "ډاډه یې؟" : "🗑", function () { chatDelete(c.id); }));
    li.appendChild(acts);
    return li;
}
// Phase 1: jump-to-latest + Stop buttons (D7/D12). Called once from init.js.
function buildChatButtons() {
    var p = document.getElementById("chatPanel");
    if (!p) return;
    jumpBtn = document.createElement("button");
    jumpBtn.id = "jumpBtn"; jumpBtn.textContent = "↓ وروستی";
    jumpBtn.addEventListener("click", jumpToLatest);
    p.appendChild(jumpBtn);
    stopBtn = document.createElement("button");
    stopBtn.id = "stopBtn"; stopBtn.textContent = "ودروه";
    stopBtn.addEventListener("click", function () { stopChat(); });
    p.appendChild(stopBtn);
    var a = document.getElementById("chatArea");
    if (a) a.addEventListener("scroll", onChatScroll);
}
