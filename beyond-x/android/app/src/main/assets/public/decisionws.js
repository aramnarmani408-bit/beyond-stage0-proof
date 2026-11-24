// Stage 12: decision workspace — matrix, weighted scoring, scenarios, risks.
var decisionPanelEl = null;
var decisionTableEl = null;
var decisionResultEl = null;
var decisionOptions = [];
var decisionRisks = [];
var decisionWeights = { "لګښت": 3, "وخت": 3, "کیفیت": 3 };
var decisionScenario = "expected";
var DECISION_SCEN_NAMES = { best: "غوره", expected: "تمه شوی", worst: "بدترین" };
function decisionStepper(label, value, fn) {
  var row = wsEl("div", "");
  row.appendChild(wsEl("span", label + ": " + value));
  row.appendChild(wsBtn("＋", function () { fn(1); }));
  row.appendChild(wsBtn("－", function () { fn(-1); }));
  return row;
}
function decisionRender() {
  if (!decisionTableEl) return;
  wsClear(decisionTableEl);
  if (decisionOptions.length === 0) decisionTableEl.appendChild(wsEl("div", "لومړی پوښتنه وکړه — انتخابونه به دلته راشي."));
  for (var i = 0; i < decisionOptions.length; i++) {
    (function (idx) {
      var o = decisionOptions[idx];
      var box = wsEl("div", "");
      box.appendChild(wsEl("div", o.name));
      box.appendChild(wsEl("div", "ګټې: " + (o.pros || []).join(", ")));
      box.appendChild(wsEl("div", "زیانونه: " + (o.cons || []).join(", ")));
      if (!o.ratings) o.ratings = {};
      for (var c in decisionWeights) {
        (function (crit) {
          box.appendChild(decisionStepper(crit, o.ratings[crit] || 3, function (d) {
            o.ratings[crit] = Math.max(1, Math.min(5, (o.ratings[crit] || 3) + d));
            decisionRender();
          }));
        })(c);
      }
      decisionTableEl.appendChild(box);
    })(i);
  }
  var risks = decisionRisks.slice().sort(function (a, b) { return b.sev - a.sev; });
  var riskBox = wsEl("div", "");
  riskBox.appendChild(wsEl("div", "خطرونه (تر ټولو لوړ لومړی):"));
  for (var j = 0; j < risks.length; j++) {
    (function (r) {
      riskBox.appendChild(decisionStepper(r.text, r.sev, function (d) {
        r.sev = Math.max(1, Math.min(5, r.sev + d));
        decisionRender();
      }));
    })(risks[j]);
  }
  decisionTableEl.appendChild(riskBox);
  var scores = decisionScore(decisionOptions, decisionWeights, decisionScenario);
  if (decisionResultEl) {
    wsClear(decisionResultEl);
    decisionResultEl.appendChild(wsEl("div", "سناریو: " + DECISION_SCEN_NAMES[decisionScenario]));
    for (var k = 0; k < scores.length; k++) decisionResultEl.appendChild(wsEl("div", (k + 1) + ". " + scores[k].name + " — " + scores[k].score));
    if (scores.length > 0) decisionResultEl.appendChild(wsBtn("پرېکړه: " + scores[0].name, function () {
      universeSave("decision", { choice: scores[0].name, score: scores[0].score, at: Date.now() });
      showToast("پرېکړه خوندي شوه: " + scores[0].name);
    }));
  }
}
function buildDecisionPanel() {
  if (decisionPanelEl) return decisionPanelEl;
  var p = wsPanel("decisionPanel");
  p.appendChild(wsEl("div", "پرېکړه"));
  var weights = wsEl("div", "");
  for (var c in decisionWeights) {
    (function (crit) {
      weights.appendChild(decisionStepper("وزن — " + crit, decisionWeights[crit], function (d) {
        decisionWeights[crit] = Math.max(1, Math.min(5, decisionWeights[crit] + d));
        decisionRender();
      }));
    })(c);
  }
  p.appendChild(weights);
  var scen = wsEl("div", "");
  ["best", "expected", "worst"].forEach(function (s) {
    scen.appendChild(wsBtn(DECISION_SCEN_NAMES[s], function () { decisionScenario = s; decisionRender(); }));
  });
  p.appendChild(scen);
  decisionTableEl = wsEl("div", "");
  p.appendChild(decisionTableEl);
  decisionResultEl = wsEl("div", "");
  p.appendChild(decisionResultEl);
  decisionPanelEl = p;
  decisionRender();
  return p;
}
function fillDecisionPanel(content) {
  decisionOptions = (content && content.options) || [];
  decisionRisks = [];
  for (var i = 0; i < decisionOptions.length; i++) {
    var cons = decisionOptions[i].cons || [];
    for (var j = 0; j < cons.length; j++) decisionRisks.push({ text: cons[j], sev: 3 });
  }
  decisionRender();
}
function showDecisionPanel(show) { wsShow(decisionPanelEl, show); }
