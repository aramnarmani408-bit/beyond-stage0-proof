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
    const msg = document.createElement("div");
    msg.className = "msg " + who;
    msg.textContent = text;
    chatArea.appendChild(msg);
    chatArea.scrollTop = chatArea.scrollHeight;
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
}

