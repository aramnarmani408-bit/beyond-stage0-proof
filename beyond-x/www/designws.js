// Stage 12: design workspace — 2D SVG editor (shapes, layers, undo, export).
var designPanelEl = null;
var designSvgEl = null;
var designExportEl = null;
var designShapes = [];
var designSel = -1;
var designHist = [];
var DESIGN_COLORS = ["#00F5FF", "#A855F7", "#00FF88"];
function svgEl(tag) {
  if (typeof document.createElementNS === "function") return document.createElementNS("http://www.w3.org/2000/svg", tag);
  return document.createElement(tag);
}
function designPush() {
  designHist.push(JSON.stringify(designShapes));
  if (designHist.length > 20) designHist.shift();
}
function designUndo() {
  if (designHist.length === 0) return;
  designShapes = JSON.parse(designHist.pop());
  designSel = -1;
  designRender();
}
function designAdd(type) {
  designPush();
  var n = designShapes.length;
  designShapes.push({ type: type, x: 20 + (n % 4) * 60, y: 20 + Math.floor(n / 4) * 60, w: 80, h: 50, color: DESIGN_COLORS[n % 3], rot: 0, text: type === "text" ? "متن" : "" });
  designSel = designShapes.length - 1;
  designRender();
}
function designEdit(fn) {
  if (designSel < 0 || !designShapes[designSel]) return;
  designPush();
  fn(designShapes[designSel]);
  designRender();
}
function designLayer(d) {
  if (designSel < 0) return;
  var j = designSel + d;
  if (j < 0 || j >= designShapes.length) return;
  designPush();
  var t = designShapes[designSel]; designShapes[designSel] = designShapes[j]; designShapes[j] = t;
  designSel = j;
  designRender();
}
function buildDesignPanel() {
  if (designPanelEl) return designPanelEl;
  var p = wsPanel("designPanel");
  p.appendChild(wsEl("div", "ډیزاین — 2D"));
  var add = wsEl("div", "");
  [["مستطیل", "rect"], ["دایره", "circle"], ["کرښه", "line"], ["متن", "text"]].forEach(function (s) {
    add.appendChild(wsBtn(s[0], function () { designAdd(s[1]); }));
  });
  p.appendChild(add);
  var edit = wsEl("div", "");
  [["↑", 0, -10], ["↓", 0, 10], ["←", -10, 0], ["→", 10, 0]].forEach(function (n) {
    edit.appendChild(wsBtn(n[0], function () { designEdit(function (s) { s.x += n[1]; s.y += n[2]; }); }));
  });
  edit.appendChild(wsBtn("＋", function () { designEdit(function (s) { s.w += 10; s.h += 10; }); }));
  edit.appendChild(wsBtn("－", function () { designEdit(function (s) { s.w = Math.max(10, s.w - 10); s.h = Math.max(10, s.h - 10); }); }));
  edit.appendChild(wsBtn("⟳", function () { designEdit(function (s) { s.rot = (s.rot + 15) % 360; }); }));
  edit.appendChild(wsBtn("رنګ", function () { designEdit(function (s) { s.color = DESIGN_COLORS[(DESIGN_COLORS.indexOf(s.color) + 1) % 3]; }); }));
  p.appendChild(edit);
  var lay = wsEl("div", "");
  lay.appendChild(wsBtn("پورته", function () { designLayer(1); }));
  lay.appendChild(wsBtn("ښکته", function () { designLayer(-1); }));
  lay.appendChild(wsBtn("بیرته", designUndo));
  lay.appendChild(wsBtn("3D مخکتنه", function () { if (typeof d3Show === "function") d3Show(); }));
  lay.appendChild(wsBtn("خوندي کړه", function () { universeSave("design", { shapes: designShapes.length, at: Date.now() }); showToast("ډیزاین خوندي شو"); }));
  lay.appendChild(wsBtn("صادر کړه", designExport));
  p.appendChild(lay);
  designSvgEl = svgEl("svg");
  designSvgEl.setAttribute("width", "300");
  designSvgEl.setAttribute("height", "400");
  designSvgEl.style.background = "var(--cd)";
  p.appendChild(designSvgEl);
  designExportEl = document.createElement("textarea");
  designExportEl.style.width = "100%";
  p.appendChild(designExportEl);
  designPanelEl = p;
  designRender();
  return p;
}
function fillDesignPanel(content) {
  var nodes = (content && content.nodes) || [];
  designShapes = [];
  for (var i = 0; i < nodes.length; i++) {
    designShapes.push({ type: "rect", x: 60, y: 20 + i * 70, w: 180, h: 40, color: DESIGN_COLORS[i % 3], rot: 0, text: "" });
    designShapes.push({ type: "text", x: 70, y: 20 + i * 70, w: 160, h: 20, color: "var(--tx)", rot: 0, text: nodes[i].label });
    if (i > 0) designShapes.push({ type: "line", x: 150, y: 20 + (i - 1) * 70 + 40, w: 0, h: 30, color: "var(--mu)", rot: 0, text: "" });
  }
  designSel = -1;
  designRender();
}
function showDesignPanel(show) { wsShow(designPanelEl, show); }
