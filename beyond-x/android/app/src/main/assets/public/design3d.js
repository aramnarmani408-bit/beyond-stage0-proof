// Stage 12: limited 3D prototype — minimal in-house WebGL renderer.
// The 2D design becomes 3D boxes (one unit cube, scaled per shape).
// Rotation happens in the shader (no matrix library).
var d3CanvasEl = null;
var d3Gl = null;
var d3Prog = null;
var d3RotX = -0.5, d3RotY = 0.6, d3Zoom = 1;
function d3Supported() {
  try {
    var c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch (e) { return false; }
}
function d3Box(s) {
  return { off: [(s.x + s.w / 2 - 150) / 150, -(s.y + s.h / 2 - 200) / 200, 0],
    scl: [Math.max(0.05, s.w / 150), Math.max(0.05, s.h / 200), 0.12], color: s.color || "#00F5FF" };
}
function d3Hex(hex) {
  var n = parseInt((wsResolveColor(hex) || "#00F5FF").slice(1), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}
function d3Shader(gl, type, src) {
  var s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}
function d3Attr(name, off) {
  var a = d3Gl.getAttribLocation(d3Prog, name);
  d3Gl.enableVertexAttribArray(a);
  d3Gl.vertexAttribPointer(a, 3, d3Gl.FLOAT, false, 24, off);
}
function d3Init() {
  var gl = d3CanvasEl.getContext("webgl") || d3CanvasEl.getContext("experimental-webgl");
  if (!gl) return false;
  d3Gl = gl;
  var vs = d3Shader(gl, gl.VERTEX_SHADER, "attribute vec3 p;attribute vec3 n;uniform vec3 off;uniform vec3 scl;uniform float rx;uniform float ry;uniform float zm;varying vec3 N;vec3 rot(vec3 v){float cx=cos(rx),sx=sin(rx),cy=cos(ry),sy=sin(ry);v=vec3(v.x,cx*v.y-sx*v.z,sx*v.y+cx*v.z);return vec3(cy*v.x+sy*v.z,v.y,-sy*v.x+cy*v.z);}void main(){vec3 q=rot(p*scl+off);N=rot(n);gl_Position=vec4(q.x*zm,q.y*zm,q.z,1.0);}");
  var fs = d3Shader(gl, gl.FRAGMENT_SHADER, "precision mediump float;varying vec3 N;uniform vec3 c;void main(){float l=0.6+0.4*max(dot(normalize(N),normalize(vec3(0.5,0.8,0.6))),0.0);gl_FragColor=vec4(c*l,1.0);}");
  d3Prog = gl.createProgram();
  gl.attachShader(d3Prog, vs);
  gl.attachShader(d3Prog, fs);
  gl.linkProgram(d3Prog);
  gl.useProgram(d3Prog);
  gl.enable(gl.DEPTH_TEST);
  var v = [];
  for (var i = 0; i < 8; i++) {
    var cx = i & 1 ? 0.5 : -0.5, cy = i & 2 ? 0.5 : -0.5, cz = i & 4 ? 0.5 : -0.5;
    v.push(cx, cy, cz, cx / 0.866, cy / 0.866, cz / 0.866);
  }
  var vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);
  var ib = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6, 0, 4, 5, 0, 5, 1, 2, 6, 7, 2, 7, 3, 0, 3, 7, 0, 7, 4, 1, 5, 6, 1, 6, 2]), gl.STATIC_DRAW);
  d3Attr("p", 0);
  d3Attr("n", 12);
  return true;
}
function d3Render() {
  if (!d3Gl || !d3Prog) return;
  var gl = d3Gl;
  if (wsThemeDark()) gl.clearColor(0.04, 0.04, 0.12, 1); else gl.clearColor(0.95, 0.95, 0.96, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniform1f(gl.getUniformLocation(d3Prog, "rx"), d3RotX);
  gl.uniform1f(gl.getUniformLocation(d3Prog, "ry"), d3RotY);
  gl.uniform1f(gl.getUniformLocation(d3Prog, "zm"), d3Zoom);
  for (var i = 0; i < designShapes.length; i++) {
    var b = d3Box(designShapes[i]);
    gl.uniform3f(gl.getUniformLocation(d3Prog, "off"), b.off[0], b.off[1], b.off[2]);
    gl.uniform3f(gl.getUniformLocation(d3Prog, "scl"), b.scl[0], b.scl[1], b.scl[2]);
    var c = d3Hex(b.color);
    gl.uniform3f(gl.getUniformLocation(d3Prog, "c"), c[0], c[1], c[2]);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
  }
}
