// BEYOND X splash screen (parts list §1) — launch screen only.
// The static #splash div in index.html shows at parse, before any
// script runs; this module hides it when the app is ready, on tap,
// or after a short delay. It never blocks the chat: hide is
// idempotent + guarded, and a CSS animation fades the div out on
// its own if this script never runs. First open shows the logo +
// slogan for at least SPLASH_MIN_MS; later opens hide at once.
// The #main flex + input-area rules moved here from index.html
// (push limit) and are injected at load, while the splash covers
// the first paint. Needs bEl from builders.js (loads after it).
var SPLASH_KEY = "beyondx-splash-v1";
var SPLASH_MIN_MS = 1200;
var SPLASH_MAX_MS = 3500;
var SPLASH_REPEAT_MS = 400;
var SPLASH_CSS = ":root{--sf:#fff;--tx:#0D0D0D;--mu:#6B7280;--ac:#2C67C5;--bd:#E5E7EB;--cd:#F3F4F6;--gd:#16A34A}body{margin:0;background:#FCFCFC;display:flex;height:100vh;overflow:hidden}.msg.user{background:#E8F3FE;align-self:flex-end}#main,#chatPanel,#chatArea,#schoolPanel{flex:1;display:flex;flex-direction:column;min-height:0}#inputArea{display:flex;border:1px solid var(--bd);border-radius:50%;margin:10px}#sendBtn{border-radius:50%;width:36px;height:36px}#askInput{flex:1;padding:8px}#newChatBtn,#main button{background:var(--ac);color:#fff}#chatArea{overflow-y:auto}";
var splashShownAt = 0;
var splashTimer = null;
var splashFirst = true;
function splashContent() {
  return { name: "BEYOND X", slogan: "موږ به نړۍ بدلوو", loading: "پرانیستل کېږي..." };
}
function splashIsFirstOpen() {
  try { return localStorage.getItem(SPLASH_KEY) === null; } catch (e) { return true; }
}
function splashMarkSeen() {
  try { localStorage.setItem(SPLASH_KEY, "1"); return true; } catch (e) { return false; }
}
function splashEl() {
  try { if (typeof document === "undefined") return null; return document.getElementById("splash"); } catch (e) { return null; }
}
function splashMinMs(first) { return first ? SPLASH_MIN_MS : 0; }
function splashMaxMs(first) { return first ? SPLASH_MAX_MS : SPLASH_REPEAT_MS; }
function splashHide() {
  try {
    if (splashTimer !== null) { clearTimeout(splashTimer); splashTimer = null; }
    var el = splashEl();
    if (!el || el.style.display === "none") return false;
    el.style.display = "none";
    return true;
  } catch (e) { return false; }
}
function splashShow() {
  try {
    var el = splashEl();
    if (!el || el.style.display === "none") return false;
    if (splashShownAt === 0) {
      splashFirst = splashIsFirstOpen();
      splashMarkSeen();
      splashShownAt = Date.now();
    }
    if (!el._splashWired) {
      el._splashWired = true;
      el.addEventListener("click", function () { splashHide(); });
    }
    if (splashTimer === null) splashTimer = setTimeout(splashHide, splashMaxMs(splashFirst));
    return true;
  } catch (e) { return false; }
}
function splashReady() {
  try {
    var el = splashEl();
    if (!el || el.style.display === "none") return false;
    var wait = splashMinMs(splashFirst) - (Date.now() - splashShownAt);
    if (wait > 0) {
      if (splashTimer !== null) { clearTimeout(splashTimer); splashTimer = null; }
      splashTimer = setTimeout(splashHide, wait);
      return false;
    }
    return splashHide();
  } catch (e) { return false; }
}
function splashInit() {
  try {
    if (typeof document !== "undefined" && document.head && !document.getElementById("splashStyle")) {
      var st = null;
      if (typeof bEl === "function") st = bEl("style", "splashStyle", SPLASH_CSS);
      else { st = document.createElement("style"); st.id = "splashStyle"; st.textContent = SPLASH_CSS; }
      document.head.appendChild(st);
    }
  } catch (e) {}
  return splashShow();
}
splashInit();
