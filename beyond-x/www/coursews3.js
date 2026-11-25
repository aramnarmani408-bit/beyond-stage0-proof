// #174 Course workspace (3/3) — mutations, fill + registry. Reuses
// lessonws.js: "له درس څخه کورس جوړ کړه" wraps lessonSteps via
// cwFromLessonSteps; fillCourseWsPanel accepts {lessons:[...]} (the
// future book-to-course step hands it a parsed course), a lesson
// {steps:[...]}, or an answer string split by cwSplitLessons.
// No new fetch. Local-first (cwLoad / cwSave).
function cwPushCourse(st, c) { st.courses.unshift(c); if (st.courses.length > CW_MAX_COURSES) st.courses.length = CW_MAX_COURSES; st.cur = 0; }
function cwAddCourse() { var st = cwGetState(); cwPushCourse(st, cwNewCourse(cwTitleEl ? cwTitleEl.value : "")); cwSave(st); cwRender(); showToast("کورس جوړ شو"); }
function cwAddLessonToCur() { var st = cwGetState(); var c = cwCurCourse(st); if (!c) { showToast("لومړی یو کورس جوړ کړه"); return; } var ok = cwAddLesson(c, cwLessonTitleEl ? cwLessonTitleEl.value : "", cwLessonTextEl ? cwLessonTextEl.value : ""); if (!ok) { showToast("د درس نوم ولیکئ"); return; } cwSave(st); cwRender(); showToast("درس زیات شو"); }
function cwFromLesson() { var st = cwGetState(); var c = cwFromLessonSteps(typeof lessonSteps !== "undefined" ? lessonSteps : []); if (!c) { showToast("لومړی یو درس جوړ کړه"); return; } cwPushCourse(st, c); cwSave(st); cwRender(); showToast("کورس جوړ شو"); }
function fillCourseWsPanel(content) {
  buildCourseWsPanel();
  var st = cwGetState();
  if (typeof content === "string") {
    if (content) { var ls = cwSplitLessons(content); if (ls.length) { var c = cwNewCourse("د ځواب کورس"); c.lessons = ls; cwPushCourse(st, c); } }
  } else if (content && Array.isArray(content.lessons) && content.lessons.length) {
    var c2 = cwNewCourse(content.title || "نوی کورس");
    for (var i = 0; i < content.lessons.length; i++) { var l = content.lessons[i] || {}; cwAddLesson(c2, l.title || "درس", l.text || ""); }
    cwPushCourse(st, c2);
  } else if (content && Array.isArray(content.steps) && content.steps.length) {
    var c3 = cwFromLessonSteps(content.steps, content.title);
    if (c3) cwPushCourse(st, c3);
  }
  cwSave(st); cwRender();
}
if (typeof CAPABILITIES !== "undefined") CAPABILITIES.coursews = { name: "کورس", status: "available", stage: 12 };
if (typeof UNIVERSE_TYPES !== "undefined") { UNIVERSE_TYPES.coursews = { cap: "coursews", panel: "coursews", name: "کورس" }; UNIVERSE_HINTS.coursews = "درسونه په ترتیب ولوله او پرمختګ وګوره"; }
var _cwVerify = verifyCapability; verifyCapability = function (c) { if (c === "coursews") return { ok: typeof buildCourseWsPanel === "function", missing: "coursews" }; return _cwVerify(c); };
var _cwIsCap = isUniverseCap; isUniverseCap = function (c) { return c === "coursews" || _cwIsCap(c); };
var _cwDirect = universeDirect; universeDirect = function (q) { q = q || ""; if (q.indexOf("کورس") !== -1 && (q.indexOf("جوړ") !== -1 || q.indexOf("خلاص") !== -1 || q.indexOf("وګوره") !== -1 || q.indexOf("پیل") !== -1)) return "coursews"; return _cwDirect(q); };
var _cwBuild = universeBuild; universeBuild = function (t) { if (t === "coursews") return buildCourseWsPanel(); return _cwBuild(t); };
var _cwFill = universeFill; universeFill = function (t, a) { if (t === "coursews") { fillCourseWsPanel(a || ""); return; } _cwFill(t, a); };
var _cwShowUni = showUniversePanel; showUniversePanel = function (n) { _cwShowUni(n); wsShow(cwPanelEl, n === "coursews"); };
if (typeof setTimeout === "function") setTimeout(ppAddCourseWsBtn, 800);
