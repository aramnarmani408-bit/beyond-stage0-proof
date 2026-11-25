// BEYOND X Visual Studio — the editor panel (local-first, no fetch).
// The preview is a capped render; its pixel check is the conditional
// verification (decision §4.2). Open/export/save: vsuix.js. Router: vsroute.js.
var vsPanelEl = null;
var vsProject = null;
var vsImg = null;
var vsPending = null;
var vsPrevCv = null;
var vsCanvasEl = null;
var vsStatusEl = null;
var vsNlEl = null;
var vsNlPrevEl = null;
var vsTextListEl = null;
var vsProjListEl = null;
function vsEl(tag, text) { var el = document.createElement(tag); if (text) el.textContent = text; return el; }
function vsBtn(text, fn) { var b = vsEl("button", text); b.addEventListener("click", fn); return b; }
function vsSlider(min, max, val, fn) { var s = document.createElement("input"); s.type = "range"; s.min = min; s.max = max; s.value = val; s.addEventListener("input", function () { fn(parseInt(s.value, 10)); }); return s; }
function vsSetOp(k, v) {
    if (!vsProject) return;
    var ops = vsProject.ops;
    for (var i = 0; i < ops.length; i++) if (ops[i].k === k) { ops[i].v = v; vsRender(); return; }
    vsProjectPushOp(vsProject, { k: k, v: v });
    vsRender();
}
function vsRender(proj) {
    var p = proj || vsProject;
    if (!p || !vsImg || !vsCanvasEl) return;
    var r = vsRenderProject(p, vsImg, VS_PREVIEW_MAX, false);
    if (!r) return;
    var ctx = vsCanvasEl.getContext("2d");
    if (!ctx) return;
    vsCanvasEl.width = r.cv.width; vsCanvasEl.height = r.cv.height;
    ctx.drawImage(r.cv, 0, 0);
    if (!proj) {
        if (!vsPrevCv) { vsPrevCv = r.cv; vsStatusEl.textContent = "چمتو یم"; return; }
        var chk = vsPixelCheck(vsPrevCv, r.cv);
        vsPrevCv = r.cv;
        vsStatusEl.textContent = chk.changed ? "بدلون تایید شو (پېکسل کتنه)" : "هېڅ بدلون نه دی شوی";
    }
}
function vsBuildPanel() {
    if (vsPanelEl) return vsPanelEl;
    var p = document.createElement("div");
    p.id = "vsPanel"; p.style.display = "none"; p.style.flex = "1"; p.style.flexDirection = "column"; p.style.gap = "12px";
    p.appendChild(vsBtn("← بیرته", function () { showPanel("images"); }));
    p.appendChild(vsEl("div", "ویژول سټوډیو"));
    vsCanvasEl = document.createElement("canvas");
    vsCanvasEl.style.maxWidth = "100%";
    p.appendChild(vsCanvasEl);
    vsStatusEl = vsEl("div", "چمتو یم");
    p.appendChild(vsStatusEl);
    var sliders = [["روښانتیا", -100, 100, 0, "bright"], ["تضاد", -100, 100, 0, "contrast"], ["رنګ", 0, 200, 100, "saturate"]];
    sliders.forEach(function (s) {
        var row = vsEl("div", s[0] + ": ");
        row.appendChild(vsSlider(s[1], s[2], s[3], function (v) { vsSetOp(s[4], v); }));
        p.appendChild(row);
    });
    var btns = vsEl("div", "");
    [["څرخوه", "rotate", 90], ["برعکس", "flipH", 1], ["تور سپین", "gray", 1], ["مربع", "crop", "square"]].forEach(function (b) {
        btns.appendChild(vsBtn(b[0], function () {
            if (b[1] === "crop") vsProjectPushOp(vsProject, { k: "crop", square: true });
            else vsProjectPushOp(vsProject, { k: b[1], v: b[2] });
            vsRender();
        }));
    });
    btns.appendChild(vsBtn("بیرته", function () { vsProjectUndo(vsProject); vsRenderTextList(); vsRender(); }));
    btns.appendChild(vsBtn("بیا", function () { vsProjectRedo(vsProject); vsRenderTextList(); vsRender(); }));
    btns.appendChild(vsBtn("له سره", function () { vsProjectReset(vsProject); vsRenderTextList(); vsRender(); }));
    p.appendChild(btns);
    var tIn = document.createElement("input");
    tIn.placeholder = "په انځور کې متن ولیکئ...";
    p.appendChild(tIn);
    p.appendChild(vsBtn("متن اضافه کړه", function () { var t = tIn.value.trim(); if (!t || !vsProject) return; vsProjectPushText(vsProject, vsTextNew(t)); tIn.value = ""; vsRenderTextList(); vsRender(); }));
    vsTextListEl = vsEl("div", "");
    p.appendChild(vsTextListEl);
    vsNlEl = document.createElement("input");
    vsNlEl.placeholder = "په پښتو امر وکړئ...";
    p.appendChild(vsNlEl);
    vsNlPrevEl = vsEl("div", "");
    p.appendChild(vsNlPrevEl);
    p.appendChild(vsBtn("پلي کړه", vsNlRun));
    var ex = vsEl("div", "");
    ex.appendChild(vsBtn("خوندي کړه (export)", vsExportNow));
    ex.appendChild(vsBtn("پروژه خوندي کړه", vsSaveProject));
    p.appendChild(ex);
    vsProjListEl = vsEl("div", "");
    p.appendChild(vsProjListEl);
    document.getElementById("main").appendChild(p);
    vsPanelEl = p;
    vsRenderProjectList();
    return p;
}
