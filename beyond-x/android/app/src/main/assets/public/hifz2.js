// Stage 3 Phase 2 — Hifz (2/2): picker, session, revision.
// Ayahs come LIVE via xIslamic, shown in the ornate book only.
var hifzPanelEl = null, hifzListEl = null, hifzDueEl = null, hifzProgEl = null;
var hifzCur = null;
function hifzShowPanel(show) { wsShow(hifzPanelEl, show); }
var _hzShowUni = showUniversePanel; showUniversePanel = function (n) { _hzShowUni(n); hifzShowPanel(n === "hifz"); };
function hifzOpen() { buildHifzPanel(); hifzRender(); showPanel("hifz"); return true; }
function buildHifzPanel() {
  if (hifzPanelEl) return hifzPanelEl;
  var p = wsPanel("hifzPanel");
  p.appendChild(wsEl("div", "حفظ — قرآن کریم"));
  p.appendChild(wsEl("div", "یو آیت وټاکه؛ ویې لوله؛ پټ یې کړه؛ له یاده یې ووایه؛ بیا یې وګوره."));
  hifzProgEl = wsEl("div", ""); p.appendChild(hifzProgEl);
  hifzDueEl = wsEl("div", ""); p.appendChild(hifzDueEl);
  hifzListEl = wsEl("div", ""); p.appendChild(hifzListEl);
  hifzPanelEl = p; return p;
}
function hifzRender() {
  if (!hifzListEl) return;
  var st = hifzLoad(), t = hifzTotal(st);
  hifzProgEl.textContent = "زده کړي: " + pashtoDigits(t.done) + " • نن بیا کتنه: " + pashtoDigits(t.due);
  wsClear(hifzDueEl);
  var due = hifzDue(st, Date.now());
  if (!due.length) hifzDueEl.appendChild(wsEl("div", "نن هېڅ بیا کتنه نشته."));
  else due.forEach(function (ref) { var r = ref.split(":"); hifzDueEl.appendChild(wsBtn("بیا کتنه: " + ref, function () { hifzStart(+r[0], +r[1]); })); });
  wsClear(hifzListEl);
  HIFZ_SURAHS.forEach(function (su) { var pr = hifzProgress(st, su.n); hifzListEl.appendChild(wsBtn(su.p + " • " + pashtoDigits(pr.done) + "/" + pashtoDigits(pr.total), function () { hifzStart(su.n, 1); })); });
}
async function hifzStart(s, a) {
  var su = hifzSurah(s); if (!su) return false;
  hifzCur = { s: s, a: a || 1, total: su.c, arabic: "", trans: "", ref: "", hidden: false };
  return hifzFetchAyah();
}
async function hifzFetchAyah() {
  try {
    var r = await xIslamic("/quran/ayah/" + hifzCur.s + ":" + hifzCur.a, await ensureSession());
    if (!r || typeof r.text !== "string" || !r.text) throw new Error("Bad response");
    hifzCur.arabic = r.text; hifzCur.trans = (r.translation && r.translation.text) || "";
    hifzCur.ref = hifzCur.s + ":" + hifzCur.a; hifzCur.hidden = false;
    hifzShowCur(); return true;
  } catch (e) { showToast("آیت و نه شو لوستل شوی — بیا هڅه وکړه"); return false; }
}
function hifzCurText() { return hifzCur.arabic + "\n" + hifzCur.trans + "\n" + "سورة " + hifzSurah(hifzCur.s).p + " — آیت " + pashtoDigits(hifzCur.a) + " / " + pashtoDigits(hifzCur.total); }
function hifzShowCur() {
  ornateOpenText("حفظ — سورة " + hifzSurah(hifzCur.s).p, hifzCurText(), "quran");
  showPanel("ornate"); hifzBuildControls(); hifzCtlUpdate();
}
function hifzBuildControls() {
  buildOrnatePanel();
  var old = document.getElementById("hifzCtl"); if (old) { old.style.display = ""; return old; }
  var row = ornateDiv("hifzCtl", "");
  row.appendChild(booksBtn("پټ کړه", hifzToggle));
  row.appendChild(booksBtn("زده مې کړه ✓", hifzMarkCur));
  row.appendChild(booksBtn("مخکینی آیت", hifzPrev));
  row.appendChild(booksBtn("بل آیت", hifzNext));
  row.appendChild(ornateDiv("hifzStat", ""));
  ornatePanelEl.appendChild(row);
  return row;
}
function hifzCtlUpdate() {
  var st = document.getElementById("hifzStat"); if (!st || !hifzCur) return;
  var pr = hifzProgress(hifzLoad(), hifzCur.s);
  st.textContent = "آیت " + pashtoDigits(hifzCur.a) + " / " + pashtoDigits(hifzCur.total) + " • زده کړي: " + pashtoDigits(pr.done) + "/" + pashtoDigits(pr.total);
  var row = document.getElementById("hifzCtl");
  if (row && row.children[0]) row.children[0].textContent = hifzCur.hidden ? "وښیه" : "پټ کړه";
}
function hifzToggle() {
  if (!hifzCur || !ornateBodyEl) return;
  if (hifzCur.hidden) { ornateBodyEl.textContent = hifzCurText(); hifzCur.hidden = false; }
  else { ornateBodyEl.textContent = hifzCur.trans + "\n" + "سورة " + hifzSurah(hifzCur.s).p + " — آیت " + pashtoDigits(hifzCur.a); hifzCur.hidden = true; }
  hifzCtlUpdate();
}
function hifzMarkCur() {
  if (!hifzCur) return;
  var st = hifzLoad();
  if (st.m[hifzCur.ref]) { hifzRevise(st, hifzCur.ref, Date.now()); showToast("بیا کتنه وشوه"); }
  else { hifzMark(st, hifzCur.ref, Date.now()); showToast("خوندي شو — بیا کتنه سبا"); }
  hifzCtlUpdate();
}
async function hifzNext() { if (!hifzCur) return; if (hifzCur.a >= hifzCur.total) { showToast("سورت پای ته ورسېد"); return; } hifzCur.a++; await hifzFetchAyah(); }
async function hifzPrev() { if (!hifzCur || hifzCur.a <= 1) return; hifzCur.a--; await hifzFetchAyah(); }
