// L.A.E. Phase 1: math engine (equations + geometry) — pure functions,
// split from laemath.js by the push limit.
// The unit: the word after the first number ("۵ مڼې" -> "مڼې").
function laeUnit(q) {
  var m = laeDigits(q || "").match(/\d+(\.\d+)?\s+([^\s\d.,؟!،؛:()+*/×÷-]+)/);
  if (!m) return "";
  var w = m[2];
  var stop = ["دی", "لري", "وو", "ده", "شو", "کې", "ته", "له", "سره", "وې", "دي", "په", "پر"];
  if (stop.indexOf(w) !== -1) return "";
  return w.slice(0, 20);
}
function laeSolveEquation(q) {
  var s = laeDigits(q || "").replace(/\s+/g, "");
  if (s.indexOf("=") === -1) return null;
  var m = s.match(/([+-]?\d*\.?\d*)[xX]([+-]\d+\.?\d*)?=([+-]?\d+\.?\d*)/);
  if (!m) return null;
  var a = (m[1] === "" || m[1] === "+") ? 1 : m[1] === "-" ? -1 : parseFloat(m[1]);
  var b = m[2] ? parseFloat(m[2]) : 0;
  var c = parseFloat(m[3]);
  if (!a || isNaN(a) || isNaN(b) || isNaN(c)) return null;
  var x = (c - b) / a;
  if (Math.abs(a * x + b - c) > 0.000001) return null; // substitution check
  var ax = a === 1 ? "x" : laeFmt(a) + "x";
  var bs = b > 0 ? " + " + laeFmt(b) : b < 0 ? " - " + laeFmt(-b) : "";
  var steps = [ax + bs + " = " + laeFmt(c)];
  if (b !== 0) steps.push(ax + " = " + laeFmt(c) + (b > 0 ? " - " + laeFmt(b) : " + " + laeFmt(-b)) + " = " + laeFmt(c - b));
  if (a !== 1) steps.push("x = " + laeFmt(c - b) + " ÷ " + laeFmt(a) + " = " + laeFmt(x));
  return { kind: "equation", topic: "معادلې", nums: [a, b, c], op: "equation", result: x, unit: "", steps: steps, formula: "ax + b = c", ask: "equation", values: { a: a, b: b, c: c } };
}
function laeSolveGeometry(q) {
  var s = q || "";
  var shape = s.indexOf("مستطیل") !== -1 ? "rect" : s.indexOf("مربع") !== -1 ? "square" : s.indexOf("دایره") !== -1 ? "circle" : s.indexOf("مثلث") !== -1 ? "triangle" : null;
  if (!shape) return null;
  var wantArea = s.indexOf("مساحت") !== -1;
  var wantPer = s.indexOf("محیط") !== -1;
  if (!wantArea && !wantPer) return null;
  var nums = laeNums(q);
  if (nums.length < ((shape === "rect" || shape === "triangle") ? 2 : 1)) return null;
  if (shape === "triangle" && !wantArea) return null; // v1: area only
  var a = nums[0], b = nums[1] || 0;
  var result, formula, calc;
  if (shape === "rect") { result = wantArea ? a * b : 2 * (a + b); formula = wantArea ? "مساحت = اوږدوالی × پلنوالی" : "محیط = ۲ × (اوږدوالی + پلنوالی)"; calc = wantArea ? laeFmt(a) + " × " + laeFmt(b) : "۲ × (" + laeFmt(a) + " + " + laeFmt(b) + ")"; }
  else if (shape === "square") { result = wantArea ? a * a : 4 * a; formula = wantArea ? "مساحت = اړخ × اړخ" : "محیط = ۴ × اړخ"; calc = wantArea ? laeFmt(a) + " × " + laeFmt(a) : "۴ × " + laeFmt(a); }
  else if (shape === "circle") { result = wantArea ? Math.PI * a * a : 2 * Math.PI * a; formula = wantArea ? "مساحت = π × شعاع²" : "محیط = ۲ × π × شعاع"; calc = wantArea ? "π × " + laeFmt(a) + "²" : "۲ × π × " + laeFmt(a); }
  else { result = 0.5 * a * b; formula = "مساحت = ½ × بنسټ × لوړوالی"; calc = "½ × " + laeFmt(a) + " × " + laeFmt(b); }
  if (!isFinite(result)) return null;
  var dims = shape === "rect" ? "اوږدوالی = " + laeFmt(a) + "، پلنوالی = " + laeFmt(b) : shape === "square" ? "اړخ = " + laeFmt(a) : shape === "circle" ? "شعاع = " + laeFmt(a) : "بنسټ = " + laeFmt(a) + "، لوړوالی = " + laeFmt(b);
  var steps = ["شکل: " + LAE_SHAPE_NAME[shape], dims, formula, calc + " = " + laeFmt(result)];
  return { kind: "geometry", topic: "هندسه", nums: nums, op: "geometry", result: result, unit: "", steps: steps, formula: formula, ask: wantArea ? "area" : "perimeter", values: { shape: shape, nums: nums, ask: wantArea ? "area" : "perimeter" } };
}
// The entry point. override = { op } (a correction forcing the operation).
function laeParseMath(q, override) {
  if (!q || q.length > 500) return null;
  if (/\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(laeDigits(q))) return null; // a date is not math
  var eq = laeSolveEquation(q);
  if (eq) return eq;
  var g = laeSolveGeometry(q);
  if (g) return g;
  var w = laeSolveWord(q, override);
  if (w) return w;
  // Bare expression ("۵+۳").
  var s = laeDigits(q).replace(/\s+/g, "");
  if (s.length <= 20 && /^[0-9+\-*/.×÷^⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+$/.test(s) && /[+\-*/×÷^⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/.test(s)) {
    var v = laeEval(s);
    if (v !== null) return { kind: "expr", topic: "حساب", nums: laeNums(q), op: "expr", result: v, unit: "", steps: [s + " = " + laeFmt(v)], formula: "", ask: "expr", values: { nums: laeNums(q), op: "expr" } };
  }
  return null;
}
