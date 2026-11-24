// Stage 12: design rendering + SVG export (split from designws.js — the
// push limit). The export is a plain string in a textarea.
function designRender() {
  if (!designSvgEl) return;
  wsClear(designSvgEl);
  for (var i = 0; i < designShapes.length; i++) {
    (function (idx) {
      var s = designShapes[idx];
      var el;
      if (s.type === "circle") { el = svgEl("circle"); el.setAttribute("cx", s.x + s.w / 2); el.setAttribute("cy", s.y + s.h / 2); el.setAttribute("r", Math.min(s.w, s.h) / 2); }
      else if (s.type === "line") { el = svgEl("line"); el.setAttribute("x1", s.x); el.setAttribute("y1", s.y); el.setAttribute("x2", s.x + s.w); el.setAttribute("y2", s.y + s.h); el.setAttribute("stroke-width", "3"); }
      else if (s.type === "text") { el = svgEl("text"); el.setAttribute("x", s.x); el.setAttribute("y", s.y + 20); el.textContent = s.text; }
      else { el = svgEl("rect"); el.setAttribute("x", s.x); el.setAttribute("y", s.y); el.setAttribute("width", s.w); el.setAttribute("height", s.h); }
      el.style.fill = s.type === "line" ? "none" : s.color;
      if (s.type === "line" || idx === designSel) el.style.stroke = idx === designSel ? "var(--ac)" : s.color;
      if (s.rot) el.setAttribute("transform", "rotate(" + s.rot + " " + (s.x + s.w / 2) + " " + (s.y + s.h / 2) + ")");
      el.addEventListener("click", function () { designSel = idx; designRender(); });
      designSvgEl.appendChild(el);
    })(i);
  }
  if (typeof d3Render === "function" && typeof d3CanvasEl !== "undefined" && d3CanvasEl && d3CanvasEl.style.display !== "none") d3Render();
}
function designExport() {
  var s = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400">';
  for (var i = 0; i < designShapes.length; i++) {
    var sh = designShapes[i];
    if (sh.type === "rect") s += '<rect x="' + sh.x + '" y="' + sh.y + '" width="' + sh.w + '" height="' + sh.h + '" fill="' + wsResolveColor(sh.color) + '"/>';
    else if (sh.type === "circle") s += '<circle cx="' + (sh.x + sh.w / 2) + '" cy="' + (sh.y + sh.h / 2) + '" r="' + (Math.min(sh.w, sh.h) / 2) + '" fill="' + wsResolveColor(sh.color) + '"/>';
    else if (sh.type === "line") s += '<line x1="' + sh.x + '" y1="' + sh.y + '" x2="' + (sh.x + sh.w) + '" y2="' + (sh.y + sh.h) + '" stroke="' + wsResolveColor(sh.color) + '"/>';
    else if (sh.type === "text") s += '<text x="' + sh.x + '" y="' + (sh.y + 20) + '" fill="' + wsResolveColor(sh.color) + '">' + sh.text + '</text>';
  }
  s += "</svg>";
  if (designExportEl) designExportEl.value = s;
  return s;
}
