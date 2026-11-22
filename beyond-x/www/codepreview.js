// Stage 12: code preview — DOM-based SAFE renderer (no iframe, no eval).
// JS/Python show as syntax, never executed. HTML uses allowlisted tags +
// CSS only. States: available / limited / none.
var CODEWS_TAGS = ["div", "p", "span", "button", "h1", "h2", "h3", "ul", "ol", "li", "b", "i", "strong", "em", "br"];
var CODEWS_CSS = ["color", "background", "font-size", "padding", "margin", "border", "text-align"];
function codewsHighlight(code) {
  var out = [];
  var re = /(\/\/[^\n]*|#[^\n]*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:def|function|return|if|else|for|while|class|import|from|var|let|const|print)\b|\b\d+\b)/g;
  var last = 0, m;
  while ((m = re.exec(code || "")) !== null) {
    if (m.index > last) out.push({ text: code.slice(last, m.index), cls: "" });
    var t = m[0];
    var cls = t[0] === "#" || t.indexOf("//") === 0 ? "com" : (t[0] === '"' || t[0] === "'") ? "str" : /^[0-9]/.test(t) ? "num" : "kw";
    out.push({ text: t, cls: cls });
    last = m.index + t.length;
  }
  if (last < (code || "").length) out.push({ text: code.slice(last), cls: "" });
  return out;
}
function codewsColor(cls) {
  if (cls === "kw") return "#A855F7";
  if (cls === "str") return "#00FF88";
  if (cls === "com") return "#94A3B8";
  if (cls === "num") return "#00F5FF";
  return "#F1F5F9";
}
function codewsSyntaxEl(code) {
  var box = wsEl("div", "");
  box.style.whiteSpace = "pre-wrap";
  var toks = codewsHighlight(code);
  for (var i = 0; i < toks.length; i++) {
    var sp = wsEl("span", toks[i].text);
    sp.style.color = codewsColor(toks[i].cls);
    box.appendChild(sp);
  }
  return box;
}
function codewsApplyStyle(el, styleText) {
  var parts = (styleText || "").split(";");
  for (var i = 0; i < parts.length; i++) {
    var kv = parts[i].split(":");
    if (kv.length < 2) continue;
    var prop = kv[0].trim().toLowerCase();
    if (CODEWS_CSS.indexOf(prop) === -1) continue;
    el.style[prop] = kv.slice(1).join(":").trim();
  }
}
function codeSafePreview(code, lang) {
  var box = wsEl("div", "");
  if (lang === "javascript" || lang === "python") return { state: "limited", el: codewsSyntaxEl(code) };
  if (lang !== "html") return { state: "none", el: box };
  var stack = [box];
  var re = /<(\/?)([a-z0-9]+)([^>]*)>|([^<]+)/g;
  var m, ok = false, skip = 0;
  while ((m = re.exec(code || "")) !== null) {
    if (m[4]) {
      if (skip > 0) continue;
      var txt = m[4].trim();
      if (txt) stack[stack.length - 1].appendChild(wsEl("span", txt));
      continue;
    }
    var tag = m[2].toLowerCase();
    if (CODEWS_TAGS.indexOf(tag) === -1) {
      if (m[1] === "/") { if (skip > 0) skip--; }
      else if ((m[3] || "").trim().slice(-1) !== "/") skip++;
      continue;
    }
    if (m[1] === "/") { if (stack.length > 1) stack.pop(); continue; }
    var el = document.createElement(tag);
    var sm = /style\s*=\s*"([^"]*)"/.exec(m[3] || "");
    if (sm) codewsApplyStyle(el, sm[1]);
    stack[stack.length - 1].appendChild(el);
    if (tag !== "br") stack.push(el);
    ok = true;
  }
  return { state: ok ? "available" : "none", el: box };
}
