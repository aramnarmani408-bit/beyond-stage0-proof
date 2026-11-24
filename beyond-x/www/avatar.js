// Design Phase 2: the avatar + the five real generating states (D12, JD11).
// 2D SVG/CSS is the default; 3D is lazy + auto-degrades (avatar3d.js).
// If the avatar ever harms chat, the avatar simplifies first.
var genState = "idle";
var wowDone = false;
var AVATAR_CSS = "#avatar{transition:transform .3s}#avatar.av-gen{animation:avspin 1s linear infinite}#avatar.av-done{transform:scale(1.15)}@keyframes avspin{to{transform:rotate(360deg)}}#avatar.av-fail{opacity:.5}#avatar.av-pause{opacity:.75}body.av-static #avatar{animation:none!important}body.av-off #avatar{display:none}body.wow header{animation:wowshow 3s ease}@keyframes wowshow{0%{filter:hue-rotate(0deg)}50%{filter:hue-rotate(180deg)}100%{filter:hue-rotate(360deg)}}";
function genStateIs(s) { return genState === s; }
function setGenState(s) {
  if (["idle", "generating", "completed", "failed", "paused"].indexOf(s) === -1) return;
  genState = s;
  var av = typeof document !== "undefined" ? document.getElementById("avatar") : null;
  if (av && av.classList) {
    ["av-gen", "av-done", "av-fail", "av-pause"].forEach(function (c) { av.classList.remove(c); });
    if (s === "generating") av.classList.add("av-gen");
    else if (s === "completed") av.classList.add("av-done");
    else if (s === "failed") av.classList.add("av-fail");
    else if (s === "paused") av.classList.add("av-pause");
  }
  if (typeof avatar3dSetRate === "function") avatar3dSetRate(s === "generating" ? "speaking" : "idle");
  if (s === "completed" && typeof setTimeout !== "undefined") {
    setTimeout(function () { if (genState === "completed") setGenState("idle"); }, 1500);
  }
  if (typeof renderNeon === "function") renderNeon();
}
// The wow (D15 + REQ-ANSWER-007): a one-time color show on the FIRST
// answer only. ask.js calls this before marking the first answer done.
function wowShow() {
  if (typeof laeIsFirstAnswer === "function" && !laeIsFirstAnswer()) return;
  wowDone = true;
  if (typeof document !== "undefined" && document.body && document.body.classList) {
    document.body.classList.add("wow");
    if (typeof setTimeout !== "undefined") {
      setTimeout(function () { document.body.classList.remove("wow"); }, 3000);
    }
  }
  setGenState("completed");
}
function avatarApplyMode() {
  var m = themePrefs.avatar || "auto";
  if ((m === "3d" || m === "auto") && typeof avatar3dInit === "function") avatar3dInit();
  else if (typeof avatar3dStop === "function") avatar3dStop();
}
function buildAvatar() {
  if (typeof document !== "undefined" && document.head && !document.getElementById("avatarStyle")) {
    var st = document.createElement("style");
    st.id = "avatarStyle";
    st.textContent = AVATAR_CSS;
    document.head.appendChild(st);
  }
  var av = typeof document !== "undefined" ? document.getElementById("avatar") : null;
  if (!av || av.dataset.avBuilt) return;
  av.dataset.avBuilt = "1";
  // The moving dot (circles only, like the rest of the avatar).
  var dot = typeof document.createElementNS === "function" ? document.createElementNS("http://www.w3.org/2000/svg", "circle") : document.createElement("circle");
  dot.setAttribute("cx", "32");
  dot.setAttribute("cy", "8");
  dot.setAttribute("r", "3");
  dot.setAttribute("fill", "#00FF88");
  av.appendChild(dot);
  avatarApplyMode();
}
