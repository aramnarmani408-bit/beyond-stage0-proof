var NEON_KEY = "beyondx-neon-v1";
var neonPrefs = { lang: "ps", depth: "full", style: "teacher" };
var firstOpenMs = 0;
var neonNav = null;
var neonProfile = null;
var neonNavBtns = {};
var neonPrefBtns = [];
var neonFirstOpenEl = null;
var NEON_CSS = "header{border:1px solid #00F5FF;border-radius:14px;padding:12px;margin-bottom:12px}#avatar.busy{animation:pulse 1s infinite}#avatar.err{opacity:.5}.msg{border-radius:16px}.msg.user{border-radius:16px 16px 4px 16px}.msg.ai{border-radius:16px 16px 16px 4px}#inputArea{border:1px solid #00F5FF;border-radius:16px;padding:8px}#askInput{border:0}nav#bottomNav{position:fixed;bottom:0;left:0;right:0;background:#0A0A1F;border-top:1px solid #00F5FF;display:flex;z-index:40}nav#bottomNav button{flex:1;min-height:56px;border:0;background:transparent;color:#94A3B8;font-size:14px}nav#bottomNav button.on{color:#00F5FF;font-weight:700;border-top:2px solid #00F5FF}#profilePanel{flex:1;display:none;flex-direction:column}#profilePanel .fact{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #0A0A1F}#profilePanel .fact .k{flex:0 0 92px;color:#00F5FF;font-weight:700}#profilePanel button.on{outline:2px solid #F1F5F9}.msg,nav#bottomNav button{transition:opacity .15s}@media (prefers-reduced-motion:reduce){.status-dot,#avatar{animation:none}*{transition:none!important}}#main{padding-bottom:64px}";
function loadNeonPrefs() {
    try {
        if (typeof localStorage === "undefined") return;
        var raw = localStorage.getItem(NEON_KEY);
        if (!raw) return;
        var p = JSON.parse(raw);
        if (!p) return;
        var valid = { lang: ["ps", "en"], depth: ["short", "full"], style: ["teacher", "tech"] };
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
    var ok = (key === "lang" && (value === "ps" || value === "en"))
        || (key === "depth" && (value === "short" || value === "full"))
        || (key === "style" && (value === "teacher" || value === "tech"));
    if (!ok) return;
    neonPrefs[key] = value;
    saveNeonPrefs();
    neonMarkPrefs();
}
