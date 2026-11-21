// BEYOND X module 6/13: ui — message rendering + actions + panels
function addMessage(text, who) {
    const chat = document.getElementById("chat");
    if (!chat) return;
    const div = document.createElement("div");
    div.className = "bubble " + (who === "user" ? "user" : "ai");
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}
function showToast(msg) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = "block";
    setTimeout(function () { toast.style.display = "none"; }, 2500);
}
function setAction(text) {
    const line = document.getElementById("actionLine");
    if (line) line.textContent = text;
}
// Panel switching: chat or the school quiz or the Islamic,
// books, images, voice, games or language workspace. The
// function was moved here from router.js (stage 8) because
// router's push was full.
function showPanel(name) {
    var panels = {
        chat: "chatPanel", school: "schoolPanel",
        islamic: "islamicPanel", books: "booksPanel",
        images: "imagesPanel", voice: "voicePanel",
        games: "gamesPanel", language: "languagePanel"
    };
    Object.keys(panels).forEach(function (key) {
        const panel = document.getElementById(panels[key]);
        if (panel) panel.style.display = key === name ? "flex" : "none";
    });
    const drawer = document.getElementById("drawer");
    if (drawer && name === "school") drawer.style.display = "none";
}

