var langLastTranslation;
var LANG_NAMES = { ps: "پښتو", en: "انګلیسي", fa: "فارسي", ar: "عربي", ur: "اردو" };
async function xLanguage(path, token, body) {
  var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
  var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, CHAT_TIMEOUT_MS);
  var resp;
  try {
    resp = await fetch(LANGUAGE_BASE + path, {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl ? ctrl.signal : undefined
    });
  } catch (e) {
    clearTimeout(timer);
    throw new Error(e.name === "AbortError" ? "Timeout" : "Network");
  }
  clearTimeout(timer);
  if (resp.status === 429) throw new Error("RateLimit");
  if (resp.status === 401) { sessionToken = null; sessionExpiry = 0; throw new Error("Unauthorized"); }
  if (!resp.ok) throw new Error("Network");
  var data = await resp.json();
  if (!data || (data.status !== "success" && data.status !== "partial" && data.status !== "failed") || !data.response || data.response.identity !== "beyondx") throw new Error("Bad response");
  return data.response;
}
async function langCall(path, body) {
  var token = await ensureSession();
  try { return await xLanguage(path, token, body); }
  catch (e) { if (e.message !== "Unauthorized") throw e; return xLanguage(path, await ensureSession(), body); }
}
function langOf(text) { var l = detectLanguage(text); return l === "mixed" || l === "unknown" ? "ps" : l; }
function langShow(outEl, lines) { languageClear(outEl); lines.forEach(function (l) { languageAdd(l, outEl); }); }
async function languageTranslate(text, from, to) {
  var f = from === "auto" ? langOf(text) : from;
  var r = await langCall("/language/translate", { text: text, from: f, to: to });
  if (!r.translation) throw new Error("Failed: " + (r.reason || "نامعلومه ستونزه"));
  langLastTranslation = r.translation;
  langShow(langTrOut, from === "auto" ? ["ژبه: " + (LANG_NAMES[f] || f), r.translation] : [r.translation]);
  return r;
}
async function languageGrammar(text, lang) {
  var r = await langCall("/language/grammar", { text: text, lang: lang });
  if (!r.corrected) throw new Error("Failed: " + (r.reason || "نامعلومه ستونزه"));
  langShow(langGrOut, [r.corrected, r.rule, r.explanation]);
  return r;
}
async function languageWord(word, lang) {
  var r = await langCall("/language/word", { word: word, lang: lang });
  if (!r.meaning) throw new Error("Failed: " + (r.reason || "نامعلومه ستونزه"));
  langShow(langWdOut, [r.meaning, r.example, r.example_translation, "سرچینه: " + (r.source || "د ماډل ژباړه")]);
  return r;
}
async function langPanelCall(kind) {
  var cfg = { translate: [langTrIn, langTrOut, "NoText", "ژباړل کېږي..."],
    grammar: [langGrIn, langGrOut, "NoText", "سمول کېږي..."],
    word: [langWdIn, langWdOut, "NoWord", "لټول کېږي..."] }[kind];
  var t = cfg[0].value.trim();
  if (!t) { languagePanelError(new Error(cfg[2]), cfg[1]); return; }
  languageClear(cfg[1]);
  languageAdd(cfg[3], cfg[1]);
  setAction("فکر کوم...");
  try {
    if (kind === "word") await languageWord(t, langOf(t));
    else if (kind === "grammar") await languageGrammar(t, langOf(t));
    else await languageTranslate(t, langFrom.value, langTo.value);
  } catch (e) { languagePanelError(e, cfg[1]); }
  finally { setAction("چمتو یم"); }
}
function languageTranslateFromPanel() { return langPanelCall("translate"); }
function languageGrammarFromPanel() { return langPanelCall("grammar"); }
function languageWordFromPanel() { return langPanelCall("word"); }
function languagePanelError(e, outEl) {
  var o = outEl || langTrOut;
  if (!o) return;
  languageClear(o);
  var m = e.message || "";
  var msgs = { RateLimit: "ډېرې غوښتنې وشوې — لږ وروسته بیا هڅه وکړه", NoText: "لومړی متن ولیکئ.", NoWord: "لومړی کلمه ولیکئ." };
  if (m.indexOf("Failed: ") === 0) languageAdd("کار ونه شو — " + m.slice(8), o);
  else languageAdd(msgs[m] || "انټرنیټ نشته یا ځواب ونه رسېد — بیا هڅه وکړه", o);
}
