// BEYOND X image edit loop (IMAGE-SPECIAL BAR v2) — true edit via the
// gateway /images/edit route when it serves, else regeneration +
// vision verification (labelled as a NEW image, never as edited).
var imagesEditEl = null;
var imagesTextDone = false;
function imagesEditPrompt(change) {
    var p = imagesLastGen ? (imagesLastGen.promptEn || imagesLastGen.prompt || "") : "";
    return (p ? p + ". " : "") + change;
}
async function imagesEditRequest() {
    var ch = imagesEditEl ? imagesEditEl.value.trim() : "";
    var src = imagesTextCurrent();
    imagesTextNote = null;
    if (!ch || !src) { showToast("لومړی انځور جوړ کړه، بیا بدلون ولیکئ"); return; }
    setAction("فکر کوم...");
    var b64 = (src.split(",")[1]) || "";
    var edited = null;
    try {
        var r = await xImages("/images/edit", await ensureSession(), { image: b64, mimeType: "image/jpeg", instruction: ch });
        if (r && r.image) edited = r;
    } catch (e) { /* no edit route — fall through to regeneration */ }
    if (edited) {
        var esrc = "data:" + edited.mimeType + ";base64," + edited.image;
        imagesWatermark(esrc, function (marked) {
            if (marked !== esrc) { edited.image = (marked.split(",")[1]) || edited.image; edited.mimeType = "image/jpeg"; }
            edited.prompt = (imagesLastGen ? imagesLastGen.prompt : "") + " (سم شوی)";
            edited.promptEn = edited.instructionEn || "";
            edited.translated = !!edited.instructionEn;
            showGeneratedImage(edited);
            imagesAddHistory(edited);
            showImagesHistory();
            imagesEditVerify(edited, ch);
        });
    } else {
        imagesTextNote = "یادونه: د سمېدو لاره نشته — دا نوی انځور دی، نه سم شوی.";
        await imagesGeneratePrompt(imagesEditPrompt(ch), null);
        var nsrc = imagesTextCurrent();
        if (nsrc) imagesEditVerify({ image: (nsrc.split(",")[1]) || "", mimeType: "image/jpeg" }, ch);
    }
    setAction("چمتو یم");
}
async function imagesEditVerify(r, ch) {
    try {
        var v = await xImages("/images/analyze", await ensureSession(), { image: r.image, mimeType: r.mimeType || "image/jpeg", question: "په دې انځور کې " + ch + " شته؟" });
        if (v && typeof v.text === "string" && v.text) imagesAdd("د بدلون کتنه: " + v.text);
    } catch (e) { /* verification is best-effort */ }
}
function imagesTextBuildUI() {
    if (imagesTextDone || !imagesPanelEl) return;
    imagesTextDone = true;
    imagesTextEl = imagesInput("په انځور کې متن ولیکئ...");
    imagesPanelEl.appendChild(imagesTextEl);
    imagesPanelEl.appendChild(imagesBtn("متن اضافه کړه", imagesTextApply));
    imagesEditEl = imagesInput("څه بدل کړم؟...");
    imagesPanelEl.appendChild(imagesEditEl);
    imagesPanelEl.appendChild(imagesBtn("بدل کړه", imagesEditRequest));
}
if (typeof buildImagesPanel === "function") { var _itPrev = buildImagesPanel; buildImagesPanel = function () { var p = _itPrev(); imagesTextBuildUI(); return p; }; }
