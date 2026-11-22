// Stage 12: X-SPACE core — registry, detection, offer, activation.
// Lazy initialization: no workspace work until the user asks.
var UNIVERSE_TYPES = {
  lesson: { cap: "lesson", panel: "lesson", name: "درس" },
  design: { cap: "design", panel: "design", name: "ډیزاین" },
  training: { cap: "training", panel: "training", name: "روزنه" },
  code: { cap: "codews", panel: "codews", name: "کوډ" },
  decision: { cap: "decision", panel: "decision", name: "پرېکړه" }
};
var UNIVERSE_HINTS = { lesson: "درس ولوله، تمرین وکړه او پرمختګ وګوره", design: "شکلونه جوړ کړه، رنګ یې بدل کړه او ډیاګرام جوړ کړه", training: "ګام په ګام تمرین وکړه او پرمختګ وګوره", code: "کوډ ولیکه، تحلیل یې کړه او خوندي یې کړه", decision: "انتخابونه پرتله کړه، نمرې ورکړه او پرېکړه وکړه" };
function isUniverseCap(cap) {
  return cap === "lesson" || cap === "design" || cap === "training" || cap === "codews" || cap === "decision";
}
function universeDirect(q) {
  if (q.indexOf("درس") !== -1 && (q.indexOf("جوړ") !== -1 || q.indexOf("راکړه") !== -1)) return "lesson";
  if ((q.indexOf("ډیزاین") !== -1 || q.indexOf("ډیاګرام") !== -1) && q.indexOf("جوړ") !== -1) return "design";
  if ((q.indexOf("تمرین") !== -1 || q.indexOf("روزنه") !== -1) && q.indexOf("جوړ") !== -1) return "training";
  if (q.indexOf("کوډ کارځای") !== -1) return "code";
  if (q.indexOf("پرېکړه") !== -1 || q.indexOf("پرتله") !== -1 || q.indexOf("کوم یو غوره") !== -1) return "decision";
  return null;
}
function detectUniverseType(q, answer) {
  var a = answer || "";
  if (a.indexOf(CODE_FENCE) !== -1) return "code";
  var d = universeDirect(q || "");
  if (d) return d;
  var s = { lesson: 0, design: 0, training: 0, decision: 0 };
  if (a.indexOf("ګټې") !== -1 && a.indexOf("زیانونه") !== -1) s.decision += 3;
  if (a.indexOf("لومړی انتخاب") !== -1 || a.indexOf("دوهم انتخاب") !== -1) s.decision += 2;
  if ((a.match(/\n[0-9۰۱۲۳۴۵۶۷۸۹]+\./g) || []).length >= 3) s.lesson += 2;
  if (a.indexOf("مثال") !== -1 || (q || "").indexOf("تشریح") !== -1) s.lesson += 1;
  if (a.indexOf("تمرین") !== -1) s.training += 2;
  if (a.indexOf("ګام په ګام") !== -1) s.training += 1;
  if (a.indexOf("ډیاګرام") !== -1 || a.indexOf("نقشه") !== -1 || a.indexOf("شکل") !== -1) s.design += 2;
  var best = null, bs = 2;
  for (var k in s) if (s[k] >= bs) { best = k; bs = s[k]; }
  return best;
}
function universeRoute(q) {
  var type = universeDirect(q || "");
  if (!type) return false;
  universeActivate(type, "");
  return true;
}
function universeActivate(type, answer) {
  var t = UNIVERSE_TYPES[type];
  if (!t) return false;
  if (!activateWorkspace(t.cap)) return false;
  universeBuild(type);
  universeFill(type, answer || "");
  showPanel(t.panel);
  addMessage("د " + t.name + " کارځای دې لپاره جوړ شو — " + UNIVERSE_HINTS[type] + ".", "ai");
  return true;
}
function universeBuild(type) {
  if (type === "lesson") return buildLessonPanel();
  if (type === "design") return buildDesignPanel();
  if (type === "training") return buildTrainPanel();
  if (type === "code") return buildCodeWsPanel();
  if (type === "decision") return buildDecisionPanel();
  return null;
}
function universeFill(type, answer) {
  var content = genUniverseContent(type, answer);
  if (type === "lesson") fillLessonPanel(content);
  else if (type === "design") fillDesignPanel(content);
  else if (type === "training") fillTrainPanel(content);
  else if (type === "code") fillCodeWsPanel(content);
  else if (type === "decision") fillDecisionPanel(content);
}
function universeResume(cap) {
  if (!isUniverseCap(cap)) return false;
  var type = cap === "codews" ? "code" : cap;
  universeBuild(type);
  showPanel(UNIVERSE_TYPES[type].panel);
  return true;
}
function showUniversePanel(name) {
  showLessonPanel(name === "lesson");
  showDesignPanel(name === "design");
  showTrainPanel(name === "training");
  showCodeWsPanel(name === "codews");
  showDecisionPanel(name === "decision");
}
