var sessionToken = null;
var sessionExpiry = 0;
var gatewayUsage = null;
var chatCtrl = null;
var chatStopped = false;
// Data budget (infra.js): real chat-route bytes, counted per call.
// Stateless: every add reads the stored total first, so a reload
// (or another tab) never loses the day's earlier bytes.
function dataBudgetAdd(n) {
    var b = dataBudgetRead() + n;
    try { localStorage.setItem("beyondx-data-v1", JSON.stringify({ d: new Date().toISOString().slice(0, 10), b: b })); } catch (e) {}
}
function dataBudgetRead() {
    try {
        var s = JSON.parse(localStorage.getItem("beyondx-data-v1") || "null");
        if (s && s.d === new Date().toISOString().slice(0, 10)) return s.b || 0;
    } catch (e) {}
    return 0;
}
function stopChat() {
    if (chatCtrl) {
        chatStopped = true;
        chatCtrl.abort();
    }
}
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
    let timer = null;
    try {
        const ctrl = (typeof AbortController !== "undefined") ? new AbortController() : null;
        chatCtrl = ctrl;
        const abortP = new Promise(function (resolve, reject) {
            if (ctrl) ctrl.signal.addEventListener("abort", function () { reject(new Error("Stopped")); });
        });
        abortP.catch(function () {});
        const timeout = new Promise(function (resolve, reject) {
            timer = setTimeout(function () {
                reject(new Error("Timeout"));
                if (ctrl) ctrl.abort();
            }, CHAT_TIMEOUT_MS);
        });
        const bodyStr = JSON.stringify({ message: { text: question },
            preferences: { language: (typeof neonPrefs !== "undefined" ? neonPrefs.lang : "ps"), response_language: (typeof neonPrefs !== "undefined" ? neonPrefs.lang : "ps"), stream: false, persona: (typeof neonPrefs !== "undefined" ? neonPrefs.style : "friend") },
            context: { workspace: "chat" } });
        const call = fetch("https://beyond-build-gateway.aramnarmani408.workers.dev/api/v1/x/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: bodyStr,
            signal: ctrl ? ctrl.signal : undefined
        });
        const resp = await Promise.race([call, timeout, abortP]);
        if (timer) clearTimeout(timer);
        if (resp.status === 429) throw new Error("RateLimit");
        if (resp.status === 401) throw new Error("Unauthorized");
        if (!resp.ok) throw new Error("Network");
        const data = await resp.json();
        dataBudgetAdd(bodyStr.length + JSON.stringify(data).length);
        if (data && data.usage) gatewayUsage = data.usage;
        if (!data || data.status !== "success" || !data.response
            || data.response.identity !== "beyondx"
            || typeof data.response.text !== "string"
            || data.response.text.length === 0) throw new Error("Bad response");
        return data.response.text;
    } finally {
        chatCtrl = null;
        if (timer) clearTimeout(timer);
    }
}

