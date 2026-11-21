// BEYOND X module 4/13: chatstore — chat persistence + conversation title
// Chat persistence (bounded: last 50 messages) + conversation
// id + auto-title from the first user message.
const CHAT_KEY = "beyondx-chat-v1";
const CHAT_MAX = 50;
function saveChat() {
    try {
        if (typeof localStorage === "undefined") return;
        const msgs = AppState.messages.slice(-CHAT_MAX);
        localStorage.setItem(CHAT_KEY, JSON.stringify({ id: AppState.convId || "", messages: msgs }));
    } catch (e) { /* storage unavailable — chat still works */ }
}
function loadChat() {
    try {
        if (typeof localStorage === "undefined") return false;
        const raw = localStorage.getItem(CHAT_KEY);
        if (!raw) return false;
        const s = JSON.parse(raw);
        if (!s || !Array.isArray(s.messages)) return false;
        AppState.convId = s.id || null;
        AppState.messages = s.messages.slice(-CHAT_MAX);
        const chatArea = document.getElementById("chatArea");
        // Render only into an empty area — never duplicate.
        if (chatArea && chatArea.children.length === 0) {
            for (let i = 0; i < AppState.messages.length; i++) {
                const m = AppState.messages[i];
                const msg = document.createElement("div");
                msg.className = "msg " + m.who;
                msg.textContent = m.text;
                chatArea.appendChild(msg);
            }
            chatArea.scrollTop = chatArea.scrollHeight;
        }
        updateChatTitle();
        return true;
    } catch (e) { return false; }
}
function updateChatTitle() {
    const list = document.getElementById("chatList");
    if (!list) return;
    let first = null;
    for (let i = 0; i < AppState.messages.length; i++) {
        if (AppState.messages[i].who === "user") { first = AppState.messages[i].text; break; }
    }
    const title = first ? first.slice(0, 30) : "خبره ۱";
    let li = list.children && list.children[0] ? list.children[0] : null;
    if (!li) { li = document.createElement("li"); list.appendChild(li); }
    li.textContent = title;
}

