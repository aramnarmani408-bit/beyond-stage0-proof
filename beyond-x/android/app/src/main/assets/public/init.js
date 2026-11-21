// BEYOND X module 31/31: init — element wiring + resume + polling (LAST)
const drawerBtn = document.getElementById("drawerBtn");
const drawer = document.getElementById("drawer");
const newChatBtn = document.getElementById("newChatBtn");
const chatArea = document.getElementById("chatArea");
const sendBtn = document.getElementById("sendBtn");
const askInput = document.getElementById("askInput");
const quizRestart = document.getElementById("quizRestart");
const reviseBtn = document.getElementById("reviseBtn");
const modeBtn = document.getElementById("modeBtn");
const wordBtn = document.getElementById("wordBtn");
const sentBtn = document.getElementById("sentBtn");
const backChat = document.getElementById("backChat");
const closeWorkspaceBtn = document.getElementById("closeWorkspaceBtn");
const errDetailsBtn = document.getElementById("errDetailsBtn");

if (drawerBtn && drawer) {
    drawerBtn.addEventListener("click", () => drawer.classList.toggle("open"));
}

if (newChatBtn && chatArea) {
    newChatBtn.addEventListener("click", () => {
        while (chatArea.firstChild) chatArea.removeChild(chatArea.firstChild);
        AppState.messages = [];
        AppState.currentChat++;
        AppState.convId = "conv-" + Date.now();
        AppState.lastError = null;
        const btn = document.getElementById("errDetailsBtn");
        if (btn) btn.style.display = "none";
        saveChat();
        updateChatTitle();
        setAction("چمتو یم");
    });
}

if (closeWorkspaceBtn) closeWorkspaceBtn.addEventListener("click", closeWorkspace);

if (errDetailsBtn) errDetailsBtn.addEventListener("click", showErrorDetails);

if (sendBtn) sendBtn.addEventListener("click", sendQuestion);
if (askInput) {
    askInput.addEventListener("keydown", e => {
        if (e.key === "Enter") sendQuestion();
    });
}

if (quizRestart) quizRestart.addEventListener("click", startQuiz);

if (reviseBtn) reviseBtn.addEventListener("click", startRevision);

if (modeBtn) modeBtn.addEventListener("click", toggleMode);

if (wordBtn) wordBtn.addEventListener("click", startQuiz);

if (sentBtn) {
    sentBtn.addEventListener("click", startSentenceQuiz);
    if (vocabItems().length === 0) sentBtn.style.display = "none";
}

if (backChat) backChat.addEventListener("click", () => showPanel("chat"));

// Resume saved progress if there is any; otherwise start fresh.
if (!loadProgress()) startQuiz();
else if (quizState.kind === "sentence" && vocabItems().length === 0) startQuiz();
else showQuizQuestion();
// Engine init: restore chat + workspace + gateway state; then
// bounded polling (every 60s, skipped while the tab is hidden).
if (!AppState.convId) AppState.convId = "conv-" + Date.now();
loadChat();
if (loadWorkspace() && workspaceState.status === "ready") {
    setWorkspaceStatus("ready");
    if (workspaceState.capability === "school") showPanel("school");
    else if (workspaceState.capability === "islamic") { buildIslamicPanel(); showPanel("islamic"); }
    else if (workspaceState.capability === "books") { buildBooksPanel(); showPanel("books"); }
    else if (workspaceState.capability === "images") { buildImagesPanel(); showPanel("images"); }
    else if (workspaceState.capability === "voice") { buildVoicePanel(); showPanel("voice"); }
    else if (workspaceState.capability === "games") { buildGamesPanel(); showPanel("games"); }
    else if (workspaceState.capability === "polyglot") { buildLanguagePanel(); showPanel("language"); }
}
checkGateway();
if (typeof setInterval !== "undefined") {
    setInterval(function () {
        if (typeof document !== "undefined" && document.hidden) return;
        checkGateway();
    }, HEALTH_POLL_MS);
}
if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) checkGateway();
    });
}
setAction("چمتو یم");
