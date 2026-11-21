// BEYOND X module 2/13: workspace — Dynamic Workspace Engine lifecycle + persistence
const workspaceState = { capability: null, mode: null, status: null, startedAt: 0, verified: false };
const WS_KEY = "beyondx-workspaces-v1";
function saveWorkspace() {
    try {
        if (typeof localStorage === "undefined") return;
        if (!workspaceState.capability) { localStorage.removeItem(WS_KEY); return; }
        localStorage.setItem(WS_KEY, JSON.stringify(workspaceState));
    } catch (e) { /* storage unavailable — the workspace still works */ }
}
function loadWorkspace() {
    try {
        if (typeof localStorage === "undefined") return false;
        const raw = localStorage.getItem(WS_KEY);
        if (!raw) return false;
        const s = JSON.parse(raw);
        if (!s || !s.capability || !CAPABILITIES[s.capability]) return false;
        workspaceState.capability = s.capability;
        workspaceState.mode = s.mode || null;
        workspaceState.status = s.status || null;
        workspaceState.startedAt = s.startedAt || 0;
        workspaceState.verified = s.verified === true;
        return true;
    } catch (e) { return false; }
}
function setWorkspaceStatus(status) {
    workspaceState.status = status;
    const el = document.getElementById("workspaceStatus");
    if (el) {
        if (!workspaceState.capability) { el.textContent = ""; }
        else {
            el.textContent = "کارځای: " + CAPABILITIES[workspaceState.capability].name
                + " — " + (WS_LABELS[status] || status);
        }
    }
    saveWorkspace();
}
function verifyCapability(cap) {
    if (cap === "school") {
        // The word quiz needs the 6 verified pairs (local data).
        if (!quizWords || quizWords.length === 0) return { ok: false, missing: "quizWords" };
        return { ok: true, missing: null };
    }
    if (cap === "islamic") {
        // Panel built by JS; the gateway serves the sources.
        if (typeof buildIslamicPanel !== "function") return { ok: false, missing: "islamic" };
        return { ok: true, missing: null };
    }
    if (cap === "books") {
        // Panel built by JS; the gateway serves the books.
        if (typeof buildBooksPanel !== "function") return { ok: false, missing: "books" };
        return { ok: true, missing: null };
    }
    return { ok: false, missing: "unknown" };
}
function activateWorkspace(cap, mode) {
    workspaceState.capability = cap;
    workspaceState.mode = mode;
    workspaceState.startedAt = Date.now();
    workspaceState.verified = false;
    setWorkspaceStatus("requested");
    setWorkspaceStatus("analyzing");
    setWorkspaceStatus("activating");
    setWorkspaceStatus("testing");
    const v = verifyCapability(cap);
    if (!v.ok) {
        setWorkspaceStatus("verification-failed");
        addMessage("د " + CAPABILITIES[cap].name + " سیستم تایید ناکام شو — اړین معلومات نشته.", "ai");
        return false;
    }
    workspaceState.verified = true;
    setWorkspaceStatus("ready");
    return true;
}
function closeWorkspace() {
    // Explicit intent only. School PROGRESS (its own key) is kept.
    workspaceState.capability = null;
    workspaceState.mode = null;
    workspaceState.status = null;
    workspaceState.verified = false;
    const el = document.getElementById("workspaceStatus");
    if (el) el.textContent = "";
    saveWorkspace();
    showPanel("chat");
    addMessage("کارځای بند شو — ستا پرمختګ خوندي دی.", "ai");
}

