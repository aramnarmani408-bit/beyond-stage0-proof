// JD14 Proof 1 — Physics 11 Ch.1, part 5/5 (logic). Assembles the course
// from PHYS11_LESSONS_1..4 + PHYS11_QUIZ_1..4, opens it in the course
// workspace, and runs the 12-question quiz in its own panel. The quiz
// lesson is lesson 9; its quiz array rides cwNormLesson's quiz field.
// Deferred (phys11 group): phys11Open here replaces the lazyload.js stub.
var PHYS11_TITLE = "فزیک ۱۱ — وکتورونه او سکالر کمیتونه";
var phys11QuizEl = null, phys11QuizQEl = null, phys11QuizCEl = null, phys11QuizFEl = null, phys11QuizNEl = null;
var phys11QuizState = null;
function phys11Course() {
  var lessons = PHYS11_LESSONS_1.concat(PHYS11_LESSONS_2, PHYS11_LESSONS_3, PHYS11_LESSONS_4);
  var quiz = PHYS11_QUIZ_1.concat(PHYS11_QUIZ_2, PHYS11_QUIZ_3, PHYS11_QUIZ_4);
  var out = [];
  for (var i = 0; i < lessons.length; i++) {
    var l = { title: lessons[i].title, text: lessons[i].text };
    if (i === lessons.length - 1) l.quiz = quiz;
    out.push(l);
  }
  return { title: PHYS11_TITLE, lessons: out };
}
function phys11Open() {
  var c = phys11Course();
  var st = cwGetState();
  for (var i = 0; i < st.courses.length; i++) {
    if (st.courses[i].title === PHYS11_TITLE) { st.cur = i; cwSave(st); ppOpenCourseWs(); return true; }
  }
  fillCourseWsPanel(c);
  ppOpenCourseWs();
  return true;
}
function phys11BuildQuizPanel() {
  if (phys11QuizEl) return phys11QuizEl;
  var p = wsPanel("phys11QuizPanel");
  p.appendChild(wsEl("div", "پوښتنې او تمرینونه — فزیک ۱۱"));
  phys11QuizQEl = wsEl("div", "");
  phys11QuizCEl = wsEl("div", "");
  phys11QuizFEl = wsEl("div", "");
  p.appendChild(phys11QuizQEl);
  p.appendChild(phys11QuizCEl);
  p.appendChild(phys11QuizFEl);
  phys11QuizNEl = wsBtn("بله پوښتنه", phys11QuizNext);
  p.appendChild(phys11QuizNEl);
  p.appendChild(wsBtn("کورس ته بېرته", function () { showPanel("coursews"); }));
  phys11QuizEl = p;
  return p;
}
function phys11QuizShow() {
  var s = phys11QuizState;
  if (!s || !phys11QuizQEl) return;
  wsClear(phys11QuizCEl); wsClear(phys11QuizFEl);
  if (s.idx >= s.quiz.length) {
    phys11QuizQEl.textContent = "پایله: " + s.score + "/" + s.quiz.length;
    phys11QuizFEl.textContent = s.score === s.quiz.length ? "ټولې پوښتنې سمې دې — درس بشپړ شو" : "بیا هڅه وکړه — درسونه وګوره او پوښتنې تکرار کړه";
    phys11QuizNEl.textContent = "کورس ته بېرته";
    var st = cwGetState();
    var c = cwCurCourse(st);
    if (c && s.score === s.quiz.length) {
      for (var i = 0; i < c.lessons.length; i++) {
        if (c.lessons[i].title === "پوښتنې او تمرینونه") { cwMarkLesson(c, i, true); cwSave(st); cwRender(); break; }
      }
    }
    return;
  }
  var q = s.quiz[s.idx];
  phys11QuizQEl.textContent = (s.idx + 1) + ". " + q.q;
  phys11QuizNEl.textContent = "بله پوښتنه";
  for (var i = 0; i < q.c.length; i++) {
    (function (n) {
      var b = wsBtn(q.c[n], function () { phys11QuizAnswer(n); });
      phys11QuizCEl.appendChild(b);
    })(i);
  }
}
function phys11StartQuiz(lesson) {
  var quiz = (lesson && lesson.quiz) || [];
  if (!quiz.length) return false;
  phys11BuildQuizPanel();
  phys11QuizState = { lesson: lesson, quiz: quiz, idx: 0, score: 0, locked: false };
  phys11QuizShow();
  showPanel("phys11quiz");
  return true;
}
function phys11QuizAnswer(n) {
  var s = phys11QuizState;
  if (!s || s.locked || s.idx >= s.quiz.length) return false;
  s.locked = true;
  var q = s.quiz[s.idx];
  var ok = n === q.a;
  if (ok) s.score++;
  var kids = phys11QuizCEl.children || [];
  for (var i = 0; i < kids.length; i++) { try { kids[i].disabled = true; } catch (e) {} }
  phys11QuizFEl.textContent = (ok ? "سم دی ✓" : "ناسم دی — سم ځواب: " + q.c[q.a]) + " — " + q.w;
  return ok;
}
function phys11QuizNext() {
  var s = phys11QuizState;
  if (!s) return false;
  if (s.idx >= s.quiz.length) { showPanel("coursews"); return true; }
  if (!s.locked) { phys11QuizFEl.textContent = "لومړی یو ځواب وټاکه"; return false; }
  s.idx++;
  s.locked = false;
  phys11QuizShow();
  return true;
}
function phys11QuizScore() {
  var s = phys11QuizState;
  if (!s) return { score: 0, total: 0 };
  return { score: s.score, total: s.quiz.length };
}
if (typeof showUniversePanel === "function") {
  var _p11ShowUni = showUniversePanel;
  showUniversePanel = function (n) { _p11ShowUni(n); wsShow(phys11QuizEl, n === "phys11quiz"); };
}
