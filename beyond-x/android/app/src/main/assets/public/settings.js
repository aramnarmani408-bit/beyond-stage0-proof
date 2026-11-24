// Design Phase 2: Settings v1 (D16) — ONLY working settings. Every row
// changes something real, at once, and persists it. No fake options:
// no Dari (the gateway chat route does not read it), no dead toggles.
// Settings build (parts list §4): the SET store + the sections live
// in settings2.js; this file holds the v1 rows + the row builders.
var settingsBuilt = false;
var settingsBtns = [];
function markSettings() {
  settingsBtns.forEach(function (b) {
    if (!b.el) return;
    var cur = b.store === "set" ? setPrefs[b.key] : themePrefs[b.key];
    b.el.style.fontWeight = cur === b.value ? "700" : "";
  });
}
// Row builders (shared with settings2.js): setOptRow is an option row
// (theme prefs, or SET prefs when isSet); setText is a fact row;
// setBtnRow is one action button. Every row changes something real.
function setOptRow(prof, label, key, opts, isSet) {
  var r = document.createElement("div");
  r.textContent = label;
  opts.forEach(function (o) {
    var b = document.createElement("button");
    b.textContent = o[1];
    b.addEventListener("click", function () {
      if (isSet) setSetPref(key, o[0]); else setThemePref(key, o[0]);
      markSettings();
    });
    r.appendChild(b);
    settingsBtns.push({ store: isSet ? "set" : "theme", key: key, value: o[0], el: b });
  });
  prof.appendChild(r);
  return r;
}
function setText(prof, label, text) {
  var r = document.createElement("div");
  r.textContent = label + ": " + text;
  prof.appendChild(r);
  return r;
}
function setBtnRow(prof, label, btnText, fn) {
  var r = document.createElement("div");
  r.textContent = label;
  var b = document.createElement("button");
  b.textContent = btnText;
  b.addEventListener("click", fn);
  r.appendChild(b);
  prof.appendChild(r);
  return r;
}
// A two-tap confirm button (first tap arms «ډاډه یې؟», second runs).
function setConfirmRow(prof, label, btnText, fn) {
  var armed = false;
  var b = null;
  var r = document.createElement("div");
  r.textContent = label;
  b = document.createElement("button");
  b.textContent = btnText;
  b.addEventListener("click", function () {
    if (!armed) { armed = true; b.textContent = "ډاډه یې؟"; return; }
    armed = false; b.textContent = btnText; fn();
  });
  r.appendChild(b);
  prof.appendChild(r);
  return r;
}
function buildSettings() {
  if (settingsBuilt) return;
  var prof = (typeof neonProfile !== "undefined" && neonProfile) || (typeof document !== "undefined" ? document.getElementById("profilePanel") : null);
  if (!prof) return;
  settingsBuilt = true;
  setOptRow(prof, "بڼه", "theme", [["light", "روښانه"], ["dark", "تور"]]);
  setOptRow(prof, "رنګ", "accent", [["blue", "آبي"], ["purple", "بنفش"], ["green", "شین"]]);
  setOptRow(prof, "اواتار", "avatar", [["auto", "اتوماتیک"], ["2d", "۲D"], ["3d", "۳D"], ["static", "ثابت"], ["off", "بند"]]);
  setOptRow(prof, "فونټ", "font", [["small", "کوچنی"], ["medium", "منځنی"], ["large", "لوی"]]);
  setOptRow(prof, "غږیز ځواب", "voice", [["on", "چالان"], ["off", "بند"]]);
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
  ab.textContent = "BEYOND X — تنظیمات";
  prof.appendChild(ab);
  if (typeof buildSettings2 === "function") buildSettings2(prof);
  markSettings();
}
// The voice setting: when on, each AI answer is spoken aloud.
function voiceAutoSpeak() {
  if (themePrefs.voice !== "on") return;
  if (typeof voiceSpeakLast === "function") voiceSpeakLast();
}
