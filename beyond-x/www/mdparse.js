// Design Phase 2: the answer parser (D4). Splits an AI answer into
// blocks (code fence, display math, heading, table, list, paragraph)
// and detects whether an answer carries any markdown at all. Pure
// string logic — no DOM. The fence is written with escapes (no
// backticks may appear in any module).
var MD_FENCE = "\u0060\u0060\u0060";
function mdIsTableRow(l) { return l.indexOf("|") !== -1 && l.split("|").length >= 3; }
function mdIsList(l) { return /^(\s*[-*]|\s*\d+\.)\s/.test(l); }
function mdHasMarkers(t) {
  if (!t) return false;
  if (t.indexOf(MD_FENCE) !== -1 || t.indexOf("**") !== -1) return true;
  var lines = t.split("\n");
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].charAt(0) === "#" || mdIsTableRow(lines[i])) return true;
  }
  var d = t.indexOf("$");
  if (d !== -1) {
    var e = t.indexOf("$", d + 1);
    if (e !== -1) {
      var m = t.substring(d + 1, e);
      if (m.indexOf("\\") !== -1 || m.indexOf("_") !== -1 || m.indexOf("^") !== -1) return true;
    }
  }
  return false;
}
function mdParse(text) {
  var lines = text.split("\n"), out = [], i = 0;
  while (i < lines.length) {
    var l = lines[i];
    if (l.indexOf(MD_FENCE) === 0) {
      var lang = l.slice(3).trim(), code = [];
      i++;
      while (i < lines.length && lines[i].indexOf(MD_FENCE) !== 0) { code.push(lines[i]); i++; }
      i++;
      out.push({ k: "code", lang: lang, text: code.join("\n") });
    } else if (l.indexOf("$$") === 0) {
      var tex = [l.slice(2)];
      i++;
      while (i < lines.length && lines[i].indexOf("$$") === -1) { tex.push(lines[i]); i++; }
      if (i < lines.length) { tex.push(lines[i].slice(0, lines[i].indexOf("$$"))); i++; }
      out.push({ k: "math", text: tex.join("\n") });
    } else if (l.charAt(0) === "#") {
      out.push({ k: "h", text: l.replace(/^#+\s*/, "") });
      i++;
    } else if (mdIsTableRow(l)) {
      var rows = [];
      while (i < lines.length && mdIsTableRow(lines[i])) { rows.push(lines[i]); i++; }
      out.push({ k: "table", rows: rows });
    } else if (mdIsList(l)) {
      var items = [], num = /^\s*\d+\./.test(l);
      while (i < lines.length && mdIsList(lines[i])) { items.push(lines[i].replace(/^(\s*[-*]|\s*\d+\.)\s/, "")); i++; }
      out.push({ k: num ? "ol" : "ul", items: items });
    } else if (l.trim() === "") {
      i++;
    } else {
      var para = [];
      while (i < lines.length && lines[i].trim() !== "" && lines[i].indexOf(MD_FENCE) !== 0 && lines[i].indexOf("$$") !== 0 && lines[i].charAt(0) !== "#" && !mdIsTableRow(lines[i]) && !mdIsList(lines[i])) { para.push(lines[i]); i++; }
      out.push({ k: "p", text: para.join("\n") });
    }
  }
  return out;
}
