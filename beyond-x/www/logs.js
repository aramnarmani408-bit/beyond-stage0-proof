// #209 Logging system — one unified log: error / network / workspace /
// database / gateway / generation. PRIVACY: only short kind labels,
// statuses and counts are stored — NEVER tokens, message text, user
// input, file contents, emails or personal data. ppLogOk refuses long
// values, sentences and token-like strings. No network calls here.
var LOG_KEY = "beyondx-logs-v1";
var LOG_CATS = ["error", "network", "workspace", "database", "gateway", "generation"];
var LOG_MAX = 100;
var LOG_LABEL = { error: "تېروتنې", network: "شبکه", workspace: "کارځای", database: "ډېټابېس", gateway: "ګیټوې", generation: "ځواب جوړول" };
var LOG_ROW = {};
function ppLogRead() { try { var l = JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); return Array.isArray(l) ? l : []; } catch (e) { return []; } }
function ppLogWrite(l) { try { localStorage.setItem(LOG_KEY, JSON.stringify(l)); } catch (e) {} }
function ppLogOk(msg) {
  if (typeof msg !== "string") return false;
  var m = msg.trim();
  if (!m || m.length > 120) return false;
  if (/\s/.test(m)) return false;
  if (m.indexOf("@") !== -1 || m.indexOf("://") !== -1 || m.indexOf("=") !== -1) return false;
  if (/[A-Za-z0-9_\-]{32,}/.test(m)) return false;
  if (/api[_-]?key|token|secret|passw|bearer|auth|eyJ|sk-/.test(m.toLowerCase())) return false;
  return true;
}
function ppLog(cat, msg, n) {
  if (LOG_CATS.indexOf(cat) === -1) return false;
  if (!ppLogOk(msg)) return false;
  var l = ppLogRead();
  l.unshift({ t: Date.now(), cat: cat, msg: msg.trim(), n: (typeof n === "number" ? n : 0) });
  if (l.length > LOG_MAX) l.length = LOG_MAX;
  ppLogWrite(l);
  ppLogRefreshRows();
  return true;
}
function ppLogList(cat) {
  if (LOG_CATS.indexOf(cat) === -1) return [];
  return ppLogRead().filter(function (e) { return e.cat === cat; });
}
function ppLogCounts() {
  var c = { error: 0, network: 0, workspace: 0, database: 0, gateway: 0, generation: 0 };
  ppLogRead().forEach(function (e) { if (c[e.cat] !== undefined) c[e.cat]++; });
  return c;
}
function ppLogClear(cat) {
  if (LOG_CATS.indexOf(cat) === -1) return false;
  ppLogWrite(ppLogRead().filter(function (e) { return e.cat !== cat; }));
  ppLogRefreshRows();
  return true;
}
function ppLogClearAll() { try { localStorage.removeItem(LOG_KEY); } catch (e) {} ppLogRefreshRows(); }
function ppLogCountText(cat) {
  var c = ppLogCounts()[cat] || 0;
  if (!c) return "نشته";
  return (typeof pashtoDigits === "function") ? pashtoDigits(c) : String(c);
}
function ppLogText(cat) { return LOG_LABEL[cat] + ": " + ppLogCountText(cat); }
function ppLogSummary() {
  return LOG_CATS.map(function (c) { return LOG_LABEL[c] + " " + ppLogCountText(c); }).join(" • ");
}
function ppLogTime(t) { var d = new Date(t); return d.toISOString().slice(0, 10) + " " + d.toISOString().slice(11, 19); }
function ppLogRowLabel(cat) { return "لاګ: " + LOG_LABEL[cat] + " — " + ppLogCountText(cat); }
function ppLogRefreshRows() {
  for (var i = 0; i < LOG_CATS.length; i++) {
    var r = LOG_ROW[LOG_CATS[i]];
    if (r && r.firstChild && r.firstChild.nodeType === 3) r.firstChild.textContent = ppLogRowLabel(LOG_CATS[i]);
  }
}
function ppLogView(cat) {
  if (LOG_CATS.indexOf(cat) === -1) return;
  var p = document.getElementById("ppLogPanel");
  if (!p) { p = bEl("div", "ppLogPanel", ""); document.body.appendChild(p); }
  while (p.firstChild) p.removeChild(p.firstChild);
  p.appendChild(bEl("div", "", LOG_LABEL[cat] + " — وروستۍ پېښې (" + ppLogCountText(cat) + ")"));
  var list = ppLogList(cat);
  if (!list.length) p.appendChild(bEl("div", "", "هېڅ پېښه نشته"));
  for (var i = 0; i < list.length && i < 20; i++) {
    var e = list[i];
    p.appendChild(bEl("div", "", e.msg + " • " + ppLogTime(e.t) + (e.n ? " • " + e.n : "")));
  }
  var cb = bEl("button", "", "پاک کړه");
  cb.addEventListener("click", function () { ppLogClear(cat); ppLogView(cat); });
  p.appendChild(cb);
  var b = bEl("button", "", "بند");
  b.addEventListener("click", function () { p.style.display = "none"; });
  p.appendChild(b);
  p.style.display = "";
}
function ppLogRows(prof) {
  if (!prof || typeof setBtnRow !== "function") return;
  for (var i = 0; i < LOG_CATS.length; i++) {
    (function (cat) {
      var r = setBtnRow(prof, ppLogRowLabel(cat), "وښایه", function () { ppLogView(cat); });
      var cb = document.createElement("button");
      cb.textContent = "پاک کړه";
      cb.addEventListener("click", function () { ppLogClear(cat); showToast("لاګ پاک شو"); });
      r.appendChild(cb);
      LOG_ROW[cat] = r;
    })(LOG_CATS[i]);
  }
}
