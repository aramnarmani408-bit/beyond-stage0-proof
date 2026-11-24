// Design Phase 2: lightweight math rendering (REQ-MATH-001 v1, arman).
// The model already emits LaTeX; this renders the common cases as
// structured DOM — sub/superscripts, stacked fractions, roots —
// light on the A10 (no KaTeX). Dollar markers never show literally.
var MATH_CSS = ".math-frac{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 2px}.math-frac .nu{border-bottom:1px solid var(--tx);padding:0 4px}.math-disp{display:block;text-align:center;padding:8px 0;font-size:1.1em}";
if (typeof document !== "undefined" && document.head && !document.getElementById("mathStyle")) {
  var mast = document.createElement("style");
  mast.id = "mathStyle";
  mast.textContent = MATH_CSS;
  document.head.appendChild(mast);
}
var MD_SYM = { "\\times": "×", "\\div": "÷", "\\pm": "±", "\\pi": "π", "\\infty": "∞", "\\cdot": "·", "\\le": "≤", "\\ge": "≥", "\\ne": "≠", "\\alpha": "α", "\\beta": "β", "\\theta": "θ", "\\log": "log", "\\ln": "ln", "\\sin": "sin", "\\cos": "cos", "\\tan": "tan" };
function mdBrace(tex, i) {
  while (tex.charAt(i) === " ") i++;
  if (tex.charAt(i) !== "{") return { text: "", end: i };
  var depth = 0;
  for (var j = i; j < tex.length; j++) {
    if (tex.charAt(j) === "{") depth++;
    else if (tex.charAt(j) === "}") { depth--; if (depth === 0) return { text: tex.substring(i + 1, j), end: j + 1 }; }
  }
  return { text: tex.substring(i + 1), end: tex.length };
}
function mdMath(el, tex, display) {
  var box = document.createElement(display ? "div" : "span");
  if (display) box.className = "math-disp";
  var i = 0;
  while (i < tex.length) {
    var ch = tex.charAt(i);
    if (ch === "\\") {
      var m = tex.substring(i).match(/^\\(frac|sqrt|[a-z]+)/);
      if (m && m[1] === "frac") {
        var a = mdBrace(tex, i + m[0].length);
        var b = mdBrace(tex, a.end);
        var f = document.createElement("span");
        f.className = "math-frac";
        var nu = document.createElement("span"); nu.className = "nu"; mdMath(nu, a.text, false);
        var de = document.createElement("span"); mdMath(de, b.text, false);
        f.appendChild(nu); f.appendChild(de);
        box.appendChild(f);
        i = b.end;
      } else if (m && m[1] === "sqrt") {
        var nx = i + m[0].length;
        if (tex.charAt(nx) === "[") {
          var e = tex.indexOf("]", nx);
          if (e !== -1) {
            var sup = document.createElement("sup");
            sup.textContent = tex.substring(nx + 1, e);
            box.appendChild(sup);
            nx = e + 1;
          }
        }
        var r = mdBrace(tex, nx);
        var s = document.createElement("span");
        s.textContent = "√";
        box.appendChild(s);
        var rd = document.createElement("span");
        mdMath(rd, r.text, false);
        box.appendChild(rd);
        i = r.end;
      } else if (m && m[1] === "text") {
        var tb = mdBrace(tex, i + m[0].length);
        var ts = document.createElement("span");
        ts.textContent = tb.text;
        box.appendChild(ts);
        i = tb.end;
      } else if (m && MD_SYM["\\" + m[1]]) {
        var t = document.createElement("span");
        t.textContent = MD_SYM["\\" + m[1]];
        box.appendChild(t);
        i += m[0].length;
      } else if (m && (m[1] === "left" || m[1] === "right")) {
        var p = document.createElement("span");
        p.textContent = tex.charAt(i + m[0].length) || "";
        box.appendChild(p);
        i += m[0].length + 1;
      } else if (m) {
        i += m[0].length;
      } else {
        i++;
      }
    } else if (ch === "_" || ch === "^") {
      var sub = ch === "_";
      var arg = "", next = i + 1;
      if (tex.charAt(next) === "{") { var br = mdBrace(tex, next); arg = br.text; next = br.end; }
      else { arg = tex.charAt(next); next = next + 1; }
      var se = document.createElement(sub ? "sub" : "sup");
      mdMath(se, arg, false);
      box.appendChild(se);
      i = next;
    } else {
      var j = i;
      while (j < tex.length && "\\_^".indexOf(tex.charAt(j)) === -1) j++;
      var run = document.createElement("span");
      run.textContent = tex.substring(i, j);
      box.appendChild(run);
      i = j;
    }
  }
  el.appendChild(box);
}
