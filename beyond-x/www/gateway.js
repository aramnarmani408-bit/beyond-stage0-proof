// BEYOND X module 7/13: gateway — guest session + X chat route (bounded)
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
    // Bounded wait: the race rejects on timeout even if fetch hangs.
    let timer = null;
    try {
        const ctrl = (typeof AbortController !== "undefined") ? new AbortController() : null;
        const timeout = new Promise(function (resolve, reject) {
            timer = setTimeout(function () {
                if (ctrl) ctrl.abort();
                reject(new Error("Timeout"));
            }, CHAT_TIMEOUT_MS);
        });
        const call = fetch("https://beyond-build-gateway.aramnarmani408.workers.dev/api/v1/x/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: JSON.stringify({ message: { text: question },
                preferences: { language: "ps", response_language: "ps", stream: false },
                context: { workspace: "chat" } }),
            signal: ctrl ? ctrl.signal : undefined
        });
        const resp = await Promise.race([call, timeout]);
        if (timer) clearTimeout(timer);
        if (resp.status === 429) throw new Error("RateLimit");
        if (resp.status === 401) throw new Error("Unauthorized");
        if (!resp.ok) throw new Error("Network");
        const data = await resp.json();
        // Never render raw provider text: show ONLY a contract-valid answer.
        if (!data || data.status !== "success" || !data.response
            || data.response.identity !== "beyondx"
            || typeof data.response.text !== "string"
            || data.response.text.length === 0) throw new Error("Bad response");
        return data.response.text;
    } finally {
        if (timer) clearTimeout(timer);
    }
}

