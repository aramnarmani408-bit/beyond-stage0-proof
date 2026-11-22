// Stage 12: 3D preview UI — canvas + drag rotate + zoom (split from
// design3d.js for the push limit). Falls back cleanly, never crashes.
var d3Drag = null;
function d3Move(x, y) {
  if (!d3Drag) return;
  d3RotY += (x - d3Drag.x) / 100;
  d3RotX += (y - d3Drag.y) / 100;
  d3Drag = { x: x, y: y };
  d3Render();
}
function d3Show() {
  if (!d3Supported()) { showToast("3D په دې وسیله نشته"); return false; }
  if (!d3CanvasEl) {
    d3CanvasEl = document.createElement("canvas");
    d3CanvasEl.width = 300;
    d3CanvasEl.height = 400;
    d3CanvasEl.style.background = "#0A0A1F";
    d3CanvasEl.addEventListener("mousedown", function (e) { d3Drag = { x: e.clientX, y: e.clientY }; });
    d3CanvasEl.addEventListener("mousemove", function (e) { d3Move(e.clientX, e.clientY); });
    d3CanvasEl.addEventListener("mouseup", function () { d3Drag = null; });
    d3CanvasEl.addEventListener("touchstart", function (e) { var t = e.touches[0]; d3Drag = { x: t.clientX, y: t.clientY }; });
    d3CanvasEl.addEventListener("touchmove", function (e) { var t = e.touches[0]; d3Move(t.clientX, t.clientY); });
    d3CanvasEl.addEventListener("touchend", function () { d3Drag = null; });
    designPanelEl.appendChild(d3CanvasEl);
    var row = wsEl("div", "");
    row.appendChild(wsBtn("زوم ＋", function () { d3Zoom = Math.min(3, d3Zoom * 1.2); d3Render(); }));
    row.appendChild(wsBtn("زوم －", function () { d3Zoom = Math.max(0.5, d3Zoom / 1.2); d3Render(); }));
    row.appendChild(wsBtn("بند کړه", function () { d3CanvasEl.style.display = "none"; row.style.display = "none"; }));
    designPanelEl.appendChild(row);
    if (!d3Init()) { showToast("3D په دې وسیله نشته"); return false; }
  }
  d3CanvasEl.style.display = "block";
  d3Render();
  return true;
}
