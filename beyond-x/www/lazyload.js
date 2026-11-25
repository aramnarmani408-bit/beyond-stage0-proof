// BEYOND X part #208: lazy loader — rarely-used modules load on
// demand instead of at first paint, so the Galaxy A10 first paint
// carries less parser-blocking JS. Deferred groups (8 files, 32,448 B):
//   sectest  (sectest.js + sectest2.js) — security self-test, Settings row tap
//   dbtest   (dbtest.js + dbtest2.js + dbtest3.js) — storage self-test, Settings row tap
//   photows  (photows.js + photows2.js) — profile photo, after login
//   avatar3d (avatar3d.js) — 3D avatar, right after first paint
// design3d stays first-paint: design3dui.js calls d3Supported / d3Init /
// d3Render synchronously with no guards, so no stub can satisfy the
// first 3D tap honestly. The other groups stay first-paint too — they
// install load-time wraps or build first-paint UI (see
// lazyload-assessment.md). Merge: index.html drops the 8 deferred
// <script> tags and gains these two after acc3.js, before init.js;
// MODULES 134 -> 128, init header 134/134 -> 128/128.
var LAZY_GROUPS = {
  sectest: ["sectest.js", "sectest2.js"],
  dbtest: ["dbtest.js", "dbtest2.js", "dbtest3.js"],
  photows: ["photows.js", "photows2.js"],
  avatar3d: ["avatar3d.js"]
};
var LAZY_FILES = ["sectest.js", "sectest2.js", "dbtest.js", "dbtest2.js", "dbtest3.js", "photows.js", "photows2.js", "avatar3d.js"];
var lazyState = {};
var lazyPromises = {};
function lazyIsLoaded(group) { return lazyState[group] === true; }
function lazyLoadFile(file) {
  return new Promise(function (resolve, reject) {
    var s = null;
    try {
      if (typeof document === "undefined" || !document.createElement) { reject(new Error("no-document")); return; }
      s = document.createElement("script");
      s.src = file;
      s.onload = function () { resolve(file); };
      s.onerror = function () { reject(new Error("load-failed " + file)); };
      var parent = document.head || document.body;
      if (!parent || !parent.appendChild) { reject(new Error("no-parent")); return; }
      parent.appendChild(s);
    } catch (e) { reject(e); }
  });
}
function lazyLoad(group) {
  if (lazyState[group] === true) return Promise.resolve(group);
  if (lazyPromises[group]) return lazyPromises[group];
  var files = LAZY_GROUPS[group];
  if (!files) return Promise.reject(new Error("unknown-group " + group));
  var chain = Promise.resolve();
  files.forEach(function (f) { chain = chain.then(function () { return lazyLoadFile(f); }); });
  lazyPromises[group] = chain.then(function () {
    lazyState[group] = true;
    return group;
  }, function (e) {
    delete lazyPromises[group];
    throw e;
  });
  return lazyPromises[group];
}
// --- stubs: names first-paint code already calls, guarded with
// typeof. A stub starts the real load, then hands over to the real
// function — but only if the load actually replaced it (the
// _lazyStub mark), so a load that never defines the function can
// never loop back into the stub.
function photoWsShow() {
  lazyLoad("photows").then(function () {
    if (typeof photoWsShow === "function" && !photoWsShow._lazyStub) photoWsShow();
  }, function () {
    if (typeof showToast === "function") showToast("عکس برخه و نه شوې — بیا هڅه وکړه");
  });
  return false;
}
photoWsShow._lazyStub = true;
function avatar3dInit() {
  lazyLoad("avatar3d").then(function () {
    if (typeof avatar3dInit === "function" && !avatar3dInit._lazyStub && typeof avatarApplyMode === "function") avatarApplyMode();
  }, function () {});
  return false;
}
avatar3dInit._lazyStub = true;
function avatar3dStop() {}
avatar3dStop._lazyStub = true;
function avatar3dSetRate() {}
avatar3dSetRate._lazyStub = true;
