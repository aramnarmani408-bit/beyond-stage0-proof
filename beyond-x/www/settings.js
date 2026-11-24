// Design Phase 2: Settings v1 (D16) — ONLY working settings. Every row
// changes something real, at once, and persists it. No fake options:
// no Dari (the gateway chat route does not read it), no dead toggles.
var settingsBuilt = false;
var settingsBtns = [];
function markSettings() {
  settingsBtns.forEach(function (b) {
    if (b.el) b.el.style.fontWeight = themePrefs[b.key] === b.value ? "700" : "";
  });
}
function buildSettings() {
  if (settingsBuilt) return;
  var prof = (typeof neonProfile !== "undefined" && neonProfile) || (typeof document !== "undefined" ? document.getElementById("profilePanel") : null);
  if (!prof) return;
  settingsBuilt = true;
  function setRow(label, key, opts) {
    var r = document.createElement("div");
    r.textContent = label;
    opts.forEach(function (o) {
      var b = document.createElement("button");
      b.textContent = o[1];
      b.addEventListener("click", function () { setThemePref(key, o[0]); markSettings(); });
      r.appendChild(b);
      settingsBtns.push({ key: key, value: o[0], el: b });
    });
    prof.appendChild(r);
  }
  setRow("بڼه", "theme", [["light", "روښانه"], ["dark", "تور"]]);
  setRow("اواتار", "avatar", [["auto", "اتوماتیک"], ["2d", "۲D"], ["3d", "۳D"], ["static", "ثابت"], ["off", "بند"]]);
  setRow("فونټ", "font", [["small", "کوچنی"], ["medium", "منځنی"], ["large", "لوی"]]);
  setRow("غږیز ځواب", "voice", [["on", "چالان"], ["off", "بند"]]);
  var hr = document.createElement("div");
  hr.textContent = "تاریخچه";
  var clr = document.createElement("button");
  clr.textContent = "آرشیف شوي ړنګ کړه";
  clr.addEventListener("click", function () {
    var n = 0;
    AppState.chats = AppState.chats.filter(function (c) { if (c.archived) { n++; return false; } return true; });
    saveChat();
    renderChatList();
    showToast(n + " آرشیف شوي خبرې ړنګې شوې");
  });
  hr.appendChild(clr);
  prof.appendChild(hr);
  var ab = document.createElement("div");
  ab.textContent = "BEYOND X — ډیزاین پړاو ۲";
  prof.appendChild(ab);
  markSettings();
}
// The voice setting: when on, each AI answer is spoken aloud.
function voiceAutoSpeak() {
  if (themePrefs.voice !== "on") return;
  if (typeof voiceSpeakLast === "function") voiceSpeakLast();
}
