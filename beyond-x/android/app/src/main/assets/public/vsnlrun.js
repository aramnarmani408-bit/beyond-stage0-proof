// BEYOND X Visual Studio — natural-language apply (preview BEFORE
// applying) + panel wiring. The pending preview renders the parsed
// command on a COPY of the project — nothing is committed until the
// user taps «تایید». Wiring uses the established wrap pattern.
function vsPendingProject() {
    if (!vsProject || !vsPending) return vsProject;
    var c = vsProjectCopy(vsProject);
    vsPending.ops.forEach(function (o) { c.ops.push(o); });
    vsPending.texts.forEach(function (b) { c.texts.push(b); });
    vsPending.moves.forEach(function (m) {
        if (c.texts.length) { var b = c.texts[c.texts.length - 1]; b.x = Math.min(1, Math.max(0, b.x + m.dx)); b.y = Math.min(1, Math.max(0, b.y + m.dy)); }
    });
    return c;
}
function vsShowPending() {
    if (!vsPending || !vsNlPrevEl) return;
    while (vsNlPrevEl.firstChild) vsNlPrevEl.removeChild(vsNlPrevEl.firstChild);
    var p = vsPending;
    vsNlPrevEl.appendChild(vsEl("div", "پایلې: " + vsNlSummary(p) + (p.notes.length ? " (" + p.notes.join(", ") + ")" : "")));
    vsNlPrevEl.appendChild(vsBtn("تایید", vsApplyPending));
    vsNlPrevEl.appendChild(vsBtn("لغوه", vsCancelPending));
    vsRender(vsPendingProject());
}
function vsNlRun() {
    var t = vsNlEl ? vsNlEl.value.trim() : "";
    if (!t || !vsProject) { showToast("لومړی انځور خلاص کړه، بیا امر وکړئ"); return; }
    var p = vsNlParse(t);
    if (!p.ok) {
        if (vsNlPrevEl) vsNlPrevEl.textContent = "نشي کېدای: " + p.error;
        return;
    }
    vsPending = p;
    vsShowPending();
}
function vsApplyPending() {
    if (!vsProject || !vsPending) return;
    var p = vsPending;
    p.ops.forEach(function (o) { vsProjectPushOp(vsProject, o); });
    p.texts.forEach(function (b) { vsProjectPushText(vsProject, b); });
    p.moves.forEach(function (m) { if (vsProject.texts.length) vsProjectMoveText(vsProject, vsProject.texts[vsProject.texts.length - 1].id, m.dx, m.dy); });
    p.actions.forEach(function (a) { if (a === "undo") vsProjectUndo(vsProject); else if (a === "redo") vsProjectRedo(vsProject); else vsProjectReset(vsProject); });
    vsPending = null;
    if (vsNlPrevEl) vsNlPrevEl.textContent = "پایلې: " + vsOutcomeLabel("local");
    vsRenderTextList(); vsRender();
}
function vsCancelPending() {
    vsPending = null;
    if (vsNlPrevEl) vsNlPrevEl.textContent = "";
    vsRender();
}
if (typeof showPanel === "function") { var _vsShowPrev = showPanel; showPanel = function (name) { _vsShowPrev(name); if (vsPanelEl) vsPanelEl.style.display = name === "vs" ? "flex" : "none"; }; }
var vsOpenBtnDone = false;
if (typeof buildImagesPanel === "function") { var _vsBuildPrev = buildImagesPanel; buildImagesPanel = function () { var p = _vsBuildPrev(); if (!vsOpenBtnDone && imagesPanelEl) { vsOpenBtnDone = true; imagesPanelEl.appendChild(imagesBtn("ویژول سټوډیو", vsOpenFromImages)); } return p; }; }
if (typeof showGeneratedImage === "function") { var _vsShowGenPrev = showGeneratedImage; showGeneratedImage = function (r) { _vsShowGenPrev(r); if (imagesResultEl) imagesResultEl.appendChild(imagesBtn("په ویژول سټوډیو کې سمول", vsOpenFromImages)); }; }
if (typeof imagesEditRequest === "function") { var _vsEditPrev = imagesEditRequest; imagesEditRequest = async function () {
    var ch = imagesEditEl ? imagesEditEl.value.trim() : "";
    var src = imagesTextCurrent();
    if (ch && src && vsEditRoute(ch, src)) return;
    return _vsEditPrev();
}; }
