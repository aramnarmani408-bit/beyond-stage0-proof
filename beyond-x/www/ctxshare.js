// Design Phase 2: the context meter + share (REQ-BETTER-001).
// The meter shows how full the chat is and offers a new chat early.
var CONTEXT_MAX = 20000;
var shareAttempted = false;
var ctxWarned = "";
var CTX_CSS = "#ctxWrap{height:3px;background:var(--bd)}#ctxBar{height:100%;background:var(--ac);width:0;transition:width .3s}#ctxLabel{font-size:11px;color:var(--mu);padding:2px 8px}#shareBar,#ctxOffer{border:1px solid var(--bd);border-radius:12px;padding:12px;margin:10px 0;background:var(--sf)}#shareBar button,#ctxOffer button{background:var(--ac);color:#fff;border:0;border-radius:8px;padding:8px 12px;margin:4px 0 0;cursor:pointer}";
if (typeof document !== "undefined" && document.head && !document.getElementById("ctxStyle")) {
  var ctxst = document.createElement("style");
  ctxst.id = "ctxStyle";
  ctxst.textContent = CTX_CSS;
  document.head.appendChild(ctxst);
}
function buildContextMeter() {
  if (typeof document === "undefined") return;
  var p = document.getElementById("chatPanel");
  if (!p || document.getElementById("ctxBar")) return;
  var kids = p.children || [];
  for (var i = 0; i < kids.length; i++) if (kids[i].id === "ctxWrap") return;
  var wrap = document.createElement("div");
  wrap.id = "ctxWrap";
  var bar = document.createElement("div");
  bar.id = "ctxBar";
  wrap.appendChild(bar);
  var lbl = document.createElement("div");
  lbl.id = "ctxLabel";
  var area = document.getElementById("chatArea");
  if (area) {
    p.insertBefore(wrap, area);
    p.insertBefore(lbl, area);
  } else {
    p.appendChild(wrap);
    p.appendChild(lbl);
  }
}
buildContextMeter();
function contextMeter() {
  var used = 0;
  for (var i = 0; i < AppState.messages.length; i++) used += AppState.messages[i].text.length;
  return { used: used, total: CONTEXT_MAX, pct: Math.min(100, Math.round(used / CONTEXT_MAX * 100)), n: AppState.messages.length };
}
function contextUpdate() {
  var m = contextMeter();
  var bar = typeof document !== "undefined" ? document.getElementById("ctxBar") : null;
  if (bar) bar.style.width = m.pct + "%";
  var lbl = typeof document !== "undefined" ? document.getElementById("ctxLabel") : null;
  if (lbl) lbl.textContent = m.n + "/۵۰ • " + m.pct + "٪";
  if (m.n >= 40 && ctxWarned !== AppState.convId) {
    ctxWarned = AppState.convId;
    var area = typeof document !== "undefined" ? document.getElementById("chatArea") : null;
    if (area && !document.getElementById("ctxOffer")) {
      var offer = document.createElement("div");
      offer.id = "ctxOffer";
      var t = document.createElement("div");
      t.textContent = "خبره نږدې ډکه ده — نوې خبره پیل کړې؟";
      offer.appendChild(t);
      var b = document.createElement("button");
      b.textContent = "نوې خبره";
      b.addEventListener("click", function () { newChat(); });
      offer.appendChild(b);
      area.appendChild(offer);
    }
  }
  return m;
}
function shareChat(id) {
  if (typeof document === "undefined") return;
  if (typeof goView === "function") goView("chat");
  var area = document.getElementById("chatArea");
  if (!area || document.getElementById("shareBar")) return;
  var c = (typeof chatById === "function" ? chatById(id || AppState.convId) : null) || { title: "", messages: AppState.messages };
  var bar = document.createElement("div");
  bar.id = "shareBar";
  var q = document.createElement("div");
  q.textContent = "دا خبره" + (c.title ? " «" + c.title + "»" : "") + " شریکه کړم؟ دا به نورو ته ښکاره شي.";
  bar.appendChild(q);
  var yes = document.createElement("button");
  yes.textContent = "هو — شریکه کړه";
  yes.addEventListener("click", function () { shareConfirm(c); });
  bar.appendChild(yes);
  var no = document.createElement("button");
  no.textContent = "نه";
  no.addEventListener("click", function () {
    if (bar.parentNode) bar.parentNode.removeChild(bar);
    else if (bar.parent) bar.parent.removeChild(bar);
  });
  bar.appendChild(no);
  area.appendChild(bar);
}
function shareConfirm(c) {
  shareAttempted = true;
  var bar = typeof document !== "undefined" ? document.getElementById("shareBar") : null;
  if (bar) {
    if (bar.parentNode) bar.parentNode.removeChild(bar);
    else if (bar.parent) bar.parent.removeChild(bar);
  }
  var msgs = (c && c.messages) || AppState.messages;
  var txt = msgs.map(function (m) { return (m.who === "user" ? "زه: " : "BEYOND X: ") + m.text; }).join("\n");
  if (typeof mobileShare === "function") mobileShare("BEYOND X", txt);
  else showToast("شریکول نشته");
}
