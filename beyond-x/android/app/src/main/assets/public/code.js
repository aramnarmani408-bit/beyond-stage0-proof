var codePanel = null, codeLangSel = null, codeGenIn = null,
  codeEditor = null, codeOutEl = null, codePreviewEl = null,
  codeHistEl = null;
var CODE_BASE = "https://beyond-build-gateway.aramnarmani408.workers.dev/api/v1/x";
function codeEl(tag, text) {
  var el = document.createElement(tag);
  el.textContent = text;
  return el;
}
function codeBtn(text, fn) {
  var b = codeEl("button", text);
  b.addEventListener("click", fn);
  return b;
}
function codeAdd(text, outEl) {
  if (text) outEl.appendChild(codeEl("div", text));
}
function codeClear(outEl) {
  while (outEl.firstChild) outEl.removeChild(outEl.firstChild);
}
function buildCodePanel() {
  if (codePanel) return codePanel;
  var panel = document.createElement("div");
  panel.id = "codePanel";
  panel.style.display = "none";
  panel.style.flex = "1";
  panel.style.flexDirection = "column";
  panel.style.gap = "12px";
  panel.appendChild(codeBtn("← بیرته", function () { showPanel("chat"); }));
  panel.appendChild(codeEl("div", "پروګرام کول"));
  codeLangSel = document.createElement("select");
  [["python", "Python"], ["javascript", "JavaScript"]].forEach(function (p) {
    var o = codeEl("option", p[1]);
    o.value = p[0];
    codeLangSel.appendChild(o);
  });
  codeLangSel.value = "python";
  panel.appendChild(codeLangSel);
  codeGenIn = document.createElement("input");
  codeGenIn.placeholder = "څه ډول پروګرام غواړې؟";
  codeGenIn.style.cssText = "background:#0A0A1F;color:#F1F5F9;";
  panel.appendChild(codeGenIn);
  codeEditor = document.createElement("textarea");
  codeEditor.placeholder = "کوډ دلته ولیکئ...";
  codeEditor.style.cssText = "background:#0A0A1F;color:#F1F5F9;min-height:120px;";
  panel.appendChild(codeEditor);
  var btns = document.createElement("div");
  btns.appendChild(codeBtn("چلوه", codeRunFromPanel));
  btns.appendChild(codeBtn("جوړ کړه", codeGenerateFromPanel));
  btns.appendChild(codeBtn("وپوهېږه", codeExplainFromPanel));
  btns.appendChild(codeBtn("سم یې کړه", codeFixFromPanel));
  btns.appendChild(codeBtn("بدل یې کړه (Python → JS)", codeConvertFromPanel));
  panel.appendChild(btns);
  codeOutEl = document.createElement("div");
  panel.appendChild(codeOutEl);
  codePreviewEl = document.createElement("div");
  panel.appendChild(codePreviewEl);
  codeHistEl = document.createElement("div");
  panel.appendChild(codeHistEl);
  document.getElementById("main").appendChild(panel);
  codePanel = panel;
  loadCode();
  codeEditor.value = codeGetFile(codeProject.active);
  codeRenderHistory();
  return panel;
}
function showCodePanel(show) {
  if (codePanel) codePanel.style.display = show ? "flex" : "none";
}
function codeShowOutput(stdout, stderr, exitCode) {
  codeClear(codeOutEl);
  codeAdd(stdout, codeOutEl);
  if (stderr) codeAdd("تېروتنه: " + stderr, codeOutEl);
  codeAdd("وتلو کوډ: " + exitCode, codeOutEl);
}
function codeShowPreview(html) {
  codeClear(codePreviewEl);
  var f = document.createElement("iframe");
  f.srcdoc = html;
  f.setAttribute("sandbox", "allow-scripts");
  f.style.width = "100%";
  f.style.height = "400px";
  codePreviewEl.appendChild(f);
}
function codePanelError(e, outEl) {
  var o = outEl || codeOutEl;
  if (!o) return;
  codeClear(o);
  var m = e.message || "";
  var msgs = { RateLimit: "ډېرې غوښتنې وشوې — لږ وروسته بیا هڅه وکړه", NoText: "لومړی متن ولیکئ.", NoCode: "لومړی کوډ ولیکئ." };
  if (m.indexOf("Failed: ") === 0) codeAdd("کار ونه شو — " + m.slice(8), o);
  else codeAdd(msgs[m] || "انټرنیټ نشته یا ځواب ونه رسېد — بیا هڅه وکړه", o);
}
function codeGenerateFromPanel() { return codePanelTask("generate"); }
function codeExplainFromPanel() { return codePanelTask("explain"); }
function codeFixFromPanel() { return codePanelTask("fix"); }
function codeConvertFromPanel() { return codePanelTask("convert"); }
