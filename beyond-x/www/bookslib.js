// BEYOND X module 16/18: bookslib — library state + paging + bookmarks + notes (localStorage).
var BOOKS_KEY = "beyondx-books-v1";
var booksLib = { books: {}, current: null };
function booksKey(ia, file) { return ia + "|" + file; }
function saveBooks() {
    try {
        if (typeof localStorage === "undefined") return;
        localStorage.setItem(BOOKS_KEY, JSON.stringify(booksLib));
    } catch (e) { /* storage unavailable — the library still works */ }
}
function loadBooks() {
    try {
        if (typeof localStorage === "undefined") return false;
        var raw = localStorage.getItem(BOOKS_KEY);
        if (!raw) return false;
        var s = JSON.parse(raw);
        if (!s || typeof s.books !== "object") return false;
        booksLib = s;
        if (typeof booksLib.current !== "string") booksLib.current = null;
        return true;
    } catch (e) { return false; }
}
function booksCurrentEntry() {
    return booksLib.current ? booksLib.books[booksLib.current] || null : null;
}
function booksAddEntry(ia, file, title, author, total) {
    var key = booksKey(ia, file);
    if (!booksLib.books[key]) booksLib.books[key] = { ia: ia, file: file, title: title, author: author, page: 1, total: total, marks: [], notes: {} };
    return key;
}
function booksPanelError(e) {
    booksClear();
    booksAdd(e.message === "NotFound" ? "دا کتاب ونه موندل شو." : "انټرنیټ نشته یا ځواب ونه رسېد — بیا هڅه وکړه");
}
async function booksPanelCall(path, render) {
    buildBooksPanel();
    try {
        render(await xBooks(path, await ensureSession()));
    } catch (e) { booksPanelError(e); }
}
function showBookLibrary() {
    booksClear();
    var keys = Object.keys(booksLib.books);
    if (keys.length === 0) { booksAdd("لا دې کوم کتاب نه دی خوندي کړی — یو کتاب ولټوه."); return; }
    keys.forEach(function (k) {
        var b = booksLib.books[k];
        var d = booksEl("div", (b.title || b.ia) + " — مخ " + pashtoDigits(b.page || 1));
        d.addEventListener("click", function () { booksOpen(b.ia, b.file, b.title, b.author); });
        booksResultEl.appendChild(d);
    });
}
function showBookSearchResults(results) {
    booksClear();
    if (results.length === 0) { booksAdd("هیڅ کتاب ونه موندل شو."); return; }
    results.forEach(function (r) {
        var ia = (r.ia && r.ia[0]) || "";
        var label = (r.title || "") + (r.author && r.author[0] ? " — " + r.author[0] : "") + (r.year ? " (" + r.year + ")" : "");
        var d = booksEl("div", label);
        if (ia) d.addEventListener("click", function () { booksOpen(ia, "", r.title, (r.author && r.author[0]) || ""); });
        booksResultEl.appendChild(d);
    });
}
function booksTurnPage(dir) {
    var entry = booksCurrentEntry();
    if (!entry) return;
    var next = (entry.page || 1) + dir;
    if (next < 1 || (entry.total && next > entry.total)) return;
    booksLoadPage(next);
}
function booksToggleBookmark() {
    var entry = booksCurrentEntry();
    if (!entry) return;
    if (!Array.isArray(entry.marks)) entry.marks = [];
    var i = entry.marks.indexOf(entry.page);
    if (i === -1) entry.marks.push(entry.page); else entry.marks.splice(i, 1);
    saveBooks();
    booksMarkBtn.textContent = i === -1 ? "نښه ✓" : "نښه";
}
function booksSaveNote() {
    var entry = booksCurrentEntry();
    if (!entry) return;
    if (!entry.notes) entry.notes = {};
    entry.notes[entry.page] = booksNoteEl.value;
    saveBooks();
}
loadBooks();
