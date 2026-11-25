// BEYOND X Visual Studio — project storage. A saved project stores the
// op list + the text list + a thumbnail — never only the flat image, so
// the work stays editable after reopening. The ORIGINAL data URL is
// stored only when it fits the 150 KB history cap (same cap as the
// images history); a bigger original is NOT duplicated — srcMissing is
// recorded honestly and reopening asks for the image from the history.
function vsProjectSerialize(p) {
    var b64 = (p.src || "").split(",")[1] || "";
    return { name: p.name, generated: p.generated, watermarked: p.watermarked, ops: p.ops, texts: p.texts, fmt: p.fmt, q: p.q, src: b64.length <= VS_SRC_MAX_B64 ? p.src : "", srcMissing: b64.length > VS_SRC_MAX_B64 };
}
function vsProjectSave(p, thumb) {
    if (!p || !p.name || !vsOpsValidate(p.ops) || !vsTextsValidate(p.texts)) return false;
    try {
        if (typeof localStorage === "undefined") return false;
        var raw = localStorage.getItem(VS_PROJECT_KEY), s = raw ? JSON.parse(raw) : {};
        if (!s || typeof s !== "object") s = {};
        var rec = vsProjectSerialize(p);
        rec.thumb = thumb || ""; rec.at = Date.now();
        s[p.name] = rec;
        var keys = Object.keys(s);
        if (keys.length > VS_PROJECT_MAX) { keys.sort(function (a, b) { return (s[a].at || 0) - (s[b].at || 0); }); delete s[keys[0]]; }
        localStorage.setItem(VS_PROJECT_KEY, JSON.stringify(s));
        return true;
    } catch (e) { return false; }
}
function vsProjectLoad(name) {
    try {
        if (typeof localStorage === "undefined") return null;
        var raw = localStorage.getItem(VS_PROJECT_KEY);
        if (!raw) return null;
        var s = JSON.parse(raw), r = s && s[name];
        if (!r || !vsOpsValidate(r.ops || []) || !vsTextsValidate(r.texts || [])) return null;
        var p = vsProjectNew(r.src || "", !!r.generated, !!r.watermarked, name);
        p.ops = r.ops; p.texts = r.texts; p.fmt = r.fmt || "jpeg"; p.q = r.q || 0.9;
        p.srcMissing = !!r.srcMissing;
        return p;
    } catch (e) { return null; }
}
function vsProjectList() {
    try {
        if (typeof localStorage === "undefined") return [];
        var raw = localStorage.getItem(VS_PROJECT_KEY);
        if (!raw) return [];
        var s = JSON.parse(raw);
        return s && typeof s === "object" ? Object.keys(s) : [];
    } catch (e) { return []; }
}
// ---- Export (same file: storage + export stay under one push) ----
// Renders base -> ops -> texts, then
// the watermark LAST and only at export, only on GENERATED images, only
// once (the project flag flips so a second export adds nothing). The
// preview (forExport false) NEVER carries the watermark: the working
// image and the exported image are different things. User photos are
// never watermarked.
function vsWatermarkDraw(ctx, W, H) {
    var fs = Math.max(10, Math.round(W / 28));
    ctx.save();
    ctx.font = "bold " + fs + "px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = 4;
    ctx.textAlign = "right"; ctx.textBaseline = "bottom";
    ctx.fillText("BEYOND X", W - fs / 2, H - fs / 2);
    ctx.restore();
}
function vsRenderProject(p, img, maxDim, forExport) {
    var cv = vsApplyOps(img, p.ops, maxDim);
    if (!cv) return null;
    var ctx = cv.getContext("2d");
    if (!ctx) return null;
    for (var i = 0; i < p.texts.length; i++) vsTextRender(ctx, p.texts[i], cv.width, cv.height);
    var marked = false;
    if (forExport && p.generated && !p.watermarked) { vsWatermarkDraw(ctx, cv.width, cv.height); p.watermarked = true; marked = true; }
    return { cv: cv, markedNow: marked };
}
function vsExport(p, img, done) {
    var r = vsRenderProject(p, img, VS_EXPORT_MAX, true);
    if (!r) return done(null);
    var mime = p.fmt === "png" ? "image/png" : "image/jpeg";
    var out = r.cv.toDataURL(mime, p.fmt === "png" ? undefined : p.q);
    done({ dataUrl: out, mimeType: mime, w: r.cv.width, h: r.cv.height, watermarked: p.watermarked, markedNow: r.markedNow });
}
