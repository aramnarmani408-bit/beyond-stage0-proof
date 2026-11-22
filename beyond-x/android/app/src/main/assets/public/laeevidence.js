// L.A.E. Phase 1: the Evidence Graph + Quality Gate — pure functions
// (one DOM builder for the Evidence Map). "Verified" requires real
// computation, never a model confidence score. A model number that
// disagrees with the computation is CONTRADICTED, never verified.
var LAE_STATE_LABEL = { verified: "تایید شوی", supported: "ملاتړ شوی", uncertain: "ناڅرګند", unknown: "نامعلوم", contradicted: "مخالف شواهد لري" };
// The model's claimed result: the number after "ځواب", else after the
// last "=", else the only number. Several unmarked numbers -> no claim
// (honest: we cannot tell which one is the result).
function laeModelResult(modelText) {
  var t = modelText || "";
  var j = t.indexOf("ځواب");
  if (j !== -1) { var n = laeNums(t.slice(j)); if (n.length > 0) return n[0]; }
  var e = t.lastIndexOf("=");
  if (e !== -1) { var n2 = laeNums(t.slice(e + 1)); if (n2.length > 0) return n2[0]; }
  var all = laeNums(t);
  if (all.length === 1) return all[0];
  return null;
}
function laeClaims(parsed, modelText) {
  var claims = [];
  claims.push({ text: "ځواب: " + laeFmt(parsed.result) + (parsed.unit ? " " + parsed.unit : ""), state: "verified", why: "د اپ په خپله محاسبه تایید شو" });
  for (var i = 0; i < parsed.steps.length; i++) {
    claims.push({ text: parsed.steps[i], state: "verified", why: "ګام په ګام محاسبه" });
  }
  var last = laeModelResult(modelText);
  if (last !== null) {
    if (Math.abs(last - parsed.result) < 0.01) {
      claims.push({ text: "د ماډل ځواب له محاسبې سره سمون لري", state: "verified", why: "د ماډل وروستۍ شمېره له محاسبې سره یو ده" });
    } else {
      claims.push({ text: "د ماډل وروستۍ شمېره (" + laeFmt(last) + ") له محاسبې (" + laeFmt(parsed.result) + ") سره توپیر لري", state: "contradicted", why: "محاسبه بل ځواب ورکوي — محاسبه سمه ګڼل کېږي" });
    }
  }
  return claims;
}
// The Quality Gate (Self-Check): recompute the result independently and
// compare. A tampered or inconsistent parse fails — the answer is then
// shown WITHOUT a verified badge (see laeShow's fallback).
function laeQualityGate(parsed) {
  var problems = [];
  if (!parsed || typeof parsed.result !== "number" || !isFinite(parsed.result)) return { ok: false, problems: ["نتیجه شمېره نه ده"] };
  var again = null;
  if (parsed.kind === "equation") {
    again = parsed.values.a * parsed.result + parsed.values.b;
    if (Math.abs(again - parsed.values.c) > 0.000001) problems.push("معادله په ځای کولو سره نه سمونېږي");
  } else if (parsed.kind === "word") {
    var nums = parsed.values.nums, op = parsed.values.op;
    if (op === "+") { again = 0; for (var i = 0; i < nums.length; i++) again += nums[i]; }
    else again = laeEval(nums[0] + " " + op + " " + nums[1]);
    if (again === null || Math.abs(again - parsed.result) > 0.000001) problems.push("محاسبه بیا نه سمونېږي");
  } else if (parsed.kind === "expr") {
    again = laeEval(parsed.steps[0].split(" = ")[0]);
    if (again === null || Math.abs(again - parsed.result) > 0.000001) problems.push("محاسبه بیا نه سمونېږي");
  } else if (parsed.kind === "geometry") {
    var v = parsed.values, n = v.nums;
    if (v.shape === "rect") again = v.ask === "area" ? n[0] * n[1] : 2 * (n[0] + n[1]);
    else if (v.shape === "square") again = v.ask === "area" ? n[0] * n[0] : 4 * n[0];
    else if (v.shape === "circle") again = v.ask === "area" ? Math.PI * n[0] * n[0] : 2 * Math.PI * n[0];
    else again = 0.5 * n[0] * n[1];
    if (again === null || Math.abs(again - parsed.result) > 0.01) problems.push("هندسه بیا نه سمونېږي");
  }
  return { ok: problems.length === 0, problems: problems };
}
function laeEvidenceText(claims) {
  var counts = {};
  for (var i = 0; i < claims.length; i++) counts[claims[i].state] = (counts[claims[i].state] || 0) + 1;
  var parts = [];
  ["verified", "supported", "uncertain", "unknown", "contradicted"].forEach(function (st) {
    if (counts[st]) parts.push(laeFmt(counts[st]) + " " + LAE_STATE_LABEL[st]);
  });
  return "ثبوت: " + parts.join("، ");
}
// The Evidence Map: every claim with its state + why, on tap.
function laeEvidenceMap(claims) {
  var box = wsEl("div", "");
  box.id = "laeMap";
  for (var i = 0; i < claims.length; i++) {
    (function (cl) {
      var row = wsEl("div", "");
      row.appendChild(wsEl("div", "[" + LAE_STATE_LABEL[cl.state] + "] " + cl.text));
      row.appendChild(wsEl("div", cl.why));
      box.appendChild(row);
    })(claims[i]);
  }
  return box;
}
