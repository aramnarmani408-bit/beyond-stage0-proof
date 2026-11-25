// BEYOND X Visual Studio — open / export / save actions + the saved
// projects + layouts list. A project reopens with its ops + texts
// intact; a missing original (srcMissing) is refused honestly instead
// of opening a broken project. Layouts reopen as text boxes added to
// the current project (each through the undo stack).
function vsOpen(src, generated, watermarked) {
    vsBuildPanel();
    vsProject = vsProjectNew(src, generated, watermarked, "");
    vsPending = null;
    vsPrevCv = null;
    var im = new Image();
    im.onload = function () { vsImg = im; vsRenderTextList(); vsRenderProjectList(); vsRender(); showPanel("vs"); };
    im.onerror = function () { showToast("انځور خلاص نه شو"); };
    im.src = src;
}
function vsOpenFromImages() {
    var src = imagesTextCurrent();
    if (!src) { showToast("لومړی انځور جوړ کړه، بیا سمول یې پیل کړه"); return; }
    var gen = !!imagesLastGen;
    vsOpen(src, gen, gen);
}
function vsOpenProject(name) {
    var pr = vsProjectLoad(name);
    if (!pr) { showToast("پروژه ونه موندل شوه"); return; }
    if (pr.srcMissing || !pr.src) { showToast("اصلي انځور نشته — له تاریخچې یې خلاص کړه"); return; }
    vsBuildPanel();
    vsProject = pr;
    vsPending = null;
    vsPrevCv = null;
    var im = new Image();
    im.onload = function () { vsImg = im; vsRenderTextList(); vsRender(); showPanel("vs"); };
    im.onerror = function () { showToast("انځور خلاص نه شو"); };
    im.src = pr.src;
}
function vsLoadLayout(name) {
    var ts = vsLayoutLoad(name);
    if (!ts || !vsProject) { showToast("بڼه ونه موندل شوه"); return; }
    ts.forEach(function (b) { vsProjectPushText(vsProject, vsTextNew(b.text)); });
    vsRenderTextList(); vsRender();
}
function vsRenderProjectList() {
    if (!vsProjListEl) return;
    while (vsProjListEl.firstChild) vsProjListEl.removeChild(vsProjListEl.firstChild);
    vsProjectList().forEach(function (name) {
        vsProjListEl.appendChild(vsBtn(name, function () { vsOpenProject(name); }));
    });
    vsLayoutList().forEach(function (name) {
        vsProjListEl.appendChild(vsBtn("بڼه: " + name, function () { vsLoadLayout(name); }));
    });
}
function vsExportNow() {
    if (!vsProject || !vsImg) return;
    vsExport(vsProject, vsImg, function (r) {
        if (!r) { showToast("خوندي نه شو"); return; }
        var a = vsEl("a", "ښکته کړه (" + r.w + "×" + r.h + (r.markedNow ? "، نښه یو ځل ولګېده" : "") + ")");
        a.href = r.dataUrl; a.download = "beyondx-vs." + (vsProject.fmt === "png" ? "png" : "jpg");
        vsPanelEl.appendChild(a);
        var rec = imagesLastGen || {};
        rec.image = (r.dataUrl.split(",")[1]) || rec.image;
        rec.mimeType = r.mimeType;
        rec.prompt = (rec.prompt || "") + " (ویژول سټوډیو)";
        imagesAddHistory(rec);
        showImagesHistory();
        if (vsStatusEl) vsStatusEl.textContent = "خوندي شو: " + r.w + "×" + r.h + (r.markedNow ? " — نښه یو ځل ولګېده" : " — بې نښې");
    });
}
function vsSaveProject() {
    if (!vsProject || !vsImg) return;
    var name = (vsProject.name || "").trim() || ("پروژه " + new Date().toISOString().slice(0, 10));
    vsProject.name = name;
    var thumb = vsPrevCv ? vsPrevCv.toDataURL("image/jpeg", 0.7) : "";
    if (vsProjectSave(vsProject, thumb)) { showToast("پروژه خوندي شوه: " + name); vsRenderProjectList(); }
    else showToast("پروژه خوندي نه شوه");
}
function vsSaveLayout() {
    if (!vsProject) return;
    var name = (vsProject.name || "").trim() || ("بڼه " + new Date().toISOString().slice(0, 10));
    if (vsLayoutSave(name, vsProject.texts)) { showToast("بڼه خوندي شوه: " + name); vsRenderProjectList(); }
    else showToast("بڼه خوندي نه شوه");
}
