// L.A.E. Phase 1: math engine (core) — pure functions, no DOM, no
// fetch. Equations + geometry live in laemath2.js (the push limit).
var LAE_DIGITS = {"۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9", "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9", "٫": "."};
var LAE_EA = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
function laeDigits(s) {
  var out = "";
  for (var i = 0; i < (s || "").length; i++) { var c = s.charAt(i); out += LAE_DIGITS[c] || c; }
  return out;
}
function laeFmt(v) {
  var r = Math.round(v * 100) / 100;
  var s = String(r);
  var out = "";
  for (var i = 0; i < s.length; i++) { var c = s.charAt(i); out += (c >= "0" && c <= "9") ? LAE_EA[c.charCodeAt(0) - 48] : c; }
  return out;
}
function laeNums(q) {
  var m = laeDigits(q || "").match(/\d+(\.\d+)?/g) || [];
  return m.map(function (x) { return parseFloat(x); });
}
// Safe evaluator: + - * / with precedence, no parens, no eval. A bare
// expression with parens returns null (the model answers it instead).
function laeEval(expr) {
  var s = laeDigits(expr || "").replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/");
  if (s.length === 0 || s.length > 60 || !/^[0-9+\-*/.]+$/.test(s)) return null;
  var nums = [], ops = [], cur = "";
  for (var i = 0; i < s.length; i++) {
    var c = s.charAt(i);
    if (c === "+" || c === "-" || c === "*" || c === "/") {
      if (cur === "" && c === "-") { cur = "-"; continue; }
      if (cur === "" || cur === "-") return null;
      var v = parseFloat(cur);
      if (isNaN(v)) return null;
      nums.push(v); ops.push(c); cur = "";
    } else cur += c;
  }
  if (cur === "" || cur === "-") return null;
  var last = parseFloat(cur);
  if (isNaN(last)) return null;
  nums.push(last);
  var n2 = [nums[0]], o2 = [];
  for (var j = 0; j < ops.length; j++) {
    if (ops[j] === "*" || ops[j] === "/") {
      if (ops[j] === "/" && nums[j + 1] === 0) return null;
      n2[n2.length - 1] = ops[j] === "*" ? n2[n2.length - 1] * nums[j + 1] : n2[n2.length - 1] / nums[j + 1];
    } else { o2.push(ops[j]); n2.push(nums[j + 1]); }
  }
  var v = n2[0];
  for (var k = 0; k < o2.length; k++) v = o2[k] === "+" ? v + n2[k + 1] : v - n2[k + 1];
  if (!isFinite(v)) return null;
  return Math.round(v * 1000000) / 1000000;
}
var LAE_OP_NAME = { "+": "جمع", "-": "تفریق", "*": "ضرب", "/": "تقسیم", expr: "محاسبه" };
var LAE_SHAPE_NAME = { rect: "مستطیل", square: "مربع", circle: "دایره", triangle: "مثلث" };
// Operation detection. Order matters: "هر یو" (divide) before "هر"
// (multiply); subtract before add ("ورکړ" beats "واخیست" in one question).
function laeWordOp(q) {
  var s = q || "";
  if (s.indexOf("تفریق") !== -1 || s.indexOf("ورکړ") !== -1 || s.indexOf("پاتې") !== -1 || s.indexOf("کم شو") !== -1 || s.indexOf("منفي") !== -1) return "-";
  if (s.indexOf("تقسیم") !== -1 || s.indexOf("وېش") !== -1 || s.indexOf("هر یو") !== -1) return "/";
  if (s.indexOf("ضرب") !== -1 || s.indexOf("ځلې") !== -1 || s.indexOf("ځله") !== -1 || s.indexOf("هر") !== -1) return "*";
  if (s.indexOf("جمع") !== -1 || s.indexOf("واخیست") !== -1 || s.indexOf("نور") !== -1 || s.indexOf("ټول") !== -1 || s.indexOf("یوځای") !== -1) return "+";
  if (s.indexOf("+") !== -1) return "+";
  if (s.indexOf("-") !== -1 || s.indexOf("−") !== -1) return "-";
  if (s.indexOf("*") !== -1 || s.indexOf("×") !== -1) return "*";
  if (s.indexOf("/") !== -1 || s.indexOf("÷") !== -1) return "/";
  return null;
}
function laeSolveWord(q, override) {
  var nums = laeNums(q);
  if (nums.length < 2) return null;
  var op = (override && override.op) || laeWordOp(q);
  if (!op || op === "expr") return null;
  var result;
  if (op === "+") { result = 0; for (var i = 0; i < nums.length; i++) result += nums[i]; }
  else result = laeEval(nums[0] + " " + op + " " + nums[1]);
  if (result === null) return null;
  var disp = nums.map(laeFmt);
  var steps = ["شمېرې: " + disp.join("، "), "عمل: " + LAE_OP_NAME[op], disp.join(op === "+" ? " + " : " " + op + " ") + " = " + laeFmt(result)];
  return { kind: "word", topic: "حساب", nums: nums, op: op, result: result, unit: laeUnit(q), steps: steps, formula: "", ask: "word", values: { nums: nums, op: op } };
}
