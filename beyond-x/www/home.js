// Design Phase 2: the home demo (D2/D3) — ChatGPT-style plain icon-led
// rows (no chips) + the local worked example + the recent strip.
// Moved here from neon2.js (which was at the push limit). The row keeps
// the question as its text so taps still send real questions.
var DEMO_ICONS = ["📖", "📱", "🔤", "🖼", "📖", "🔤", "💻", "🔋", "❓"];
var HOME_CSS = "#welcome{text-align:center;font-size:20px;padding:32px 0 8px}#demoBox{padding:8px 0}.demo-row{display:flex;align-items:center;gap:10px;padding:12px 14px;margin:6px 0;border:1px solid var(--bd);border-radius:12px;cursor:pointer;background:var(--sf);color:var(--tx)}.demo-row:hover{border-color:var(--ac)}.demo-ic{font-size:18px;flex:none}";
if (typeof document !== "undefined" && document.head && !document.getElementById("homeStyle")) {
  var hmst = document.createElement("style");
  hmst.id = "homeStyle";
  hmst.textContent = HOME_CSS;
  document.head.appendChild(hmst);
}
var demoEl = null;
function renderDemo() {
  var chatArea = document.getElementById("chatArea");
  if (!chatArea || demoEl) return;
  if (AppState.messages.length > 0) return;
  var cs = Array.isArray(AppState.chats) ? AppState.chats : [];
  var box = document.createElement("div");
  box.id = "demoBox";
  var firstOpen = cs.every(function (c) { return c.messages.length === 0; });
  if (firstOpen) demoQuizExample(box);
  var start = (demoCount() * 3) % DEMO_POOL.length;
  for (var i = 0; i < 3; i++) {
    var qi = (start + i) % DEMO_POOL.length;
    const q = DEMO_POOL[qi];
    var r = document.createElement("div");
    r.className = "demo-row";
    r.textContent = q;
    var ic = document.createElement("span");
    ic.className = "demo-ic";
    ic.textContent = DEMO_ICONS[qi] || "❓";
    r.insertBefore(ic, r.firstChild);
    r.addEventListener("click", function () {
      var input = document.getElementById("askInput");
      if (!input) return;
      input.value = q;
      sendQuestion();
    });
    box.appendChild(r);
  }
  demoRecentStrip(box);
  chatArea.appendChild(box);
  demoEl = box;
}
function hideDemo() {
  if (!demoEl) return;
  var chatArea = document.getElementById("chatArea");
  if (chatArea) { try { chatArea.removeChild(demoEl); } catch (e) {} }
  demoEl = null;
}
