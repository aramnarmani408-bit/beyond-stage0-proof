// #174 Course workspace (2/3) — panel. Renders the course list, the
// lesson list with per-lesson progress, the current lesson view with
// مخکې / بل navigation, and overall course progress. Mutations,
// fill and registry live in coursews3.js. No new fetch.
var cwPanelEl = null, cwListEl = null, cwViewEl = null, cwProgEl = null, cwTitleEl = null, cwLessonTitleEl = null, cwLessonTextEl = null;
var cwState = null;
function cwGetState() { if (!cwState) cwState = cwLoad(); return cwState; }
function cwCurLesson() { var c = cwCurCourse(cwGetState()); if (!c || !c.lessons.length) return null; return c.lessons[Math.min(c.cur || 0, c.lessons.length - 1)]; }
function cwInput(ph) { var e = document.createElement("input"); e.placeholder = ph; return e; }
function cwRender() {
  if (!cwListEl || !cwViewEl || !cwProgEl) return;
  var st = cwGetState();
  wsClear(cwListEl); wsClear(cwViewEl);
  var c = cwCurCourse(st);
  if (!st.courses.length) { cwListEl.appendChild(wsEl("div", "کورس نشته — نوی کورس جوړ کړه.")); cwProgEl.textContent = "پرمختګ: 0/0"; return; }
  st.courses.forEach(function (co, idx) { var p = cwCourseProgress(co); var r = wsEl("div", ""); r.appendChild(wsEl("div", co.title + " • " + p.done + "/" + p.total + " • " + p.pct + "٪")); r.appendChild(wsBtn("خلاص کړه", function () { st.cur = idx; cwSave(st); cwRender(); })); cwListEl.appendChild(r); });
  if (!c) return;
  var pr = cwCourseProgress(c);
  cwProgEl.textContent = "پرمختګ: " + pr.done + "/" + pr.total + " • " + pr.pct + "٪";
  c.lessons.forEach(function (l, idx) { var r = wsEl("div", ""); r.appendChild(wsEl("div", (l.done ? "✓ " : "") + (idx + 1) + ". " + l.title)); r.appendChild(wsBtn("خلاص کړه", function () { c.cur = idx; cwSave(st); cwRender(); })); r.appendChild(wsBtn("وشو", function () { cwMarkLesson(c, idx, true); cwSave(st); cwRender(); })); cwListEl.appendChild(r); });
  var l = cwCurLesson();
  if (l) {
    cwViewEl.appendChild(wsEl("div", l.title));
    cwViewEl.appendChild(wsEl("div", l.text || "متن نشته."));
    cwViewEl.appendChild(wsBtn("مخکې", function () { var n = cwPrevIdx(c, c.cur || 0); if (n !== -1) { c.cur = n; cwSave(st); cwRender(); } }));
    cwViewEl.appendChild(wsBtn("بل", function () { var n = cwNextIdx(c, c.cur || 0); if (n !== -1) { c.cur = n; cwSave(st); cwRender(); } }));
    cwViewEl.appendChild(wsBtn("بشپړ کړه", function () { cwMarkLesson(c, c.cur || 0, true); cwSave(st); cwRender(); showToast("درس بشپړ شو"); }));
    cwViewEl.appendChild(wsBtn("درس وګوره", function () { buildLessonPanel(); fillLessonPanel({ steps: cwLessonSteps(l) }); showPanel("lesson"); }));
  }
}
function buildCourseWsPanel() {
  if (cwPanelEl) return cwPanelEl;
  var p = wsPanel("coursewsPanel");
  p.appendChild(wsEl("div", "کورس کارځای"));
  p.appendChild(wsEl("div", "کورس = په ترتیب درسونه. پرمختګ په وسیله کې خوندي کېږي."));
  cwTitleEl = cwInput("د کورس نوم"); p.appendChild(cwTitleEl);
  p.appendChild(wsBtn("نوی کورس", cwAddCourse));
  cwLessonTitleEl = cwInput("د درس نوم"); p.appendChild(cwLessonTitleEl);
  cwLessonTextEl = cwInput("د درس متن"); p.appendChild(cwLessonTextEl);
  p.appendChild(wsBtn("درس زیات کړه", cwAddLessonToCur));
  p.appendChild(wsBtn("له درس څخه کورس جوړ کړه", cwFromLesson));
  cwProgEl = wsEl("div", ""); p.appendChild(cwProgEl);
  cwListEl = wsEl("div", ""); p.appendChild(cwListEl);
  cwViewEl = wsEl("div", ""); p.appendChild(cwViewEl);
  cwPanelEl = p; cwRender(); return p;
}
function showCourseWsPanel(show) { wsShow(cwPanelEl, show); }
function ppOpenCourseWs() { buildCourseWsPanel(); cwRender(); showPanel("coursews"); }
function ppAddCourseWsBtn() { var a = document.getElementById("inputArea"); if (!a || document.getElementById("ppCourseWsBtn")) return; var b = bEl("button", "ppCourseWsBtn", "📚 کورس"); b.addEventListener("click", ppOpenCourseWs); a.appendChild(b); }
