// BEYOND X module 35/37: mobilelib — registry + diagnostics + permissions.
// Missing values are "not reported", never invented.
var NR = "not reported";
var MOBILE_CAPS = ["battery", "network", "storage-estimate", "ram-estimate",
  "vibration", "clipboard", "share", "geolocation", "notifications",
  "camera", "microphone", "wake-lock", "deep-links", "settings-intents",
  "app-inventory", "app-launch", "usage-stats", "screen-capture",
  "accessibility", "file-access", "automation"];
var MOBILE_NATIVE = MOBILE_CAPS.slice(14);
function mobileHasBridge() { return typeof Capacitor !== "undefined"; }
function mobileNav() { return typeof navigator === "undefined" ? null : navigator; }
function mobilePick(o, k) { return o && o[k] != null ? o[k] : NR; }
function mobileStatus(id) {
  if (MOBILE_NATIVE.indexOf(id) !== -1) return "NEEDS_APP";
  if (id === "deep-links" || id === "settings-intents") return "SUPPORTED";
  var n = mobileNav();
  if (!n) return "UNSUPPORTED";
  var gum = !!(n.mediaDevices && n.mediaDevices.getUserMedia);
  var has = { battery: !!n.getBattery, network: !!n.connection || "onLine" in n,
    "storage-estimate": !!(n.storage && n.storage.estimate),
    "ram-estimate": "deviceMemory" in n || "hardwareConcurrency" in n,
    vibration: !!n.vibrate, clipboard: !!(n.clipboard && n.clipboard.writeText),
    share: !!n.share, geolocation: !!n.geolocation,
    notifications: typeof Notification !== "undefined",
    camera: gum, microphone: gum, "wake-lock": !!(n.wakeLock && n.wakeLock.request) };
  if (!has[id]) return "UNSUPPORTED";
  if (id === "notifications" && Notification.permission !== "granted") return "PERMISSION_REQUIRED";
  return "SUPPORTED";
}
function mobileRegistry() {
  return MOBILE_CAPS.map(function (id) { return { id: id, layer: MOBILE_NATIVE.indexOf(id) !== -1 ? "native" : "web", status: mobileStatus(id) }; });
}
async function mobileRead(fn, keys) {
  var o = {};
  keys.forEach(function (k) { o[k] = NR; });
  try { var v = await fn();
    keys.forEach(function (k) { o[k] = mobilePick(v, k); });
  } catch (e) { /* stays NR */ }
  return o;
}
async function mobileBattery() {
  var n = mobileNav();
  return mobileRead(function () { return n.getBattery(); },
    ["level", "charging", "chargingTime", "dischargingTime"]);
}
async function mobileStorage() {
  var n = mobileNav();
  var o = await mobileRead(function () { return n.storage.estimate(); }, ["quota", "usage"]);
  o.percent = NR;
  if (typeof o.quota === "number" && typeof o.usage === "number" && o.quota > 0)
    o.percent = Math.round(o.usage / o.quota * 100);
  return o;
}
async function mobileLatency() {
  var t = [];
  for (var i = 0; i < 3; i++) {
    var t0 = Date.now();
    try { await fetch(HEALTH_URL); t.push(Date.now() - t0); } catch (e) { /* dropped */ }
  }
  if (!t.length) return NR;
  t.sort(function (a, b) { return a - b; });
  return t[Math.floor(t.length / 2)];
}
async function mobileNetwork() {
  var n = mobileNav(), c = n && n.connection;
  return { online: mobilePick(n, "onLine"), type: mobilePick(c, "type"), effectiveType: mobilePick(c, "effectiveType"),
    downlink: mobilePick(c, "downlink"), rtt: mobilePick(c, "rtt"), latencyMs: await mobileLatency() };
}
function mobileDevice() {
  var n = mobileNav();
  return { ramGB: mobilePick(n, "deviceMemory"), cpuCores: mobilePick(n, "hardwareConcurrency"),
    userAgent: mobilePick(n, "userAgent") };
}
function mobileDiagnose(s) {
  var st = s.storage || {}, b = s.battery || {}, nw = s.network || {};
  var m = (typeof st.percent === "number") + (typeof b.level === "number")
    + (typeof nw.latencyMs === "number") + (typeof nw.rtt === "number");
  var f = [], a = [];
  function rule(ok, fi, ac) { if (ok) { f.push(fi); a.push(ac); } }
  rule(st.percent >= 90, "حافظه نږدې ډکه ده", "ځای خالي کړه");
  rule(st.percent >= 75 && st.percent < 90, "حافظه ډکېږي", "ځای خالي کړه");
  rule(b.level <= 0.2 && b.charging !== true, "بیټرۍ کمه ده", "موبایل چارج کړه");
  rule(nw.latencyMs > 1000, "انټرنیټ ورو دی", "انټرنیټ وګوره");
  return { evidence: s, confidence: m === 0 ? "none" : m < 3 ? "low" : "high",
    severity: f.length === 0 ? "ok" : (st.percent >= 90 || b.level <= 0.1) ? "critical" : "warning",
    findings: f, actions: a };
}
async function mobilePerm(name) {
  var n = mobileNav();
  if (!(n && n.permissions && n.permissions.query)) return NR;
  try { var r = await n.permissions.query({ name: name });
    return r && r.state ? r.state : NR;
  } catch (e) { return NR; }
}
