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
  lessonBoardEl.style.background = "var(--cd)";
  lessonBoardEl.style.padding = "12px";
  p.appendChild(lessonBoardEl);
  lessonProgressEl = wsEl("div", "");
  p.appendChild(lessonProgressEl);
  p.appendChild(wsBtn("کوئز وکړه", function () { showPanel("school"); }));
  p.appendChild(wsBtn("پرمختګ خوندي کړه", function () { universeSave("lesson", { steps: lessonSteps.length, done: lessonDoneCount(), at: Date.now() }); showToast("پرمختګ خوندي شو"); }));
  p.appendChild(promptExamples("lesson"));
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
function showLessonPanel(show) { wsShow(lessonPanelEl, show); }
// #168 Math workspace: a dedicated panel with a local calculator
// (deterministic, computed here, never faked).
function ppMathCalc(a,op,b){var x=parseFloat(a),y=parseFloat(b);if(isNaN(x)||isNaN(y))return null;if(op==="+")return x+y;if(op==="-")return x-y;if(op==="×")return x*y;if(op==="÷")return y===0?null:x/y;return null;}
function buildMathPanel(){var p=document.getElementById("mathPanel");if(p)return p;p=wsPanel("mathPanel");p.appendChild(wsEl("div","ریاضي کارځای"));var a=document.createElement("input");a.placeholder="لومړی عدد";var op=document.createElement("select");["+","-","×","÷"].forEach(function(o){var e=document.createElement("option");e.textContent=o;op.appendChild(e);});var b=document.createElement("input");b.placeholder="دوهم عدد";var res=wsEl("div","");p.appendChild(a);p.appendChild(op);p.appendChild(b);p.appendChild(wsBtn("حساب کړه",function(){var v=ppMathCalc(a.value,op.value,b.value);res.textContent=(v===null)?"عددونه ولیکئ یا په صفر مه وېشئ":"ځواب: "+v;}));p.appendChild(res);return p;}
function showMathPanel(show){var p=document.getElementById("mathPanel");if(!p){if(show)buildMathPanel();return;}wsShow(p,show);}
function ppOpenMath(){if(typeof activateWorkspace==="function")activateWorkspace("math","build");buildMathPanel();showPanel("math");}
function ppAddMathBtn(){var a=document.getElementById("inputArea");if(!a||document.getElementById("ppMathBtn"))return;var b=bEl("button","","🧮");b.id="ppMathBtn";b.addEventListener("click",ppOpenMath);a.appendChild(b);}
