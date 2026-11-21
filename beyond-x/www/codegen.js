var codePollTimer = null, codePollCount = 0;
var CODE_POLL_MS = 10000, CODE_MAX_POLLS = 30;
function codeFail(r) { return new Error("Failed: " + (r.reason || "نامعلومه ستونزه")); }
async function xCode(path, token, body) {
  var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
  var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, CHAT_TIMEOUT_MS);
  var resp;
  try {
    resp = await fetch(CODE_BASE + path, { method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: body ? JSON.stringify(body) : undefined, signal: ctrl ? ctrl.signal : undefined });
  } catch (e) {
    clearTimeout(timer);
    throw new Error(e.name === "AbortError" ? "Timeout" : "Network");
  }
  clearTimeout(timer);
  if (resp.status === 429) throw new Error("RateLimit");
  if (resp.status === 401) { sessionToken = null; sessionExpiry = 0; throw new Error("Unauthorized"); }
  if (!resp.ok) throw new Error("Network");
  var data = await resp.json();
  if (!data || (data.status !== "success" && data.status !== "partial" && data.status !== "failed") || !data.response || data.response.identity !== "beyondx") throw new Error("Bad response");
  return data.response;
}
async function codeCall(path, body) {
  var token = await ensureSession();
  try { return await xCode(path, token, body); }
  catch (e) { if (e.message !== "Unauthorized") throw e; return xCode(path, await ensureSession(), body); }
}
async function codeGenerate(task, text, language, target) {
  var r = await codeCall("/code/generate", { task: task, text: text, language: language, target: target });
  if (!r.code && !r.patch && !r.explanation) throw codeFail(r);
  return r;
}
async function codeRun(language, files) {
  var r = await codeCall("/code/run", { language: language, files: files });
  if (!r.job_id) throw codeFail(r);
  codePollCount = 0;
  if (codePollTimer) { clearTimeout(codePollTimer); codePollTimer = null; }
  codePollStatus(r.job_id);
  return r;
}
async function codePollStatus(jobId) {
  try {
    var r = await xCode("/code/status?id=" + encodeURIComponent(jobId), await ensureSession());
    if (r.status === "done") { codeShowOutput(r.stdout, r.stderr, r.exit_code); return; }
    if (r.status === "failed") { codePanelError(codeFail(r)); return; }
    if (++codePollCount >= CODE_MAX_POLLS) { codePanelError(new Error("Failed: چلول ډېر وخت ونیو — بیا هڅه وکړه")); return; }
    codeClear(codeOutEl);
    codeAdd("چلوې...", codeOutEl);
    codePollTimer = setTimeout(function () { codePollStatus(jobId); }, CODE_POLL_MS);
  } catch (e) { codePanelError(e); }
}
async function codeLanguages() {
  return codeCall("/code/languages");
}
async function codePanelTask(kind) {
  var isGen = kind === "generate";
  var input = isGen ? codeGenIn.value.trim() : codeEditor.value.trim();
  if (!input) { codePanelError(new Error(isGen ? "NoText" : "NoCode"), codeOutEl); return; }
  codeClear(codeOutEl);
  codeAdd(isGen ? "جوړېږي..." : "فکر کوم...", codeOutEl);
  setAction("فکر کوم...");
  try {
    var lang = codeLangSel.value;
    var r = kind === "convert" ? await codeGenerate("convert", input, "python", "javascript") : await codeGenerate(kind, input, lang);
    if (r.code) {
      codeEditor.value = r.code;
      codeSetFile(kind === "convert" || lang === "javascript" ? "main.js" : "main.py", r.code);
      codeProject.lang = kind === "convert" ? "javascript" : lang;
      saveCode();
    }
    if (r.patch) { codeApplyPatch(codeProject.active, r.patch); codeEditor.value = r.patch; }
    if (kind === "convert") codeLangSel.value = "javascript";
    codeClear(codeOutEl);
    codeAdd(r.explanation || (r.code ? "کوډ چمتو دی." : "وشو."), codeOutEl);
  } catch (e) { codePanelError(e, codeOutEl); }
  finally { setAction("چمتو یم"); }
}
async function codeRunFromPanel() {
  var src = codeEditor.value.trim();
  if (!src) { codePanelError(new Error("NoCode"), codeOutEl); return; }
  codeClear(codeOutEl);
  codeAdd("چلوې...", codeOutEl);
  setAction("فکر کوم...");
  try { await codeRun(codeLangSel.value, [{ path: codeProject.active, content: codeEditor.value }]); }
  catch (e) { codePanelError(e, codeOutEl); }
  finally { setAction("چمتو یم"); }
}
