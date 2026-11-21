function isImagesRequest(q) {
    if (q.indexOf("ځواب") !== -1 || q.indexOf("څه شی دی") !== -1 || q.indexOf("څه دی") !== -1 || q.indexOf("ووایه") !== -1) return false;
    return q.indexOf("انځور") !== -1 || q.indexOf("عکس") !== -1;
}
function isVoiceRequest(q) {
    if (q.indexOf("واوره") !== -1 || q.indexOf("ثبت کړه") !== -1) return true;
    if (q.indexOf("ځواب") !== -1 || q.indexOf("څه شی دی") !== -1 || q.indexOf("څه دی") !== -1 || q.indexOf("ووایه") !== -1) return false;
    return q.indexOf("غږ") !== -1 || q.indexOf("اواز") !== -1;
}
function isMobileRequest(q) {
    if (typeof m2bParse === "function" && m2bParse(q)) return true;
    if (q.indexOf("ځواب") !== -1 || q.indexOf("څه شی دی") !== -1 || q.indexOf("څه دی") !== -1 || q.indexOf("ووایه") !== -1) return false;
    var has = ws => ws.some(w => q.indexOf(w) !== -1);
    var prob = has(["ورو", "ډک", "ګرم", "بیټرۍ", "انټرنیټ", "تشخیص", "ستونزه", "کنټرول"]);
    return (has(["موبایل", "تلیفون"]) || has(["بیټرۍ", "حافظه", "انټرنیټ"])) && prob;
}
function isLanguageRequest(q) {
    if (q.indexOf("ځواب") !== -1 || q.indexOf("څه شی دی") !== -1 || q.indexOf("څه دی") !== -1 || q.indexOf("ووایه") !== -1) return false;
    return q.indexOf("ترجمه") !== -1 || q.indexOf("ژباړه") !== -1 || q.indexOf("ګرامر") !== -1
        || q.indexOf("لغت") !== -1 || q.indexOf("تلفظ") !== -1 || q.indexOf("معنا") !== -1
        || q.indexOf("سمه کړه") !== -1 || q.toLowerCase().indexOf("translate") !== -1;
}
function isProgrammingRequest(q) {
    if (q.indexOf("ځواب") !== -1 || q.indexOf("څه شی دی") !== -1 || q.indexOf("څه دی") !== -1 || q.indexOf("ووایه") !== -1) return false;
    return q.indexOf("کوډ") !== -1 || q.indexOf("پروګرام") !== -1 || q.indexOf("اپلیکیشن") !== -1
        || q.toLowerCase().indexOf("code") !== -1;
}
function codePromptFrom(q) {
    var drop = ["کوډ", "پروګرام", "کولو", "اپلیکیشن", "کارځای", "سیستم", "جوړ", "جوړه", "کړه", "راکړه", "غواړم", "یو", "یوه", "د", "مې", "را", "مه", "code", "Code"];
    return q.split(/\s+/).filter(function (w) { return w && drop.indexOf(w) === -1; }).join(" ");
}
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
function languagePromptFrom(q) {
  var drop = ["ترجمه", "ژباړه", "وژباړه", "ګرامر", "لغت", "لغتونه", "تلفظ", "معنا", "سمه", "کړه", "ژبې", "ژبه", "ژبو", "کارځای", "سیستم", "جوړ", "جوړه", "راکړه", "غواړم", "یو", "یوه", "د", "مې", "را", "مه", "translate", "Translate"];
  return q.split(/\s+/).filter(function (w) { return w && drop.indexOf(w) === -1; }).join(" ");
}
