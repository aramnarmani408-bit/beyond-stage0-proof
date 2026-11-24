// Static HTML builders — parts of index.html moved to JS so the script
// tags fit the push limit. The school panel moved here from quizshow.js
// (L.A.E. Phase 1); the drawer, welcome, toast, status + header followed.
// Every builder runs at module load, before init.js wires the buttons,
// and is idempotent (returns null if the element already exists).
function bEl(tag, id, text) {
  var e = document.createElement(tag);
  if (id) e.id = id;
  if (text) e.textContent = text;
  return e;
}
var SCHOOL_DEFS = "button:backChat:← خبرې|button:closeWorkspaceBtn:کارځای بند کړه|div:quizWord:|div:quizOptions:|div:quizFeedback:|span:quizScore:0/6|div:quizResult:|button:wordBtn:لغتونه|button:sentBtn:جملې|button:reviseBtn:بیا زده کړه|button:modeBtn:↔ پښتو ← انګلیسي|button:quizRestart:بیا پیل";
function buildSchoolPanel() {
  if (document.getElementById("schoolPanel")) return null;
  var m = document.getElementById("main");
  if (!m) return null;
  var p = bEl("div", "schoolPanel", "");
  SCHOOL_DEFS.split("|").forEach(function (d) {
    var a = d.split(":");
    p.appendChild(bEl(a[0], a[1], a[2] || ""));
  });
  p.appendChild(promptExamples("school"));
  m.appendChild(p);
  return p;
}
buildSchoolPanel();
function buildDrawer() {
  if (document.getElementById("drawer")) return null;
  var b = document.body;
  if (!b) return null;
  var a = bEl("aside", "drawer", "");
  a.appendChild(bEl("button", "newChatBtn", "نوې خبرې"));
  a.appendChild(bEl("ul", "chatList", ""));
  b.insertBefore(a, b.firstChild);
  return a;
}
buildDrawer();
function buildWelcome() {
  if (document.getElementById("welcome")) return null;
  var c = document.getElementById("chatPanel");
  if (!c) return null;
  var w = bEl("div", "welcome", "BEYOND X ته ښه راغلاست! زه ستا مرستیال یم — خپله پوښتنه ولیکئ.");
  c.insertBefore(w, c.firstChild);
  return w;
}
buildWelcome();
function buildInputArea(){if(document.getElementById("inputArea"))return null;var c=document.getElementById("chatPanel");if(!c)return null;var d=bEl("div","inputArea");d.appendChild(bEl("input","askInput"));d.appendChild(bEl("button","sendBtn","↑"));c.appendChild(d);return d;}
buildInputArea();
function buildToast() {
  if (document.getElementById("toast")) return null;
  var b = document.body;
  if (!b) return null;
  var t = bEl("div", "toast", "");
  b.appendChild(t);
  return t;
}
buildToast();
function buildWorkspaceStatus() {
  if (document.getElementById("workspaceStatus")) return null;
  var m = document.getElementById("main");
  var c = document.getElementById("chatPanel");
  if (!m || !c) return null;
  var w = bEl("div", "workspaceStatus", "");
  m.insertBefore(w, c);
  return w;
}
buildWorkspaceStatus();
// The header (drawer button, avatar, status dot, name, slogan, action +
// xcore lines, error-details button). Runs after buildWorkspaceStatus so
// it can insert before the status line, keeping the original order.
function headerCircle(r, fill, stroke) {
  var c = typeof document.createElementNS === "function" ? document.createElementNS("http://www.w3.org/2000/svg", "circle") : document.createElement("circle");
  c.setAttribute("cx", "20");
  c.setAttribute("cy", "20");
  c.setAttribute("r", r);
  c.setAttribute("fill", fill);
  if (stroke) c.setAttribute("stroke", stroke);
  return c;
}
function buildHeader() {
  if (document.getElementById("drawerBtn")) return null;
  var m = document.getElementById("main");
  if (!m) return null;
  var h = bEl("header", "", "");
  h.appendChild(bEl("button", "drawerBtn", "⋮"));
  var svg = typeof document.createElementNS === "function" ? document.createElementNS("http://www.w3.org/2000/svg", "svg") : document.createElement("svg");
  svg.id = "avatar";
  svg.setAttribute("width", "32");
  svg.setAttribute("height", "32");
  svg.appendChild(headerCircle("18", "#0A0A1F", "#00F5FF"));
  svg.appendChild(headerCircle("10", "#A855F7", null));
  h.appendChild(svg);
  var dot = bEl("span", "statusDot", "");
  dot.className = "status-dot";
  h.appendChild(dot);
  h.appendChild(bEl("span", "", "BEYOND X"));
  h.appendChild(bEl("div", "slogan", "موږ به نړۍ بدلوو"));
  h.appendChild(bEl("div", "actionLine", ""));
  h.appendChild(bEl("div", "xcoreLine", ""));
  var eb = bEl("button", "errDetailsBtn", "تخنیکي جزیات");
  eb.style.display = "none";
  h.appendChild(eb);
  var ws = document.getElementById("workspaceStatus");
  if (ws) m.insertBefore(h, ws);
  else m.insertBefore(h, m.firstChild);
  return h;
}
buildHeader();
