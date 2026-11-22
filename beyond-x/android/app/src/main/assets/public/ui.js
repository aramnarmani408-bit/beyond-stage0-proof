function recordError(kind, status) {
  AppState.lastError = { kind: kind, status: status || 0, time: new Date().toISOString() };
  const btn = document.getElementById("errDetailsBtn");
  if (btn) btn.style.display = "";
}
function showErrorDetails() {
  const e = AppState.lastError;
  if (!e) return;
  showToast("تخنیکي: " + e.kind + " / HTTP " + e.status + " / " + e.time);
}
function setAction(text) {
  const el = document.getElementById("actionLine");
  if (el) el.textContent = text;
  if (typeof renderNeon === "function") renderNeon();
}
function addMessage(text, who) {
  const chatArea = document.getElementById("chatArea");
  if (!chatArea) return;
  hideDemo();
  if (typeof hideRetry === "function") hideRetry();
  const atBottom = chatArea.scrollHeight - chatArea.scrollTop - (chatArea.clientHeight || 0) < 60;
  const msg = document.createElement("div");
  msg.className = "msg " + who;
  msg.textContent = text;
  chatArea.appendChild(msg);
  if (atBottom) chatArea.scrollTop = chatArea.scrollHeight;
  AppState.messages.push({ text, who });
  saveChat();
  updateChatTitle();
}
function showToast(text) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = text;
  toast.style.display = "block";
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.display = "none";
    toast.style.opacity = "0";
  }, 2500);
}
function isIdentityQuestion(q) {
  return q.indexOf("چا جوړ") !== -1 || q.indexOf("جوړ کړی") !== -1 || q.indexOf("جوړونکی") !== -1 || q.indexOf("ستا نوم") !== -1 || q.indexOf("څوک یې") !== -1;
}
function isSchoolRequest(q) {
  return q.indexOf("ښوونځی") !== -1 || q.indexOf("کوئز") !== -1 || q.indexOf("انګلیسي") !== -1 || q.indexOf("درس") !== -1 || q.indexOf("زده کړم") !== -1 || q.indexOf("زده کړه") !== -1;
}
function showPanel(name) {
  const chatPanel = document.getElementById("chatPanel");
  const schoolPanel = document.getElementById("schoolPanel");
  const profilePanel = document.getElementById("profilePanel");
  if (chatPanel) chatPanel.style.display = name === "chat" ? "flex" : "none";
  if (schoolPanel) schoolPanel.style.display = name === "school" ? "flex" : "none";
  if (profilePanel) profilePanel.style.display = name === "profile" ? "flex" : "none";
  showIslamicPanel(name === "islamic");
  showBooksPanel(name === "books");
  showImagesPanel(name === "images");
  showVoicePanel(name === "voice");
  showGamesPanel(name === "games");
  showLanguagePanel(name === "language");
  showCodePanel(name === "code");
  showMobilePanel(name === "mobile");
  showUniversePanel(name);
}
var chatQuery = "";
var chatListPage = 1;
var chatShowArchived = false;
var CHAT_PAGE = 20;
function chatListRows() {
  var out = [];
  for (var i = 0; i < AppState.chats.length; i++) {
    var c = AppState.chats[i];
    if (c.archived && !chatShowArchived) continue;
    if (chatQuery) {
      var hay = (c.title || "") + " " + c.messages.map(function (m) { return m.text; }).join(" ");
      if (hay.indexOf(chatQuery) === -1) continue;
    }
    out.push(c);
  }
  out.sort(function (a, b) { return ((b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)) || ((b.updated || 0) - (a.updated || 0)); });
  return out;
}
function chatSearch(q) {
  chatQuery = (q || "").trim();
  chatListPage = 1;
  renderChatList();
}
function renderChatList() {
  var list = document.getElementById("chatList");
  if (!list) return;
  list.style.flex = "1";
  list.style.overflowY = "auto";
  list.style.minHeight = "0";
  list.style.order = "2";
  while (list.firstChild) list.removeChild(list.firstChild);
  if (!Array.isArray(AppState.chats)) AppState.chats = [];
  var rows = chatListRows();
  var shown = rows.slice(0, chatListPage * CHAT_PAGE);
  var grp = "";
  for (var i = 0; i < shown.length; i++) {
    var c = shown[i];
    var g = c.pinned ? "پن شوي" : chatGroupOf(c.updated || 0);
    if (g !== grp) {
      grp = g;
      var h = document.createElement("li");
      h.className = "grp";
      h.textContent = g;
      list.appendChild(h);
    }
    list.appendChild(chatRowEl(c));
  }
  if (rows.length > shown.length) {
    var m = document.createElement("li");
    m.className = "more";
    m.appendChild(miniBtn("نور وښیه", function () { chatListPage++; renderChatList(); }));
    list.appendChild(m);
  }
  var a = document.createElement("li");
  a.className = "arch";
  a.appendChild(miniBtn(chatShowArchived ? "آرشیف پټ کړه" : "آرشیف وښیه", function () { chatShowArchived = !chatShowArchived; renderChatList(); }));
  list.appendChild(a);
}
