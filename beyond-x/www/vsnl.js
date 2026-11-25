// BEYOND X Visual Studio — natural-language Pashto commands → CONSTRAINED,
// VALIDATED operations. The parser can ONLY emit whitelisted ops
// (vsOpValidate) and text boxes (vsTextValidate). It NEVER builds or runs
// JavaScript: instructions inside content are data, never orders (JD14).
// A command that cannot be validated is REFUSED with the reason, never
// executed. Parts split on «او»; ONE unknown part refuses the whole
// command — never a half-applied edit. One operation per part.
var VS_NL_OPS = [
    ["روښانه", "bright", 25], ["تیاره", "bright", -25],
    ["مربع", "crop", "square"],
    ["۱۸۰", "rotate", 180], ["۲۷۰", "rotate", 270],
    ["څرخ", "rotate", 90], ["وګرځ", "rotate", 90], ["۹۰", "rotate", 90],
    ["برعکس", "flipH", 1], ["وارو", "flipH", 1],
    ["تور سپین", "gray", 1], ["خړ", "gray", 1],
    ["سپیا", "sepia", 1], ["تیز", "sharp", 50],
    ["توره", "blur", 4], ["بلر", "blur", 4],
    ["کوچنی", "resize", 0.5], ["لوی", "resize", 1.5]
];
var VS_NL_DIRS = [["پورته", 0, -0.05], ["ښکته", 0, 0.05], ["ښی", 0.05, 0], ["کیڼ", -0.05, 0]];
function vsNlNorm(s) {
    return (s || "").replace(/[\n\r\t]+/g, " ").replace(/\s+/g, " ").replace(/[؟?.!،؛:]+/g, " ").trim();
}
function vsNlParts(text) {
    var t = vsNlNorm(text);
    if (!t) return [];
    return t.split(/\s+او\s+/).map(function (p) { return p.trim(); }).filter(function (p) { return p; });
}
function vsNlMag(part) {
    if (part.indexOf("لږ") !== -1) return 0.5;
    if (part.indexOf("ډېر") !== -1 || part.indexOf("ډیر") !== -1) return 2;
    return 1;
}
function vsNlTextOf(part) {
    var m = part.match(/["«]([^"»]+)["»]/);
    if (m) return m[1].trim();
    var i = part.indexOf("ولیکه");
    if (i !== -1) return part.slice(i + 5).trim();
    return "";
}
function vsNlParseOne(part, out) {
    if (part.indexOf("برعکس") !== -1 && part.indexOf("رنګ") !== -1) { out.ops.push({ k: "invert", v: 1 }); return true; }
    if (part.indexOf("پورته ښکته") !== -1) { out.ops.push({ k: "flipV", v: 1 }); return true; }
    if (part.indexOf("شالید") !== -1 && part.indexOf("تور") !== -1) { out.ops.push({ k: "bright", v: -30 }); out.notes.push("شالید جلا نه بدلېږي"); return true; }
    if (part.indexOf("متن") !== -1 && part.indexOf("«") === -1 && part.indexOf('"') === -1) {
        for (var j = 0; j < VS_NL_DIRS.length; j++) {
            if (part.indexOf(VS_NL_DIRS[j][0]) !== -1) { out.moves.push({ dx: VS_NL_DIRS[j][1], dy: VS_NL_DIRS[j][2] }); return true; }
        }
    }
    if (part.indexOf("متن") !== -1 || part.indexOf("ولیکه") !== -1) {
        var t = vsNlTextOf(part);
        if (!t) { out.error = "متن ونه موندل شو"; return false; }
        var b = vsTextNew(t);
        if (part.indexOf("منځ") !== -1) { b.x = 0.5; b.y = 0.5; }
        out.texts.push(b);
        return true;
    }
    for (var i = 0; i < VS_NL_OPS.length; i++) {
        var r = VS_NL_OPS[i];
        if (part.indexOf(r[0]) !== -1) {
            if (r[1] === "crop") out.ops.push({ k: "crop", square: true });
            else if (r[1] === "resize") out.ops.push({ k: "resize", scale: r[2] });
            else if (r[1] === "bright") out.ops.push({ k: "bright", v: Math.round(r[2] * vsNlMag(part)) });
            else out.ops.push({ k: r[1], v: r[2] });
            return true;
        }
    }
    // Actions last: «بیا» is a substring of other words, so a part that
    // names a real operation must win over it (the preview shows the
    // result either way — the user confirms before anything applies).
    if (part.indexOf("بیرته") !== -1 || part.indexOf("واپس") !== -1) { out.actions.push("undo"); return true; }
    if (part.indexOf("بیا") !== -1) { out.actions.push("redo"); return true; }
    if (part.indexOf("له سره") !== -1 || part.indexOf("اصلي") !== -1) { out.actions.push("reset"); return true; }
    return false;
}
function vsNlParse(text) {
    var out = { ok: false, ops: [], texts: [], moves: [], actions: [], notes: [], error: "" };
    var parts = vsNlParts(text);
    if (!parts.length) { out.error = "هېڅ امر مې ونه موند"; return out; }
    for (var i = 0; i < parts.length; i++) {
        if (!vsNlParseOne(parts[i], out)) {
            if (!out.error) out.error = "د «" + parts[i] + "» برخه مې ونه پېژندله";
            out.ops = []; out.texts = []; out.moves = []; out.actions = [];
            return out;
        }
    }
    if (!vsOpsValidate(out.ops) || !vsTextsValidate(out.texts)) { out.error = "امر سم نه دی — تایید نه شو"; out.ops = []; out.texts = []; return out; }
    out.ok = true;
    return out;
}
