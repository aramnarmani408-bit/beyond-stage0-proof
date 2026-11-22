var sessionToken = null;
var sessionExpiry = 0;
var chatCtrl = null;
var chatStopped = false;
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
        const call = fetch("https://beyond-build-gateway.aramnarmani408.workers.dev/api/v1/x/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: JSON.stringify({ message: { text: question },
                preferences: { language: (typeof neonPrefs !== "undefined" ? neonPrefs.lang : "ps"), response_language: (typeof neonPrefs !== "undefined" ? neonPrefs.lang : "ps"), stream: false },
                context: { workspace: "chat", depth: (typeof neonPrefs !== "undefined" ? neonPrefs.depth : "full"), style: (typeof neonPrefs !== "undefined" ? neonPrefs.style : "teacher") } }),
            signal: ctrl ? ctrl.signal : undefined
        });
        const resp = await Promise.race([call, timeout, abortP]);
        if (timer) clearTimeout(timer);
        if (resp.status === 429) throw new Error("RateLimit");
        if (resp.status === 401) throw new Error("Unauthorized");
        if (!resp.ok) throw new Error("Network");
        const data = await resp.json();
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
