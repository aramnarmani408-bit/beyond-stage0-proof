// Phase 2: the home demo (D2/D3) — icon-led rows + the local worked
// example + the recent strip. A row keeps the question as its text,
// so taps send real questions. (Moved here from neon2.js.)
var DEMO_ICONS = ["📖", "📱", "🔤", "🖼", "🔢", "🔤", "💻", "🔋", "❓", "📚", "🔊", "🎮"];
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

// Phase 4: per-capability prompt examples (D8 + REQ-ANSWER-004).
// Every example is a real question the capability can answer;
// tapping one RUNS it — the panel action, a spoken sample (voice),
// or a real chat question.
var PROMPT_EXAMPLES = {
  school: ["د اوبو څرخ څه دی؟", "یو کوئز جوړ کړه", "د ۵ جدول راکړه"],
  islamic: ["د صبر په اړه ایت راکړه", "د الفاتحې سورت وښیه", "د لمانځه په اړه حدیث راکړه"],
  books: ["د پښتو شعر کتاب ولټوه", "د فزیک کتاب ولټوه", "د انګلیسي کتاب ولټوه"],
  images: ["غرونه", "یو ګل", "د کابل ښار"],
  voice: ["سلام، زه BEYOND X یم", "پښتو ژبه ښکلې ده", "نن ورځ ښه ده"],
  games: ["د ستورو لوبه", "د شمېرو لوبه", "د توریو لوبه"],
  language: ["سلام", "مننه", "څنګه یې؟"],
  code: ["یو پروګرام ولیکه چې «سلام» چاپ کړي", "یو پروګرام ولیکه چې ۱ تر ۱۰ شمېرې چاپ کړي", "یو پروګرام ولیکه چې دوه شمېرې سره جمع کړي"],
  mobile: ["زما بیټرۍ څومره ده؟", "زما موبایل روغتیا وګوره", "زما حافظه څومره ده؟"],
  lesson: ["د اوبو د څرخ په اړه درس جوړ کړه", "د لوګارتم په اړه درس جوړ کړه", "د فوتوسنتز په اړه درس جوړ کړه"],
  design: ["د اوبو د څرخ ډیاګرام جوړ کړه", "د حج د سفر ډیزاین جوړ کړه", "د کور نقشه ډیزاین جوړ کړه"],
  training: ["د انګلیسي تمرین جوړ کړه", "د ریاضي تمرین جوړ کړه", "د پښتو تمرین جوړ کړه"],
  codews: ["کوډ کارځای پرانیزه", "یو کوډ کارځای جوړ کړه"],
  decision: ["کوم یو غوره دی: کتاب که ټلیفون؟", "د موټر او بایسکل پرتله وکړه", "پرېکړه وکړه: کابل که هرات؟"]
};
function promptExampleRun(cap, q, input, action) {
  if (input && action) { input.value = q; action(q); return; }
  if (cap === "voice" && typeof voiceSpeak === "function") { voiceSpeak(q, "ps"); return; }
  var el = document.getElementById("askInput");
  if (!el) return;
  el.value = q;
  sendQuestion();
}
function promptExamples(cap, input, action) {
  var list = PROMPT_EXAMPLES[cap] || [];
  var box = document.createElement("div");
  box.className = "prompt-examples";
  var label = document.createElement("div");
  label.textContent = "بېلګې:";
  box.appendChild(label);
  list.forEach(function (q) {
    var r = document.createElement("div");
    r.className = "demo-row";
    r.textContent = q;
    r.addEventListener("click", function () { promptExampleRun(cap, q, input, action); });
    box.appendChild(r);
  });
  return box;
}
