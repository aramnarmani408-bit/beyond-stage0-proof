async function m2bRunTask(t) {
var k = t.task, a = t.args || {};
var d = document.documentElement || {}, W = d.clientWidth || 540, H = d.clientHeight || 960;
if (k === "network") { var s = await mobileNetwork(); return typeof s.latencyMs === "number" ? { status: "SUCCESS", verification: "انټرنیټ: " + s.online + "، ځنډ: " + s.latencyMs + "ms" } : { status: "UNSUPPORTED", verification: "ځنډ نه دی راپور شوی" }; }
if (k === "battery") { var b = await mobileBattery(); return typeof b.level === "number" ? { status: "SUCCESS", verification: "بیټرۍ: " + b.level + "، چارجېږي: " + b.charging } : { status: "UNSUPPORTED", verification: "بیټرۍ نه ده راپور شوې" }; }
if (k === "vibrate") { var r = await mobileVibrate(200); if (r.status === "SUCCESS") r.verification = "وایبرېټ شو"; return r; }
if (k === "share") { var r = await mobileShare("BEYOND X", mLastDiag || "BEYOND X"); if (r.status === "SUCCESS") r.verification = "شریک شو"; return r; }
if (k === "locate") { var n = mobileNav(); if (!(n && n.geolocation)) return mobileNoApi("geolocation"); return new Promise(ok => { n.geolocation.getCurrentPosition(pos => ok({ status: "SUCCESS", verification: "ځای: " + pos.coords.latitude + "," + pos.coords.longitude }), e => ok({ status: e.code === 1 ? PR : "FAILED", verification: e.message || "failed" })); }); }
if (k === "listApps") return m2bEnv(listApps, d => "اپونه: " + d.apps.length + " — " + d.apps.slice(0, 10).map(a => a.label).join("، "));
if (k === "appUsage") return m2bEnv(() => appUsage(7), d => d.apps.sort((x, y) => y.minutes - x.minutes).slice(0, 5).map(a => a.label + ": " + a.minutes).join("، "));
if (k === "launchApp") return m2bEnv(() => launchApp(a.pkg), () => "خلاص شو: " + a.pkg);
if (k === "readScreen") return m2bEnv(readScreen, d => d.text ? d.text.slice(0, 500) : "سکرین خالي دی");
if (k === "captureScreen") return m2bEnv(captureScreen, () => "سکرین شاټ واخیستل شو");
if (k === "scheduleTask") return m2bEnv(() => scheduleTask({ title: "BEYOND X یادونه", text: "یادونه", delayMinutes: 60 }), d => "یادونه جوړه شوه: " + d.id);
if (k === "tapText") return m2bVerify(() => tapText(a.text), "tap");
if (k === "swipeUp") return m2bVerify(() => swipeScreen(W / 2, H * 0.75, W / 2, H * 0.25, 300), "tap");
if (k === "swipeDown") return m2bVerify(() => swipeScreen(W / 2, H * 0.25, W / 2, H * 0.75, 300), "tap");
if (k === "listNotif") return m2bEnv(listNotifications, d => d.notifications.length ? "خبرتیاوې: " + d.notifications.length + " — " + d.notifications.map(n => n.title).join("، ") : "خبرتیا نشته");
if (k === "replyFirst") { var f = await m2bFirst(); return f.key ? m2bVerify(() => replyNotification(f.key, a.text), f.key) : f; }
if (k === "dismissFirst") { var f = await m2bFirst(); return f.key ? m2bVerify(() => dismissNotification(f.key), "x" + f.key) : f; }
if (k === "sms") return m2bVerify(() => sendSms(a.number, a.body));
if (k === "install") return m2bVerify(() => installApk(a.path));
if (k === "uninstall") return m2bVerify(() => uninstallApp(a.pkg));
if (k === "help") return helpRun(t.id);
return { status: "UNSUPPORTED", verification: "unknown task" };
}
var HELP_STEPS = { r: "بیا چالان کړه", a: "الوتکې حالت بدل کړه", n: "شبکې تنظیمات بیا جوړ کړه", s: "خوندي حالت کې وګوره", c: "کیچ برخه پاکه کړه", u: "سافټویر تازه کړه", f: "فابریکې ته وګرځوه (بېک اپ واخله)", p: "ترمیم ځای ته بوځه", h: "درنې اپونه بند کړه", k: "کیچ پاک کړه", g: "ځای خالي کړه", d: "نقل فایلونه ړنګ کړه", m: "عکسونه کلاوډ ته ولېږدوه", b: "شالید کار بند کړه", l: "رڼا ټیټه کړه", o: "راډیوګانې بندې کړه", v: "روټر ته نږدې شه", e: "بېلانس وګوره", i: "سیم وګوره", y: "APN وګوره", t: "بل کیبل وازمویه", w: "پورټ پاک کړه", x: "پاور + غږ ټیټ ۱۰ ثانیې ونیسه", z: "غږ لوړ کړه", q: "مزاحمت مه کوه بند کړه", j: "بلوتوت ایرفون وګوره", "1": "یخ یې کړه: لوبه مه کوه", "2": "اپ بیا نصب کړه", "3": "جوړه لرې کړه بیا یې جوړه کړه", "4": "خبرتیاوې بندې کړه", "5": "اپ لرې کړه (Android ډیالوګ)", "6": "Find My Device له لارې بیرته واخله", "7": "کامرې اجازه ورکړه" };
var HELP_NOTES = { t: "تودوخه نه اندازه کېږي — تشخیص له نښو څخه دی", s: "سیګنال له وېب څخه نه اندازه کېږي", h: "زیاتره هارډویر دی — که سم نه شو، ترمیم ځای ته بوځه", l: "Android امنیت نه ماتېږي — پټنوم نشي تېرېدلی", v: "BEYOND X انټي ویروس نه دی", w: "خبرداری: پاسورډونه به ورک شي" };
var HELP_VERIFY = { m: "بیا اندازه کړه — شمېره باید ښه شوې وي", u: "وروسته بیا وګوره" };
function helpSteps(s) { return s.split("").map((c, i) => (i + 1) + ". " + HELP_STEPS[c]).join(" — "); }
