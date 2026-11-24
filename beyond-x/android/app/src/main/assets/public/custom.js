// Design Phase 2: chat-requested customization (REQ-CUSTOM-001).
// The user asks in chat; X changes the design at once + persists it.
// Only real changes — every command maps to a working setting. A
// question about a color (no action verb) is NOT a command.
function customCommand(q) {
  if (!q) return false;
  var has = function (s) { return q.indexOf(s) !== -1; };
  // Short targets match whole words only: "تم" as a substring fires
  // inside سیستم/تنظیمات, and "لیک" inside ولیکه (both real requests).
  var toks = q.split(/[\s،؟!.]+/);
  var hasTok = function (s) { return toks.indexOf(s) !== -1; };
  var action = has("بدل") || has("کړه") || has("بېرته") || has("لوی") || has("کوچنی");
  if (!action) return false;
  var done = null;
  if (has("بګراونډ") || hasTok("تم") || has("رنګ")) {
    if (has("بېرته") || has("عادي")) { setThemePref("theme", "light"); setThemePref("accent", "blue"); done = "بګراونډ بېرته عادي شو ✓"; }
    else if (has("تور")) { setThemePref("theme", "dark"); done = "بګراونډ تور شو ✓"; }
    else if (has("روښانه")) { setThemePref("theme", "light"); done = "بګراونډ روښانه شو ✓"; }
    else if (has("شین")) { setThemePref("accent", "green"); done = "رنګ شین شو ✓"; }
    else if (has("بنفش")) { setThemePref("accent", "purple"); done = "رنګ بنفش شو ✓"; }
    else if (has("آبي")) { setThemePref("accent", "blue"); done = "رنګ آبي شو ✓"; }
    else { setThemePref("theme", themePrefs.theme === "dark" ? "light" : "dark"); done = "بګراونډ بدل شو ✓"; }
  } else if (has("فونټ") || hasTok("لیک")) {
    if (has("لوی")) { setThemePref("font", "large"); done = "فونټ لوی شو ✓"; }
    else if (has("کوچنی")) { setThemePref("font", "small"); done = "فونټ کوچنی شو ✓"; }
    else if (has("بېرته") || has("عادي")) { setThemePref("font", "medium"); done = "فونټ بېرته عادي شو ✓"; }
    else { setThemePref("font", themePrefs.font === "large" ? "medium" : "large"); done = "فونټ بدل شو ✓"; }
  } else if (has("غږ") && (has("چالان") || has("بند"))) {
    if (has("بند")) { setThemePref("voice", "off"); done = "غږیز ځواب بند شو ✓"; }
    else { setThemePref("voice", "on"); done = "غږیز ځواب چالان شو ✓"; }
  }
  if (!done) return false;
  addMessage(done, "ai");
  return true;
}
function customReset() {
  setThemePref("theme", "light");
  setThemePref("font", "medium");
  setThemePref("accent", "blue");
  setThemePref("avatar", "auto");
  setThemePref("voice", "off");
}
