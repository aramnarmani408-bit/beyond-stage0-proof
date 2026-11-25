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
// Safe evaluator: + - * / ^ (right-assoc), no parens, no eval.
// Unicode superscripts (digits + signs only) normalize to ^ form
// with run-sharing (5⁻¹ -> 5^-1, 2³² -> 2^32) — the gateway's
// xMathAscii semantics. Superscript LETTERS are not mapped: any
// letter in the expr fails the charset either way, so the result
// is identical to the gateway's (2ⁿ -> null, x² -> null).
var LAE_SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻", LAE_SUP_A = "0123456789+-";
function laeSupAscii(s) { return s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, function (m) { var o = "^", i; for (i = 0; i < m.length; i++) o += LAE_SUP_A.charAt(LAE_SUP.indexOf(m.charAt(i))); return o; }); }
function laeEval(expr) {
  var s = laeSupAscii(laeDigits(expr || "").replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/"));
  if (s.length === 0 || s.length > 60 || !/^[0-9+\-*/.^]+$/.test(s)) return null;
  var nums = [], ops = [], cur = "";
  for (var i = 0; i < s.length; i++) {
    var c = s.charAt(i);
    if (c === "+" || c === "-" || c === "*" || c === "/" || c === "^") {
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
  var p = nums.slice(), po = ops.slice();
  for (var h = po.length - 1; h >= 0; h--) if (po[h] === "^") { var pw = Math.pow(p[h], p[h + 1]); if (!isFinite(pw)) return null; p.splice(h, 2, pw); po.splice(h, 1); }
  nums = p; ops = po;
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
// Op detection: "هر یو" first; subtract beats add.
function laeWordOp(q) {
  var s = q || "";
  if (/تفریق|ورکړ|پاتې|کم شو|منفي/.test(s)) return "-";
  if (/تقسیم|وېش|هر یو/.test(s)) return "/";
  if (/ضرب|ځلې|ځله|هر/.test(s)) return "*";
  if (/جمع|واخیست|نور|ټول|یوځای/.test(s)) return "+";
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
  var steps = ["شمېرې: " + disp.join("، "), "عمل: " + LAE_OP_NAME[op], disp.join(" " + op + " ") + " = " + laeFmt(result)];
  return { kind: "word", topic: "حساب", nums: nums, op: op, result: result, unit: laeUnit(q), steps: steps, formula: "", ask: "word", values: { nums: nums, op: op } };
}
