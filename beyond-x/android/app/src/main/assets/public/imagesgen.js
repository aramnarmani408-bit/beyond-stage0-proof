// BEYOND X module 21/21: imagesgen — Images gateway calls (Bearer <redacted>, 60 s abort, identity checked).
async function xImages(path, token, body) {
    var ctrl = (typeof AbortController !== "undefined") ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, CHAT_TIMEOUT_MS);
    var resp;
    try {
        resp = await fetch(IMAGES_BASE + path, {
            method: body ? "POST" : "GET",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: body ? JSON.stringify(body) : undefined,
            signal: ctrl ? ctrl.signal : undefined
        });
    } catch (e) {
        clearTimeout(timer);
        throw new Error(e.name === "AbortError" ? "Timeout" : "Network");
    }
    clearTimeout(timer);
    if (resp.status === 429) throw new Error("RateLimit");
    if (resp.status === 401) { sessionToken = null; sessionExpiry = 0; throw new Error("Unauthorized"); }
    if (resp.status === 404) throw new Error("NotFound");
    if (!resp.ok) throw new Error("Network");
    var data = await resp.json();
    if (!data || (data.status !== "success" && data.status !== "partial" && data.status !== "failed") || !data.response
        || data.response.identity !== "beyondx") throw new Error("Bad response");
    return data.response;
}
async function imagesGenerate() {
    var q = imagesPromptEl.value.trim();
    if (!q) return;
    return imagesGeneratePrompt(q, null);
}
async function imagesGeneratePrompt(q, provider) {
    setAction("فکر کوم...");
    try {
        var body = { prompt: q };
        if (provider) body.provider = provider;
        var r = await xImages("/images/generate", await ensureSession(), body);
        if (!r.image) {
            imagesPanelError(new Error("Failed: " + (r.reason || "نامعلومه ستونزه")));
            return;
        }
        showGeneratedImage(r);
        imagesAddHistory(r);
        showImagesHistory();
    } catch (e) { imagesPanelError(e); }
    finally { setAction("چمتو یم"); }
}
function imagesGenerateRetry(provider) {
    var q = imagesPromptEl.value.trim();
    if (q) imagesGeneratePrompt(q, provider);
}
async function imagesAnalyze(b64, mimeType, question) {
    setAction("فکر کوم...");
    try {
        var r = await xImages("/images/analyze", await ensureSession(), { image: b64, mimeType: mimeType, question: question || "" });
        if (typeof r.text !== "string" || r.text.length === 0) throw new Error("Bad response");
        showImageAnalysis(r.text);
    } catch (e) { imagesPanelError(e); }
    finally { setAction("چمتو یم"); }
}
async function imagesRefreshStatus() {
    try {
        var r = await xImages("/images/status", await ensureSession());
        if (r.providers) showImageStatus(r.providers);
    } catch (e) { /* status is best-effort — the panel works without it */ }
}
// Prompt words stripped when a chat message becomes a prompt.
function imagesPromptFrom(q) {
    var drop = ["انځورونه", "انځورونو", "انځور", "عکسونه", "عکس", "سیستم", "جوړ", "کړه", "راکړه", "غواړم", "یو", "یوه", "د", "مې", "را", "مه"];
    var words = q.split(/\s+/).filter(function (w) { return w && drop.indexOf(w) === -1; });
    return words.join(" ");
}
