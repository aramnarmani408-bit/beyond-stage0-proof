// #170 Ornate book viewer (1/2) — chapters, verbatim render, search,
// bookmarks, book-page turning, open-from-books. Quran / Hadith /
// books are read in a decorated book page, never as a plain chat
// bubble. Text is VERBATIM via textContent. Built (Stage 3 Phase 2):
// Hifz + Fiqh (deferred hifz1/2.js + fiqh1/2/3.js). No new fetch.
var ORNATE_KEY = "beyondx-ornate-v1";
var ornateCur = null, ornateChaps = [], ornateIdx = 0;
function ornateKindOf(t) { t = String(t || ""); if (t.indexOf("قرآن") !== -1) return "quran"; if (t.indexOf("حدیث") !== -1 || t.indexOf("بخاري") !== -1 || t.indexOf("مسلم") !== -1) return "hadith"; return "book"; }
function ornateKindLabel(k) { return k === "quran" ? "قرآن کریم" : k === "hadith" ? "حدیث شریف" : "کتاب"; }
function ornateIsHeading(line) { if (line.length > 80) return false; return line.indexOf("باب") === 0 || line.indexOf("فصل") === 0 || line.indexOf("سورت") === 0 || line.indexOf("Chapter") === 0; }
function ornateChapters(text) {
  var lines = String(text || "").split("\n"), out = [], cur = { title: "", lines: [] };
  function push() { if (cur.lines.length) out.push({ title: cur.title || ("برخه " + pashtoDigits(out.length + 1)), text: cur.lines.join("\n") }); }
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;
    if (ornateIsHeading(line)) { push(); cur = { title: line, lines: [] }; continue; }
    cur.lines.push(lines[i]);
    if (cur.lines.join("\n").length > 1500) { push(); cur = { title: "", lines: [] }; }
  }
  push();
  if (!out.length) out.push({ title: "کتاب", text: String(text || "") });
  return out;
}
function ornateSaveMark() { try { if (!ornateCur) return; localStorage.setItem(ORNATE_KEY, JSON.stringify({ key: ornateCur.key, idx: ornateIdx })); } catch (e) {} }
function ornateLoadMark(key) { try { var s = JSON.parse(localStorage.getItem(ORNATE_KEY) || "null"); if (s && s.key === key && typeof s.idx === "number") return s.idx; } catch (e) {} return 0; }
function ornateMark() { ornateSaveMark(); if (ornateMarkBtn) ornateMarkBtn.textContent = "نښه ✓"; showToast("نښه خوندي شوه"); }
function ornateShow(i) {
  if (!ornateChaps.length) return false;
  if (i < 0) i = 0; if (i >= ornateChaps.length) i = ornateChaps.length - 1;
  ornateIdx = i;
  buildOrnatePanel();
  var c = ornateChaps[i];
  ornateTitleEl.textContent = (ornateCur ? ornateCur.title : "کتاب") + " — " + ornateKindLabel(ornateCur ? ornateCur.kind : "book");
  ornateBodyEl.textContent = c.text;
  ornatePageEl.textContent = c.title + " • برخه " + pashtoDigits(i + 1) + " / " + pashtoDigits(ornateChaps.length);
  while (ornateChapEl.firstChild) ornateChapEl.removeChild(ornateChapEl.firstChild);
  for (var k = 0; k < ornateChaps.length; k++) { (function (n) { ornateChapEl.appendChild(booksBtn((n === ornateIdx ? "• " : "") + ornateChaps[n].title, function () { ornateShow(n); })); })(k); }
  if (ornateMarkBtn) ornateMarkBtn.textContent = "نښه";
  return true;
}
function ornateNext() { return ornateShow(ornateIdx + 1); }
function ornatePrev() { return ornateShow(ornateIdx - 1); }
function ornateSearch() {
  if (!ornateCur || !ornateSearchEl) return 0;
  var q = ornateSearchEl.value.trim();
  if (!q) { if (ornateResEl) ornateResEl.textContent = "لټون ولیکئ."; return 0; }
  var count = 0, first = -1;
  for (var i = 0; i < ornateChaps.length; i++) { var t = ornateChaps[i].text, pos = -1; while ((pos = t.indexOf(q, pos + 1)) !== -1) { count++; if (first === -1) first = i; } }
  if (!count) { if (ornateResEl) ornateResEl.textContent = "نه وموندل شو: " + q; return 0; }
  ornateShow(first);
  if (ornateResEl) ornateResEl.textContent = pashtoDigits(count) + " موندل شوي • " + q;
  return count;
}
function ornateOpenText(title, text, kind) { return ornateOpen({ title: title, kind: kind || "book", text: text, key: "text:" + String(title || "کتاب") }); }
function ornateOpenCurrent() {
  var entry = booksCurrentEntry();
  if (!entry) { showToast("لومړی یو کتاب پرانیزه"); return false; }
  var text = booksReadEl ? booksReadEl.textContent : "";
  if (!text) { showToast("متن لا نه دی راغلی"); return false; }
  return ornateOpen({ title: entry.title || entry.ia, kind: ornateKindOf(entry.title), text: text, key: booksKey(entry.ia, entry.file) });
}
function ornateBookPage(dir) {
  var entry = booksCurrentEntry();
  if (!entry) { showToast("لومړی یو کتاب پرانیزه"); return false; }
  booksTurnPage(dir);
  setTimeout(function () { ornateOpenCurrent(); }, 600);
  return true;
}
