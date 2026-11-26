// BEYOND X part #208: lazy loader part 2 — Settings rows for the
// deferred self-tests (sectest + dbtest). These wraps live here, not
// in sectest2.js / dbtest2.js, because those files no longer load at
// first paint — but the rows must still appear at first paint, so the
// tap itself is what loads the group. Same row order as before (after
// the log rows): security, then database. Loads after lazyload.js.
// --- Settings rows for the deferred self-tests. These wraps live
// here, not in sectest2.js / dbtest2.js, because those files no
// longer load at first paint — but the rows must still appear at
// first paint, so the tap itself is what loads the group. Same row
// order as before (after the log rows): security, then database.
function lazySecRow(prof) {
  if (!prof || typeof setBtnRow !== "function") return;
  setBtnRow(prof, "امنیت ازموینه", "وګوره", function () {
    lazyLoad("sectest").then(function () {
      if (typeof secTestShow === "function") secTestShow();
    }, function () {
      if (typeof showToast === "function") showToast("امنیت ازموینه و نه شوې — بیا هڅه وکړه");
    });
  });
}
function lazyDbRow(prof) {
  if (!prof || typeof setBtnRow !== "function") return;
  setBtnRow(prof, "ډېټابېس ازموینه", "وګوره", function () {
    lazyLoad("dbtest").then(function () {
      if (typeof dbTestShow === "function") dbTestShow();
    }, function () {
      if (typeof showToast === "function") showToast("ډېټابېس ازموینه و نه شوې — بیا هڅه وکړه");
    });
  });
}
if (typeof ppInfraRows === "function") {
  var _lzPIR = ppInfraRows;
  ppInfraRows = function (prof) { _lzPIR(prof); lazySecRow(prof); lazyDbRow(prof); };
}
// --- stubs: Hifz + Fiqh (Stage 3 Phase 2). Same pattern as
// phys11Open in lazyload.js — the real functions live deferred.
function hifzOpen() {
  lazyLoad("hifz").then(function () {
    if (typeof hifzOpen === "function" && !hifzOpen._lazyStub) hifzOpen();
  }, function () {
    if (typeof showToast === "function") showToast("حفظ برخه و نه شوې — بیا هڅه وکړه");
  });
  return false;
}
hifzOpen._lazyStub = true;
function fiqhOpen() {
  lazyLoad("fiqh").then(function () {
    if (typeof fiqhOpen === "function" && !fiqhOpen._lazyStub) fiqhOpen();
  }, function () {
    if (typeof showToast === "function") showToast("فقه برخه و نه شوې — بیا هڅه وکړه");
  });
  return false;
}
fiqhOpen._lazyStub = true;
