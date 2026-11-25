// BEYOND X Visual Studio — the four-outcome router. Outcomes, never
// equivalent: local (edited locally — no server, no cap unit), regen
// (a NEW image, never labelled as edited), analyze (vision analysis),
// unavailable (the reason is shown, nothing is executed). The router
// runs BEFORE the old edit loop: a local command never spends a cap
// unit and a question never becomes an edit.
function vsNlOpLabel(o) {
    if (o.k === "bright") return o.v > 0 ? "روښانتیا +" + o.v : "روښانتیا " + o.v;
    if (o.k === "rotate") return o.v + " درجې څرخوه";
    if (o.k === "resize") return o.scale < 1 ? "کوچنی کړه" : "لوی کړه";
    var m = { crop: "مربع کړه", flipH: "برعکس کړه", flipV: "پورته ښکته کړه", gray: "تور سپین کړه", sepia: "سپیا کړه", invert: "رنګ برعکس کړه", sharp: "تیز کړه", blur: "توره کړه" };
    return m[o.k] || o.k;
}
function vsNlSummary(p) {
    var s = [];
    p.ops.forEach(function (o) { s.push(vsNlOpLabel(o)); });
    p.texts.forEach(function (b) { s.push("متن «" + b.text + "» اضافه کړه"); });
    p.moves.forEach(function (m) { s.push("متن " + (m.dy < 0 ? "پورته" : m.dy > 0 ? "ښکته" : m.dx > 0 ? "ښی" : "کیڼ") + " یوسه"); });
    p.actions.forEach(function (a) { s.push(a === "undo" ? "بیرته" : a === "redo" ? "بیا" : "له سره"); });
    return s.join("، ");
}
function vsOutcomeLabel(kind) {
    if (kind === "local") return "په ځای کې سم شو";
    if (kind === "regen") return "نوی انځور جوړ شو";
    if (kind === "analyze") return "کتل شوی";
    return "نشي کېدای";
}
function vsIsQuestion(t) {
    return t.indexOf("؟") !== -1 || t.indexOf("?") !== -1 || t.indexOf("شته") !== -1 || t.indexOf("څه دي") !== -1 || t.indexOf("وښیه") !== -1;
}
function vsIsLocalIntent(t) {
    var keys = ["روښانه", "تیاره", "مربع", "څرخ", "وګرځ", "برعکس", "وارو", "تور سپین", "خړ", "سپیا", "تیز", "توره", "بلر", "کوچنی", "لوی", "شالید", "متن", "ولیکه", "بیرته", "واپس", "له سره", "اصلي"];
    for (var i = 0; i < keys.length; i++) if (t.indexOf(keys[i]) !== -1) return true;
    return false;
}
function vsRoute(change) {
    var t = (change || "").trim();
    if (!t) return { kind: "unavailable", reason: "هېڅ امر نه دی لیکل شوی" };
    var p = vsNlParse(t);
    if (p.ok) return { kind: "local", parsed: p };
    if (vsIsQuestion(t)) return { kind: "analyze" };
    if (vsIsLocalIntent(t)) return { kind: "unavailable", reason: p.error || "دا امر تایید نه شو" };
    return { kind: "regen" };
}
// Handles the local / analyze / unavailable outcomes; returns false for
// regen (the old edit loop runs). Called by the imagesEditRequest wrap.
function vsEditRoute(ch, src) {
    var r = vsRoute(ch);
    if (r.kind === "local") { vsOpenFromImages(); vsPending = r.parsed; if (vsNlEl) vsNlEl.value = ch; vsShowPending(); return true; }
    if (r.kind === "analyze") { imagesAdd("پایلې: " + vsOutcomeLabel("analyze")); imagesAnalyze((src.split(",")[1]) || "", "image/jpeg", ch); return true; }
    if (r.kind === "unavailable") { imagesAdd("پایلې: " + vsOutcomeLabel("unavailable") + " — " + r.reason); return true; }
    return false;
}
