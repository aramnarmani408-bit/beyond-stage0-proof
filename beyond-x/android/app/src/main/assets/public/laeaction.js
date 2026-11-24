// L.A.E. Phase 1: Answer-to-Action — the doing selector + artifact
// builders. Reuses the five Stage 12 workspaces; builds no second system.
// Every artifact must really work (Functional Test) — nothing decorative.
function laeActionFor(parsed, q) {
  if (!parsed) return null;
  if ((q || "").indexOf("کوډ") !== -1) return { workspace: "code" };
  if (parsed.kind === "word") return { workspace: "lesson" };
  if (parsed.kind === "equation") return { workspace: "design", mode: "diagram" };
  if (parsed.kind === "geometry") return { workspace: "design", mode: "figure" };
  return null;
}
function laeCodeScript(parsed) {
  if (parsed.kind === "equation") {
    var v = parsed.values;
    return "a = " + v.a + "\nb = " + v.b + "\nc = " + v.c + "\nx = (c - b) / a\nprint(x)  # " + parsed.result;
  }
  if (parsed.kind === "geometry") {
    var n = parsed.values.nums;
    if (parsed.values.shape === "rect") return "length = " + n[0] + "\nwidth = " + n[1] + "\narea = length * width\nprint(area)  # " + parsed.result;
    if (parsed.values.shape === "square") return "side = " + n[0] + "\narea = side * side\nprint(area)  # " + parsed.result;
    if (parsed.values.shape === "circle") return "import math\nr = " + n[0] + "\narea = math.pi * r * r\nprint(area)  # " + parsed.result;
    return "base = " + n[0] + "\nheight = " + n[1] + "\narea = 0.5 * base * height\nprint(area)  # " + parsed.result;
  }
  var nums = parsed.nums;
  var expr = parsed.op === "+" ? nums.join(" + ") : nums[0] + " " + parsed.op + " " + nums[1];
  return "print(" + expr + ")  # " + parsed.result;
}
function laeAction(obj) {
  var sel = laeActionFor(obj.parsed, obj.q);
  if (!sel || typeof universeActivate !== "function") return null;
  if (sel.workspace === "lesson") {
    var stepsText = obj.parsed.steps.map(function (s, i) { return (i + 1) + ". " + s; }).join("\n");
    universeActivate("lesson", stepsText);
    return "lesson";
  }
  if (sel.workspace === "code") {
    universeActivate("code", CODE_FENCE + "python\n" + laeCodeScript(obj.parsed) + "\n" + CODE_FENCE);
    return "code";
  }
  if (sel.mode === "diagram") {
    universeActivate("design", obj.parsed.steps.join(" → "));
    return "design";
  }
  universeActivate("design", "");
  laeDrawFigure(obj.parsed);
  return "design";
}
// The geometry figure: a REAL scaled shape in the design workspace
// (editable afterwards — move, resize, color, undo all work).
function laeDrawFigure(parsed) {
  if (typeof designAdd !== "function" || typeof designEdit !== "function") return;
  var v = parsed.values, n = v.nums;
  var sc, w, h;
  if (v.shape === "rect") { sc = Math.min(200 / n[0], 120 / n[1]); w = Math.round(n[0] * sc); h = Math.round(n[1] * sc); }
  else if (v.shape === "square") { sc = Math.min(200 / n[0], 120 / n[0]); w = Math.round(n[0] * sc); h = w; }
  else if (v.shape === "circle") { sc = Math.min(200 / (2 * n[0]), 120 / (2 * n[0])); w = Math.round(2 * n[0] * sc); h = w; }
  else { sc = Math.min(200 / n[0], 120 / n[1]); w = Math.round(n[0] * sc); h = Math.round(n[1] * sc); }
  if (v.shape === "triangle") {
    var x0 = 50, y0 = 60;
    laeDrawLine(x0, y0 + h, w, 0);
    laeDrawLine(x0 + w, y0 + h, -Math.round(w / 2), -h);
    laeDrawLine(x0 + Math.round(w / 2), y0, -Math.round(w / 2), h);
  } else {
    designAdd(v.shape === "circle" ? "circle" : "rect");
    (function (ww, hh) { designEdit(function (s) { s.x = 50; s.y = 60; s.w = ww; s.h = hh; }); })(w, h);
  }
  laeDrawLabel(50, 40, v.shape === "rect" ? "اوږدوالی: " + laeFmt(n[0]) : v.shape === "square" ? "اړخ: " + laeFmt(n[0]) : v.shape === "circle" ? "شعاع: " + laeFmt(n[0]) : "بنسټ: " + laeFmt(n[0]));
  var resLabel = (parsed.ask === "area" ? "مساحت: " : "محیط: ") + laeFmt(parsed.result);
  laeDrawLabel(50, 80 + h, v.shape === "rect" ? "پلنوالی: " + laeFmt(n[1]) : v.shape === "triangle" ? "لوړوالی: " + laeFmt(n[1]) : resLabel);
  if (v.shape === "rect" || v.shape === "triangle") laeDrawLabel(50, 110 + h, resLabel);
}
function laeDrawLine(x, y, w, h) {
  designAdd("line");
  (function (xx, yy, ww, hh) { designEdit(function (s) { s.x = xx; s.y = yy; s.w = ww; s.h = hh; }); })(x, y, w, h);
}
function laeDrawLabel(x, y, text) {
  designAdd("text");
  (function (xx, yy, tt) { designEdit(function (s) { s.x = xx; s.y = yy; s.text = tt; s.color = "var(--tx)"; }); })(x, y, text);
}
