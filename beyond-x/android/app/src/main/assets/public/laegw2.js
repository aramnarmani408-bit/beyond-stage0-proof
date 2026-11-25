// Living Answer, Phase 2: rendering + controls for the gateway object.
// Direct answer FIRST; SHORT is direct + evidence, MEDIUM adds the card,
// doing and next, LONG adds the model text. See laegw.js for the client.
var laeGwCurrent = null; // { q, gw, modelText, length, isFirst }
var LAE_GW_STATES = ["verified", "supported", "uncertain", "unknown", "contradicted"];
function laeGwBox(id, hide) {
  var c = document.getElementById("chatArea");
  if (!c) return null;
  hide();
  var b = wsEl("div", "");
  b.id = id;
  c.appendChild(b);
  return b;
}
function laeGwDirect() {
  var d = laeGwCurrent.gw.direct || "";
  if (d.indexOf("ځواب:") === 0) d = d.slice(6).trim();
  return d;
}
function laeGwShowCard() {
  var gw = laeGwCurrent.gw, u = gw.understanding || {};
  var t = "زما پوهېدنه: " + (u.meaning || laeGwCurrent.q) + "؛ کچه: " + (u.level || "منځنی");
  addMessage(t, "ai");
  var box = laeGwBox("laeCard", laeHideCard);
  if (!box) return;
  box.appendChild(wsBtn("سم دی", function () { laeHideCard(); }));
  laeCardEl = box;
}
function laeGwShowDoing() {
  var doing = laeGwCurrent.gw.doing;
  if (!doing || doing.type === "none") return;
  var box = laeGwBox("laeAction", laeHideAction);
  if (!box) return;
  var name = doing.type === "calculator" ? "حسابوونکی" : doing.type === "diagram" ? "ډیزاین" : "کوئز";
  addMessage("ایا دا طریقه هم وکړم؟ (" + name + ")", "ai");
  box.appendChild(wsBtn("کارځای پرانیزه: " + name, function () {
    while (box.firstChild) box.removeChild(box.firstChild);
    if (doing.type === "diagram") { if (typeof laeGwDiagram === "function") laeGwDiagram(doing.spec); return; }
    if (doing.type === "calculator") laeGwCalcBox(box, doing.spec);
    else if (typeof laeGwQuizBox === "function") laeGwQuizBox(box, doing.spec);
  }));
  laeActionEl = box;
}
function laeGwShowNext() {
  var next = laeGwCurrent.gw.next;
  if (!next) return;
  addMessage("بل ګام: " + next, "ai");
  var box = laeGwBox("laeNext", laeHideNext);
  if (!box) return;
  box.appendChild(wsBtn("دا تمرین وکړه", function () { laeHideNext(); askBeyond(next); }));
  laeNextEl = box;
}
function laeGwShowLength() {
  var box = laeGwBox("laeLength", laeHideLength);
  if (!box) return;
  var cur = laeGwCurrent.length;
  [["short", "لنډ"], ["medium", "منځنی"], ["long", "اوږد"]].forEach(function (p) {
    box.appendChild(wsBtn(p[1] + (p[0] === cur ? " ✓" : ""), function () { laeGwRerender(p[0]); }));
  });
  laeLengthEl = box;
}
function laeGwRenderLayers() {
  addMessage("ځواب: " + laeGwDirect(), "ai");
  if (laeGwCurrent.isFirst) addMessage("سلام! زه BEYOND X یم — ستا مرستیال. زه هره پوښتنه په ګامونو ځوابوم، ځواب په شواهدو تاییدوم، او درس، ډیزاین یا کوئز درته جوړوم.", "ai");
  var len = laeGwCurrent.length;
  if (len === "short") {
    if (typeof laeShowEvidence === "function") laeShowEvidence({ claims: laeGwCurrent.gw.claims });
    laeGwShowLength();
    return;
  }
  laeGwShowCard();
  if (typeof laeShowEvidence === "function") laeShowEvidence({ claims: laeGwCurrent.gw.claims });
  if (len === "long" && typeof laeShowModelText === "function") laeShowModelText({ modelText: laeGwCurrent.modelText });
  laeGwShowDoing();
  laeGwShowNext();
  laeGwShowLength();
}
function laeGwRender(gw, q, modelText) {
  if (!gw || typeof gw !== "object" || typeof gw.direct !== "string" || !gw.direct.trim()) return false;
  if (!Array.isArray(gw.claims)) return false;
  var bad = [], i, c;
  for (i = 0; i < gw.claims.length; i++) {
    c = gw.claims[i];
    if (!c || typeof c.text !== "string" || !c.text.trim()) { gw.claims.splice(i, 1); i--; continue; }
    if (LAE_GW_STATES.indexOf(c.state) === -1) c.state = "supported";
    if (typeof c.evidence !== "string") c.evidence = "";
    if (!c.why) c.why = c.evidence;
    if (c.state === "contradicted") bad.push(c.text.trim());
  }
  laeGwCurrent = { q: q, gw: gw, modelText: modelText,
    length: (typeof laeLengthFor === "function") ? laeLengthFor(q) : "medium",
    isFirst: (typeof laeIsFirstAnswer === "function") ? laeIsFirstAnswer() : false };
  laePending = null;
  laeHideAll();
  if (bad.length > 0) {
    addMessage("ځواب: " + laeGwDirect(), "ai");
    addMessage("د محاسبې تایید ونه شو (" + bad.join(", ") + ") — ځواب وګوره.", "ai");
    return true;
  }
  laeGwRenderLayers();
  if (typeof laeGwRemember === "function") laeGwRemember(gw, q);
  return true;
}
function laeGwRerender(len) {
  if (!laeGwCurrent) return;
  laeGwCurrent.length = len;
  laeGwCurrent.isFirst = false;
  laeHideAll();
  laeGwRenderLayers();
}
