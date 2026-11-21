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

