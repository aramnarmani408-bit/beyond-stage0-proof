// BEYOND X module 13/15: islamic — Quran + Hadith panel (renders gateway text verbatim).
var islamicPanelEl = null;
var islamicSearchEl = null;
var islamicResultEl = null;
var ISLAMIC_BASE = "https://beyond-build-gateway.aramnarmani408.workers.dev/api/v1/x";
var ISLAMIC_LABELS = ["قرآن", "حدیث", "تفسیر", "فقه", "اختلاف", "د AI تحلیل"];
function islamicEl(tag, text) {
    var el = document.createElement(tag);
    el.textContent = text;
    return el;
}
function islamicAdd(text) {
    if (text) islamicResultEl.appendChild(islamicEl("div", text));
}
function islamicClear() {
    while (islamicResultEl.firstChild) islamicResultEl.removeChild(islamicResultEl.firstChild);
}
function buildIslamicPanel() {
    if (islamicPanelEl) return islamicPanelEl;
    var panel = document.createElement("div");
    panel.id = "islamicPanel";
    panel.style.display = "none";
    panel.style.flex = "1";
    panel.style.flexDirection = "column";
    panel.style.gap = "12px";
    var back = islamicEl("button", "← بیرته");
    back.addEventListener("click", function () { showPanel("chat"); });
    panel.appendChild(back);
    panel.appendChild(islamicEl("div", "اسلامي"));
    islamicSearchEl = document.createElement("input");
    islamicSearchEl.placeholder = "پلټنه...";
    islamicSearchEl.style.cssText = "background:#0A0A1F;color:#F1F5F9;";
    panel.appendChild(islamicSearchEl);
    var btn = islamicEl("button", "پلټنه");
    btn.addEventListener("click", islamicSearch);
    panel.appendChild(btn);
    islamicResultEl = document.createElement("div");
    panel.appendChild(islamicResultEl);
    document.getElementById("main").appendChild(panel);
    islamicPanelEl = panel;
    return panel;
}
function showIslamicPanel(show) {
    if (islamicPanelEl) islamicPanelEl.style.display = show ? "flex" : "none";
}
function showIslamicSource(r) {
    islamicAdd(r.label || (r.type === "hadith" ? "حدیث" : "قرآن"));
    islamicAdd(r.arabic || r.text);
    islamicAdd(r.pashto || (r.translation && r.translation.text));
    var c = r.citation;
    var cit = c ? (c.surah ? c.surah + ":" + c.ayah : c.collection ? c.collection + " " + c.book + ":" + c.hadith : "") : (r.ref || "");
    islamicAdd(cit);
}
function showIslamicSources(sources) {
    buildIslamicPanel();
    islamicClear();
    sources.forEach(function (s) {
        if (ISLAMIC_LABELS.indexOf(s.label) !== -1) showIslamicSource(s);
    });
}
