// Design Phase 2: the answer block renderer (D4). Turns parsed blocks
// into structured DOM: code cards (LTR + Copy), RTL-safe tables,
// headings, lists, paragraphs with bold + inline math. No inner HTML.
var MD_CSS = ".md-code{background:var(--cd);border:1px solid var(--bd);border-radius:8px;margin:8px 0;overflow:hidden}.md-code .hd{display:flex;justify-content:space-between;padding:6px 10px;font-size:12px;color:var(--mu)}.md-code pre{direction:ltr;text-align:left;margin:0;padding:10px;overflow-x:auto;font-size:13px}.md-code button{background:var(--ac);color:#fff;border:0;border-radius:6px;padding:4px 8px;cursor:pointer}.md-table{width:100%;border-collapse:collapse;margin:8px 0}.md-table td,.md-table th{border:1px solid var(--bd);padding:6px 8px;text-align:right}.md-more{background:transparent;color:var(--ac);border:0;cursor:pointer;padding:6px 0;font-size:14px}";
if (typeof document !== "undefined" && document.head && !document.getElementById("mdStyle")) {
  var mdst = document.createElement("style");
  mdst.id = "mdStyle";
  mdst.textContent = MD_CSS;
  document.head.appendChild(mdst);
}
function mdInline(el, text) {
  if (text.indexOf("$") === -1 && text.indexOf("**") === -1) {
    el.textContent = text;
    return;
  }
  var parts = text.split("$");
  for (var i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      if (typeof mdMath === "function") mdMath(el, parts[i], false);
      else { var s0 = document.createElement("span"); s0.textContent = parts[i]; el.appendChild(s0); }
    } else mdBold(el, parts[i]);
  }
}
function mdBold(el, text) {
  var parts = text.split("**");
  for (var i = 0; i < parts.length; i++) {
    if (!parts[i]) continue;
    if (i % 2 === 1) {
      var b = document.createElement("b");
      b.textContent = parts[i];
      el.appendChild(b);
    } else {
      var s = document.createElement("span");
      s.textContent = parts[i];
      el.appendChild(s);
    }
  }
}
function mdBlockLen(b) {
  if (b.k === "table") return b.rows.join("\n").length;
  if (b.k === "ol" || b.k === "ul") return b.items.join("\n").length;
  return (b.text || "").length;
}
function mdRenderBlock(parent, b) {
  var el;
  if (b.k === "code") {
    el = document.createElement("div");
    el.className = "md-code";
    var hd = document.createElement("div");
    hd.className = "hd";
    var lb = document.createElement("span");
    lb.textContent = b.lang || "کوډ";
    hd.appendChild(lb);
    var cp = document.createElement("button");
    cp.textContent = "کاپي";
    (function (code) {
      cp.addEventListener("click", function () { if (typeof copyAnswer === "function") copyAnswer(code); });
    })(b.text);
    hd.appendChild(cp);
    el.appendChild(hd);
    var pre = document.createElement("pre");
    pre.textContent = b.text;
    el.appendChild(pre);
    parent.appendChild(el);
    return;
  }
  if (b.k === "math") {
    if (typeof mdMath === "function") mdMath(parent, b.text, true);
    else { el = document.createElement("div"); el.textContent = b.text; parent.appendChild(el); }
    return;
  }
  if (b.k === "h") {
    el = document.createElement("h3");
    mdInline(el, b.text);
    parent.appendChild(el);
    return;
  }
  if (b.k === "table") {
    el = document.createElement("table");
    el.className = "md-table";
    for (var r = 0; r < b.rows.length; r++) {
      var cells = b.rows[r].split("|").map(function (c) { return c.trim(); }).filter(function (c) { return c !== ""; });
      if (cells.length && cells.every(function (c) { return /^:?-{2,}:?$/.test(c); })) continue;
      var tr = document.createElement("tr");
      for (var c = 0; c < cells.length; c++) {
        var td = document.createElement(r === 0 ? "th" : "td");
        mdInline(td, cells[c]);
        tr.appendChild(td);
      }
      el.appendChild(tr);
    }
    parent.appendChild(el);
    return;
  }
  if (b.k === "ol" || b.k === "ul") {
    el = document.createElement(b.k);
    for (var n = 0; n < b.items.length; n++) {
      var li = document.createElement("li");
      mdInline(li, b.items[n]);
      el.appendChild(li);
    }
    parent.appendChild(el);
    return;
  }
  el = document.createElement("div");
  mdInline(el, b.text);
  parent.appendChild(el);
}
