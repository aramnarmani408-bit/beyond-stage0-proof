var GAMES_KEY = "beyondx-games-v1";
var GAMES_LETTERS = "ابپتټثجچحخدډذرړزژسشصضطظعغفقکګلمنوهیېۍئ";
var gamesLetters = { round: 0, score: 0, best: 0, target: "", options: [] };
var gamesReflex = { taps: 0, best: 0, active: false, timer: null, endTimer: null };
var gamesSaved = [];
function gamesSaveState() {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(GAMES_KEY, JSON.stringify({ L: gamesLetters, R: gamesReflex.best, S: gamesSaved }));
  } catch (e) { /* storage unavailable */ }
}
function gamesLoadState() {
  try {
    if (typeof localStorage === "undefined") return false;
    var s = JSON.parse(localStorage.getItem(GAMES_KEY) || "0");
    if (!s || !s.L) return false;
    gamesLetters = s.L;
    gamesReflex.best = s.R || 0;
    gamesSaved = Array.isArray(s.S) ? s.S : [];
    return true;
  } catch (e) { return false; }
}
function gamesClearPlay() {
  while (gamesPlayAreaEl.firstChild) gamesPlayAreaEl.removeChild(gamesPlayAreaEl.firstChild);
}
function gamesEndScreen(a, b, fn) {
  gamesClearPlay();
  gamesPlayAreaEl.appendChild(gamesEl("div", a));
  gamesPlayAreaEl.appendChild(gamesEl("div", b));
  gamesPlayAreaEl.appendChild(gamesBtn("بیا پیل", fn));
}
function gamesLettersPick() {
  var L = gamesLetters;
  var t = GAMES_LETTERS[Math.floor(Math.random() * 38)];
  var opts = [t];
  while (opts.length < 4) {
    var l = GAMES_LETTERS[Math.floor(Math.random() * 38)];
    if (opts.indexOf(l) === -1) opts.push(l);
  }
  opts.sort(function () { return Math.random() - 0.5; });
  L.target = t;
  L.options = opts;
}
function gamesRenderLetters() {
  var L = gamesLetters;
  gamesClearPlay();
  var t = gamesEl("div", L.target);
  t.style.cssText = "font-size:48px;text-align:center;";
  gamesPlayAreaEl.appendChild(t);
  L.options.forEach(function (letter, i) {
    gamesPlayAreaEl.appendChild(gamesBtn(letter, function () { gamesLettersAnswer(i); }));
  });
  gamesPlayAreaEl.appendChild(gamesEl("div", "نمرې: " + L.score + " — پړاو " + L.round + "/10"));
}
function gamesStartLetters(fresh) {
  var L = gamesLetters;
  if (fresh || L.round < 1 || L.round > 10) { L.round = 1; L.score = 0; }
  gamesLettersPick();
  gamesRenderLetters();
}
function gamesLettersAnswer(i) {
  var L = gamesLetters;
  if (L.round > 10) return;
  if (L.options[i] === L.target) L.score++;
  if (L.round >= 10) {
    L.round = 11;
    if (L.score > L.best) L.best = L.score;
    gamesSaveState();
    gamesEndScreen("بشپړ شو! نمرې: " + L.score + "/10", "غوره: " + L.best, function () { gamesStartLetters(true); });
    return;
  }
  gamesLettersNext();
}
function gamesLettersNext() {
  gamesLetters.round++;
  gamesLettersPick();
  gamesRenderLetters();
  gamesSaveState();
}
function gamesStartReflex() {
  var R = gamesReflex;
  clearTimeout(R.timer);
  clearTimeout(R.endTimer);
  R.taps = 0;
  R.active = true;
  gamesClearPlay();
  gamesPlayAreaEl.appendChild(gamesBtn("● 0", gamesReflexTap));
  gamesReflexMove();
  R.endTimer = setTimeout(gamesReflexEnd, 30000);
}
function gamesReflexMove() {
  var R = gamesReflex;
  if (!R.active) return;
  var b = gamesPlayAreaEl.children[0];
  b.style.position = "absolute";
  b.style.left = Math.floor(Math.random() * 80) + "%";
  b.style.top = Math.floor(Math.random() * 80) + "%";
  R.timer = setTimeout(gamesReflexMove, 900);
}
function gamesReflexTap() {
  var R = gamesReflex;
  if (!R.active) return;
  R.taps++;
  gamesPlayAreaEl.children[0].textContent = "● " + R.taps;
  clearTimeout(R.timer);
  gamesReflexMove();
}
function gamesReflexEnd() {
  var R = gamesReflex;
  if (!R.active) return;
  R.active = false;
  clearTimeout(R.timer);
  clearTimeout(R.endTimer);
  if (R.taps > R.best) R.best = R.taps;
  gamesSaveState();
  gamesEndScreen("وخت پای ته ورسېد! ټکونه: " + R.taps, "غوره: " + R.best, gamesStartReflex);
}
gamesLoadState();
