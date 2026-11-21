// listFiles: app dirs only — SAF folders are a LATER item.
var BB = "BeyondXBridge";
var MOBILE_PERM_WHY = { "app-inventory": "اپونه وښيي", "app-launch": "اپ پرانیزي",
  "usage-stats": "کارول ښيي", "screen-capture": "سکرین شاټ",
  "accessibility": "سکرین لولي", "file-access": "فایلونه وښيي",
  "automation": "یادونې جوړوي", location: "ځای ښيي",
  notifications: "خبرتیا لېږي", files: "فایلونه لولي",
  tap: "ټپ کوي", swipe: "کش کوي", notif: "خبرتیاوې",
  "notif-reply": "ځواب", "notif-dismiss": "لرې کوي", sms: "SMS",
  install: "نصب", uninstall: "لرې" };
function bridgeNo() { return { ok: false, status: "UNSUPPORTED", error: "no native bridge" }; }
function bridgeMap(e) {
  var c = (e && e.code) || "";
  var m = "" + ((e && e.message) || e || "error");
  var t = c + " " + m;
  var s = "UNSUPPORTED";
  if (/usage_access_required|accessibility_disabled|consent_denied|notification_disabled/.test(t)) s = "USER_ACTION_REQUIRED";
  else if (/unsupported_api/.test(t)) s = "BLOCKED_BY_ANDROID";
  else if (/ermission|denied/.test(t)) s = "PERMISSION_REQUIRED";
  return { ok: false, status: s, error: m };
}
async function bridgeCall(p, m, a) {
  if (typeof Capacitor === "undefined") return bridgeNo();
  try { var r = await Capacitor.registerPlugin(p)[m](a);
    return { ok: true, status: "SUPPORTED", data: r };
  } catch (e) { return bridgeMap(e); }
}
async function deviceInfo() {
  var i = await bridgeCall("Device", "getInfo");
  if (!i.ok) return i;
  var b = await bridgeCall("Device", "getBatteryInfo");
  if (!b.ok) return b;
  return { ok: true, status: "SUPPORTED", data: { info: i.data, battery: b.data } };
}
function listApps() { return bridgeCall(BB, "listApps"); }
function launchApp(pkg) { return bridgeCall(BB, "launchApp", { package: pkg }); }
function appUsage(days) { return bridgeCall(BB, "appUsage", { days: days || 7 }); }
function listFiles(p) { return bridgeCall("Filesystem", "readdir", { path: p || "", directory: "Data" }); }
function readScreen() { return bridgeCall(BB, "readScreen"); }
function captureScreen() { return bridgeCall(BC, "captureScreen"); }
function scheduleTask(t) { return bridgeCall(BB, "scheduleTask", t); }
var BeyondXNative = { version: 1, deviceInfo: deviceInfo, listApps: listApps,
  launchApp: launchApp, appUsage: appUsage, listFiles: listFiles,
  readScreen: readScreen, captureScreen: captureScreen, scheduleTask: scheduleTask };
function mobileBridgeStatus(id) {
  if (typeof Capacitor === "undefined") return null;
  if (/^(app-inventory|app-launch|file-access|automation)$/.test(id)) return "SUPPORTED";
  if (/^(usage-stats|screen-capture|accessibility)$/.test(id)) return "USER_ACTION_REQUIRED";
  if (/^(tap|swipe|notif|notif-reply|notif-dismiss)$/.test(id)) return "USER_ACTION_REQUIRED";
  if (/^(sms|install|uninstall)$/.test(id)) return "SUPPORTED";
  return null;
}
var mBOut = null;
function mBridgeDo(name, fn, show) {
  fn().then(r => {
    showToast(name + ": " + r.status);
    mobileAudit(name, NPR, r.status, r.ok ? "ok" : (r.error || r.status));
    mClear(mBOut);
    if (r.ok) { var o = show(r.data); if (typeof o === "string") mAdd(o, mBOut); else mBOut.appendChild(o); }
    else mAdd(r.status + ": " + (r.error || ""), mBOut);
  });
}
function mBridgeSection(panel) {
  var st = mEl("div", "");
  st.appendChild(mEl("div", "نیټیو پل"));
  MOBILE_NATIVE.forEach(id => mAdd(id + ": " + mobileStatus(id) + " — " + MOBILE_PERM_WHY[id], st));
  panel.appendChild(st);
  var btns = mEl("div", "");
  var B = [
    ["اپلیکېشنونه", listApps, d => "اپونه: " + d.apps.length + " — " + d.apps.slice(0, 10).map(a => a.label).join("، ")],
    ["کارونه", appUsage, d => d.apps.sort((x, y) => y.minutes - x.minutes).slice(0, 5).map(a => a.label + ": " + a.minutes).join("، ")],
    ["فایلونه", listFiles, d => d.files.map(f => f.name || f).join("، ")],
    ["سکرین ولوله", readScreen, d => d.text.slice(0, 500)],
    ["سکرین شاټ", captureScreen, d => { var im = document.createElement("img"); im.src = d.image; return im; }],
    ["یادونه", () => scheduleTask({ title: "BEYOND X یادونه", text: "یادونه", delayMinutes: 60 }), d => "یادونه جوړه شوه: " + d.id]];
  B.forEach(b => btns.appendChild(mBtn(b[0], () => mBridgeDo(b[0], b[1], b[2]))));
  panel.appendChild(btns);
  mBOut = mEl("div", "");
  panel.appendChild(mBOut);
}
