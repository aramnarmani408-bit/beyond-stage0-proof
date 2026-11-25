// #167 Document workspace, part 2 — copy, open-attached + runtime registration.
// No edit to core.js / universe.js / workspace.js: the hooks below
// wrap the registry functions at load time (docws.js loads first).
function docOpenAttached() { if (typeof attach2List === "undefined" || !attach2List.length) { showToast("متن فایل ضمیمه کړه"); return; } var f = null; for (var i = attach2List.length - 1; i >= 0; i--) if (attach2List[i].kind === "text") { f = attach2List[i]; break; } if (!f) { showToast("متن فایل نشته"); return; } var d = docFromAttached(f); if (!d) { showToast("فایل خلاص نه شو"); return; } docCur = null; docFill(d); showToast("خلاص شو: " + d.title); }
function docCopy(t) { var ok = function () { showToast("کاپي شو ✓"); }; if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t).then(ok, function () { docCopyFb(t); }); return; } docCopyFb(t); }
function docCopyFb(t) { try { var ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); showToast("کاپي شو ✓"); } catch (e) { showToast("کاپي نشوه — متن وټاکئ"); } }
function ppAddDocBtn() { var a = document.getElementById("inputArea"); if (!a || document.getElementById("ppDocBtn")) return; var b = document.createElement("button"); b.id = "ppDocBtn"; b.textContent = "📄 سند"; b.addEventListener("click", ppOpenDocWs); a.appendChild(b); }
if (typeof CAPABILITIES !== "undefined") CAPABILITIES.doc = { name: "سند", status: "available", stage: 12 };
if (typeof UNIVERSE_TYPES !== "undefined") { UNIVERSE_TYPES.doc = { cap: "doc", panel: "doc", name: "سند" }; UNIVERSE_HINTS.doc = "سند ولیکئ او وګورئ او کاپي او صادر یې کړئ"; }
var _docVerify = verifyCapability; verifyCapability = function (c) { if (c === "doc") return { ok: typeof buildDocWsPanel === "function", missing: "doc" }; return _docVerify(c); };
var _docIsCap = isUniverseCap; isUniverseCap = function (c) { return c === "doc" || _docIsCap(c); };
var _docDirect = universeDirect; universeDirect = function (q) { q = q || ""; if (q.indexOf("سند") !== -1 && (q.indexOf("جوړ") !== -1 || q.indexOf("لیک") !== -1 || q.indexOf("خلاص") !== -1)) return "doc"; return _docDirect(q); };
var _docBuild = universeBuild; universeBuild = function (t) { if (t === "doc") return buildDocWsPanel(); return _docBuild(t); };
var _docFill = universeFill; universeFill = function (t, a) { if (t === "doc") { fillDocWsPanel({ title: "", body: a || "" }); return; } _docFill(t, a); };
var _docShowUni = showUniversePanel; showUniversePanel = function (n) { _docShowUni(n); showDocWsPanel(n === "doc"); };
if (typeof setTimeout === "function") setTimeout(ppAddDocBtn, 800);
