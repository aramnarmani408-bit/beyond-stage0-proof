// BEYOND X Visual Studio — Canvas rendering for the op list (vsedit.js).
// The base image is never mutated: every render draws from the original
// into a fresh canvas. The preview is capped (VS_PREVIEW_MAX); full
// resolution only at export (VS_EXPORT_MAX) — the A10 memory rule.
function vsCanvas(w, h) {
    var c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
    return c;
}
function vsApplyOps(img, ops, maxDim) {
    var g = vsGeom(ops, img.width, img.height);
    var sc = Math.min(1, (maxDim || VS_PREVIEW_MAX) / Math.max(g.dw, g.dh));
    var cv = vsCanvas(g.dw * sc, g.dh * sc);
    var ctx = cv.getContext("2d");
    if (!ctx) return null;
    ctx.save();
    ctx.translate(cv.width / 2, cv.height / 2);
    if (g.rot) ctx.rotate(g.rot * Math.PI / 180);
    ctx.scale(g.fh ? -1 : 1, g.fv ? -1 : 1);
    var fs = vsFilterString(ops);
    if (fs) ctx.filter = fs;
    ctx.drawImage(img, g.sx, g.sy, g.sw, g.sh, -cv.width / 2, -cv.height / 2, cv.width, cv.height);
    ctx.restore();
    var temp = 0, sharp = 0;
    (ops || []).forEach(function (o) { if (o.k === "temp") temp = o.v; if (o.k === "sharp") sharp = o.v; });
    if (temp !== 0) {
        ctx.globalCompositeOperation = "overlay";
        ctx.fillStyle = temp > 0 ? "rgba(255,140,0," + (temp / 400) + ")" : "rgba(0,120,255," + (-temp / 400) + ")";
        ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.globalCompositeOperation = "source-over";
    }
    if (sharp > 0) vsSharpen(ctx, cv.width, cv.height, sharp / 100);
    return cv;
}
function vsSharpen(ctx, w, h, amt) {
    var src = ctx.getImageData(0, 0, w, h), d = src.data;
    var out = ctx.createImageData(w, h), o = out.data;
    var k = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var i = (y * w + x) * 4;
        for (var c = 0; c < 3; c++) {
            var s = 0;
            for (var ky = -1; ky <= 1; ky++) for (var kx = -1; kx <= 1; kx++) {
                var xx = Math.min(w - 1, Math.max(0, x + kx)), yy = Math.min(h - 1, Math.max(0, y + ky));
                s += d[(yy * w + xx) * 4 + c] * k[(ky + 1) * 3 + kx + 1];
            }
            o[i + c] = Math.min(255, Math.max(0, d[i + c] + (s - d[i + c]) * amt));
        }
        o[i + 3] = d[i + 3];
    }
    ctx.putImageData(out, 0, 0);
}
// Conditional verification (decision §4.2): for a deterministic local op,
// the pixel data is the proof — no vision call is spent. Samples every
// 16th pixel; changed = mean abs channel diff over 0.5.
function vsPixelCheck(a, b) {
    if (!a || !b || a.width !== b.width || a.height !== b.height) return { changed: false, mean: 0 };
    var ca = a.getContext("2d"), cb = b.getContext("2d");
    if (!ca || !cb) return { changed: false, mean: 0 };
    var da = ca.getImageData(0, 0, a.width, a.height).data;
    var db = cb.getImageData(0, 0, b.width, b.height).data;
    var s = 0, n = 0;
    for (var i = 0; i < da.length; i += 64) { s += (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2])) / 3; n++; }
    var m = n ? s / n : 0;
    return { changed: m > 0.5, mean: Math.round(m * 100) / 100 };
}
