// Phase 2: the optional low-poly 3D avatar (JD11). Minimal in-house
// WebGL, no library. Auto-degrades to 2D when WebGL is missing.
// FPS: idle ~12, speaking ~22, off when the page is hidden.
var av3Cv = null, av3Gl = null, av3Pr = null, av3U = null, av3Tm = null, av3A = 0, av3Rate = 80;
function avatar3dAvailable() {
  try { var c = document.createElement("canvas"); return !!(c.getContext("webgl") || c.getContext("experimental-webgl")); }
  catch (e) { return false; }
}
function av3Shader(gl, t, s) {
  var sh = gl.createShader(t);
  gl.shaderSource(sh, s);
  gl.compileShader(sh);
  return sh;
}
function av3Buf(gl, pr, name, data) {
  var b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  var l = gl.getAttribLocation(pr, name);
  gl.enableVertexAttribArray(l);
  gl.vertexAttribPointer(l, 3, gl.FLOAT, false, 0, 0);
}
function avatar3dInit() {
  if (av3Cv) return true;
  if (typeof document === "undefined" || !avatar3dAvailable()) return false;
  var av = document.getElementById("avatar");
  if (!av) return false;
  var cv = document.createElement("canvas");
  cv.id = "avatar3d";
  cv.width = 40; cv.height = 40;
  cv.style.width = "32px"; cv.style.height = "32px";
  if (av.parentNode) av.parentNode.insertBefore(cv, av.nextSibling);
  var gl = cv.getContext("webgl") || cv.getContext("experimental-webgl");
  if (!gl) { if (cv.parentNode) cv.parentNode.removeChild(cv); return false; }
  var vs = av3Shader(gl, gl.VERTEX_SHADER, "attribute vec3 p;attribute vec3 c;uniform float a;varying vec3 v;void main(){float s=sin(a),q=cos(a);v=c;gl_Position=vec4(vec3(q*p.x-s*p.z,p.y,s*p.x+q*p.z),1.0);}");
  var fs = av3Shader(gl, gl.FRAGMENT_SHADER, "precision mediump float;varying vec3 v;void main(){gl_FragColor=vec4(v,1.0);}");
  var pr = gl.createProgram();
  gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { if (cv.parentNode) cv.parentNode.removeChild(cv); return false; }
  gl.useProgram(pr);
  // Tetrahedron: apex + 3 base points, 4 faces, one color per face.
  var P = [0, .8, 0, -.7, -.5, .4, .7, -.5, .4, 0, .8, 0, .7, -.5, .4, 0, -.5, -.7, 0, .8, 0, 0, -.5, -.7, -.7, -.5, .4, -.7, -.5, .4, 0, -.5, -.7, .7, -.5, .4];
  var C = [0, .96, 1, 0, .96, 1, 0, .96, 1, .66, .33, .97, .66, .33, .97, .66, .33, .97, 0, 1, .53, 0, 1, .53, 0, 1, .53, .95, .96, .98, .95, .96, .98, .95, .96, .98];
  av3Buf(gl, pr, "p", P);
  av3Buf(gl, pr, "c", C);
  av3Cv = cv; av3Gl = gl; av3Pr = pr; av3U = gl.getUniformLocation(pr, "a");
  av.style.display = "none";
  avatar3dStart();
  return true;
}
function av3Draw() {
  if (!av3Gl) return;
  var gl = av3Gl;
  av3A += 0.15;
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if (av3U) gl.uniform1f(av3U, av3A);
  gl.drawArrays(gl.TRIANGLES, 0, 12);
}
function avatar3dStart() {
  if (av3Tm || !av3Gl) return;
  av3Tm = setInterval(av3Draw, av3Rate);
}
function avatar3dSetRate(r) {
  av3Rate = r === "speaking" ? 45 : 80;
  if (av3Tm) { clearInterval(av3Tm); av3Tm = null; avatar3dStart(); }
}
function avatar3dStop() {
  if (av3Tm) { clearInterval(av3Tm); av3Tm = null; }
  if (av3Cv) {
    if (av3Cv.parentNode) av3Cv.parentNode.removeChild(av3Cv);
    else if (av3Cv.parent) av3Cv.parent.removeChild(av3Cv);
    av3Cv = null;
  }
  av3Gl = null; av3Pr = null; av3U = null;
  var av = typeof document !== "undefined" ? document.getElementById("avatar") : null;
  if (av) av.style.display = "";
}
if (typeof document !== "undefined" && document.addEventListener) {
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { if (av3Tm) { clearInterval(av3Tm); av3Tm = null; } }
    else avatar3dStart();
  });
}
