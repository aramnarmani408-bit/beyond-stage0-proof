// Stage 12: lesson workspace — interactive lessons on a blackboard.
var lessonPanelEl = null;
var lessonBoardEl = null;
var lessonProgressEl = null;
var lessonSteps = [];
var lessonDone = {};
var lessonOpen = {};
function lessonLevel() {
  var w = (quizState.weak || []).length + (quizState.sentWeak || []).length;
  if (w >= 4) return "اسانه";
  if (w >= 1) return "منځنی";
  return "سخت";
}
function buildLessonPanel() {
  if (lessonPanelEl) return lessonPanelEl;
  var p = wsPanel("lessonPanel");
  p.appendChild(wsEl("div", "درس — کچه: " + lessonLevel()));
  lessonBoardEl = wsEl("div", "");
  lessonBoardEl.style.background = "#0A0A1F";
  lessonBoardEl.style.padding = "12px";
  p.appendChild(lessonBoardEl);
  lessonProgressEl = wsEl("div", "");
  p.appendChild(lessonProgressEl);
  p.appendChild(wsBtn("کوئز وکړه", function () { showPanel("school"); }));
  p.appendChild(wsBtn("پرمختګ خوندي کړه", function () { universeSave("lesson", { steps: lessonSteps.length, done: lessonDoneCount(), at: Date.now() }); showToast("پرمختګ خوندي شو"); }));
  lessonPanelEl = p;
  lessonRender();
  return p;
}
function lessonDoneCount() {
  var n = 0;
  for (var k in lessonDone) if (lessonDone[k]) n++;
  return n;
}
function lessonRender() {
  if (!lessonBoardEl) return;
  wsClear(lessonBoardEl);
  if (lessonSteps.length === 0) lessonBoardEl.appendChild(wsEl("div", "لومړی پوښتنه وکړه — درس به دلته جوړ شي."));
  for (var i = 0; i < lessonSteps.length; i++) {
    (function (idx) {
      var s = lessonSteps[idx];
      var row = wsEl("div", "");
      row.appendChild(wsEl("div", (lessonDone[idx] ? "✓ " : "") + s.title));
      row.appendChild(wsBtn("تشریح", function () { lessonOpen[idx] = !lessonOpen[idx]; lessonRender(); }));
      row.appendChild(wsBtn("وشو", function () { lessonDone[idx] = true; lessonRender(); }));
      if (lessonOpen[idx]) row.appendChild(wsEl("div", s.text));
      lessonBoardEl.appendChild(row);
    })(i);
  }
  if (lessonProgressEl) lessonProgressEl.textContent = "پرمختګ: " + lessonDoneCount() + "/" + lessonSteps.length + " — کمزورې: " + ((quizState.weak || []).length + (quizState.sentWeak || []).length);
}
function fillLessonPanel(content) {
  lessonSteps = (content && content.steps) || [];
  lessonDone = {};
  lessonOpen = {};
  lessonRender();
}
function showLessonPanel(show) { if (lessonPanelEl) lessonPanelEl.style.display = show ? "flex" : "none"; }
