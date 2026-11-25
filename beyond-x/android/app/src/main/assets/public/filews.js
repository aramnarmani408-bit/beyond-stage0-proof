// Chat shell (#main > #chatPanel > #chatArea) — moved out of index.html
// (wave 2, push limit). Lives here, not builders.js: builders.js is
// already at the push limit, and this must run before attach.js loads.
function buildChatShell() {
  if (document.getElementById("main")) return null;
  var b = document.body;
  if (!b) return null;
  var m = document.createElement("div");
  m.id = "main";
  var p = document.createElement("div");
  p.id = "chatPanel";
  var a = document.createElement("div");
  a.id = "chatArea";
  p.appendChild(a);
  m.appendChild(p);
  b.appendChild(m);
  return m;
}
buildChatShell();
// #178 File workspace (1/2) — pure logic: preview text, in-preview
// search, attached-text-file access. The panel + registry live in
// filews2.js. The store is attach2/attach3 (attach2List) — this module
// never re-attaches. PDF / Word: NO extraction here — that needs a
// gateway extraction route, which does not exist yet.
// No new fetch. Local-first.
var FW_PREVIEW_SHOW = 4000, FW_PREVIEW_MAX = 8000;
function fwPreviewText(t, max) { var s = String(t || ""); var m = max || FW_PREVIEW_SHOW; if (s.length > m) return s.slice(0, m) + "… (لنډ شوی)"; return s; }
function fwLineCount(t) { return String(t || "").split("\n").length; }
function fwSearchLines(t, q) { var out = []; var s = String(t || ""), n = String(q || "").toLowerCase(); if (!n) return out; var ls = s.split("\n"); for (var i = 0; i < ls.length; i++) if (ls[i].toLowerCase().indexOf(n) !== -1) out.push(i + 1); return out; }
function fwSearchFirst(t, q) { var ls = String(t || "").split("\n"); var n = String(q || "").toLowerCase(); if (!n) return ""; for (var i = 0; i < ls.length; i++) if (ls[i].toLowerCase().indexOf(n) !== -1) return ls[i].trim().slice(0, 120); return ""; }
function fwTextFiles() { if (typeof attach2List === "undefined" || !attach2List) return []; var out = []; for (var i = 0; i < attach2List.length; i++) if (attach2List[i].kind === "text") out.push(attach2List[i]); return out; }
function fwIsPreviewable(f) { return !!f && f.kind === "text" && typeof f.text === "string"; }
function fwExtractNote(name) { var n = String(name || "").toLowerCase(); if (/\.pdf$/.test(n)) return "PDF استخراج لا نشته — ګیټ وې ته اړتیا ده."; if (/\.docx?$/.test(n)) return "Word استخراج لا نشته — ګیټ وې ته اړتیا ده."; return ""; }
function fwFileLabel(f) { return (f.name || "فایل") + " • " + Math.round((f.size || 0) / 1024) + " KB"; }
