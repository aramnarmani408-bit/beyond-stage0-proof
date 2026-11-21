// BEYOND X module 3/13: intent — request analysis (capability + mode)
function pashtoDigits(n) {
    const map = { "0": "۰", "1": "۱", "2": "۲", "3": "۳", "4": "۴", "5": "۵", "6": "۶", "7": "۷", "8": "۸", "9": "۹" };
    return String(n).split("").map(function (c) { return map[c] || c; }).join("");
}
function isBuildWord(q) {
    return q.indexOf("جوړ") !== -1 || q.indexOf("سیستم") !== -1
        || q.indexOf("راکړه") !== -1 || q.indexOf("غواړم") !== -1;
}
function isCapabilityQuestion(q) {
    return q.indexOf("څه کولی شې") !== -1 || q.indexOf("ستا وړتیاوې") !== -1
        || q.indexOf("څه شیان کولی شې") !== -1;
}
function isIslamicRequest(q) {
    return q.indexOf("قرآن") !== -1 || q.indexOf("حدیث") !== -1
        || q.indexOf("سورت") !== -1 || q.indexOf("آیت") !== -1
        || q.indexOf("اسلامي") !== -1 || q.indexOf("لمونځ") !== -1
        || q.indexOf("روژه") !== -1 || q.indexOf("زکات") !== -1
        || q.indexOf("فتوا") !== -1;
}
// "حج" is NOT a trigger: it false-positives on "حجره" (room).
// Intent → {capability, mode}. A question (ځواب/څه دی/ووایه) is
// chat, not a build request — EXCEPT an Islamic question, which
// goes to the source-grounded pipeline, not generic chat.
// Planned systems answer honestly; only available ones activate.
function analyzeIntent(q) {
    if (isSchoolRequest(q)) return { capability: "school", mode: "temporary" };
    if (isIslamicRequest(q)) return { capability: "islamic", mode: "temporary" };
    if (q.indexOf("ځواب") !== -1 || q.indexOf("څه شی دی") !== -1 || q.indexOf("څه دی") !== -1 || q.indexOf("ووایه") !== -1) return { capability: "chat", mode: "inline" };
    if (isBuildWord(q)) {
        if (q.indexOf("کتاب") !== -1) return { capability: "books", mode: "temporary" };
        if (q.indexOf("انځور") !== -1 || q.indexOf("عکس") !== -1) return { capability: "images", mode: "temporary" };
        if (q.indexOf("غږ") !== -1 || q.indexOf("اواز") !== -1) return { capability: "voice", mode: "temporary" };
        if (q.indexOf("لوب") !== -1) return { capability: "games", mode: "temporary" };
        if (q.indexOf("کوډ") !== -1 || q.indexOf("پروګرام") !== -1 || q.indexOf("اپلیکیشن") !== -1) return { capability: "programming", mode: "full" };
        if (q.indexOf("موبایل") !== -1 || q.indexOf("تلیفون") !== -1) return { capability: "mobile", mode: "temporary" };
        if (q.indexOf("3D") !== -1 || q.indexOf("درې بعدي") !== -1) return { capability: "neon", mode: "full" };
        if (q.indexOf("ژب") !== -1 || q.indexOf("ترجم") !== -1) return { capability: "polyglot", mode: "temporary" };
    }
    return { capability: "chat", mode: "inline" };
}

