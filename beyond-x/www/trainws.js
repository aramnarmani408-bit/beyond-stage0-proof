// Stage 12: training workspace — rule-based adaptive practice.
var trainPanelEl = null;
var trainListEl = null;
var trainProgressEl = null;
var trainNextEl = null;
var trainSteps = [];
var trainPos = 0;
var trainTopics = {};
function trainPickNext(topics) {
  var best = null, bestScore = -1;
  for (var k in topics) {
    var t = topics[k];
    var n = t.right + t.wrong;
    var score = n === 0 ? 0.5 : t.wrong / n;
    if (score > bestScore) { best = k; bestScore = score; }
  }
  return best;
}
function trainLevel() {
  var r = 0, w = 0;
  for (var k in trainTopics) { r += trainTopics[k].right; w += trainTopics[k].wrong; }
  var n = r + w;
  if (n === 0 || r / n < 0.5) return "اسانه";
  if (r / n >= 0.8) return "سخت";
  return "منځنی";
}
function trainDoneCount() {
  var n = 0;
  for (var i = 0; i < trainSteps.length; i++) if (trainSteps[i].done) n++;
  return n;
}
function trainMark(idx, ok) {
  var s = trainSteps[idx];
  if (!s) return;
  s.done = ok;
  var topic = s.step.slice(0, 20);
  if (!trainTopics[topic]) trainTopics[topic] = { right: 0, wrong: 0 };
  if (ok) trainTopics[topic].right++; else trainTopics[topic].wrong++;
  trainRender();
}
function trainRender() {
  if (!trainListEl) return;
  wsClear(trainListEl);
  if (trainSteps.length === 0) trainListEl.appendChild(wsEl("div", "لومړی پوښتنه وکړه — تمرین به دلته جوړ شي."));
  for (var i = 0; i < trainSteps.length; i++) {
    (function (idx) {
      var s = trainSteps[idx];
      var row = wsEl("div", "");
      row.appendChild(wsEl("div", (idx === trainPos ? "▶ " : "") + (s.done ? "✓ " : "") + s.step));
      row.appendChild(wsBtn("وشو", function () { trainMark(idx, true); }));
      row.appendChild(wsBtn("ستونزمن", function () { trainMark(idx, false); }));
      trainListEl.appendChild(row);
    })(i);
  }
  if (trainProgressEl) trainProgressEl.textContent = "پرمختګ: " + trainDoneCount() + "/" + trainSteps.length + " — کچه: " + trainLevel();
  var next = trainPickNext(trainTopics);
  if (trainNextEl) trainNextEl.textContent = next ? "راتلونکی تمرین: " + next : "راتلونکی تمرین: نوی موضوع";
}
function buildTrainPanel() {
  if (trainPanelEl) return trainPanelEl;
  var p = wsPanel("trainPanel");
  p.appendChild(wsEl("div", "روزنه"));
  trainListEl = wsEl("div", "");
  p.appendChild(trainListEl);
  trainProgressEl = wsEl("div", "");
  p.appendChild(trainProgressEl);
  trainNextEl = wsEl("div", "");
  p.appendChild(trainNextEl);
  p.appendChild(wsBtn("بل ګام", function () { if (trainPos < trainSteps.length - 1) { trainPos++; trainRender(); } }));
  p.appendChild(wsBtn("ناسته خوندي کړه", function () { universeSave("training", { steps: trainSteps.length, done: trainDoneCount(), at: Date.now() }); showToast("ناسته خوندي شوه"); }));
  trainPanelEl = p;
  trainRender();
  return p;
}
function fillTrainPanel(content) {
  trainSteps = (content && content.steps) || [];
  trainPos = 0;
  trainRender();
}
function showTrainPanel(show) { if (trainPanelEl) trainPanelEl.style.display = show ? "flex" : "none"; }
