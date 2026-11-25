// #209 Logging system — runtime hooks (logs.js holds the store).
// Every hook WRAPS an existing function; no source module is edited.
// Error (#202 stays untouched): every recordError also lands here.
if (typeof recordError === "function") { var _lgRE = recordError; recordError = function (k, s) { _lgRE(k, s); ppLog("error", k, s); if (k === "network") ppLog("network", "gateway-fail"); if (k === "network" || k === "rate_limit" || k === "timeout" || k === "bad_contract" || k === "session") ppLog("generation", "answer-failed"); }; }
// Workspace: open / close.
if (typeof activateWorkspace === "function") { var _lgAW = activateWorkspace; activateWorkspace = function (cap, mode) { var r = _lgAW(cap, mode); ppLog("workspace", r ? "open" : "open-fail"); return r; }; }
if (typeof closeWorkspace === "function") { var _lgCW = closeWorkspace; closeWorkspace = function () { var r = _lgCW(); ppLog("workspace", "close"); return r; }; }
// Gateway + network: the health-check outcome (offline.js already wraps
// checkGateway once; this wrap sits on top of that chain).
if (typeof checkGateway === "function") { var _lgCG = checkGateway; checkGateway = function () { var p = _lgCG(); if (p && typeof p.then === "function") p.then(function (s) { ppLog("gateway", s); if (s === "offline") ppLog("network", "health-offline"); }); return p; }; }
// Generation: a finished answer (afterAnswer runs on the success path).
if (typeof afterAnswer === "function") { var _lgAA = afterAnswer; afterAnswer = function () { _lgAA(); ppLog("generation", "answer-ok"); }; }
// Database: a native DB call that fails (web has no native DB, so this
// stays silent there — wired, no events yet on the web build).
if (typeof histExec === "function") { var _lgHE = histExec; histExec = function (s, p) { var r; try { r = _lgHE(s, p); } catch (e) { if (typeof histNative === "function" && histNative()) ppLog("database", "exec-fail"); throw e; } if (r && typeof r.then === "function") r.then(function (v) { if (v && v.ok === false && typeof histNative === "function" && histNative()) ppLog("database", "exec-fail"); }); return r; }; }
// Settings: one live row per category under the infra rows (p5.js).
if (typeof ppInfraRows === "function") { var _lgPIR = ppInfraRows; ppInfraRows = function (prof) { _lgPIR(prof); ppLogRows(prof); }; }
