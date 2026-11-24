// L.A.E. Phase 1: answer rendering — card, evidence, action, next,
// length control, model text. Only the latest answer has live controls.
var laeCardEl = null, laeEvidenceEl = null, laeActionEl = null, laeNextEl = null, laeLengthEl = null;
function laeRemoveEl(el) {
  if (!el) return;
  var chatArea = document.getElementById("chatArea");
  if (chatArea) { try { chatArea.removeChild(el); } catch (e) {} }
}
function laeHideCard() { laeRemoveEl(laeCardEl); laeCardEl = null; }
function laeHideEvidence() { laeRemoveEl(laeEvidenceEl); laeEvidenceEl = null; }
function laeHideAction() { laeRemoveEl(laeActionEl); laeActionEl = null; }
function laeHideNext() { laeRemoveEl(laeNextEl); laeNextEl = null; }
function laeHideLength() { laeRemoveEl(laeLengthEl); laeLengthEl = null; }
function laeHideAll() { laeHideCard(); laeHideEvidence(); laeHideAction(); laeHideNext(); laeHideLength(); }
function laeShowCard(obj) {
  var chatArea = document.getElementById("chatArea");
  if (!chatArea) return;
  laeHideCard();
  addMessage(laeUnderstandText(obj), "ai");
  var box = wsEl("div", "");
  box.id = "laeCard";
  box.appendChild(wsBtn("سم دی", function () { laeHideCard(); }));
  box.appendChild(wsBtn("سم نه دی", function () {
    laeHideCard();
    laePending = { q: obj.q, obj: obj };
    addMessage("څه سم کړم؟ سمه شمېره ولیکه (لکه «۳ نه، ۴») یا سم عمل (لکه «تفریق») — یا ولیکه «لغوه»." , "ai");
  }));
  chatArea.appendChild(box);
  laeCardEl = box;
}
function laeShowEvidence(obj) {
  var chatArea = document.getElementById("chatArea");
  if (!chatArea) return;
  laeHideEvidence();
  addMessage(laeEvidenceText(obj.claims), "ai");
  // Settings build: sources off hides the Evidence Map (the
  // verification line above is the trust verdict, always shown).
  if (typeof setPrefs !== "undefined" && setPrefs.showSources === "off") return;
  var box = wsEl("div", "");
  box.id = "laeEvidence";
  var mapEl = null;
  box.appendChild(wsBtn("شواهد", function () {
    if (mapEl) { try { box.removeChild(mapEl); } catch (e) {} mapEl = null; return; }
    mapEl = laeEvidenceMap(obj.claims);
    box.appendChild(mapEl);
  }));
  chatArea.appendChild(box);
  laeEvidenceEl = box;
}
function laeShowAction(obj) {
  var sel = laeActionFor(obj.parsed, obj.q);
  if (!sel) return;
  var chatArea = document.getElementById("chatArea");
  if (!chatArea) return;
  laeHideAction();
  var box = wsEl("div", "");
  box.id = "laeAction";
  var name = sel.workspace === "lesson" ? "درس" : sel.workspace === "code" ? "کوډ" : "ډیزاین";
  box.appendChild(wsBtn("کارځای پرانیزه: " + name, function () {
    laeHideAction();
    var art = laeAction(obj);
    if (art) addMessage("کارځای جوړ شو — په کې کار وکړه.", "ai");
  }));
  chatArea.appendChild(box);
  laeActionEl = box;
}
function laeShowNext(obj) {
  var q2 = laeNextStep(obj);
  if (!q2) return;
  addMessage("بل ګام: " + q2, "ai");
  var chatArea = document.getElementById("chatArea");
  if (!chatArea) return;
  laeHideNext();
  var box = wsEl("div", "");
  box.id = "laeNext";
  box.appendChild(wsBtn("دا تمرین وکړه", function () { laeHideNext(); askBeyond(q2); }));
  chatArea.appendChild(box);
  laeNextEl = box;
}
// REQ-ANSWER-006: the length control — the current length is marked.
function laeShowLength(obj) {
  var chatArea = document.getElementById("chatArea");
  if (!chatArea) return;
  laeHideLength();
  var box = wsEl("div", "");
  box.id = "laeLength";
  var cur = obj.dna.length;
  [["short", "لنډ"], ["medium", "منځنی"], ["long", "اوږد"]].forEach(function (p) {
    box.appendChild(wsBtn(p[1] + (p[0] === cur ? " ✓" : ""), function () { laeRerender(p[0]); }));
  });
  chatArea.appendChild(box);
  laeLengthEl = box;
}
// REQ-ANSWER-007: strip a LEADING greeting from the model text — only
// a leading self-introduction (at most two sentences), never content.
function laeStripGreeting(t) {
  var s = t || "";
  for (var k = 0; k < 2; k++) {
    var m = s.match(/^[^.!؟\n]+[.!؟]\s*/);
    if (!m) break;
    var first = m[0];
    var greet = first.indexOf("سلام") === 0 || first.indexOf("دا ډیره ښه پوښتنه ده") !== -1 || first.indexOf("په خوښۍ سره") !== -1 || first.indexOf("خوشحاله یم") !== -1 || (first.indexOf("زه ") === 0 && (first.indexOf("مرستیال") !== -1 || first.indexOf("BEYOND") !== -1 || first.indexOf("بیونډ") !== -1));
    if (!greet) break;
    s = s.slice(first.length);
  }
  return s;
}
function laeShowModelText(obj) {
  var mt = laeStripGreeting(laeStripIdentity(obj.modelText));
  if (mt) addMessage(mt, "ai");
}
