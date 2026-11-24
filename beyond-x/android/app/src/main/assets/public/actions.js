// Design Phase 2: the answer actions (D4). Every AI answer gets a row
// (copy, regenerate, feedback); one Regenerate exists at a time,
// always under the latest answer. Regenerate replaces the last answer.
var copyAttempted = false;
var ACT_CSS = ".act-row{display:flex;gap:8px;margin:4px 0 12px}.act-row button{background:transparent;color:var(--mu);border:0;cursor:pointer;font-size:12px;padding:4px 6px}";
if (typeof document !== "undefined" && document.head && !document.getElementById("actStyle")) {
  var actst = document.createElement("style");
  actst.id = "actStyle";
  actst.textContent = ACT_CSS;
  document.head.appendChild(actst);
}
function attachActions(msgEl, text) {
  var area = typeof document !== "undefined" ? document.getElementById("chatArea") : null;
  if (!area || !msgEl) return;
  for (var i = 0; i < area.children.length; i++) {
    var ch = area.children[i];
    if (ch.className !== "act-row") continue;
    for (var j = ch.children.length - 1; j >= 0; j--) {
      if (ch.children[j].className === "regen-btn") ch.removeChild(ch.children[j]);
    }
  }
  var row = document.createElement("div");
  row.className = "act-row";
  var cp = document.createElement("button");
  cp.textContent = "کاپي";
  cp.addEventListener("click", function () { copyAnswer(text); });
  row.appendChild(cp);
  var rg = document.createElement("button");
  rg.className = "regen-btn";
  rg.textContent = "بیا جوړ کړه";
  rg.addEventListener("click", function () { regenerateLast(); });
  row.appendChild(rg);
  var up = document.createElement("button");
  up.textContent = "👍";
  up.addEventListener("click", function () { feedbackAnswer(text, true); });
  row.appendChild(up);
  var dn = document.createElement("button");
  dn.textContent = "👎";
  dn.addEventListener("click", function () { feedbackAnswer(text, false); });
  row.appendChild(dn);
  var idx = -1;
  for (var k = 0; k < area.children.length; k++) {
    if (area.children[k] === msgEl) { idx = k; break; }
  }
  if (idx !== -1 && idx + 1 < area.children.length) area.insertBefore(row, area.children[idx + 1]);
  else area.appendChild(row);
}
async function copyAnswer(text) {
  copyAttempted = true;
  if (typeof mobileCopy !== "function") { showToast("کاپي نشوه — متن وټاکئ"); return; }
  var res = await mobileCopy(text);
  showToast(res && res.status === "SUCCESS" ? "کاپي شو ✓" : "کاپي نشوه — متن وټاکئ");
}
async function regenerateLast() {
  var msgs = AppState.messages;
  if (!msgs.length || msgs[msgs.length - 1].who !== "ai") {
    showToast("لومړی د دې پوښتنې ځواب ته انتظار وکړه");
    return;
  }
  if (!AppState.lastQuestion) { showToast("بیا جوړولو ته پوښتنه نشته"); return; }
  msgs.pop();
  if (typeof chatMutate === "function") chatMutate(AppState.convId, function () {});
  else saveChat();
  var area = typeof document !== "undefined" ? document.getElementById("chatArea") : null;
  if (area) {
    for (var i = area.children.length - 1; i >= 0; i--) {
      if (area.children[i].className === "msg ai") { area.removeChild(area.children[i]); break; }
    }
    for (var j = area.children.length - 1; j >= 0; j--) {
      if (area.children[j].className === "act-row") { area.removeChild(area.children[j]); break; }
    }
  }
  await askBeyond(AppState.lastQuestion);
}
function feedbackAnswer(text, good) {
  try {
    if (typeof localStorage !== "undefined") {
      var k = "beyondx-feedback-v1";
      var f = JSON.parse(localStorage.getItem(k) || "[]");
      f.push({ t: text.slice(0, 200), g: good ? 1 : 0, at: Date.now() });
      localStorage.setItem(k, JSON.stringify(f.slice(-100)));
    }
  } catch (e) {}
  showToast(good ? "مننه — ستا نظر خوندي شو ✓" : "مننه — موږ به یې ښه کړو");
}
// After every answer: the meter + the voice (the wow is separate —
// ask.js calls maybeWow before marking the first answer done).
function afterAnswer() {
  if (typeof contextUpdate === "function") contextUpdate();
  if (typeof voiceAutoSpeak === "function") voiceAutoSpeak();
}
