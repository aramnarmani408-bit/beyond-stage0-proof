var NEON_KEY = "beyondx-neon-v1";
var neonPrefs = { lang: "ps", depth: "medium", style: "friend" };
var firstOpenMs = 0;
var neonNav = null;
var neonProfile = null;
var neonNavBtns = {};
var neonPrefBtns = [];
var neonFirstOpenEl = null;
var NEON_CSS = "#avatar.busy{animation:pulse 1s infinite}#avatar.err{opacity:.5}@keyframes pulse{50%{opacity:.5}}.msg{border-radius:16px}.msg.user{border-radius:16px 16px 4px 16px}.msg.ai{border-radius:16px 16px 16px 4px}nav#bottomNav{position:fixed;bottom:0;left:0;right:0;background:var(--sf);border-top:1px solid var(--bd);display:flex;z-index:40}nav#bottomNav button{flex:1;min-height:56px;border:0;background:transparent;color:var(--mu);font-size:14px}nav#bottomNav button.on{color:var(--ac);font-weight:700;border-top:2px solid var(--ac)}#profilePanel{flex:1;display:none;flex-direction:column;min-height:0;overflow-y:auto}#profilePanel .fact{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--bd)}#profilePanel .fact .k{flex:0 0 92px;color:var(--ac);font-weight:700}#profilePanel button.on{outline:2px solid var(--ac)}.msg,nav#bottomNav button{transition:opacity .15s}@media (prefers-reduced-motion:reduce){.status-dot,#avatar{animation:none}*{transition:none!important}}#main{padding-bottom:64px}#islamicPanel,#booksPanel,#imagesPanel,#voicePanel,#gamesPanel,#languagePanel,#codePanel,#mobilePanel{min-height:0;overflow-y:auto}#demoBox{margin-top:8px}#chatSearch{background:var(--sf);color:var(--tx);border:1px solid var(--bd);border-radius:8px;padding:10px;margin:10px 0}#drawerSettingsBtn{background:var(--ac);color:#fff;border:0;padding:10px;cursor:pointer;border-radius:8px}#jumpBtn,#stopBtn{position:fixed;bottom:150px;z-index:30;display:none}#jumpBtn{left:16px}#stopBtn{right:16px}body.set-nomotion *{transition:none!important;animation:none!important}";
function loadNeonPrefs() {
    try {
        if (typeof localStorage === "undefined") return;
        var raw = localStorage.getItem(NEON_KEY);
        if (!raw) return;
        var p = JSON.parse(raw);
        if (!p) return;
        var valid = { lang: ["ps"], depth: ["short", "medium", "long"], style: ["friend", "teacher", "formal"] };
        Object.keys(valid).forEach(function (k) {
            if (valid[k].indexOf(p[k]) !== -1) neonPrefs[k] = p[k];
        });
    } catch (e) {}
}
function saveNeonPrefs() {
    try {
        if (typeof localStorage !== "undefined") localStorage.setItem(NEON_KEY, JSON.stringify(neonPrefs));
    } catch (e) {}
}
function neonState() {
    if (chatState.status === "failed" || gatewayState.status === "offline") return "error";
    if (["requested", "analyzing", "activating", "testing"].indexOf(workspaceState.status) !== -1) return "creating";
    if (chatState.status === "busy") {
        var a = document.getElementById("actionLine");
        return a && a.textContent === "ځواب ورکوم" ? "responding" : "processing";
    }
    return "idle";
}
function neonMarkPrefs() {
    neonPrefBtns.forEach(function (b) {
        if (b.el && b.el.classList) b.el.classList.toggle("on", neonPrefs[b.key] === b.value);
    });
}
function renderNeon() {
    var av = document.getElementById("avatar");
    if (av && av.classList) {
        var s = neonState();
        av.classList.toggle("busy", s === "processing" || s === "creating");
        av.classList.toggle("err", s === "error");
    }
    neonMarkPrefs();
}
function neonSetPref(key, value) {
    var ok = (key === "lang" && value === "ps")
        || (key === "depth" && (value === "short" || value === "medium" || value === "long"))
        || (key === "style" && (value === "friend" || value === "teacher" || value === "formal"));
    if (!ok) return;
    neonPrefs[key] = value;
    saveNeonPrefs();
    neonMarkPrefs();
}
