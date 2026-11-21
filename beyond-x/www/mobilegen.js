// BEYOND X module 36/37: mobilegen — assistant leg + actions + audit.
var MOBILE_KEY = "beyondx-mobile-v1";
var mobileWakeSentinel = null;
var NPR = "not required";
var PR = "PERMISSION_REQUIRED";
function mobileAuditLog() { try { var a = JSON.parse(localStorage.getItem(MOBILE_KEY) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
function mobileAudit(a, p, r, v) { try { var l = mobileAuditLog(); l.push({ time: new Date().toISOString(), action: a, permission: p, result: r, verification: v }); localStorage.setItem(MOBILE_KEY, JSON.stringify(l.slice(-50))); } catch (e) { } }
function mobileStateText(s) {
  var b = s.battery, st = s.storage, nw = s.network, d = s.device;
  return "battery " + b.level + " charging " + b.charging + "; storage " + st.percent
    + "%; online " + nw.online + " latency " + nw.latencyMs + "ms; RAM " + d.ramGB + "GB est; never invent values.";
}
async function mobileMeasureAll() { return { battery: await mobileBattery(), storage: await mobileStorage(), network: await mobileNetwork(), device: mobileDevice() }; }
async function xMobileAsk(q) {
  var s = await mobileMeasureAll();
  await askBeyond(q + "\n[" + mobileStateText(s) + " Pashto, ONLY from these values.]");
}
function mobileConfirm(n) {
  return ["geolocation", "notification", "deep-links", "settings-intents"].indexOf(n) === -1 || typeof confirm === "undefined" || confirm("اجازه ورکوې؟");
}
async function mobileAct(n, p, fn) {
  if (!mobileConfirm(n)) { mobileAudit(n, p, "DENIED", "declined"); return { status: "DENIED", verification: "declined" }; }
  var r;
  try { r = await fn(); } catch (e) { r = { status: "FAILED", verification: e.message || "error" }; }
  mobileAudit(n, p, r.status, r.verification);
  return r;
}
function mobileNoApi(a) { return { status: "UNSUPPORTED", verification: a + " absent" }; }
function mobileTry(p) { return p.then(function () { return { status: "SUCCESS", verification: "ok" }; }, function (e) { return { status: e.name === "NotAllowedError" ? PR : "FAILED", verification: e.name || "failed" }; }); }
function mobileVibrate(ms) { return mobileAct("vibrate", NPR, function () { var n = mobileNav(); if (!n || !n.vibrate) return mobileNoApi("vibrate"); return n.vibrate(ms || 200) ? { status: "SUCCESS", verification: "ok" } : { status: "FAILED", verification: "rejected" }; }); }
function mobileCopy(t) { return mobileAct("clipboard", NPR, function () { var n = mobileNav(); if (!(n && n.clipboard && n.clipboard.writeText)) return mobileNoApi("clipboard"); return mobileTry(n.clipboard.writeText(t)); }); }
function mobileShare(t, x) { return mobileAct("share", NPR, function () { var n = mobileNav(); if (!n || !n.share) return mobileNoApi("share"); return mobileTry(n.share({ title: t, text: x })); }); }
function mobileOpenLink(n, u) { return mobileAct(n, NPR, function () { var a = document.createElement("a"); a.href = u; a.click(); return { status: "ATTEMPTED", verification: "unverifiable" }; }); }
function mobileWakeLock() { return mobileAct("wake-lock", NPR, function () { var n = mobileNav(); if (!(n && n.wakeLock && n.wakeLock.request)) return mobileNoApi("wake-lock"); return mobileTry(n.wakeLock.request("screen").then(function (s) { mobileWakeSentinel = s; if (!s || s.released !== false) throw new Error("no lock"); })); }); }
function mobileNotify(t, b) {
  var hasN = typeof Notification !== "undefined";
  return mobileAct("notification", hasN ? Notification.permission : NR, function () {
    if (!hasN) return mobileNoApi("Notification");
    if (Notification.permission === "denied") return { status: PR, verification: "denied" };
    if (Notification.permission === "granted") { new Notification(t, { body: b }); return { status: "SUCCESS", verification: "ok" }; }
    return Notification.requestPermission().then(function (p) {
      if (p !== "granted") return { status: PR, verification: "permission " + p };
      new Notification(t, { body: b });
      return { status: "SUCCESS", verification: "ok" };
    });
  });
}
async function mobileLocate() {
  return mobileAct("geolocation", await mobilePerm("geolocation"), function () { var n = mobileNav();
    if (!(n && n.geolocation)) return mobileNoApi("geolocation");
    return new Promise(function (resolve) { n.geolocation.getCurrentPosition(function (pos) { resolve({ status: "SUCCESS", verification: pos.coords.latitude + "," + pos.coords.longitude }); },
      function (e) { resolve({ status: e.code === 1 ? PR : "FAILED", verification: e.message || "failed" }); }); });
  });
}
