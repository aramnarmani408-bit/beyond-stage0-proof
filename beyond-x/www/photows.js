// BEYOND X local profile photo, part 1: logic (parts #15 / #217).
// Device-only: a photo picked from the device is saved as a data URL
// in localStorage — never uploaded, no server, no R2. Large photos are
// downscaled on a canvas to 256 px and JPEG-compressed (quality
// ladder) so the saved data URL stays under 200 KB; a photo that still
// does not fit is refused honestly. UI lives in photows2.js.
// Server-side photo stays OWED: it needs R2, which arman has not
// enabled in his Cloudflare dashboard.
var PHOTO_KEY = "beyondx-photo-v1";
var PHOTO_MAX_PX = 256;
var PHOTO_MAX_BYTES = 204800;
var PHOTO_Q = [0.85, 0.7, 0.55, 0.4];
function photoWsOkType(t) { return typeof t === "string" && t.indexOf("image/") === 0; }
function photoWsOkUrl(s) { return typeof s === "string" && s.indexOf("data:image/") === 0; }
function photoWsTooBig(s) { return typeof s !== "string" || s.length > PHOTO_MAX_BYTES; }
function photoWsScale(w, h) {
  if (typeof w !== "number" || typeof h !== "number" || w <= 0 || h <= 0) return { w: 0, h: 0 };
  var m = w > h ? w : h;
  var k = m > PHOTO_MAX_PX ? PHOTO_MAX_PX / m : 1;
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) };
}
function photoWsGet() {
  var s = "";
  try { s = localStorage.getItem(PHOTO_KEY) || ""; } catch (e) { return ""; }
  return photoWsOkUrl(s) ? s : "";
}
function photoWsHas() { return photoWsGet() !== ""; }
function photoWsSet(s) {
  if (!photoWsOkUrl(s) || photoWsTooBig(s)) return false;
  try { localStorage.setItem(PHOTO_KEY, s); } catch (e) { return false; }
  return true;
}
function photoWsRemove() { try { localStorage.removeItem(PHOTO_KEY); } catch (e) {} return true; }
function photoWsCompress(url, done) {
  if (!photoWsOkUrl(url)) { done({ ok: false, error: "bad" }); return; }
  if (typeof Image === "undefined" || typeof document === "undefined") {
    if (photoWsTooBig(url)) done({ ok: false, error: "tooBig" });
    else done({ ok: true, url: url });
    return;
  }
  var im = new Image();
  im.onload = function () {
    var s = photoWsScale(im.width, im.height);
    var cv = document.createElement("canvas");
    cv.width = s.w; cv.height = s.h;
    var ctx = null;
    try { ctx = cv.getContext("2d"); } catch (e) { ctx = null; }
    if (!ctx) {
      if (photoWsTooBig(url)) done({ ok: false, error: "tooBig" });
      else done({ ok: true, url: url });
      return;
    }
    try { ctx.drawImage(im, 0, 0, s.w, s.h); } catch (e) { done({ ok: false, error: "corrupt" }); return; }
    var i = 0;
    (function next() {
      if (i >= PHOTO_Q.length) { done({ ok: false, error: "tooBig" }); return; }
      var out = "";
      try { out = cv.toDataURL("image/jpeg", PHOTO_Q[i]); } catch (e) { done({ ok: false, error: "corrupt" }); return; }
      if (!photoWsOkUrl(out)) { done({ ok: false, error: "corrupt" }); return; }
      if (!photoWsTooBig(out)) { done({ ok: true, url: out }); return; }
      i++;
      next();
    })();
  };
  im.onerror = function () { done({ ok: false, error: "corrupt" }); };
  im.src = url;
}
function photoWsSave(url, say) {
  var s = (typeof say === "function") ? say : function () {};
  if (!photoWsOkUrl(url)) { s("دا انځور سم نه دی"); return false; }
  photoWsCompress(url, function (res) {
    if (res.ok) {
      if (photoWsSet(res.url)) { photoWsRefresh(); s("عکس خوندي شو — یوازې ستا په وسیله کې دی"); }
      else s("عکس خوندي نه شو — ډېر لوی دی");
    } else if (res.error === "corrupt") { s("دا انځور خراب دی"); }
    else if (res.error === "bad") { s("دا انځور سم نه دی"); }
    else { s("عکس ډېر لوی دی — کوچنی عکس وټاکه"); }
  });
  return true;
}
function photoWsOnFile(file, say) {
  var s = (typeof say === "function") ? say : function () {};
  if (!file) return false;
  if (!photoWsOkType(file.type)) { s("یوازې انځور وټاکه"); return false; }
  if (typeof FileReader === "undefined") { s("دا وسیله عکس نه شي لوستلای"); return false; }
  var r = new FileReader();
  r.onload = function () { photoWsSave(r.result, s); };
  r.onerror = function () { s("عکس و نه لوستل شو"); };
  r.readAsDataURL(file);
  return true;
}
