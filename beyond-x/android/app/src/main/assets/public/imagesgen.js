// BEYOND X module 21/21: imagesgen — Images gateway calls.
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
// Mark GENERATED images with BEYOND X (canvas, bottom-right).
function imagesWatermark(dataUrl, done) {
    if (typeof Image === "undefined") return done(dataUrl);
    var im = new Image();
    im.onload = function () {
        var cv = document.createElement("canvas");
        cv.width = im.width; cv.height = im.height;
        var ctx = cv.getContext("2d");
        if (!ctx) return done(dataUrl);
        ctx.drawImage(im, 0, 0);
        var fs = Math.max(10, Math.round(im.width / 28));
        ctx.font = "bold " + fs + "px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = 4;
        ctx.textAlign = "right"; ctx.textBaseline = "bottom";
        ctx.fillText("BEYOND X", im.width - fs / 2, im.height - fs / 2);
        done(cv.toDataURL("image/jpeg", 0.9));
    };
    im.onerror = function () { done(dataUrl); };
    im.src = dataUrl;
}
async function imagesGenerate() {
    var q = imagesPromptEl.value.trim();
    if (!q) return;
    return imagesGeneratePrompt(q, null);
}
async function imagesGeneratePrompt(q, provider, avoid) {
    setAction("فکر کوم...");
    try {
        var body = { prompt: q };
        if (provider) body.provider = provider;
        if (avoid) body.avoid = avoid;
        var r = await xImages("/images/generate", await ensureSession(), body);
        if (!r.image) {
            imagesPanelError(new Error("Failed: " + (r.reason || "نامعلومه ستونزه")));
            return;
        }
        var src = "data:" + r.mimeType + ";base64," + r.image;
        imagesWatermark(src, function (marked) {
            if (marked !== src) { r.image = (marked.split(",")[1]) || r.image; r.mimeType = "image/jpeg"; }
            showGeneratedImage(r);
            imagesAddHistory(r);
            showImagesHistory();
        });
    } catch (e) { imagesPanelError(e); }
    finally { setAction("چمتو یم"); }
}
function imagesGenerateRetry(avoid) {
    var q = imagesPromptEl.value.trim();
    if (q) imagesGeneratePrompt(q, null, avoid);
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
    } catch (e) { /* best-effort */ }
}
