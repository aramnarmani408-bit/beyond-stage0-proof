// Stage 3 Phase 2 — Hifz (1/2): state, storage, revision schedule.
// Surah list: 17 short surahs students memorize first (Al-Fatiha +
// Juz 30: 99-114). Ayah counts verified live from AlQuran Cloud
// /v1/surah 2026-11-26 (114 surahs). No Quran TEXT is stored here —
// ayahs are fetched live from the gateway at runtime (hifz2.js),
// byte-identical Uthmani from AlQuran Cloud. No fetch. Local-first.
var HIFZ_KEY = "beyondx-hifz-v1";
var HIFZ_STEPS = [1, 3, 7, 14, 30, 90];
var HIFZ_SURAHS = [
  { n: 1, p: "الفاتحه", c: 7 },
  { n: 99, p: "الزلزله", c: 8 },
  { n: 100, p: "العادیات", c: 11 },
  { n: 101, p: "القارعه", c: 11 },
  { n: 102, p: "التکاثر", c: 8 },
  { n: 103, p: "العصر", c: 3 },
  { n: 104, p: "الهمزه", c: 9 },
  { n: 105, p: "الفیل", c: 5 },
  { n: 106, p: "قریش", c: 4 },
  { n: 107, p: "الماعون", c: 7 },
  { n: 108, p: "الکوثر", c: 3 },
  { n: 109, p: "الکافرون", c: 6 },
  { n: 110, p: "النصر", c: 3 },
  { n: 111, p: "المسد", c: 5 },
  { n: 112, p: "الاخلاص", c: 4 },
  { n: 113, p: "الفلق", c: 5 },
  { n: 114, p: "الناس", c: 6 }
];
function hifzRef(s, a) { return s + ":" + a; }
function hifzSurah(n) { for (var i = 0; i < HIFZ_SURAHS.length; i++) if (HIFZ_SURAHS[i].n === n) return HIFZ_SURAHS[i]; return null; }
function hifzNew() { return { m: {} }; }
function hifzLoad() { try { var s = JSON.parse(localStorage.getItem(HIFZ_KEY) || "null"); if (s && typeof s.m === "object") return s; } catch (e) {} return hifzNew(); }
function hifzSave(st) { try { localStorage.setItem(HIFZ_KEY, JSON.stringify(st)); } catch (e) {} }
function hifzMark(st, ref, now) { st.m[ref] = { d: now + 86400000, r: 1, l: now }; hifzSave(st); return st.m[ref]; }
function hifzRevise(st, ref, now) { var e = st.m[ref]; if (!e) return null; var i = Math.min(e.r, HIFZ_STEPS.length - 1); e.d = now + HIFZ_STEPS[i] * 86400000; e.r = e.r + 1; hifzSave(st); return e; }
function hifzDue(st, now) { var out = []; for (var k in st.m) if (st.m[k].d <= now) out.push(k); out.sort(function (a, b) { var pa = a.split(":"), pb = b.split(":"); return (+pa[0] - +pb[0]) || (+pa[1] - +pb[1]); }); return out; }
function hifzProgress(st, n) { var su = hifzSurah(n); if (!su) return { done: 0, total: 0 }; var done = 0; for (var a = 1; a <= su.c; a++) if (st.m[n + ":" + a]) done++; return { done: done, total: su.c }; }
function hifzTotal(st) { var done = 0; for (var k in st.m) done++; return { done: done, due: hifzDue(st, Date.now()).length }; }
