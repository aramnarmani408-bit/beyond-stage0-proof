// BEYOND X module 20/21: imageslib — history + upload.
var IMAGES_KEY = "beyondx-images-v1";
var imagesLib = { items: [] };
var NOUP = "پورته کول په دې وسیله کې نشته.";
function saveImages() {
    try {
        if (typeof localStorage === "undefined") return;
        localStorage.setItem(IMAGES_KEY, JSON.stringify(imagesLib));
    } catch (e) { /* storage unavailable */ }
}
function loadImages() {
    try {
        if (typeof localStorage === "undefined") return false;
        var raw = localStorage.getItem(IMAGES_KEY);
        if (!raw) return false;
        var s = JSON.parse(raw);
        if (!s || !Array.isArray(s.items)) return false;
        imagesLib = s;
        return true;
    } catch (e) { return false; }
}
function imagesAddHistory(r) {
    var data = (r.image && r.image.length <= 150000) ? "data:" + r.mimeType + ";base64," + r.image : null;
    imagesLib.items.unshift({ prompt: r.prompt, promptEn: r.promptEn, provider: r.provider, seed: r.seed, data: data });
    if (imagesLib.items.length > 10) imagesLib.items.length = 10;
    saveImages();
}
function showImagesHistory() {
    while (imagesHistoryEl.firstChild) imagesHistoryEl.removeChild(imagesHistoryEl.firstChild);
    if (imagesLib.items.length === 0) { imagesHistoryEl.appendChild(imagesEl("div", "لا دې کوم انځور نه دی جوړ کړی.")); return; }
    imagesLib.items.forEach(function (it) {
        var d = imagesEl("div", it.prompt);
        d.addEventListener("click", function () { showHistoryImage(it); });
        imagesHistoryEl.appendChild(d);
    });
}
function showHistoryImage(it) {
    imagesClear();
    if (!it.data) { imagesAdd("دا انځور خوندي شوی نه دی — کله چې جوړ شو، ښکته یې کړه."); return; }
    var img = document.createElement("img");
    img.src = it.data;
    img.style.maxWidth = "100%";
    imagesResultEl.appendChild(img);
    imagesAdd(it.prompt);
}
function imagesPanelError(e) {
    imagesClear();
    var m = e.message || "";
    if (m.indexOf("Failed: ") === 0) imagesAdd("انځور جوړ نه شو — " + m.slice(8));
    else if (m === "RateLimit") imagesAdd("ډېرې غوښتنې وشوې — لږ وروسته بیا هڅه وکړه");
    else if (m === "TooBig") imagesAdd("انځور ډېر لوی دی — تر ۲ میګابایټ پورې.");
    else imagesAdd("انټرنیټ نشته یا ځواب ونه رسېد — بیا هڅه وکړه");
}
function imagesScaleSize(w, h) {
    if (w <= 1024 && h <= 1024) return { w: w, h: h };
    var s = 1024 / Math.max(w, h);
    return { w: Math.round(w * s), h: Math.round(h * s) };
}
function imagesTooBig(b64) { return b64.length > 2800000; }
function imagesUpload(file) {
    if (!file) return;
    if (typeof FileReader === "undefined") { imagesAdd(NOUP); return; }
    var reader = new FileReader();
    reader.onload = function () { imagesDownscale(reader.result); };
    reader.readAsDataURL(file);
}
function imagesDownscale(dataUrl) {
    if (typeof Image === "undefined" || typeof document === "undefined") { imagesAdd(NOUP); return; }
    var im = new Image();
    im.onload = function () {
        var s = imagesScaleSize(im.width, im.height);
        var cv = document.createElement("canvas");
        cv.width = s.w; cv.height = s.h;
        var ctx = cv.getContext("2d");
        if (!ctx) { imagesAdd(NOUP); return; }
        ctx.drawImage(im, 0, 0, s.w, s.h);
        var b64 = (cv.toDataURL("image/jpeg", 0.8).split(",")[1]) || "";
        if (imagesTooBig(b64)) { imagesPanelError(new Error("TooBig")); return; }
        imagesAnalyze(b64, "image/jpeg", "");
    };
    im.src = dataUrl;
}
function imagesPromptFrom(q) {
    var drop = ["انځورونه", "انځورونو", "انځور", "عکسونه", "عکس", "سیستم", "جوړ", "کړه", "راکړه", "غواړم", "یو", "یوه", "د", "مې", "را", "مه"];
    return q.split(/\s+/).filter(function (w) { return w && drop.indexOf(w) === -1; }).join(" ");
}
loadImages();
