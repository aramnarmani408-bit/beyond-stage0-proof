// BEYOND X Visual Studio — pixel-editing ops (LOCAL-FIRST, no server).
// Ops are small validated objects; the working state is the op list, NOT
// pixel snapshots — bounded memory on the A10. Rendering lives in
// vsrender.js; this file is pure logic (testable without a canvas).
var VS_UNDO_MAX = 20;
var VS_PREVIEW_MAX = 512;
var VS_EXPORT_MAX = 2048;
var VS_OPS = { bright: [-100, 100], contrast: [-100, 100], saturate: [0, 200], gray: [0, 1], sepia: [0, 1], invert: [0, 1], blur: [0, 10], sharp: [0, 100], temp: [-100, 100], rotate: [0, 90, 180, 270], flipH: [0, 1], flipV: [0, 1] };
function vsOpValidate(op) {
    if (!op || typeof op.k !== "string") return false;
    if (op.k === "crop") {
        if (op.square === true) return true;
        return typeof op.x === "number" && typeof op.y === "number" && typeof op.w === "number" && typeof op.h === "number" && op.x >= 0 && op.y >= 0 && op.w > 0 && op.h > 0 && op.x + op.w <= 1 && op.y + op.h <= 1;
    }
    if (op.k === "resize") {
        if (typeof op.scale === "number") return op.scale >= 0.25 && op.scale <= 2;
        return typeof op.w === "number" && typeof op.h === "number" && op.w >= 16 && op.w <= 2048 && op.h >= 16 && op.h <= 2048;
    }
    var r = VS_OPS[op.k];
    if (!r) return false;
    if (op.k === "rotate") return r.indexOf(op.v) !== -1;
    return typeof op.v === "number" && op.v >= r[0] && op.v <= r[1];
}
function vsOpsValidate(ops) {
    if (!Array.isArray(ops)) return false;
    for (var i = 0; i < ops.length; i++) if (!vsOpValidate(ops[i])) return false;
    return true;
}
function vsFilterString(ops) {
    var f = [];
    (ops || []).forEach(function (o) {
        if (o.k === "bright") f.push("brightness(" + (100 + o.v) + "%)");
        else if (o.k === "contrast") f.push("contrast(" + (100 + o.v) + "%)");
        else if (o.k === "saturate") f.push("saturate(" + o.v + "%)");
        else if (o.k === "gray" && o.v) f.push("grayscale(100%)");
        else if (o.k === "sepia" && o.v) f.push("sepia(100%)");
        else if (o.k === "invert" && o.v) f.push("invert(100%)");
        else if (o.k === "blur" && o.v) f.push("blur(" + o.v + "px)");
    });
    return f.join(" ");
}
// Geometry fold: source rect + dest size + rotation + flips, in op order.
// Crop fractions are relative to the CURRENT source rect; a square crop
// centres on the shorter side.
function vsGeom(ops, W, H) {
    var g = { sx: 0, sy: 0, sw: W, sh: H, dw: W, dh: H, rot: 0, fh: false, fv: false };
    (ops || []).forEach(function (o) {
        if (o.k === "crop") {
            var cw, ch, cx, cy;
            if (o.square === true) { var s = Math.min(g.sw, g.sh); cw = s; ch = s; cx = (g.sw - s) / 2; cy = (g.sh - s) / 2; }
            else { cw = g.sw * o.w; ch = g.sh * o.h; cx = g.sw * (o.x || 0); cy = g.sh * (o.y || 0); }
            g.sx += cx; g.sy += cy; g.sw = cw; g.sh = ch;
        } else if (o.k === "resize") {
            if (typeof o.scale === "number") { g.dw = Math.round(g.dw * o.scale); g.dh = Math.round(g.dh * o.scale); }
            else { g.dw = o.w; g.dh = o.h; }
        } else if (o.k === "rotate") { g.rot = (g.rot + o.v) % 360; }
        else if (o.k === "flipH") g.fh = !g.fh;
        else if (o.k === "flipV") g.fv = !g.fv;
    });
    if (g.rot === 90 || g.rot === 270) { var t = g.dw; g.dw = g.dh; g.dh = t; }
    return g;
}
