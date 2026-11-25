// BEYOND X Visual Studio — Pashto typography layers. Text boxes are
// LAYERS rendering from fractions (x, y, size relative to image width),
// so a box survives resize + reopen. Layouts live in localStorage, capped.
var VS_LAYOUT_KEY = "beyondx-vs-layouts-v1";
var VS_LAYOUT_MAX = 10;
var VS_TEXT_MAX = 20;
function vsTextNew(text) {
    return { id: "t" + Date.now().toString(36) + Math.floor(Math.random() * 1000), text: (text || "").slice(0, 200), x: 0.5, y: 0.85, size: 0.09, align: "center", color: "#ffffff", bg: "rgba(0,0,0,0.55)", outline: false, shadow: true, rot: 0 };
}
function vsTextValidate(b) {
    if (!b || typeof b.text !== "string" || !b.text.trim() || b.text.length > 200) return false;
    if (typeof b.x !== "number" || b.x < 0 || b.x > 1 || typeof b.y !== "number" || b.y < 0 || b.y > 1) return false;
    if (typeof b.size !== "number" || b.size < 0.02 || b.size > 0.5) return false;
    if (["center", "right", "left"].indexOf(b.align) === -1) return false;
    if (typeof b.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(b.color)) return false;
    if (typeof b.rot !== "number" || b.rot < -180 || b.rot > 180) return false;
    return true;
}
function vsTextsValidate(ts) {
    if (!Array.isArray(ts) || ts.length > VS_TEXT_MAX) return false;
    for (var i = 0; i < ts.length; i++) if (!vsTextValidate(ts[i])) return false;
    return true;
}
function vsTextRender(ctx, b, W, H) {
    var fs = Math.max(10, Math.round(b.size * W));
    ctx.save();
    ctx.translate(b.x * W, b.y * H);
    if (b.rot) ctx.rotate(b.rot * Math.PI / 180);
    ctx.font = "bold " + fs + "px sans-serif";
    ctx.direction = "rtl";
    ctx.textBaseline = "middle";
    var maxW = W * 0.9;
    var lines = imagesTextWrap(ctx, b.text, maxW);
    var lh = fs * 1.5, bh = lines.length * lh;
    var wmax = 0;
    for (var j = 0; j < lines.length; j++) wmax = Math.max(wmax, ctx.measureText(lines[j]).width);
    var bw = wmax + fs, bx = -bw / 2;
    if (b.bg) { ctx.fillStyle = b.bg; ctx.fillRect(bx, -bh / 2 - fs * 0.5, bw, bh + fs); }
    if (b.shadow) { ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = 4; }
    ctx.fillStyle = b.color;
    ctx.textAlign = b.align === "right" ? "right" : b.align === "left" ? "left" : "center";
    for (var i = 0; i < lines.length; i++) {
        var ly = -bh / 2 + lh * i + lh / 2;
        var lx = b.align === "right" ? bw / 2 - fs / 2 : b.align === "left" ? -bw / 2 + fs / 2 : 0;
        if (b.outline) { ctx.strokeStyle = "rgba(0,0,0,0.9)"; ctx.lineWidth = Math.max(1, fs / 12); ctx.strokeText(lines[i], lx, ly); }
        ctx.fillText(lines[i], lx, ly);
    }
    ctx.restore();
}
function vsLayoutStore() {
    try {
        if (typeof localStorage === "undefined") return null;
        var raw = localStorage.getItem(VS_LAYOUT_KEY);
        if (!raw) return {};
        var s = JSON.parse(raw);
        return s && typeof s === "object" ? s : {};
    } catch (e) { return null; }
}
function vsLayoutSave(name, texts) {
    if (!name || !vsTextsValidate(texts)) return false;
    var s = vsLayoutStore();
    if (s === null) return false;
    s[name] = { texts: texts, at: Date.now() };
    var keys = Object.keys(s);
    if (keys.length > VS_LAYOUT_MAX) { keys.sort(function (a, b) { return (s[a].at || 0) - (s[b].at || 0); }); delete s[keys[0]]; }
    try { localStorage.setItem(VS_LAYOUT_KEY, JSON.stringify(s)); return true; } catch (e) { return false; }
}
function vsLayoutLoad(name) {
    var s = vsLayoutStore();
    if (!s || !s[name] || !vsTextsValidate(s[name].texts)) return null;
    return s[name].texts;
}
function vsLayoutList() {
    var s = vsLayoutStore();
    return s ? Object.keys(s) : [];
}
// Text-box editor list (panel UI): move buttons, size slider, delete
// (delete goes through the undo stack).
function vsRenderTextList() {
    if (!vsTextListEl || !vsProject) return;
    while (vsTextListEl.firstChild) vsTextListEl.removeChild(vsTextListEl.firstChild);
    vsProject.texts.forEach(function (b) {
        var row = vsEl("div", b.text + " ");
        [["←", -0.05, 0], ["→", 0.05, 0], ["↑", 0, -0.05], ["↓", 0, 0.05]].forEach(function (m) {
            row.appendChild(vsBtn(m[0], function () { vsProjectMoveText(vsProject, b.id, m[1], m[2]); vsRender(); }));
        });
        row.appendChild(vsSlider(2, 30, Math.round(b.size * 100), function (v) { b.size = v / 100; vsRender(); }));
        row.appendChild(vsBtn("لرې کړه", function () { vsProjectDeleteText(vsProject, b.id); vsRenderTextList(); vsRender(); }));
        vsTextListEl.appendChild(row);
    });
}
