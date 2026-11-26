// #170 Ornate book viewer (2/2). Hifz + Fiqh built (Stage 3 Phase 2).
var ornatePanelEl = null, ornateTitleEl = null, ornateBodyEl = null;
var ornatePageEl = null, ornateChapEl = null, ornateResEl = null;
var ornateSearchEl = null, ornateMarkBtn = null;
var ornateRC = false, ornateRV = false, ornateRD = false, ornateRS = false;
function ornateDiv(i, c) { var d = document.createElement("div"); if (i) d.id = i; if (c) d.style.cssText = c; return d; }
function ornateOpen(book) {
  if (!book || !book.text) { showToast("متن نشته"); return false; }
  buildOrnatePanel();
  ornateCur = { title: book.title || "کتاب", kind: book.kind || ornateKindOf(book.title), key: book.key || book.title };
  ornateChaps = ornateChapters(book.text);
  ornateShow(ornateLoadMark(ornateCur.key));
  return true;
}
function buildOrnatePanel() {
  ornateRegister();
  if (ornatePanelEl) return ornatePanelEl;
  var p = ornateDiv("ornatePanel", "display:none;flex:1;flex-direction:column;gap:12px;overflow-y:auto");
  p.appendChild(booksBtn("← بیرته", function () { showPanel("chat"); }));
  p.appendChild(booksEl("div", "ښکلی کتاب"));
  var frame = ornateDiv("ornateFrame", "border:3px double #B8860B;border-radius:12px;padding:16px;background:#FFFBF0;");
  ornateTitleEl = booksEl("div", "");
  frame.appendChild(ornateTitleEl);
  frame.appendChild(booksEl("div", "✦ ✦ ✦"));
  ornateBodyEl = ornateDiv("ornateBody", "white-space:pre-wrap;font-family:Georgia,serif;font-size:19px;line-height:2;");
  frame.appendChild(ornateBodyEl);
  ornatePageEl = booksEl("div", "");
  frame.appendChild(ornatePageEl);
  p.appendChild(frame);
  ornateChapEl = booksEl("div", "");
  p.appendChild(ornateChapEl);
  var nav = booksEl("div", "");
  [["← مخکینی", ornatePrev], ["راتلونکی →", ornateNext]].forEach(function (pair) { nav.appendChild(booksBtn(pair[0], pair[1])); });
  nav.appendChild(booksBtn("مخکینی مخ", function () { ornateBookPage(-1); }));
  nav.appendChild(booksBtn("بل مخ", function () { ornateBookPage(1); }));
  ornateMarkBtn = booksBtn("نښه", ornateMark);
  nav.appendChild(ornateMarkBtn);
  p.appendChild(nav);
  ornateSearchEl = document.createElement("input");
  ornateSearchEl.placeholder = "په کتاب کې لټون";
  p.appendChild(ornateSearchEl);
  p.appendChild(booksBtn("لټون", ornateSearch));
  ornateResEl = booksEl("div", "");
  p.appendChild(ornateResEl);
  var r = booksEl("div", "");
  r.appendChild(booksBtn("🕌 حفظ", function () { if (typeof hifzOpen === "function") hifzOpen(); }));
  r.appendChild(booksBtn("📜 فقه", function () { if (typeof fiqhOpen === "function") fiqhOpen(); }));
  p.appendChild(r);
  document.getElementById("main").appendChild(p);
  ornatePanelEl = p;
  return p;
}
function ppOpenOrnate() {
  buildOrnatePanel();
  if (!ornateOpenCurrent()) {
    ornateCur = null; ornateChaps = []; ornateIdx = 0;
    if (ornateBodyEl) ornateBodyEl.textContent = "لومړی یو کتاب پرانیزه — بیا دلته ولوله.";
    if (ornatePageEl) ornatePageEl.textContent = "";
  }
  showPanel("ornate");
}
function ppAddOrnateBtn() {
  var a = document.getElementById("inputArea");
  if (!a || document.getElementById("ppOrnateBtn") || typeof bEl !== "function") return;
  var b = bEl("button", "ppOrnateBtn", "📖 ښکلی کتاب");
  b.addEventListener("click", ppOpenOrnate);
  a.appendChild(b);
}
function ornateRegister() {
  if (typeof CAPABILITIES !== "undefined") CAPABILITIES.ornate = { name: "ښکلی کتاب", status: "available", stage: 3 };
  if (typeof UNIVERSE_TYPES !== "undefined" && !ornateRC) { ornateRC = true; UNIVERSE_TYPES.ornate = { cap: "ornate", panel: "ornate", name: "ښکلی کتاب" }; UNIVERSE_HINTS.ornate = "کتاب په ښکلي کتاب کې ولوله"; }
  if (typeof verifyCapability === "function" && !ornateRV) { ornateRV = true; var _ov = verifyCapability; verifyCapability = function (c) { if (c === "ornate") return { ok: typeof buildOrnatePanel === "function", missing: "ornate" }; return _ov(c); }; }
  if (typeof universeDirect === "function" && !ornateRD) { ornateRD = true; var _od = universeDirect; universeDirect = function (q) { q = q || ""; if (q.indexOf("ښکلی کتاب") !== -1 || (q.indexOf("ولوله") !== -1 && (q.indexOf("کتاب") !== -1 || q.indexOf("قرآن") !== -1))) return "ornate"; return _od(q); }; }
  if (typeof showUniversePanel === "function" && !ornateRS) { ornateRS = true; var _os = showUniversePanel; showUniversePanel = function (n) { _os(n); var p = n === "ornate" ? buildOrnatePanel() : ornatePanelEl; if (p) p.style.display = n === "ornate" ? "flex" : "none"; }; }
  ppAddOrnateBtn();
}
ornateRegister();
if (typeof setTimeout === "function") setTimeout(ornateRegister, 800);
