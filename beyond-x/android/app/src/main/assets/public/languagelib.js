var LANG_CORE = "کور|house;اوبه|water;کتاب|book;مینه|love;ښوونځی|school;مور|mother;پلار|father;ورور|brother;خور|sister;زوی|son;لور|daughter;سړی|man;ښځه|woman;لمر|sun;سپوږمۍ|moon;ستوری|star;ځمکه|earth;اسمان|sky;ونه|tree;ګل|flower;سپی|dog;غوا|cow;ډوډۍ|food, meal;اور|fire;باران|rain".split(";").map(function (s) { return s.split("|"); });
var LANG_KEY = "beyondx-language-v1";
var languageProgress = { learned: [], weak: [], streak: 0, day: "" };
function languageSaveState() {
  try { localStorage.setItem(LANG_KEY, JSON.stringify(languageProgress)); }
  catch (e) {}
}
function languageLoadState() {
  try {
    var s = JSON.parse(localStorage.getItem(LANG_KEY) || "0");
    if (!s || !Array.isArray(s.learned) || !Array.isArray(s.weak)) return false;
    var P = languageProgress;
    P.learned = s.learned;
    P.weak = s.weak;
    P.streak = s.streak || 0;
    P.day = s.day || "";
    return true;
  } catch (e) { return false; }
}
var languageLesson = { active: false, quiz: false, done: false };
function languageStartLesson() {
  var L = languageLesson, learned = languageProgress.learned;
  L.words = [];
  for (var i = 0; i < LANG_CORE.length && L.words.length < 5; i++)
    if (learned.indexOf(i) === -1) L.words.push(i);
  L.pos = 0; L.score = 0;
  L.active = true; L.quiz = false; L.done = false; L.feedback = "";
  languageRenderLesson();
}
function languageStartQuiz() {
  var L = languageLesson;
  if (!L.active || L.done || L.words.length === 0) return;
  L.quiz = true;
  languageQuizOptions();
  languageRenderLesson();
}
function languageQuizOptions() {
  var L = languageLesson, idx = L.words[L.pos], opts = [LANG_CORE[idx][1]];
  for (var i = 1; i <= 3; i++) opts.push(LANG_CORE[(idx + i) % LANG_CORE.length][1]);
  L.options = opts.sort(function () { return Math.random() - 0.5; });
}
function langMark(idx, ok) {
  var P = languageProgress;
  if (ok) {
    if (P.learned.indexOf(idx) === -1) P.learned.push(idx);
    P.weak = P.weak.filter(function (x) { return x !== idx; });
  } else if (P.weak.indexOf(idx) === -1) P.weak.push(idx);
}
function languageAnswerQuiz(i) {
  var L = languageLesson;
  if (!L.active || !L.quiz || L.done) return;
  var idx = L.words[L.pos], correct = LANG_CORE[idx][1], P = languageProgress;
  if (L.options[i] === correct) {
    L.score++; L.feedback = "سم دی ✓";
    langMark(idx, true);
  } else {
    L.feedback = "غلط دی — سم ځواب: " + correct;
    langMark(idx, false);
  }
  L.pos++;
  if (L.pos >= L.words.length) {
    L.done = true; L.quiz = false;
    var today = new Date().toDateString();
    if (P.day !== today) { P.streak++; P.day = today; }
  } else languageQuizOptions();
  languageSaveState();
  languageRenderLesson();
}
function languageRenderLesson() {
  var el = langLesson;
  if (!el) return;
  while (el.firstChild) el.removeChild(el.firstChild);
  var L = languageLesson, P = languageProgress;
  function add(t) { el.appendChild(languageEl("div", t)); }
  function btn(t, fn) { el.appendChild(languageBtn(t, fn)); }
  if (L.active && !L.done) {
    if (L.quiz) {
      add(LANG_CORE[L.words[L.pos]][0]);
      L.options.forEach(function (opt, i) { btn(opt, function () { languageAnswerQuiz(i); }); });
      add(L.feedback);
      add("نمرې: " + L.score + " — " + (L.pos + 1) + "/" + L.words.length);
      return;
    }
    if (L.words.length === 0) { add("ټولې کلمې زده شوې!"); return; }
    add("ننۍ درس");
    L.words.forEach(function (i) { add(LANG_CORE[i][0] + " — " + LANG_CORE[i][1]); });
    btn("کوئز پیل کړه", languageStartQuiz);
    return;
  }
  if (L.done) {
    add("بشپړ شو! نمرې: " + L.score + "/" + L.words.length + " — زده شوې: " + P.learned.length + "/25");
    btn("بل درس", languageStartLesson);
    return;
  }
  add("زده شوې: " + P.learned.length + "/25 — ورځې: " + P.streak);
  btn("درس پیل کړه", languageStartLesson);
  if (P.weak.length === 0) add("کمزورې کلمې نشته");
  else add("بیا زده کړه: " + P.weak.map(function (i) { return LANG_CORE[i][0]; }).join("، "));
}
languageLoadState();
