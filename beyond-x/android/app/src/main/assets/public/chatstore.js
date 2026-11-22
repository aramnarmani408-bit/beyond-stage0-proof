const CHAT_KEY = "beyondx-chat-v1";
const CHAT_MAX = 50;
const CHAT_MAX_CHATS = 50;
var convSeq = 0; // Stage 12: unique ids (same-ms newChat calls collided).
function chatTitleOf(c, idx) {
  if (c.renamed && c.title) return c.title;
  for (var i = 0; i < c.messages.length; i++) {
    if (c.messages[i].who === "user") return c.messages[i].text.slice(0, 30);
  }
  return "خبره " + pashtoDigits((idx || 0) + 1);
}
function saveChat() {
  try {
    if (typeof localStorage === "undefined") return;
    if (!Array.isArray(AppState.chats)) AppState.chats = [];
    var id = AppState.convId || "";
    if (!id) return;
    var msgs = AppState.messages.slice(-CHAT_MAX);
    var cs = AppState.chats, found = false;
    for (var i = 0; i < cs.length; i++) if (cs[i].id === id) {
      cs[i].messages = msgs; cs[i].title = chatTitleOf(cs[i], i); cs[i].updated = Date.now(); found = true; break;
    }
    if (!found) cs.push({ id: id, title: chatTitleOf({ messages: msgs }, cs.length), messages: msgs, updated: Date.now() });
    localStorage.setItem(CHAT_KEY, JSON.stringify({ chats: cs, activeId: id }));
  } catch (e) {}
}
function loadChat() {
  try {
    if (typeof localStorage === "undefined") return false;
    var raw = localStorage.getItem(CHAT_KEY);
    if (!raw) return false;
    var s = JSON.parse(raw);
    if (!s) return false;
    var chats = null, activeId = null, migrated = false;
    if (Array.isArray(s.chats)) { chats = s.chats; activeId = s.activeId || null; }
    else if (Array.isArray(s.messages)) {
      chats = [{ id: s.id || "conv-1", title: "", messages: s.messages }];
      activeId = chats[0].id; migrated = true;
    } else return false;
    AppState.chats = [];
    for (var i = 0; i < chats.length; i++) {
      var c = chats[i];
      if (c && Array.isArray(c.messages)) AppState.chats.push({ id: c.id || ("conv-" + i), title: chatTitleOf(c, AppState.chats.length), messages: c.messages.slice(-CHAT_MAX), updated: c.updated || 0, pinned: !!c.pinned, archived: !!c.archived, renamed: !!c.renamed });
    }
    if (AppState.chats.length === 0) return false;
    var active = AppState.chats[AppState.chats.length - 1];
    for (var j = 0; j < AppState.chats.length; j++) {
      if (AppState.chats[j].id === activeId) { active = AppState.chats[j]; break; }
    }
    AppState.convId = active.id;
    AppState.messages = active.messages.slice();
    renderChatMessages();
    renderChatList();
    if (AppState.messages.length === 0) renderDemo(); else hideDemo();
    if (migrated) saveChat();
    return true;
  } catch (e) { return false; }
}
function renderChatMessages() {
  var chatArea = document.getElementById("chatArea");
  if (!chatArea) return;
  while (chatArea.firstChild) chatArea.removeChild(chatArea.firstChild);
  hideDemo();
  for (var i = 0; i < AppState.messages.length; i++) {
    var m = AppState.messages[i], msg = document.createElement("div");
    msg.className = "msg " + m.who; msg.textContent = m.text; chatArea.appendChild(msg);
  }
  chatArea.scrollTop = chatArea.scrollHeight;
}
function updateChatTitle() {
  renderChatList();
}
function newChat() {
  saveChat();
  if (!Array.isArray(AppState.chats)) AppState.chats = [];
  if (AppState.chats.length >= CHAT_MAX_CHATS) {
    showToast("۵۰ چټونه ډک شول — لومړی یو زوړ ړنګ کړه");
    goView("history");
    return;
  }
  var id = "conv-" + Date.now() + "-" + (convSeq++);
  AppState.chats.push({ id: id, title: "خبره " + pashtoDigits(AppState.chats.length + 1), messages: [], updated: Date.now() });
  AppState.convId = id;
  AppState.messages = [];
  AppState.currentChat++;
  AppState.lastError = null;
  var chatArea = document.getElementById("chatArea");
  if (chatArea) while (chatArea.firstChild) chatArea.removeChild(chatArea.firstChild);
  hideDemo();
  var btn = document.getElementById("errDetailsBtn");
  if (btn) btn.style.display = "none";
  saveChat();
  renderChatList();
  renderDemo();
  setAction("چمتو یم");
}
function switchChat(id) {
  if (!id || id === AppState.convId) return;
  if (!Array.isArray(AppState.chats)) return;
  saveChat();
  var target = null;
  for (var i = 0; i < AppState.chats.length; i++) if (AppState.chats[i].id === id) { target = AppState.chats[i]; break; }
  if (!target) return;
  AppState.convId = target.id;
  AppState.messages = target.messages.slice();
  renderChatMessages();
  renderChatList();
  if (AppState.messages.length === 0) renderDemo(); else hideDemo();
  showPanel("chat");
  var d = document.getElementById("drawer");
  if (d && d.classList) d.classList.remove("open");
}
