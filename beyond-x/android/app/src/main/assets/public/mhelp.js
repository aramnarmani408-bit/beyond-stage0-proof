async function helpTop() { var u = await appUsage(7); return u.ok && u.data.apps.length ? u.data.apps.sort((x, y) => y.minutes - x.minutes)[0].label : NR; }
async function helpMeasure(f) {
var k = f[3];
if (k === "bt") { var b = await radioStates(); return b.ok ? "بلوتوت: " + (b.data.bluetooth ? "چالان" : "بند") : "بلوتوت: " + b.status; }
if (k === "cam") return "د کامرې اجازه: " + (await mobilePerm("camera"));
if (k === "notif") { var n = await listNotifications(); if (!n.ok) return "خبرتیاوې: " + n.status; var c = {}, top = "", tc = 0; n.data.notifications.forEach(x => { c[x.package] = (c[x.package] || 0) + 1; if (c[x.package] > tc) { tc = c[x.package]; top = x.package; } }); return "خبرتیاوې: " + n.data.notifications.length + (top ? "، زیاتې: " + top : ""); }
if (k === "apps") { var a = await listApps(); if (!a.ok) return "اپونه: " + a.status; var u = a.data.apps.filter(x => !x.system); return "اپونه: " + a.data.apps.length + "، کارن: " + u.length + " — " + u.slice(0, 5).map(x => x.label).join("، "); }
if (k === "none") return "اندازه نه کېږي";
var s = await mobileMeasureAll();
if (k === "ram") return "RAM: " + mShow(s.device.ramGB) + "GB، حافظه: " + mShow(s.storage.percent) + "٪، زیات: " + (await helpTop());
if (k === "storage") return "حافظه: " + mShow(s.storage.percent) + "٪ ډکه";
if (k === "battery") return "بیټرۍ: " + mShow(s.battery.level) + "، چارجېږي: " + mShow(s.battery.charging) + "، زیات: " + (await helpTop());
if (k === "latency") return "ځنډ: " + mShow(s.network.latencyMs) + "ms، ډول: " + mShow(s.network.effectiveType);
if (k === "online") return "انټرنیټ: " + mShow(s.network.online);
if (k === "charge") return "چارجېږي: " + mShow(s.battery.charging) + "، بیټرۍ: " + mShow(s.battery.level);
if (k === "radio") { var r = await radioStates(); var w = r.ok ? r.data : {}; var q = v => v === true ? "چالان" : v === false ? "بند" : NR; var off = r.ok && w.wifi === false && w.bluetooth === false && w.airplane === false; return "وای فای: " + q(w.wifi) + "، بلوتوت: " + q(w.bluetooth) + "، الوتکې حالت: " + q(w.airplane) + "، انټرنیټ: " + mShow(s.network.online) + (off ? " — درې واړه بند دي: تنظیمات یا چپ" : ""); }
return "اندازه نه کېږي";
}
async function helpRun(id) {
var f = HELP_FLOWS.filter(x => x[0] === id)[0];
if (!f) return { status: "NOT_SUPPORTED", verification: "ناپیژندل شوې ستونزه" };
var ev = await helpMeasure(f);
var out = "تشخیص: " + f[1] + " — " + ev + "\nحل: " + helpSteps(f[4]);
if (f[6]) out += "\n" + HELP_NOTES[f[6]];
out += "\nتایید: " + HELP_VERIFY[f[5]];
return { status: "SUCCESS", verification: out };
}
async function helpHealth() {
var s = await mobileMeasureAll();
var rep = "روغتیا: بیټرۍ " + mShow(s.battery.level) + "، حافظه " + mShow(s.storage.percent) + "٪، RAM " + mShow(s.device.ramGB) + "GB، ځنډ " + mShow(s.network.latencyMs) + "ms، زیات اپ: " + (await helpTop());
var bad = [];
if (typeof s.storage.percent === "number" && s.storage.percent >= 90) bad.push("حافظه ډکه ده — ځای خالي کړه");
if (typeof s.battery.level === "number" && s.battery.level <= 0.2 && s.battery.charging !== true) bad.push("بیټرۍ کمه ده — چارج کړه");
if (typeof s.network.latencyMs === "number" && s.network.latencyMs > 1000) bad.push("انټرنیټ ورو دی");
if (bad.length) rep += " — پاملرنه: " + bad.join("؛ "); else rep += " — هر څه سم دي";
return { status: "SUCCESS", verification: rep };
}
var mHOut = null;
function mHGo(fn) { mClear(mHOut); mAdd("تشخیصېږي...", mHOut); fn().then(function (r) { mClear(mHOut); mAdd(r.verification, mHOut); }); }
function mHelpSection(panel) {
var b = mEl("div", "");
b.appendChild(mBtn("روغتیا وګوره", function () { mHGo(helpHealth); }));
HELP_FLOWS.forEach(f => { b.appendChild(mBtn(f[1], function () { mHGo(function () { return helpRun(f[0]); }); })); });
panel.appendChild(b);
mHOut = mEl("div", "");
panel.appendChild(mHOut);
}
function helpFind(t) { t = t.split(" مې ").join(" "); for (var i = 0; i < HELP_FLOWS.length; i++) { var ks = HELP_FLOWS[i][2].split("|"); for (var j = 0; j < ks.length; j++) { var p = t.indexOf(ks[j]); if (p !== -1 && (p === 0 || t[p - 1] === " ") && (p + ks[j].length >= t.length || " ؟،.!۔".indexOf(t[p + ks[j].length]) !== -1)) return HELP_FLOWS[i]; } } return null; }
function helpParse(t) { var f = helpFind(t); return f ? { task: "help", id: f[0], label: f[1], summary: "د موبایل ستونزه حل کړه: " + f[1] } : null; }
