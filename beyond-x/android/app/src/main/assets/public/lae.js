// L.A.E. Phase 1: the Living Answer Engine — the structured answer
// object, Answer First, the hook. Math only (v1). Rendering lives in
// laeui.js, correction in laecorrect.js (the push limit).
var laeCurrent = null;
var laePending = null; // { q, obj } — awaiting an understanding correction
function laeShape(parsed) {
  if (parsed.kind === "expr") return "S";
  if (parsed.kind === "word") return "E";
  if (parsed.kind === "equation") return "A";
  if (parsed.kind === "geometry") return "V";
  return "S";
}
// REQ-ANSWER-006: the length adapts to the request — SHORT is direct +
// verification only, LONG adds the steps. "اوږدوالی" is not a length word.
function laeLengthFor(q) {
  var s = q || "";
  if (s.indexOf("لنډ") !== -1) return "short";
  var noLen = s.split("اوږدوالی").join("");
  if (noLen.indexOf("اوږد") !== -1 || s.indexOf("بشپړ") !== -1 || s.indexOf("تشریح") !== -1 || s.indexOf("تفصیل") !== -1) return "long";
  // Settings build: no length words — the user's default length.
  return (typeof neonPrefs !== "undefined" && neonPrefs.depth) || "medium";
}
function laeBuildAnswer(q, modelText, parsedIn) {
  var parsed = parsedIn || laeParseMath(q);
  if (!parsed) return null;
  var claims = laeClaims(parsed, modelText);
  var gate = laeQualityGate(parsed);
  var shape = laeShape(parsed);
  return { q: q, modelText: modelText, parsed: parsed, claims: claims, gate: gate,
    shape: shape, version: 1, corrected: false, isFirstAnswer: laeIsFirstAnswer(),
    dna: { intent: "solve", domain: "math", complexity: parsed.kind === "expr" ? "simple" : "medium", shape: shape, needsCalculation: true, uncertainty: gate.ok ? "low" : "high", memoryRelevance: "high", length: laeLengthFor(q) } };
}
function laeDirectLine(obj) {
  return "ځواب: " + laeFmt(obj.parsed.result) + (obj.parsed.unit ? " " + obj.parsed.unit : "");
}
function laeUnderstandText(obj) {
  var p = obj.parsed;
  var t = "زما پوهېدنه: ";
  if (p.kind === "word") t += "دا د حساب پوښتنه ده — عمل: " + LAE_OP_NAME[p.op] + "، شمېرې: " + p.nums.map(laeFmt).join(", ");
  else if (p.kind === "equation") t += "دا یوه معادله ده — د x ارزښت غوښتل شوی";
  else if (p.kind === "geometry") t += "دا د هندسې پوښتنه ده — شکل: " + LAE_SHAPE_NAME[p.values.shape] + "، غوښتل شوی: " + (p.ask === "area" ? "مساحت" : "محیط");
  else t += "دا یوه محاسبه ده";
  // REQ-SMART-001 (3): the card shows the LEVEL too — from the DNA
  // complexity + this question's actual step count, never a canned line.
  return t + "؛ کچه: " + (obj.dna.complexity === "simple" ? "اسانه" : "منځنی") + " (" + laeFmt(p.steps.length) + " ګامونه).";
}
// Renders one answer at its dna.length (SHORT = direct + verification;
// LONG adds the steps). The direct answer is FIRST at every length.
// prefix labels a corrected answer. REQ-ANSWER-007: the first answer
// also introduces the app (isFirstAnswer is the Phase 2 UI hook).
function laeRender(obj, prefix) {
  addMessage((prefix || "") + laeDirectLine(obj), "ai");
  if (obj.isFirstAnswer) addMessage("سلام! زه BEYOND X یم — ستا مرستیال. زه هره ریاضي پوښتنه په ګامونو حل کوم، ځواب په خپله محاسبه تاییدوم، او درس، ډیزاین یا کوډ درته جوړوم.", "ai");
  var len = obj.dna.length;
  if (len === "short") {
    addMessage(laeEvidenceText(obj.claims), "ai");
    laeShowLength(obj);
    return;
  }
  if (obj.shape !== "S") {
    laeShowCard(obj);
    laeShowEvidence(obj);
  }
  laeShowModelText(obj);
  if (len === "long") addMessage("تشریح: " + obj.parsed.steps.join("؛ "), "ai");
  laeShowAction(obj);
  laeShowLength(obj);
  laeShowNext(obj);
}
// The length control: re-render the current answer at a new length —
// the same answer, no re-parse, no new memory record. The introduction
// is not repeated (it was shown on the first render).
function laeRerender(len) {
  if (!laeCurrent) return;
  laeCurrent.dna.length = len;
  laeCurrent.isFirstAnswer = false;
  laePending = null;
  laeHideAll();
  laeRender(laeCurrent, laeCurrent.corrected ? "سم شوی ځواب (v" + laeCurrent.version + "): " : "");
}
// The ask.js hook. Returns true when the L.A.E. handled the answer (math),
// false for the plain path (non-math).
function laeShow(q, modelText) {
  var obj = laeBuildAnswer(q, modelText);
  if (!obj) return false;
  laeCurrent = obj;
  laePending = null;
  laeHideAll();
  if (!obj.gate.ok) {
    if (modelText) addMessage(modelText, "ai");
    addMessage("د محاسبې تایید ونه شو (" + obj.gate.problems.join(", ") + ") — ځواب وګوره.", "ai");
    return true;
  }
  laeRender(obj, "");
  laeRemember(obj);
  return true;
}
