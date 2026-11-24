var mPanel = null, mOver = null, mDiag = null, mDgn = null, mAsk = null,
  mActs = null, mPerm = null, mAudit = null, mLastDiag = "";
var MLBL = { none: "نشه", low: "ټیټ", high: "لوړ", ok: "سم دی", warning: "خبرداری", critical: "خطرناک" };
function mEl(tag, text) { var el = document.createElement(tag); el.textContent = text; return el; }
function mBtn(text, fn) { var b = mEl("button", text); b.addEventListener("click", fn); return b; }
function mAdd(text, outEl) { if (text) outEl.appendChild(mEl("div", text)); }
function mClear(outEl) { while (outEl.firstChild) outEl.removeChild(outEl.firstChild); }
function mShow(v) { return v === NR ? "نه دی راپور شوی" : v; }
function mOverview() {
  mClear(mOver);
  var d = mobileDevice();
  var reg = mobileRegistry();
  var sup = reg.filter(c => c.status === "SUPPORTED").length;
  var need = reg.filter(c => c.status === "NEEDS_APP").length;
  mAdd("RAM (اټکل): " + mShow(d.ramGB) + " GB", mOver);
  mAdd("CPU (اټکل): " + mShow(d.cpuCores) + " cores", mOver);
  mAdd("وړتیاوې: " + sup + " ملاتړ شوي، " + need + " اپ ته اړتیا لري", mOver);
  mAdd("موبایل (له براوزر څخه): " + mShow(d.userAgent), mOver);
}
async function mDiagnose() {
  mClear(mDiag);
  mAdd("تشخیصېږي...", mDiag);
  var s = await mobileMeasureAll();
  mClear(mDiag);
  mAdd("بیټرۍ: " + mShow(s.battery.level) + " چارجېږي: " + mShow(s.battery.charging), mDiag);
  mAdd("حافظه: " + mShow(s.storage.usage) + "/" + mShow(s.storage.quota) + " (" + mShow(s.storage.percent) + "٪)", mDiag);
  mAdd("انټرنیټ: " + mShow(s.network.online) + " ځنډ: " + mShow(s.network.latencyMs) + "ms", mDiag);
  mLastDiag = mobileStateText(s);
  var dg = mobileDiagnose(s);
  mClear(mDgn);
  mAdd("باور: " + MLBL[dg.confidence] + " شدت: " + MLBL[dg.severity], mDgn);
  dg.findings.forEach(f => mAdd(f, mDgn));
  dg.actions.forEach(a => mAdd("وړاندیز: " + a, mDgn));
  if (!dg.findings.length) mAdd("کومه ستونزه ونه موندل شوه.", mDgn);
}
async function mDo(name, fn) {
  var r = await fn();
  showToast(name + ": " + r.status + " — " + r.verification);
  mRenderAudit();
}
async function mPerms() {
  mClear(mPerm);
  var names = ["geolocation", "notifications", "camera", "microphone"];
  for (var i = 0; i < names.length; i++) mAdd(names[i] + ": " + (await mobilePerm(names[i])), mPerm);
}
function mRenderAudit() {
  mClear(mAudit);
  var log = mobileAuditLog();
  if (!log.length) { mAdd("لا دې کوم کار نه دی کړی.", mAudit); return; }
  log.forEach(e => mAdd(e.time + " " + e.action + ": " + e.result, mAudit));
}
function buildMobilePanel() {
  if (mPanel) return mPanel;
  var panel = document.createElement("div");
  panel.id = "mobilePanel";
  panel.style.display = "none";
  panel.style.flex = "1";
  panel.style.flexDirection = "column";
  panel.style.gap = "12px";
  function div() { var d = document.createElement("div"); panel.appendChild(d); return d; }
  panel.appendChild(mBtn("← بیرته", () => showPanel("chat")));
  panel.appendChild(mEl("div", "موبایل کنټرول"));
  mOver = div();
  mDiag = div();
  panel.appendChild(mBtn("تشخیص کړه", mDiagnose));
  mDgn = div();
  mAsk = document.createElement("input");
  mAsk.placeholder = "د موبایل په اړه وپوښته...";
  mAsk.style.cssText = "background:var(--sf);color:var(--tx);";
  panel.appendChild(mAsk);
  panel.appendChild(mBtn("وپوښته", () => { var q = mAsk.value.trim(); if (q) xMobileAsk(q); }));
  mActs = div();
  mPerm = div();
  mAudit = div();
  if (typeof mBridgeSection === "function") mBridgeSection(panel);
  if (typeof m2bSection === "function") m2bSection(panel);
  if (typeof mHelpSection === "function") mHelpSection(panel);
  document.getElementById("main").appendChild(panel);
  mPanel = panel;
  var acts = [["وایبرېټ", () => mobileVibrate(200)],
    ["کاپي کړه", () => mobileCopy(mLastDiag || "BEYOND X")],
    ["شریکه کړه", () => mobileShare("BEYOND X", mLastDiag || "BEYOND X")],
    ["ډایلر", () => mobileOpenLink("deep-links", "tel:")],
    ["ترتیبات", () => mobileOpenLink("settings-intents", "intent:#Intent;action=android.settings.SETTINGS;end")],
    ["ویښ وساته", () => mobileWakeLock()],
    ["خبرتیا", () => mobileNotify("BEYOND X", "ازمایښتي خبرتیا")],
    ["ځای", () => mobileLocate()]];
  acts.forEach(a => mActs.appendChild(mBtn(a[0], () => mDo(a[0], a[1]))));
  mOverview();
  mPerms();
  mRenderAudit();
  return panel;
}
function showMobilePanel(show) {
  if (mPanel) mPanel.style.display = show ? "flex" : "none";
}
