// BEYOND X module 93/93: init — element wiring + resume + polling (LAST)
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
const wsStatusEl = document.getElementById("workspaceStatus");
const errDetailsBtn = document.getElementById("errDetailsBtn");

if (drawerBtn && drawer) {
    drawerBtn.addEventListener("click", () => drawer.classList.toggle("open"));
}

if (newChatBtn) newChatBtn.addEventListener("click", newChat);
if (typeof buildDrawerControls === "function") buildDrawerControls();

if (closeWorkspaceBtn) closeWorkspaceBtn.addEventListener("click", closeWorkspace);

// Phase 3 (D10): tapping the workspace status line returns to the
// active workspace (without refilling it — reopenWorkspace).
if (wsStatusEl) {
    wsStatusEl.style.cursor = "pointer";
    wsStatusEl.addEventListener("click", () => { if (typeof reopenWorkspace === "function") reopenWorkspace(); });
}

if (errDetailsBtn) errDetailsBtn.addEventListener("click", showErrorDetails);

if (sendBtn) sendBtn.addEventListener("click", sendQuestion);
if (askInput) {
    askInput.addEventListener("keydown", e => {
        if (e.key === "Enter") sendQuestion();
    });
}

if (typeof buildChatButtons === "function") buildChatButtons();

if (quizRestart) quizRestart.addEventListener("click", startQuiz);

if (reviseBtn) reviseBtn.addEventListener("click", startRevision);

if (modeBtn) modeBtn.addEventListener("click", toggleMode);

if (wordBtn) wordBtn.addEventListener("click", startQuiz);

if (sentBtn) {
    sentBtn.addEventListener("click", startSentenceQuiz);
    if (vocabItems().length === 0) sentBtn.style.display = "none";
}

if (backChat) backChat.addEventListener("click", () => showPanel("chat"));

if (typeof buildNeon === "function") buildNeon();

// Phase 2: theme first (the stored theme applies before first paint
// settles), then the avatar + the settings rows in the profile panel.
if (typeof applyTheme === "function") applyTheme();
if (typeof buildAvatar === "function") buildAvatar();
if (typeof buildSettings === "function") buildSettings();

if (!loadProgress()) startQuiz();
else if (quizState.kind === "sentence" && vocabItems().length === 0) startQuiz();
else showQuizQuestion();
if (!AppState.convId) AppState.convId = "conv-" + Date.now();
// Phase 1: the demo-chip rotation counter advances once per app open (D2).
try { if (typeof localStorage !== "undefined") localStorage.setItem(DEMO_KEY, String(demoCount() + 1)); } catch (e) {}
loadChat();
// History/SQLite: the async store init runs after the sync first
// paint; the demo waits while it loads (no flash on the device).
if (typeof histInit === "function") histInit();
if (typeof memInit === "function") memInit();
if (AppState.messages.length === 0 && !(typeof histIsLoading === "function" && histIsLoading())) renderDemo();
if ((typeof setPrefs === "undefined" || setPrefs.wsResume !== "off") && loadWorkspace() && workspaceState.status === "ready") {
    setWorkspaceStatus("ready");
    // Phase 3: the resume chain lives in reopenWorkspace() (universelib.js)
    // — the same return path the status-line tap uses.
    if (typeof reopenWorkspace === "function") reopenWorkspace();
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
if (typeof neonFirstOpen === "function") neonFirstOpen();
