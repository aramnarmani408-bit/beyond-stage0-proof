// BEYOND X module 24/27: games — panel + rendering.
var gamesPanelEl = null;
var gamesInputEl = null;
var gamesStatusEl = null;
var gamesPlayEl = null;
var gamesSavedEl = null;
var gamesPlayAreaEl = null;
var GAMES_BASE = "https://beyond-build-gateway.aramnarmani408.workers.dev/api/v1/x";
function gamesEl(tag, text) {
    var el = document.createElement(tag);
    el.textContent = text;
    return el;
}
function gamesBtn(text, fn) {
    var b = gamesEl("button", text);
    b.addEventListener("click", fn);
    return b;
}
function gamesAdd(text) {
    if (text) gamesStatusEl.appendChild(gamesEl("div", text));
}
function gamesClear() {
    while (gamesStatusEl.firstChild) gamesStatusEl.removeChild(gamesStatusEl.firstChild);
}
function buildGamesPanel() {
    if (gamesPanelEl) return gamesPanelEl;
    var panel = document.createElement("div");
    panel.id = "gamesPanel";
    panel.style.display = "none";
    panel.style.flex = "1";
    panel.style.flexDirection = "column";
    panel.style.gap = "12px";
    panel.appendChild(gamesBtn("← بیرته", function () { showPanel("chat"); }));
    panel.appendChild(gamesEl("div", "لوبې"));
    var instant = document.createElement("div");
    instant.appendChild(gamesBtn("پښتو توري", gamesStartLetters));
    instant.appendChild(gamesBtn("چټک ټک", gamesStartReflex));
    panel.appendChild(instant);
    gamesPlayAreaEl = document.createElement("div");
    gamesPlayAreaEl.style.position = "relative";
    gamesPlayAreaEl.style.minHeight = "200px";
    panel.appendChild(gamesPlayAreaEl);
    gamesInputEl = document.createElement("input");
    gamesInputEl.placeholder = "د لوبې شرح...";
    gamesInputEl.style.cssText = "background:#0A0A1F;color:#F1F5F9;";
    panel.appendChild(gamesInputEl);
    panel.appendChild(gamesBtn("جوړه کړه", gamesRequestFromPanel));
    gamesStatusEl = document.createElement("div");
    panel.appendChild(gamesStatusEl);
    gamesPlayEl = document.createElement("div");
    panel.appendChild(gamesPlayEl);
    gamesSavedEl = document.createElement("div");
    panel.appendChild(gamesSavedEl);
    document.getElementById("main").appendChild(panel);
    gamesPanelEl = panel;
    showGamesSaved();
    return panel;
}
function showGamesPanel(show) {
    if (gamesPanelEl) gamesPanelEl.style.display = show ? "flex" : "none";
}
// Strip trigger words; the rest is the description (here so gameslib fits).
function gamesPromptFrom(q) {
    var drop = ["لوبې", "لوبو", "لوبه", "ګېم", "سیستم", "جوړ", "جوړه", "کړه", "راکړه", "غواړم", "یو", "یوه", "د", "مې", "را", "مه"];
    return q.split(/\s+/).filter(function (w) { return w && drop.indexOf(w) === -1; }).join(" ");
}
// A games QUESTION is chat, not the workspace.
function isGamesRequest(q) {
    if (q.indexOf("ځواب") !== -1 || q.indexOf("څه شی دی") !== -1 || q.indexOf("څه دی") !== -1 || q.indexOf("ووایه") !== -1) return false;
    return q.indexOf("لوبې") !== -1 || q.indexOf("ګېم") !== -1 || q.indexOf("لوبه") !== -1;
}
// Games router branch (moved from router.js).
function routeGames(q) {
    if (activateWorkspace("games", "temporary")) {
        buildGamesPanel();
        showPanel("games");
        addMessage("د لوبو کارځای دې لپاره جوړ شو — لوبه وکړه او نوې لوبه جوړه کړه.", "ai");
    }
    var g = gamesPromptFrom(q);
    if (g && gamesInputEl) gamesInputEl.value = g;
}
// Saved-games list (here so gameslib fits the publish limit).
function gamesAddSaved(id, description, playUrl, apkUrl) {
    gamesSaved.unshift({ id: id, description: description, playUrl: playUrl, apkUrl: apkUrl });
    if (gamesSaved.length > 10) gamesSaved.length = 10;
    gamesSaveState();
    showGamesSaved();
}
function showGamesSaved() {
    if (!gamesSavedEl) return;
    while (gamesSavedEl.firstChild) gamesSavedEl.removeChild(gamesSavedEl.firstChild);
    if (gamesSaved.length === 0) { gamesSavedEl.appendChild(gamesEl("div", "لا دې کومه لوبه نه ده جوړه کړې.")); return; }
    gamesSaved.forEach(function (g) {
        var d = gamesEl("div", g.description || g.id);
        d.addEventListener("click", function () { gamesShowPlay(g.playUrl, g.apkUrl); });
        gamesSavedEl.appendChild(d);
    });
}
function gamesPanelError(e) {
    gamesClear();
    var m = e.message || "";
    if (m.indexOf("Failed: ") === 0) gamesAdd("لوبه جوړه نه شوه — " + m.slice(8));
    else if (m === "RateLimit") gamesAdd("ډېرې غوښتنې وشوې — لږ وروسته بیا هڅه وکړه");
    else if (m === "NoDescription") gamesAdd("لومړی د لوبې شرح ولیکئ.");
    else gamesAdd("انټرنیټ نشته یا ځواب ونه رسېد — بیا هڅه وکړه");
}
