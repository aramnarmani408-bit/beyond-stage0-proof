var CODE_KEY = "beyondx-code-v1";
var codeProject = { files: [{ name: "main.py", content: "" }], lang: "python", active: "main.py" };
var codeHistory = [];
function saveCode() {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(CODE_KEY, JSON.stringify({ project: codeProject, history: codeHistory }));
  } catch (e) { /* storage unavailable — the project still works */ }
}
function loadCode() {
  try {
    if (typeof localStorage === "undefined") return false;
    var raw = localStorage.getItem(CODE_KEY);
    if (!raw) return false;
    var s = JSON.parse(raw);
    if (!s || !s.project || !Array.isArray(s.project.files)) return false;
    codeProject = s.project;
    codeHistory = Array.isArray(s.history) ? s.history : [];
    return true;
  } catch (e) { return false; }
}
function codeSetFile(name, content) {
  var found = false;
  codeProject.files.forEach(function (f) { if (f.name === name) { f.content = content; found = true; } });
  if (!found) codeProject.files.push({ name: name, content: content });
  codeProject.active = name;
  saveCode();
}
function codeGetFile(name) {
  var out = "";
  codeProject.files.forEach(function (f) { if (f.name === name) out = f.content; });
  return out;
}
function codeApplyPatch(name, patch) {
  codeHistory.unshift({ name: name, content: codeGetFile(name) });
  if (codeHistory.length > 10) codeHistory.length = 10;
  codeSetFile(name, patch);
  codeRenderHistory();
}
function codeSnapshots() { return codeHistory; }
function codeLastGood() { return codeHistory.length ? codeHistory[0] : null; }
var CODE_LANGS = "c:C,cpp:C++,rust:Rust,go:Go,zig:Zig,java:Java,kotlin:Kotlin,csharp:C#,swift:Swift,dart:Dart,javascript:JavaScript,typescript:TypeScript,html:HTML,css:CSS,php:PHP,python:Python,ruby:Ruby,bash:Bash,powershell:PowerShell,sql:SQL,graphql:GraphQL".split(",").map(function (p) {
  var kv = p.split(":");
  return { id: kv[0], name: kv[1], runnable: kv[0] === "python" || kv[0] === "javascript" };
});
function codeRunnable(lang) {
  var r = null;
  CODE_LANGS.forEach(function (l) { if (l.id === lang) r = l; });
  return !!(r && r.runnable);
}
function codeRenderHistory() {
  if (!codeHistEl) return;
  codeClear(codeHistEl);
  if (codeHistory.length === 0) { codeAdd("لا دې کومه نسخه نه ده خوندي کړې.", codeHistEl); return; }
  codeHistory.forEach(function (s) {
    codeAdd(s.name + ": " + (s.content || "").slice(0, 30), codeHistEl);
  });
}
