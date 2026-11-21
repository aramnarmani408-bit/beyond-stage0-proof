// BEYOND X module 15/18: books — reader panel + rendering (gateway text shown verbatim; display whitespace normalized).
var booksPanelEl = null;
var booksSearchEl = null;
var booksResultEl = null;
var booksReadEl = null;
var booksPageEl = null;
var booksMarkBtn = null;
var booksNoteEl = null;
var BOOKS_BASE = "https://beyond-build-gateway.aramnarmani408.workers.dev/api/v1/x";
function booksEl(tag, text) {
    var el = document.createElement(tag);
    el.textContent = text;
    return el;
}
function booksBtn(text, fn) {
    var b = booksEl("button", text);
    b.addEventListener("click", fn);
    return b;
}
function booksInput(ph) {
    var el = document.createElement("input");
    el.placeholder = ph;
    el.style.cssText = "background:#0A0A1F;color:#F1F5F9;";
    return el;
}
function booksAdd(text) {
    if (text) booksResultEl.appendChild(booksEl("div", text));
}
function booksClear() {
    while (booksResultEl.firstChild) booksResultEl.removeChild(booksResultEl.firstChild);
}
// Display-only: OCR text has double spaces + broken lines; the
// gateway text stays byte-identical, the reader just shows it clean.
function booksNormalize(text) {
    return text.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n");
}
function buildBooksPanel() {
    if (booksPanelEl) return booksPanelEl;
    var panel = document.createElement("div");
    panel.id = "booksPanel";
    panel.style.display = "none";
    panel.style.flex = "1";
    panel.style.flexDirection = "column";
    panel.style.gap = "12px";
    panel.appendChild(booksBtn("← بیرته", function () { showPanel("chat"); }));
    panel.appendChild(booksEl("div", "کتابونه"));
    booksSearchEl = booksInput("د کتاب نوم...");
    panel.appendChild(booksSearchEl);
    panel.appendChild(booksBtn("پلټنه", booksSearch));
    booksResultEl = document.createElement("div");
    panel.appendChild(booksResultEl);
    booksReadEl = document.createElement("div");
    booksReadEl.style.whiteSpace = "pre-wrap";
    panel.appendChild(booksReadEl);
    var controls = document.createElement("div");
    controls.appendChild(booksBtn("← مخکینی", function () { booksTurnPage(-1); }));
    booksPageEl = booksEl("div", "");
    controls.appendChild(booksPageEl);
    controls.appendChild(booksBtn("راتلونکی →", function () { booksTurnPage(1); }));
    booksMarkBtn = booksBtn("نښه", booksToggleBookmark);
    controls.appendChild(booksMarkBtn);
    booksNoteEl = booksInput("یادښت...");
    controls.appendChild(booksNoteEl);
    controls.appendChild(booksBtn("خوندي کړه", booksSaveNote));
    panel.appendChild(controls);
    document.getElementById("main").appendChild(panel);
    booksPanelEl = panel;
    showBookLibrary();
    return panel;
}
function showBooksPanel(show) {
    if (booksPanelEl) booksPanelEl.style.display = show ? "flex" : "none";
}
function showBookPage(r) {
    var entry = booksCurrentEntry();
    if (entry) {
        entry.page = r.page;
        if (r.totalPages) entry.total = r.totalPages;
        saveBooks();
    }
    booksReadEl.textContent = booksNormalize(r.text);
    booksPageEl.textContent = "مخ " + pashtoDigits(r.page) + (r.totalPages ? " / " + pashtoDigits(r.totalPages) : "") + (r.chapter ? " — " + r.chapter : "");
    booksMarkBtn.textContent = (entry && entry.marks && entry.marks.indexOf(r.page) !== -1) ? "نښه ✓" : "نښه";
    booksNoteEl.value = (entry && entry.notes && entry.notes[r.page]) || "";
}
function showBookSources(sources) {
    buildBooksPanel();
    booksClear();
    sources.forEach(function (s) {
        booksAdd("مخ " + pashtoDigits(s.page) + (s.chapter ? " (" + s.chapter + ")" : ""));
        booksAdd(s.excerpt || "");
    });
}
