// Stage 12: shared workspace DOM helpers + bounded storage (5 items/type).
var UNIVERSE_KEY = "beyondx-universe-v1";
var UNIVERSE_MAX = 5;
var CODE_FENCE = String.fromCharCode(96, 96, 96); // the code fence, built from char codes (backticks are forbidden)
var universeStore = null;
function wsEl(tag, text) {
  var el = document.createElement(tag);
  if (text) el.textContent = text;
  return el;
}
function wsBtn(text, fn) {
  var b = wsEl("button", text);
  b.addEventListener("click", fn);
  return b;
}
function wsClear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
function wsPanel(id) {
  var p = document.createElement("div");
  p.id = id;
  p.style.display = "none";
  p.style.flex = "1";
  p.style.flexDirection = "column";
  p.style.gap = "12px";
  p.style.overflowY = "auto";
  p.appendChild(wsBtn("← بیرته", function () { showPanel("chat"); }));
  document.getElementById("main").appendChild(p);
  return p;
}
function loadUniverse() {
  if (universeStore) return universeStore;
  universeStore = { lesson: [], design: [], training: [], code: [], decision: [] };
  try {
    if (typeof localStorage === "undefined") return universeStore;
    var raw = localStorage.getItem(UNIVERSE_KEY);
    if (raw) {
      var s = JSON.parse(raw);
      if (s) for (var k in universeStore) if (Array.isArray(s[k])) universeStore[k] = s[k].slice(0, UNIVERSE_MAX);
    }
  } catch (e) { /* storage unavailable — workspaces still work */ }
  return universeStore;
}
function saveUniverse() {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(UNIVERSE_KEY, JSON.stringify(loadUniverse()));
  } catch (e) {}
}
function universeSave(type, item) {
  var s = loadUniverse();
  if (!s[type]) return false;
  s[type].unshift(item);
  if (s[type].length > UNIVERSE_MAX) s[type].length = UNIVERSE_MAX;
  saveUniverse();
  return true;
}
function universeClear() {
  universeStore = { lesson: [], design: [], training: [], code: [], decision: [] };
  try { if (typeof localStorage !== "undefined") localStorage.removeItem(UNIVERSE_KEY); } catch (e) {}
}
// The REQ-ANSWER-003 offer: after an answer, suggest the matching workspace.
var universeOfferEl = null;
function universeOffer(q, answer) {
  var direct = universeDirect(q || "");
  if (isUniverseCap(workspaceState.capability)) {
    if (direct && UNIVERSE_TYPES[direct] && UNIVERSE_TYPES[direct].cap === workspaceState.capability) universeFill(direct, answer || "");
    return;
  }
  var type = direct || detectUniverseType(q, answer);
  if (!type) return;
  if (direct) { universeActivate(type, answer); return; }
  var chatArea = document.getElementById("chatArea");
  if (!chatArea) return;
  universeHideOffer();
  var box = wsEl("div", "");
  box.id = "universeOffer";
  box.appendChild(wsEl("div", "ایا دا طریقه هم وکړم؟ — " + UNIVERSE_TYPES[type].name + " کارځای"));
  box.appendChild(wsBtn("هو، جوړ یې کړه", function () { universeHideOffer(); universeActivate(type, answer); }));
  box.appendChild(wsBtn("نه", universeHideOffer));
  chatArea.appendChild(box);
  universeOfferEl = box;
}
function universeHideOffer() {
  if (!universeOfferEl) return;
  var chatArea = document.getElementById("chatArea");
  if (chatArea) { try { chatArea.removeChild(universeOfferEl); } catch (e) {} }
  universeOfferEl = null;
}
// Phase 3: open shows the top (D10).
function wsShow(el, show) { if (el) { el.style.display = show ? "flex" : "none"; if (show) el.scrollTop = 0; } }
// Phase 3: var() colors resolve live; WebGL/export need hex.
function wsThemeDark() { return typeof themePrefs !== "undefined" && themePrefs.theme === "dark"; }
function wsResolveColor(c) { var d = wsThemeDark(); return c === "var(--tx)" ? (d ? "#F1F5F9" : "#0D0D0D") : c === "var(--mu)" ? (d ? "#94A3B8" : "#6B7280") : c; }
// Phase 3 (D10): re-open the active workspace, no refill.
function reopenWorkspace() {
  var cap = workspaceState.capability;
  if (!cap) return false;
  if (cap === "school") { showPanel("school"); return true; }
  var b = { islamic: buildIslamicPanel, books: buildBooksPanel, images: buildImagesPanel, voice: buildVoicePanel, games: buildGamesPanel, polyglot: buildLanguagePanel, programming: buildCodePanel, mobile: buildMobilePanel };
  if (b[cap]) { b[cap](); showPanel(cap === "polyglot" ? "language" : cap === "programming" ? "code" : cap); return true; }
  if (typeof universeResume === "function") return universeResume(cap);
  return false;
}
