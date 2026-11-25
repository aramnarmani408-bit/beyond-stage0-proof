// Message editing (#63): tap a sent user message to edit it. On
// save the message is replaced, everything after it is removed (the
// old answer is not valid for the new prompt) and the answer is
// regenerated through askBeyond. The truncation is named in a toast
// with the count, never silent. Editing during generation or to an
// empty message is refused. The understanding correction (laeGwRebuild
// + "سم نه دی") is a DIFFERENT mechanism and stays owed.
var MSG_EDIT_CSS = ".msg-edit-btn{align-self:flex-end;background:transparent;color:var(--mu);border:0;cursor:pointer;font-size:11px;padding:2px 6px}.msg-edit-ta{width:100%;box-sizing:border-box;font:inherit;color:var(--tx);border:1px solid var(--ac);border-radius:8px;padding:8px}.msg-edit-row{display:flex;gap:8px;margin-top:6px}";
if (typeof document !== "undefined" && document.head && !document.getElementById("msgEditStyle")) {
  var msgEditSt = document.createElement("style");
  msgEditSt.id = "msgEditStyle";
  msgEditSt.textContent = MSG_EDIT_CSS;
  document.head.appendChild(msgEditSt);
}
function msgEditBusy() {
  if (typeof chatState !== "undefined" && chatState && chatState.status === "busy") return true;
  if (typeof genStateIs === "function" && genStateIs("generating")) return true;
  return false;
}
function msgEditUserIdx() {
  var out = [];
  if (!Array.isArray(AppState.messages)) return out;
  for (var j = 0; j < AppState.messages.length; j++) if (AppState.messages[j].who === "user") out.push(j);
  return out;
}
function msgEditAttachAll() {
  var area = typeof document !== "undefined" ? document.getElementById("chatArea") : null;
  if (!area) return;
  var userIdx = msgEditUserIdx();
  var u = 0;
  for (var i = 0; i < area.children.length; i++) {
    var c = area.children[i];
    if (c.className !== "msg user") continue;
    var idx = userIdx[u++];
    if (c._editBtn || idx === undefined) continue;
    var b = document.createElement("button");
    b.className = "msg-edit-btn";
    b.textContent = "سمول";
    (function (n, div) { b.addEventListener("click", function () { msgEditStart(n, div); }); })(idx, c);
    if (i + 1 < area.children.length) area.insertBefore(b, area.children[i + 1]);
    else area.appendChild(b);
    c._editBtn = b;
    i++;
  }
}
function msgEditStart(idx, div) {
  if (msgEditBusy()) { showToast("لومړی د ځواب انتظار وکړه"); return false; }
  var m = AppState.messages[idx];
  if (!m || m.who !== "user" || !div) return false;
  if (div._editBtn) div._editBtn.style.display = "none";
  while (div.firstChild) div.removeChild(div.firstChild);
  div.textContent = "";
  var ta = document.createElement("textarea");
  ta.className = "msg-edit-ta";
  ta.value = m.text;
  div.appendChild(ta);
  var row = document.createElement("div");
  row.className = "msg-edit-row";
  var save = document.createElement("button");
  save.textContent = "خوندي کړه";
  save.addEventListener("click", function () { msgEditSubmit(idx, ta.value); });
  row.appendChild(save);
  var cancel = document.createElement("button");
  cancel.textContent = "لغوه کړه";
  cancel.addEventListener("click", function () { renderChatMessages(); });
  row.appendChild(cancel);
  div.appendChild(row);
  return true;
}
async function msgEditSubmit(idx, newText) {
  var t = (newText || "").trim();
  if (!t) { showToast("پیغام خالي نه شي کېدای — متن ولیکه"); return false; }
  if (msgEditBusy()) { showToast("لومړی د ځواب انتظار وکړه"); return false; }
  var m = AppState.messages[idx];
  if (!m || m.who !== "user") return false;
  if (t === m.text) { renderChatMessages(); return true; }
  var removed = AppState.messages.length - idx - 1;
  AppState.messages[idx].text = t;
  AppState.messages.length = idx + 1;
  if (typeof chatMutate === "function" && Array.isArray(AppState.chats)) chatMutate(AppState.convId, function () {});
  else saveChat();
  renderChatMessages();
  if (removed > 0) showToast(pashtoDigits(removed) + " وروستي پیغامونه ړنګ شول — نوی ځواب جوړېږي");
  updateChatTitle();
  await askBeyond(t);
  return true;
}
if (typeof renderChatMessages === "function") {
  var msgEditOrigRender = renderChatMessages;
  renderChatMessages = function () { msgEditOrigRender(); msgEditAttachAll(); };
}
if (typeof addMessage === "function") {
  var msgEditOrigAdd = addMessage;
  addMessage = function (text, who) { msgEditOrigAdd(text, who); msgEditAttachAll(); };
}
