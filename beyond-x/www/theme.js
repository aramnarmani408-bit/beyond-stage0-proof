// Design Phase 2: the theme system (REQ-DESIGN-003 D1, REQ-CUSTOM-001).
// Light is the default (exactly like the real ChatGPT design); dark NEON
// stays as a setting. Colors are CSS variables (see index.html :root):
// --bg page, --sf surface, --tx text, --mu muted, --ac accent,
// --bd border, --bb user bubble, --cd code background, --gd good.
var THEME_KEY = "beyondx-theme-v1";
var themePrefs = { theme: "light", font: "medium", accent: "blue", avatar: "auto", voice: "off" };
var THEME_OPTS = { theme: ["light", "dark"], font: ["small", "medium", "large"], accent: ["blue", "purple", "green"], avatar: ["auto", "2d", "3d", "static", "off"], voice: ["on", "off"] };
var DARK_CSS = "body.dark{--bg:#050510;--sf:#0A0A1F;--tx:#F1F5F9;--mu:#94A3B8;--ac:#00F5FF;--bd:#1E293B;--bb:#16213E;--cd:#111827;--gd:#00FF88}";
// Drawer (fixed overlay) + toast + quiz CSS — moved here from index.html
// so the light theme + the 9 Phase 2 script tags fit the push limit.
// None of it affects first paint (drawer closed, toast hidden, quiz idle).
var P2_CSS = "aside{position:fixed;top:0;right:0;bottom:0;width:280px;display:flex;flex-direction:column;transform:translateX(105%);transition:transform .25s;z-index:50;background:var(--sf)}aside.open{transform:none}#toast{position:fixed;bottom:20px;right:20px;box-shadow:0 2px 8px rgba(0,0,0,.2);background:var(--sf)}#quizOptions{display:flex;flex-direction:column}#quizResult,#quizFeedback{text-align:center;color:var(--gd)}#quizWord{font-size:28px;color:var(--ac);text-align:center}.quiz-opt{border:1px solid var(--ac);padding:12px;cursor:pointer;background:var(--sf);border-radius:8px}";
if (typeof document !== "undefined" && document.head && !document.getElementById("p2Style")) {
  var p2st = document.createElement("style");
  p2st.id = "p2Style";
  p2st.textContent = P2_CSS;
  document.head.appendChild(p2st);
}
function loadThemePrefs() {
  try {
    if (typeof localStorage === "undefined") return;
    var s = JSON.parse(localStorage.getItem(THEME_KEY) || "null");
    if (!s) return;
    Object.keys(THEME_OPTS).forEach(function (k) {
      if (THEME_OPTS[k].indexOf(s[k]) !== -1) themePrefs[k] = s[k];
    });
  } catch (e) {}
}
function saveThemePrefs() {
  try { if (typeof localStorage !== "undefined") localStorage.setItem(THEME_KEY, JSON.stringify(themePrefs)); } catch (e) {}
}
function setThemePref(k, v) {
  if (!THEME_OPTS[k] || THEME_OPTS[k].indexOf(v) === -1) return false;
  themePrefs[k] = v;
  saveThemePrefs();
  applyTheme();
  return true;
}
function applyTheme() {
  loadThemePrefs();
  if (typeof document !== "undefined" && document.body && document.body.classList) {
    document.body.classList.toggle("dark", themePrefs.theme === "dark");
    document.body.classList.toggle("av-static", themePrefs.avatar === "static");
    document.body.classList.toggle("av-off", themePrefs.avatar === "off");
  }
  if (typeof document !== "undefined" && document.head) {
    var st = document.getElementById("themeStyle");
    if (themePrefs.theme === "dark") {
      if (!st) {
        st = document.createElement("style");
        st.id = "themeStyle";
        document.head.appendChild(st);
      }
      st.textContent = DARK_CSS;
    } else if (st) {
      if (st.parentNode) st.parentNode.removeChild(st);
      else if (st.parent) st.parent.removeChild(st);
    }
  }
  if (typeof document !== "undefined" && document.documentElement && document.documentElement.style) {
    document.documentElement.style.fontSize = themePrefs.font === "small" ? "14px" : themePrefs.font === "large" ? "18px" : "16px";
    var ac = themePrefs.accent === "purple" ? "#7C3AED" : themePrefs.accent === "green" ? "#16A34A" : null;
    if (ac && document.documentElement.style.setProperty) document.documentElement.style.setProperty("--ac", ac);
    else if (!ac && document.documentElement.style.removeProperty) document.documentElement.style.removeProperty("--ac");
  }
  if (typeof avatarApplyMode === "function") avatarApplyMode();
  if (typeof renderNeon === "function") renderNeon();
}
loadThemePrefs();
