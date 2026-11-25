// Living Answer, Phase 2: the gateway client. Routes eligible questions
// to POST /api/v1/x/living-answer. Rendering + controls in laegw2.js.
var laeGwLast = null;
var LAE_GW_QWORDS = ["ولې", "څنګه", "کله", "چېرته", "څوک", "کوم", "ایا", "د څه لپاره", "څومره"];
var LAE_GW_TOPICS = ["فزیک", "کیمیا", "بیولوژي", "ځمکه", "اسمان", "اوبه", "هوا", "لمر", "تودوخه", "ساینس", "تاریخ", "جغرافیه", "پلازمېنه", "هېواد", "افغانستان", "کابل"];
function laeGwEligible(q) {
  if (!q || typeof q !== "string" || q.length > 500) return false;
  if (typeof laeParseMath === "function" && laeParseMath(q)) return true;
  var s = q, i;
  for (i = 0; i < LAE_GW_QWORDS.length; i++) if (s.indexOf(LAE_GW_QWORDS[i]) !== -1) return true;
  if (/څه (دی|ده|دي|شی)/.test(s)) return true;
  for (i = 0; i < LAE_GW_TOPICS.length; i++) if (s.indexOf(LAE_GW_TOPICS[i]) !== -1) return true;
  return false;
}
async function xLivingAnswer(question, token, correction) {
  var timer = null, ctrl = (typeof AbortController !== "undefined") ? new AbortController() : null;
  chatCtrl = ctrl;
  try {
    var timeout = new Promise(function (resolve, reject) {
      timer = setTimeout(function () { reject(new Error("Timeout")); if (ctrl) ctrl.abort(); }, CHAT_TIMEOUT_MS);
    });
    var body = { message: { text: question }, context: { workspace: "living-answer" } };
    if (correction) body.correction = correction;
    var bodyStr = JSON.stringify(body);
    var resp = await Promise.race([fetch("https://beyond-build-gateway.aramnarmani408.workers.dev/api/v1/x/living-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: bodyStr,
      signal: ctrl ? ctrl.signal : undefined
    }), timeout]);
    if (timer) clearTimeout(timer);
    if (resp.status === 429) throw new Error("RateLimit");
    if (resp.status === 401) throw new Error("Unauthorized");
    if (!resp.ok) throw new Error("Network");
    var data = await resp.json();
    if (typeof dataBudgetAdd === "function") dataBudgetAdd(bodyStr.length + JSON.stringify(data).length);
    if (data && data.usage) gatewayUsage = data.usage;
    if (!data || data.status !== "success" || !data.response || data.response.identity !== "beyondx" || typeof data.response.text !== "string" || data.response.text.length === 0) throw new Error("Bad response");
    return { text: data.response.text, lae: data.response.lae || null };
  } finally {
    chatCtrl = null;
    if (timer) clearTimeout(timer);
  }
}
if (typeof xChat === "function") {
  var laeGwOrigChat = xChat;
  xChat = async function (question, token) {
    if (!laeGwEligible(question)) return laeGwOrigChat(question, token);
    try {
      var r = await xLivingAnswer(question, token);
      if (r && r.lae) laeGwLast = { q: question, lae: r.lae };
      return r.text;
    } catch (e) {
      if (e && e.message === "Bad response") return laeGwOrigChat(question, token);
      throw e;
    }
  };
}
if (typeof laeShow === "function") {
  var laeGwOrigShow = laeShow;
  laeShow = function (q, modelText) {
    if (laeGwLast && laeGwLast.q === q && laeGwLast.lae) {
      var lae = laeGwLast.lae;
      laeGwLast = null;
      if (typeof laeGwRender === "function" && laeGwRender(lae, q, modelText)) return true;
    }
    laeGwLast = null;
    return laeGwOrigShow(q, modelText);
  };
}
// Calculator doing: live inputs; exprs evaluated by laeEval (no eval).
function laeGwCalcBox(box, spec) {
  var values = {}, outEl = wsEl("div", ""), i;
  if (!spec || !Array.isArray(spec.vars) || !Array.isArray(spec.outputs)) { box.appendChild(wsEl("div", "حسابوونکی نشته")); return; }
  for (i = 0; i < spec.vars.length; i++) values[spec.vars[i].key] = spec.vars[i].value;
  function recompute() {
    var p = [];
    for (var j = 0; j < spec.outputs.length; j++) {
      var o = spec.outputs[j], s = o.expr || "", v;
      for (var k in values) s = s.replace(new RegExp("\\b" + k + "\\b", "g"), values[k]);
      v = (typeof laeEval === "function") ? laeEval(s) : null;
      p.push(o.label + ": " + (v === null ? "—" : laeFmt(v)));
    }
    outEl.textContent = p.join(", ");
  }
  for (i = 0; i < spec.vars.length; i++) (function (vv) {
    var r = wsEl("div", ""), inp = document.createElement("input");
    r.appendChild(wsEl("span", vv.label + ": "));
    inp.type = "number"; inp.value = vv.value;
    inp.addEventListener("input", function () { var n = parseFloat(inp.value); if (!isNaN(n)) values[vv.key] = n; recompute(); });
    r.appendChild(inp); box.appendChild(r);
  })(spec.vars[i]);
  box.appendChild(outEl); recompute();
}
