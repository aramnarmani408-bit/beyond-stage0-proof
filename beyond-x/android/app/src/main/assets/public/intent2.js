// BEYOND X module 4/31: intent2 — workspace detectors moved out of
// intent.js (its push was full) + the language detector (stage 8).
// An image QUESTION is chat, not the workspace — the
// images trigger runs first, so it excludes questions itself.
function isImagesRequest(q) {
    if (q.indexOf("ځواب") !== -1 || q.indexOf("څه شی دی") !== -1 || q.indexOf("څه دی") !== -1 || q.indexOf("ووایه") !== -1) return false;
    return q.indexOf("انځور") !== -1 || q.indexOf("عکس") !== -1;
}
// Action words first: "ځواب واوره" (hear the answer) is a
// voice request even though it contains "ځواب". A voice
// QUESTION ("غږ څه شی دی؟") is chat, not the workspace.
function isVoiceRequest(q) {
    if (q.indexOf("واوره") !== -1 || q.indexOf("ثبت کړه") !== -1) return true;
    if (q.indexOf("ځواب") !== -1 || q.indexOf("څه شی دی") !== -1 || q.indexOf("څه دی") !== -1 || q.indexOf("ووایه") !== -1) return false;
    return q.indexOf("غږ") !== -1 || q.indexOf("اواز") !== -1;
}
// A games QUESTION is chat, not the workspace — same
// question-word guard as images/voice.
function isGamesRequest(q) {
    if (q.indexOf("ځواب") !== -1 || q.indexOf("څه شی دی") !== -1 || q.indexOf("څه دی") !== -1 || q.indexOf("ووایه") !== -1) return false;
    return q.indexOf("لوبې") !== -1 || q.indexOf("ګېم") !== -1 || q.indexOf("لوبه") !== -1;
}
// A language QUESTION ("ګرامر څه شی دی؟") is chat, not the
// workspace — same question-word guard as images/voice/games.
// The Latin trigger is case-insensitive ("Translate this").
function isLanguageRequest(q) {
    if (q.indexOf("ځواب") !== -1 || q.indexOf("څه شی دی") !== -1 || q.indexOf("څه دی") !== -1 || q.indexOf("ووایه") !== -1) return false;
    return q.indexOf("ترجمه") !== -1 || q.indexOf("ژباړه") !== -1 || q.indexOf("ګرامر") !== -1
        || q.indexOf("لغت") !== -1 || q.indexOf("تلفظ") !== -1 || q.indexOf("معنا") !== -1
        || q.indexOf("سمه کړه") !== -1 || q.toLowerCase().indexOf("translate") !== -1;
}
// A programming QUESTION is chat, not the workspace —
// same question-word guard as images/voice/games.
function isProgrammingRequest(q) {
    if (q.indexOf("ځواب") !== -1 || q.indexOf("څه شی دی") !== -1 || q.indexOf("څه دی") !== -1 || q.indexOf("ووایه") !== -1) return false;
    return q.indexOf("کوډ") !== -1 || q.indexOf("پروګرام") !== -1 || q.indexOf("اپلیکیشن") !== -1
        || q.toLowerCase().indexOf("code") !== -1;
}
// Strip trigger words; the rest prefills the generate input.
function codePromptFrom(q) {
    var drop = ["کوډ", "پروګرام", "کولو", "اپلیکیشن", "کارځای", "سیستم", "جوړ", "جوړه", "کړه", "راکړه", "غواړم", "یو", "یوه", "د", "مې", "را", "مه", "code", "Code"];
    return q.split(/\s+/).filter(function (w) { return w && drop.indexOf(w) === -1; }).join(" ");
}
// Language detection (deterministic, client-side): script by
// Unicode range, then Pashto markers + common-word lists. It
// lives here, not languagelib, so languagelib fits its limit.
var LANG_CODES = ["ps", "fa", "ar", "ur"];
var LANG_WORDS = ["زه دی ده او ته چې د په نه هم دا هغه",
  "من است می‌کنم که را", "أنا هذا الذي في من إلى", "میں ہے کا کی کو"];
function detectLanguage(text) {
  var arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
  var latin = (text.match(/[A-Za-z]/g) || []).length;
  if (arabic === 0 && latin === 0) return "unknown";
  if (arabic >= 3 && latin >= 3) return "mixed";
  if (arabic === 0 || latin >= 3) return "en";
  var sc = [(text.match(/[ځڅډړږښګڼېۍ]/g) || []).length * 2, 0, 0, 0];
  var toks = text.split(/[\s.,!?؟۔،؛:()\[\]"'«»-]+/), k, w;
  for (k = 0; k < 4; k++) {
    var ws = LANG_WORDS[k].split(" ");
    for (w = 0; w < ws.length; w++) if (toks.indexOf(ws[w]) !== -1) sc[k]++;
  }
  var best = "unknown", bs = 0;
  for (k = 0; k < 4; k++) if (sc[k] > bs) { bs = sc[k]; best = LANG_CODES[k]; }
  return best;
}
// Strip trigger words; the rest prefills the translate input
// (here so languagelib fits — same split as gamesPromptFrom).
function languagePromptFrom(q) {
  var drop = ["ترجمه", "ژباړه", "وژباړه", "ګرامر", "لغت", "لغتونه", "تلفظ", "معنا", "سمه", "کړه", "ژبې", "ژبه", "ژبو", "کارځای", "سیستم", "جوړ", "جوړه", "راکړه", "غواړم", "یو", "یوه", "د", "مې", "را", "مه", "translate", "Translate"];
  return q.split(/\s+/).filter(function (w) { return w && drop.indexOf(w) === -1; }).join(" ");
}
