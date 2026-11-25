// Design Phase 2: theme (REQ-DESIGN-003 D1, REQ-CUSTOM-001). Light
// default (like ChatGPT); dark NEON is a setting. Vars: --bg page,
// --sf surface, --tx text, --mu muted, --ac accent, --bd border,
// --bb bubble, --cd code bg, --gd good. (See index.html :root.)
var THEME_KEY = "beyondx-theme-v1";
var themePrefs = { theme: "light", font: "medium", accent: "blue", avatar: "auto", voice: "off", contrast: "off" };
var THEME_OPTS = { theme: ["light", "dark"], font: ["small", "medium", "large"], accent: ["blue", "purple", "green"], avatar: ["auto", "2d", "3d", "static", "off"], voice: ["on", "off"], contrast: ["off", "on"] };
var DARK_CSS = "body.dark{--bg:#050510;--sf:#0A0A1F;--tx:#F1F5F9;--mu:#94A3B8;--ac:#00F5FF;--bd:#1E293B;--bb:#16213E;--cd:#111827;--gd:#00FF88;--tk:#A855F7;--ts:#00FF88;--tc:#94A3B8;--tn:#00F5FF}";
// P2_CSS: drawer + toast + quiz + chat column + header — moved from
// index.html so the script tags fit the push limit. First paint is
// unaffected (drawer closed, toast hidden, quiz idle). Phase 3: :root
// holds the LIGHT syntax-token colors; the dark values are in DARK_CSS.
var P2_CSS = "aside{position:fixed;top:0;right:0;bottom:0;width:280px;display:flex;flex-direction:column;transform:translateX(105%);transition:transform .25s;z-index:50;background:var(--sf)}aside.open{transform:none}#toast{position:fixed;bottom:20px;right:20px;box-shadow:0 2px 8px rgba(0,0,0,.2);background:var(--sf)}#quizOptions{display:flex;flex-direction:column}#quizResult,#quizFeedback{text-align:center;color:var(--gd)}#quizWord{font-size:28px;color:var(--ac);text-align:center}.quiz-opt{border:1px solid var(--ac);padding:12px;cursor:pointer;background:var(--sf);border-radius:8px}:root{--tk:#7C3AED;--ts:#15803D;--tc:#64748B;--tn:#0369A1}.status-dot{width:10px;height:10px;border-radius:50%}#slogan,#actionLine,#xcoreLine{color:var(--mu);font-size:12px}.msg{padding:10px;max-width:85%;line-height:1.6}#chatPanel{max-width:768px;margin:auto}header{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:10px}";
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
    document.body.classList.toggle("a11y-contrast", themePrefs.contrast === "on");
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
