// BEYOND X Pashto text overlay (IMAGE-SPECIAL BAR v2) — Canvas 2D,
// real Pashto font, RTL. The BEYOND X watermark is re-applied last
// so the overlay never erases it.
var imagesLastGen = null;
var imagesTextEl = null;
var imagesTextBase = null;
var imagesTextBaseR = null;
var imagesTextSrc = null;
var imagesTextNote = null;
function imagesTextWrap(ctx, text, maxW) {
    var words = (text || "").split(/\s+/).filter(function (w) { return w; });
    var lines = [], cur = "";
    for (var i = 0; i < words.length; i++) {
        var t = cur ? cur + " " + words[i] : words[i];
        if (ctx.measureText(t).width <= maxW || !cur) cur = t;
        else { lines.push(cur); cur = words[i]; }
    }
    if (cur) lines.push(cur);
    return lines;
}
function imagesTextOverlay(dataUrl, text, done) {
    if (typeof Image === "undefined" || !text) return done(dataUrl);
    var im = new Image();
    im.onload = function () {
        var cv = document.createElement("canvas");
        cv.width = im.width; cv.height = im.height;
        var ctx = cv.getContext("2d");
        if (!ctx) return done(dataUrl);
        ctx.drawImage(im, 0, 0);
        var fs = Math.max(16, Math.round(im.width / 16));
        ctx.font = "bold " + fs + "px sans-serif";
        ctx.direction = "rtl"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        var lines = imagesTextWrap(ctx, text, im.width - fs * 2);
        var lh = fs * 1.5;
        var bh = lines.length * lh + fs * 2;
        var by = im.height - bh;
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, by, im.width, bh);
        ctx.fillStyle = "#fff";
        for (var i = 0; i < lines.length; i++) ctx.fillText(lines[i], im.width / 2, by + fs + lh * i + lh / 2);
        imagesWatermark(cv.toDataURL("image/jpeg", 0.9), done);
    };
    im.onerror = function () { done(dataUrl); };
    im.src = dataUrl;
}
function imagesTextCurrent() { return imagesTextSrc; }
function imagesTextApply() {
    var t = imagesTextEl ? imagesTextEl.value.trim() : "";
    var base = imagesTextBase;
    if (!t || !base) { showToast("لومړی انځور جوړ کړه، بیا متن ولیکئ"); return; }
    setAction("فکر کوم...");
    imagesTextOverlay(base, t, function (out) {
        var r = imagesLastGen || {};
        r.image = (out.split(",")[1]) || r.image;
        r.mimeType = "image/jpeg";
        showGeneratedImage(r);
        imagesAddHistory(r);
        showImagesHistory();
        setAction("چمتو یم");
    });
}
if (typeof showGeneratedImage === "function") { var _sgPrev = showGeneratedImage; showGeneratedImage = function (r) { imagesLastGen = r; if (r !== imagesTextBaseR) { imagesTextBaseR = r; imagesTextBase = "data:" + r.mimeType + ";base64," + r.image; } imagesTextSrc = "data:" + r.mimeType + ";base64," + r.image; _sgPrev(r); if (imagesTextNote) { var n = imagesTextNote; imagesTextNote = null; imagesAdd(n); } }; }
