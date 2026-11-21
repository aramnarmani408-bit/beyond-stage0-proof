var M2BP = [["انټرنیټ وګوره","network"],["بیټرۍ وګوره","battery"],
["وایبرېټ کړه","vibrate"],["شریک یې کړه","share"],["زما ځای وښایه","locate"],
["اپلیکېشنونه وښایه","listApps"],["کارونه وښایه","appUsage"],
["سکرین ولوله","readScreen"],["سکرین شاټ واخله","captureScreen"],
["یادونه ولګوه","scheduleTask"],["پورته کړه","swipeUp"],["ښکته کړه","swipeDown"],
["خبرتیاوې وښایه","listNotif"],["ځواب ورکړه","replyFirst"],
["حذف کړه","dismissFirst"],["SMS ولېږه","sms"],["نصب کړه","install"],
["ټپ کړه","tapText"],["خلاص کړه","launchApp"],["لرې کړه","uninstall"]];
function m2bParse(q) {
if (!q) return null;
if (/څنګه|څه دی|څه شی دی|ووایه/.test(q) || /(^| )ولې( |$|؟)/.test(q)) return null;
if (q.indexOf("ځواب") !== -1 && q.indexOf("ځواب ورکړه") === -1) return null;
for (var i = 0; i < M2BP.length; i++) if (q.indexOf(M2BP[i][0]) !== -1) return m2bTask(M2BP[i], q);
return helpParse(q);
}
function m2bTask(t, q) {
var k = t[1], w, n, b;
if (k === "tapText") { var a = q.indexOf("«"), c = q.indexOf("»", a + 1); if (a === -1 || c === -1) return null; w = q.slice(a + 1, c); return { task: k, args: { text: w }, plan: "ټپ: " + w }; }
if (k === "launchApp" || k === "uninstall") { var u = k === "launchApp" ? "خلاص کړه" : "لرې کړه"; w = q.split(u)[0].trim(); return { task: k, args: { pkg: w }, plan: u + ": " + w }; }
if (k === "replyFirst") { if (q.indexOf(":") === -1) return null; w = q.slice(q.indexOf(":") + 1).trim(); return { task: k, args: { text: w }, plan: "لومړۍ خبرتیا ته ځواب: " + w }; }
if (k === "sms") { n = m2bNum ? m2bNum.value.trim() : ""; b = m2bTxt ? m2bTxt.value.trim() : ""; if (!n) return { task: k, missing: "SMS ونه لېږل شو: شمېره نشته", plan: "SMS: شمېره نشته" }; return { task: k, args: { number: n, body: b }, plan: "SMS ولېږه: " + n }; }
if (k === "install") { w = m2bTxt ? m2bTxt.value.trim() : ""; if (!w) return { task: k, missing: "نصب نه شو: پته نشته", plan: "نصب کړه: پته نشته" }; return { task: k, args: { path: w }, plan: "نصب کړه: " + w }; }
if (k === "scheduleTask") return { task: k, plan: "یادونه ولګوه: ۶۰ دقیقې وروسته" };
if (k === "dismissFirst") return { task: k, plan: "لومړۍ خبرتیا حذف کړه" };
return { task: k, plan: t[0] };
}
async function m2bRunChat(t) {
if (t.missing) { addMessage(t.plan, "ai"); addMessage(t.missing, "ai"); return; }
addMessage(t.plan + " — تایید کړه؟", "ai");
var ok = typeof confirm === "undefined" || confirm("اجازه ورکوې؟");
var r = await mobileAct(t.plan, NPR, async function () {
if (!ok) return { status: "DENIED", verification: "declined" };
return m2bRunTask(t);
});
addMessage(r.status[0] === "S" ? r.verification : "ونه شو: " + r.status + " — " + r.verification, "ai");
return r;
}
async function m2bEnv(f, s) {
var r = await f();
if (!r.ok) return { status: r.status, verification: r.error || r.status };
return { status: "SUPPORTED", verification: s(r.data) };
}
async function m2bFirst() {
var l = await listNotifications();
if (!l.ok) return { status: l.status, verification: l.error || l.status };
if (!l.data.notifications.length) return { status: "UNSUPPORTED", verification: "خبرتیا نشته" };
return { key: l.data.notifications[0].key };
}
var HELP_FLOWS = [["netslow", "ورو انټرنیټ", "انټرنیټ ورو|نېټ ورو", "latency", "ave", "m", "s"], ["slow", "ورو", "ورو|کند", "ram", "hkgr", "m", ""], ["storage", "حافظه", "حافظه ډکه|ځای نشته", "storage", "dkm", "m", ""], ["battery", "بیټرۍ", "بیټرۍ|چارج ژر", "battery", "blo", "m", ""], ["hot", "ګرم", "ګرم|ګرمېږي", "none", "h1", "u", "t"], ["nointernet", "انټرنیټ نشته", "انټرنیټ نشته|نېټ نشته", "online", "aiyer", "m", ""], ["crash", "بندېږي", "بندېږي|کریش", "none", "k2h", "u", ""], ["install", "نصب", "نصب نه|انسټال نه|نه نصبېږي", "storage", "gk", "m", ""], ["charge", "چارج", "چارج نه|چارج ورو", "charge", "twp", "m", "h"], ["frozen", "کنګل", "کنګل", "none", "x", "u", ""], ["sound", "غږ", "غږ نشته|اواز نشته|سپیکر", "bt", "zqjr", "u", ""], ["camera", "کامره", "کامره|کیمره", "cam", "7hrp", "u", "h"], ["bluetooth", "بلوتوت", "بلوتوت نه نښلي|بلوتوت نه وصل", "bt", "3", "u", ""], ["notif", "خبرتیاوې", "خبرتیاوې|نوټیفیکیشن", "notif", "4", "u", ""], ["malware", "شکمن", "شکمن|ویروس|مالویر", "apps", "5", "u", "v"], ["lock", "پټنوم", "پټنوم|پټرن", "none", "6f", "u", "l"], ["radio", "وای فای", "وای فای|وایفای|هاټ سپاټ|بلوتوت نه چالانېږي", "radio", "ranscufp", "u", "w"]];
