var BC = "BeyondXControl", BA = "BeyondXActions";
function tapScreen(x, y) { return bridgeCall(BC, "tapScreen", { x: x, y: y }); }
function swipeScreen(a, b, c, d, m) { return bridgeCall(BC, "swipeScreen", { x1: a, y1: b, x2: c, y2: d, ms: m }); }
function tapText(t) { return bridgeCall(BC, "tapText", { text: t }); }
function listNotifications() { return bridgeCall(BA, "listNotifications"); }
function replyNotification(k, t) { return bridgeCall(BA, "replyNotification", { key: k, text: t }); }
function dismissNotification(k) { return bridgeCall(BA, "dismissNotification", { key: k }); }
function sendSms(n, b) { return bridgeCall(BA, "sendSms", { number: n, body: b }); }
function installApk(p) { return bridgeCall(BA, "installApk", { path: p }); }
function uninstallApp(p) { return bridgeCall(BA, "uninstallApp", { package: p }); }
var BeyondXNative = { version: 2, deviceInfo, listApps, launchApp, appUsage, listFiles,
  readScreen, captureScreen, scheduleTask, tapScreen, swipeScreen, tapText,
  listNotifications, replyNotification, dismissNotification, sendSms, installApk, uninstallApp };
var m2bOut = null, m2bTxt = null, m2bNum = null;
async function m2bVerify(f, v) {
  var b = "";
  if (v === "tap") { var s = await readScreen(); b = s.ok ? s.data.text : ""; }
  var x = await f();
  if (!x.ok) return { status: x.status, verification: x.error || x.status };
  if (v === "tap") { var s = await readScreen(); return { status: x.status, verification: (s.ok ? s.data.text : "") !== b ? "سکرین بدل شو" : "سکرین نه دی بدل شوی" }; }
  if (v) { var l = await listNotifications(); if (!l.ok) return { status: l.status, verification: l.error || l.status }; var k = v[0] === "x" ? v.slice(1) : v; var g = l.data.notifications.some(function (n) { return n.key === k; }); return { status: x.status, verification: v[0] === "x" ? (g ? "لا هم شته" : "لرې شوه") : "ځواب ولېږل شو" }; }
  return { status: x.status, verification: "پرانیستل شو" };
}
async function m2bGo(p, f, v) {
  mClear(m2bOut);
  mAdd(p, m2bOut);
  var ok = typeof confirm === "undefined" || confirm("اجازه ورکوې؟");
  var r = await mobileAct(p, NPR, async function () {
    if (!ok) return { status: "DENIED", verification: "declined" };
    return m2bVerify(f, v);
  });
  mAdd(r.status + ": " + r.verification, m2bOut);
  return r;
}
function m2bList() {
  listNotifications().then(function (r) {
    mClear(m2bOut);
    if (!r.ok) { mAdd(r.status + ": " + (r.error || ""), m2bOut); showToast("خبرتیاوې: " + r.status); return; }
    if (!r.data.notifications.length) { mAdd("خبرتیا نشته", m2bOut); return; }
    r.data.notifications.forEach(function (n) {
      var w = mEl("div", n.title + ": " + n.text);
      if (n.canReply) w.appendChild(mBtn("ځواب", () => m2bGo("ځواب: " + n.title, () => replyNotification(n.key, m2bTxt.value), n.key)));
      w.appendChild(mBtn("✕", () => m2bGo("لرې کړه: " + n.title, () => dismissNotification(n.key), "x" + n.key)));
      m2bOut.appendChild(w);
    });
  });
}
function m2bSection(panel) {
  var i = mEl("div", "");
  m2bTxt = document.createElement("input");
  m2bTxt.placeholder = "متن";
  m2bNum = document.createElement("input");
  m2bNum.placeholder = "شمېره";
  i.appendChild(m2bTxt);
  i.appendChild(m2bNum);
  panel.appendChild(i);
  var b = mEl("div", "");
  var B = [
    ["ټپ", () => m2bGo("ټپ: " + m2bTxt.value, () => tapText(m2bTxt.value), "tap")],
    ["پورته", () => m2bGo("پورته کش کړه", () => swipeScreen(540, 1500, 540, 500, 300), "tap")],
    ["ښکته", () => m2bGo("ښکته کش کړه", () => swipeScreen(540, 500, 540, 1500, 300), "tap")],
    ["خبرتیاوې", m2bList],
    ["SMS", () => m2bGo("SMS: " + m2bNum.value, () => sendSms(m2bNum.value, m2bTxt.value))],
    ["نصب کړه", () => m2bGo("نصب کړه: " + m2bTxt.value, () => installApk(m2bTxt.value))],
    ["لرې کړه", () => m2bGo("لرې کړه: " + m2bTxt.value, () => uninstallApp(m2bTxt.value))]];
  B.forEach(x => b.appendChild(mBtn(x[0], x[1])));
  panel.appendChild(b);
  m2bOut = mEl("div", "");
  panel.appendChild(m2bOut);
}
