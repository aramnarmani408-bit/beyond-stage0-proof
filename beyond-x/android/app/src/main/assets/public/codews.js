// Stage 12: code workspace.
var codewsPanelEl = null;
var codewsEditorEl = null;
var codewsOutEl = null;
var codewsPreviewEl = null;
var codewsPromptEl = null;
var codewsLang = "python";
var codewsPolls = 0;
var CODEWS_NET = "انټرنیټ نشته یا ځواب ونه رسېد — بیا هڅه وکړه";
function codewsSay(text) {
  if (!codewsOutEl) return;
  wsClear(codewsOutEl);
  codewsOutEl.appendChild(wsEl("div", text));
}
function codewsNet() { codewsSay(CODEWS_NET); }
function codewsRun() {
  var src = codewsEditorEl ? codewsEditorEl.value.trim() : "";
  if (!src) { codewsSay("لومړی کوډ ولیکئ."); return; }
  codewsSay("چلوې...");
  codewsPolls = 0;
  codeCall("/code/run", { language: codewsLang, files: [{ path: "main." + (codewsLang === "javascript" ? "js" : "py"), content: src }] }).then(function (r) {
    if (r.job_id) codewsPoll(r.job_id); else codewsSay("کار ونه شو.");
  }).catch(codewsNet);
}
function codewsPoll(jobId) {
  if (++codewsPolls > 30) { codewsSay("چلول ډېر وخت ونیو — بیا هڅه وکړه"); return; }
  codeCall("/code/status?id=" + encodeURIComponent(jobId)).then(function (r) {
    if (r.status === "done") { codewsSay((r.stdout || "") + (r.stderr ? "\n" + r.stderr : "")); return; }
    if (r.status === "failed") { codewsSay("کار ونه شو."); return; }
    setTimeout(function () { codewsPoll(jobId); }, 10000);
  }).catch(codewsNet);
}
function codewsPreview() {
  if (!codewsPreviewEl || !codewsEditorEl) return;
  var r = codeSafePreview(codewsEditorEl.value, codewsLang);
  wsClear(codewsPreviewEl);
  codewsPreviewEl.appendChild(wsEl("div", "مخکتنه: " + (r.state === "available" ? "شتون لري" : r.state === "limited" ? "محدود" : "نشه")));
  codewsPreviewEl.appendChild(r.el);
}
function codewsProjects() {
  var list = loadUniverse().code || [];
  var box = wsEl("div", "");
  for (var i = 0; i < list.length; i++) {
    (function (p) {
      box.appendChild(wsBtn((p.lang || "") + " — " + (p.code || "").slice(0, 20), function () {
        if (codewsEditorEl) codewsEditorEl.value = p.code || "";
        codewsLang = p.lang || "python";
        codewsPreview();
      }));
    })(list[i]);
  }
  return box;
}
function buildCodeWsPanel() {
  if (codewsPanelEl) return codewsPanelEl;
  var p = wsPanel("codewsPanel");
  p.appendChild(wsEl("div", "کوډ کارځای"));
  var langs = wsEl("div", "");
  ["python", "javascript", "html", "css"].forEach(function (l) {
    langs.appendChild(wsBtn(l, function () { codewsLang = l; codewsPreview(); }));
  });
  p.appendChild(langs);
  codewsPromptEl = document.createElement("input");
  codewsPromptEl.placeholder = "څه کوډ جوړ کړم؟";
  p.appendChild(codewsPromptEl);
  p.appendChild(wsBtn("جوړ کړه", function () {
    var q = codewsPromptEl.value.trim();
    if (!q) return;
    codewsSay("جوړېږي...");
    codeGenerate("generate", q, codewsLang).then(function (r) {
      if (r.code && codewsEditorEl) codewsEditorEl.value = r.code;
      codewsSay(r.explanation || "کوډ چمتو دی.");
      codewsPreview();
    }).catch(codewsNet);
  }));
  codewsEditorEl = document.createElement("textarea");
  codewsEditorEl.style.width = "100%";
  codewsEditorEl.style.height = "160px";
  p.appendChild(codewsEditorEl);
  var tools = wsEl("div", "");
  tools.appendChild(wsBtn("تحلیل", function () {
    var a = codeAnalyze(codewsEditorEl.value);
    codewsSay("کرښې: " + a.lines + " — فنکشنونه: " + a.functions + " — قوسونه: " + (a.bracketsOk ? "سم" : "ناسم"));
  }));
  tools.appendChild(wsBtn("وچلوه", codewsRun));
  tools.appendChild(wsBtn("مخکتنه", codewsPreview));
  tools.appendChild(wsBtn("خوندي کړه", function () {
    universeSave("code", { lang: codewsLang, code: codewsEditorEl.value.slice(0, 2000) });
    showToast("کوډ خوندي شو");
  }));
  p.appendChild(tools);
  codewsOutEl = wsEl("div", "");
  p.appendChild(codewsOutEl);
  codewsPreviewEl = wsEl("div", "");
  p.appendChild(codewsPreviewEl);
  p.appendChild(wsEl("div", "پروژې:"));
  p.appendChild(codewsProjects());
  p.appendChild(promptExamples("codews"));
  codewsPanelEl = p;
  return p;
}
function fillCodeWsPanel(content) {
  var blocks = (content && content.blocks) || [];
  if (blocks.length > 0 && codewsEditorEl) {
    codewsEditorEl.value = blocks[0].code;
    if (CODEWS_LANGS.indexOf(blocks[0].lang) !== -1) codewsLang = blocks[0].lang;
    codewsPreview();
  }
}
var CODEWS_LANGS = ["python", "javascript", "html", "css"];
function showCodeWsPanel(show) { wsShow(codewsPanelEl, show); }
