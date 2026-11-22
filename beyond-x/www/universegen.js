// Stage 12: Dynamic World Generation — an answer becomes workspace content.
// Pure functions (no DOM, no fetch); every list is capped.
function genLines(answer) {
  return (answer || "").split("\n").map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });
}
function genStripNum(line) {
  return line.replace(/^[0-9۰۱۲۳۴۵۶۷۸۹]+[.)\-]\s*/, "").replace(/^[-*•]\s*/, "");
}
function genLessonSteps(answer) {
  var out = [];
  var lines = genLines(answer);
  for (var i = 0; i < lines.length && out.length < 8; i++) {
    var t = genStripNum(lines[i]);
    if (t.length < 2) continue;
    out.push({ title: t.slice(0, 60), text: t.slice(0, 300) });
  }
  if (out.length === 0 && (answer || "").trim()) out.push({ title: "درس", text: (answer || "").trim().slice(0, 300) });
  return out;
}
function genDiagramNodes(answer) {
  var out = [];
  var lines = genLines(answer);
  for (var i = 0; i < lines.length && out.length < 8; i++) {
    var t = genStripNum(lines[i]);
    if (t.length < 2) continue;
    var parts = t.split("→");
    for (var j = 0; j < parts.length && out.length < 8; j++) {
      var label = parts[j].trim().slice(0, 30);
      if (label.length < 2) continue;
      out.push({ label: label, kind: j === 0 ? "start" : "node" });
    }
  }
  return out;
}
function genTrainSteps(answer) {
  var out = [];
  var lines = genLines(answer);
  for (var i = 0; i < lines.length && out.length < 8; i++) {
    var t = genStripNum(lines[i]);
    if (t.length < 2) continue;
    out.push({ step: t.slice(0, 120), done: false });
  }
  if (out.length === 0 && (answer || "").trim()) out.push({ step: (answer || "").trim().slice(0, 120), done: false });
  return out;
}
function genCodeBlocks(answer) {
  var out = [];
  var parts = (answer || "").split(CODE_FENCE);
  for (var i = 1; i < parts.length && out.length < 5; i += 2) {
    var block = parts[i];
    var nl = block.indexOf("\n");
    var lang = nl === -1 ? "text" : (block.slice(0, nl).trim().toLowerCase().slice(0, 20) || "text");
    var code = nl === -1 ? block : block.slice(nl + 1);
    out.push({ lang: lang, code: code.slice(0, 2000) });
  }
  return out;
}
function genDecisionOptions(answer) {
  var out = [];
  var lines = genLines(answer);
  var cur = null;
  for (var i = 0; i < lines.length && out.length < 5; i++) {
    var t = lines[i];
    if (t.indexOf("ګټې") !== -1 && cur) { cur.pros.push(t.slice(0, 100)); continue; }
    if (t.indexOf("زیانونه") !== -1 && cur) { cur.cons.push(t.slice(0, 100)); continue; }
    var name = genStripNum(t).slice(0, 40);
    if (name.length < 2) continue;
    cur = { name: name, pros: [], cons: [] };
    out.push(cur);
  }
  return out;
}
function genUniverseContent(type, answer) {
  if (type === "lesson") return { steps: genLessonSteps(answer) };
  if (type === "design") return { nodes: genDiagramNodes(answer) };
  if (type === "training") return { steps: genTrainSteps(answer) };
  if (type === "code") return { blocks: genCodeBlocks(answer) };
  if (type === "decision") return { options: genDecisionOptions(answer) };
  return {};
}
// Pure workspace analysis (kept here so the panel modules stay pushable).
function codeAnalyze(code) {
  var c = code || "";
  var fns = (c.match(/function |def |class /g) || []).length;
  var open = (c.match(/[{[(]/g) || []).length;
  var close = (c.match(/[}\])]/g) || []).length;
  return { lines: c.split("\n").length, functions: fns, bracketsOk: open === close };
}
var DECISION_SCEN = { best: 1.2, expected: 1, worst: 0.8 };
function decisionScore(options, weights, scen) {
  var out = [];
  for (var i = 0; i < options.length; i++) {
    var o = options[i];
    var total = 0, wsum = 0;
    for (var c in weights) {
      var r = (o.ratings && o.ratings[c]) || 3;
      total += weights[c] * r;
      wsum += weights[c];
    }
    out.push({ name: o.name, score: Math.round(total / Math.max(1, wsum) * 10 * (DECISION_SCEN[scen] || 1)) / 10 });
  }
  out.sort(function (a, b) { return b.score - a.score; });
  return out;
}
