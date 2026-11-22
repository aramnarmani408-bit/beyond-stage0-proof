// L.A.E. Phase 1: Continuity Engine (v1, smallest honest form) — local
// memory: math topics worked on + corrections + answer versions. It lives
// only on this device, is viewable + deletable from the chat, and NEVER
// labels the user weak ("دا موضوع بیا تمرین کړه", never "ته کمزوری یې").
var LAE_MEM_KEY = "beyondx-lae-v1";
var laeMemCache = null;
function laeLoadMemory() {
  if (laeMemCache) return laeMemCache;
  laeMemCache = { topics: {}, corrections: [], versions: [] };
  try {
    if (typeof localStorage === "undefined") return laeMemCache;
    var raw = localStorage.getItem(LAE_MEM_KEY);
    if (raw) {
      var s = JSON.parse(raw);
      if (s) {
        if (s.topics) laeMemCache.topics = s.topics;
        if (Array.isArray(s.corrections)) laeMemCache.corrections = s.corrections;
        if (Array.isArray(s.versions)) laeMemCache.versions = s.versions;
      }
    }
  } catch (e) {}
  return laeMemCache;
}
function laeSaveMemory() {
  try { if (typeof localStorage !== "undefined") localStorage.setItem(LAE_MEM_KEY, JSON.stringify(laeLoadMemory())); } catch (e) {}
}
function laeRemember(obj) {
  var m = laeLoadMemory();
  var t = obj.parsed.topic;
  if (!m.topics[t]) m.topics[t] = { count: 0, last: 0 };
  m.topics[t].count++;
  m.topics[t].last = Date.now();
  var keys = Object.keys(m.topics);
  if (keys.length > 10) {
    var oldest = keys[0];
    for (var i = 1; i < keys.length; i++) if (m.topics[keys[i]].last < m.topics[oldest].last) oldest = keys[i];
    delete m.topics[oldest];
  }
  m.versions.unshift({ q: obj.q.slice(0, 80), result: obj.parsed.result, version: obj.version, at: Date.now() });
  if (m.versions.length > 3) m.versions.length = 3;
  laeSaveMemory();
}
function laeRecordCorrection(q, from, to) {
  var m = laeLoadMemory();
  m.corrections.unshift({ q: q.slice(0, 80), from: from, to: to, at: Date.now() });
  if (m.corrections.length > 5) m.corrections.length = 5;
  laeSaveMemory();
}
function laeClearMemory() {
  laeMemCache = { topics: {}, corrections: [], versions: [] };
  try { if (typeof localStorage !== "undefined") localStorage.removeItem(LAE_MEM_KEY); } catch (e) {}
}
// REQ-ANSWER-007: the first-answer flag — the app knows whether this is
// the user's first answer. Set by ask.js after ANY first answer (math or
// not); read by the Answer Composer. laeResetFirstAnswer is for tests.
var LAE_FIRST_KEY = "beyondx-lae-first-v1";
function laeIsFirstAnswer() {
  try { if (typeof localStorage !== "undefined") return localStorage.getItem(LAE_FIRST_KEY) === null; } catch (e) {}
  return true;
}
function laeMarkAnswered() {
  try { if (typeof localStorage !== "undefined") localStorage.setItem(LAE_FIRST_KEY, "1"); } catch (e) {}
}
function laeResetFirstAnswer() {
  try { if (typeof localStorage !== "undefined") localStorage.removeItem(LAE_FIRST_KEY); } catch (e) {}
}
function laeMemoryText() {
  var m = laeLoadMemory();
  var keys = Object.keys(m.topics);
  if (keys.length === 0 && m.corrections.length === 0) return "لا دې د ریاضي کومه موضوع نه ده کار کړې.";
  var out = "زما یادونه (یوازې ستا په وسیله کې ده):";
  for (var i = 0; i < keys.length; i++) out += "\n- " + keys[i] + ": " + laeFmt(m.topics[keys[i]].count) + " ځله";
  if (m.corrections.length > 0) out += "\nاصلاحونه: " + laeFmt(m.corrections.length);
  out += "\nد ړنګولو لپاره ولیکه: زما یادونه ړنګه کړه";
  return out;
}
// The next step: a deterministic practice question of the same kind,
// derived from the result — the user can ask it and the L.A.E. solves it.
function laeNextStep(obj) {
  var p = obj.parsed;
  var r = Math.floor(p.result);
  var a = (r % 5) + 2, b = (r % 4) + 2, c = (r % 3) + 1;
  if (p.kind === "equation") return laeFmt(a) + "x + " + laeFmt(c) + " = " + laeFmt(a * b + c) + "، د x ارزښت څه دی؟";
  if (p.kind === "geometry") return "یو مستطیل چې اوږدوالی یې " + laeFmt(a + 3) + " او پلنوالی یې " + laeFmt(b + 1) + " دی، مساحت یې څه دی؟";
  if (p.kind === "word" && p.op === "+") return "احمد " + laeFmt(a) + " مڼې لري، " + laeFmt(b) + " نورې یې واخیستې، اوس څو مڼې لري؟";
  if (p.kind === "word") return laeFmt(a + 5) + " " + p.op + " " + laeFmt(b) + " = ؟";
  return laeFmt(a) + " + " + laeFmt(b) + " = ؟";
}
