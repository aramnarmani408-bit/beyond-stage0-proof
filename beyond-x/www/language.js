var langPanel = null, langTrIn = null, langFrom = null, langTo = null,
  langTrOut = null, langGrIn = null, langGrOut = null,
  langWdIn = null, langWdOut = null, langLesson = null, langSecs = [];
var LANGUAGE_BASE = "https://beyond-build-gateway.aramnarmani408.workers.dev/api/v1/x";
function languageEl(tag, text) {
  var el = document.createElement(tag);
  el.textContent = text;
  return el;
}
function languageBtn(text, fn) {
  var b = languageEl("button", text);
  b.addEventListener("click", fn);
  return b;
}
function languageAdd(text, outEl) {
  if (text) outEl.appendChild(languageEl("div", text));
}
function languageClear(outEl) {
  while (outEl.firstChild) outEl.removeChild(outEl.firstChild);
}
function langInput(ph) {
  var e = document.createElement("input");
  e.placeholder = ph;
  e.style.cssText = "background:var(--sf);color:var(--tx);";
  return e;
}
function langSelect(pairs, def) {
  var s = document.createElement("select");
  pairs.forEach(function (p) {
    var o = languageEl("option", p[1]);
    o.value = p[0];
    s.appendChild(o);
  });
  s.value = def;
  return s;
}
function langSection(kids, hide) {
  var s = document.createElement("div");
  if (hide) s.style.display = "none";
  kids.forEach(function (c) { s.appendChild(c); });
  return s;
}
function languageShowTab(i) {
  langSecs.forEach(function (s, j) { s.style.display = i === j ? "flex" : "none"; });
}
function buildLanguagePanel() {
  if (langPanel) return langPanel;
  var panel = document.createElement("div");
  panel.id = "languagePanel";
  panel.style.display = "none";
  panel.style.flex = "1";
  panel.style.flexDirection = "column";
  panel.style.gap = "12px";
  panel.appendChild(languageBtn("← بیرته", function () { showPanel("chat"); }));
  panel.appendChild(languageEl("div", "ژبې"));
  var tabs = document.createElement("div");
  ["وژباړه", "ګرامر", "لغتونه"].forEach(function (t, i) {
    tabs.appendChild(languageBtn(t, function () { languageShowTab(i); }));
  });
  panel.appendChild(tabs);
  langTrIn = langInput("متن ولیکئ...");
  var langs = [["ps", "پښتو"], ["en", "انګلیسي"], ["fa", "فارسي"], ["ar", "عربي"], ["ur", "اردو"]];
  langFrom = langSelect([["auto", "خودکاره"]].concat(langs), "auto");
  langTo = langSelect(langs, "en");
  langTrOut = document.createElement("div");
  langSecs[0] = langSection([langTrIn, langFrom, langTo,
    languageBtn("وژباړه", languageTranslateFromPanel),
    languageBtn("واوره", function () { if (langLastTranslation) voiceSpeak(langLastTranslation, langTo.value); }),
    langTrOut]);
  panel.appendChild(langSecs[0]);
  langGrIn = langInput("جمله ولیکئ...");
  langGrOut = document.createElement("div");
  langSecs[1] = langSection([langGrIn, languageBtn("سمه کړه", languageGrammarFromPanel), langGrOut], true);
  panel.appendChild(langSecs[1]);
  langWdIn = langInput("کلمه ولیکئ...");
  langWdOut = document.createElement("div");
  langSecs[2] = langSection([langWdIn, languageBtn("معنا", languageWordFromPanel), langWdOut], true);
  panel.appendChild(langSecs[2]);
  langLesson = document.createElement("div");
  panel.appendChild(langLesson);
  panel.appendChild(langSection([languageEl("div", "پښتو پېژندل لا کمزوری دی — ازمایښتي دی."),
    languageBtn("په غږ تمرین وکړه", function () {
      if (activateWorkspace("voice", "temporary")) { buildVoicePanel(); showPanel("voice"); }
    })]));
  panel.appendChild(languageEl("div", "معناوې: ویکشنري (CC-BY-SA)"));
  document.getElementById("main").appendChild(panel);
  langPanel = panel;
  languageRenderLesson();
  return panel;
}
function showLanguagePanel(show) {
  if (langPanel) langPanel.style.display = show ? "flex" : "none";
}
function routeLanguage(q) {
  if (activateWorkspace("polyglot", "temporary")) {
    buildLanguagePanel();
    showPanel("language");
    addMessage("د ژبو کارځای دې لپاره جوړ شو — ژبه وژباړه، زده کړه او تمرین وکړه.", "ai");
  }
  var l = languagePromptFrom(q);
  if (l && langTrIn) langTrIn.value = l;
}
