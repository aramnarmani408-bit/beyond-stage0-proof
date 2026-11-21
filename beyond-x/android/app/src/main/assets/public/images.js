var imagesPanelEl = null;
var imagesPromptEl = null;
var imagesResultEl = null;
var imagesAnalyzeEl = null;
var imagesStatusEl = null;
var imagesHistoryEl = null;
var imagesUploadEl = null;
var IMAGES_BASE = "https://beyond-build-gateway.aramnarmani408.workers.dev/api/v1/x";
function imagesEl(tag, text) {
    var el = document.createElement(tag);
    el.textContent = text;
    return el;
}
function imagesBtn(text, fn) {
    var b = imagesEl("button", text);
    b.addEventListener("click", fn);
    return b;
}
function imagesInput(ph) {
    var el = document.createElement("input");
    el.placeholder = ph;
    el.style.cssText = "background:#0A0A1F;color:#F1F5F9;";
    return el;
}
function imagesAdd(text) {
    if (text) imagesResultEl.appendChild(imagesEl("div", text));
}
function imagesClear() {
    while (imagesResultEl.firstChild) imagesResultEl.removeChild(imagesResultEl.firstChild);
}
function buildImagesPanel() {
    if (imagesPanelEl) return imagesPanelEl;
    var panel = document.createElement("div");
    panel.id = "imagesPanel";
    panel.style.display = "none";
    panel.style.flex = "1";
    panel.style.flexDirection = "column";
    panel.style.gap = "12px";
    panel.appendChild(imagesBtn("← بیرته", function () { showPanel("chat"); }));
    panel.appendChild(imagesEl("div", "انځورونه"));
    imagesPromptEl = imagesInput("د انځور شرح...");
    panel.appendChild(imagesPromptEl);
    panel.appendChild(imagesBtn("جوړ کړه", imagesGenerate));
    imagesResultEl = document.createElement("div");
    panel.appendChild(imagesResultEl);
    imagesAnalyzeEl = document.createElement("div");
    imagesAnalyzeEl.appendChild(imagesBtn("انځور پورته کړه", function () { if (imagesUploadEl) imagesUploadEl.click(); }));
    imagesUploadEl = document.createElement("input");
    imagesUploadEl.type = "file";
    imagesUploadEl.accept = "image/*";
    imagesUploadEl.style.display = "none";
    imagesUploadEl.addEventListener("change", function () { imagesUpload(imagesUploadEl.files ? imagesUploadEl.files[0] : null); });
    imagesAnalyzeEl.appendChild(imagesUploadEl);
    panel.appendChild(imagesAnalyzeEl);
    imagesStatusEl = document.createElement("div");
    panel.appendChild(imagesStatusEl);
    imagesHistoryEl = document.createElement("div");
    panel.appendChild(imagesHistoryEl);
    document.getElementById("main").appendChild(panel);
    imagesPanelEl = panel;
    showImagesHistory();
    imagesRefreshStatus();
    return panel;
}
function showImagesPanel(show) {
    if (imagesPanelEl) imagesPanelEl.style.display = show ? "flex" : "none";
}
function showGeneratedImage(r) {
    imagesClear();
    if (r.translated) imagesAdd("انګلیسي شرح: " + r.promptEn);
    var img = document.createElement("img");
    img.src = "data:" + r.mimeType + ";base64," + r.image;
    img.style.maxWidth = "100%";
    imagesResultEl.appendChild(img);
    imagesAdd(r.prompt + (r.watermark ? " — دا انځور د Pollinations نښه لري" : r.provider === "flux" ? " — دا انځور اوس ښکته کړه، وروسته نه خوندي کېږي." : ""));
    var dl = document.createElement("a");
    dl.textContent = "خوندي کړه";
    dl.href = img.src;
    dl.download = "beyondx-image.jpg";
    imagesResultEl.appendChild(dl);
    imagesResultEl.appendChild(imagesBtn("بل چمتو کوونکی هڅه وکړه", function () { imagesGenerateRetry(r.provider); }));
}
function showImageAnalysis(text) {
    imagesAnalyzeEl.appendChild(imagesEl("div", text));
}
function showImageStatus(providers) {
    while (imagesStatusEl.firstChild) imagesStatusEl.removeChild(imagesStatusEl.firstChild);
    Object.keys(providers).forEach(function (k) {
        var v = providers[k];
        imagesStatusEl.appendChild(imagesEl("div", k + ": " + (v.ok === true ? "سم دی ✓" : v.ok === false ? "کار نه کوي" : "نامعلوم")));
    });
}
