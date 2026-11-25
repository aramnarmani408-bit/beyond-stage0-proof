// #174 Course workspace (1/2) — pure logic + store. A course is an
// ordered list of lessons; each lesson = {title, text, steps, done}.
// Built on lessonws.js: cwFromLessonSteps wraps the current single
// lesson (lessonSteps) as lesson 1 of a new course, and cwLessonSteps
// hands a course lesson back to fillLessonPanel. Local-first: one
// localStorage key. No new fetch. The book-to-course parse
// (JD14 Proof 1) is NOT built here — cwSplitLessons only splits an
// answer text on numbered headings; a real book parse is owed.
var CW_KEY = "beyondx-course-v1";
var CW_MAX_LESSONS = 20;
var CW_MAX_COURSES = 5;
var CW_DIGITS = "0123456789۰۱۲۳۴۵۶۷۸۹";
function cwPct(done, total) { if (!total || total <= 0) return 0; var p = Math.round(done * 100 / total); return p < 0 ? 0 : (p > 100 ? 100 : p); }
function cwNewCourse(title) { var t = String(title || "").trim().slice(0, 80) || "نوی کورس"; return { title: t, lessons: [], cur: 0, at: Date.now() }; }
function cwCourseDone(c) { var n = 0; var ls = (c && c.lessons) || []; for (var i = 0; i < ls.length; i++) if (ls[i].done) n++; return n; }
function cwCourseProgress(c) { var ls = (c && c.lessons) || []; var d = cwCourseDone(c); return { done: d, total: ls.length, pct: cwPct(d, ls.length) }; }
function cwNormLesson(title, text) { var t = String(title || "").trim().slice(0, 80) || "درس"; var x = String(text || "").slice(0, 2000); return { title: t, text: x, steps: [{ title: t, text: x }], done: false }; }
function cwAddLesson(c, title, text) { if (!c || !Array.isArray(c.lessons)) return false; if (c.lessons.length >= CW_MAX_LESSONS) return false; var t = String(title || "").trim(); if (!t) return false; c.lessons.push(cwNormLesson(t, text)); return true; }
function cwMarkLesson(c, idx, done) { var ls = (c && c.lessons) || []; if (idx < 0 || idx >= ls.length) return false; ls[idx].done = done !== false; return true; }
function cwNextIdx(c, idx) { var ls = (c && c.lessons) || []; return idx + 1 < ls.length ? idx + 1 : -1; }
function cwPrevIdx(c, idx) { return idx - 1 >= 0 ? idx - 1 : -1; }
function cwLessonSteps(l) { if (!l) return []; if (Array.isArray(l.steps) && l.steps.length) return l.steps; return [{ title: l.title || "درس", text: l.text || "" }]; }
function cwFromLessonSteps(steps, title) { var st = Array.isArray(steps) ? steps : []; if (!st.length) return null; var c = cwNewCourse(title || "د درس کورس"); var f = st[0] || {}; c.lessons.push({ title: f.title || "لومړی درس", text: f.text || "", steps: st.slice(0, CW_MAX_LESSONS), done: false }); return c; }
function cwHeadTitle(ln) { var s = String(ln || "").trim(); var i = 0; while (i < s.length && CW_DIGITS.indexOf(s.charAt(i)) !== -1) i++; if (i > 0 && (s.charAt(i) === "." || s.charAt(i) === ")")) i++; var t = s.slice(i).trim(); return t || "درس"; }
function cwIsHead(ln) { var s = String(ln || "").trim(); if (!s) return false; if (CW_DIGITS.indexOf(s.charAt(0)) === -1) return false; var i = 1; while (i < s.length && CW_DIGITS.indexOf(s.charAt(i)) !== -1) i++; return s.charAt(i) === "." || s.charAt(i) === ")"; }
function cwSplitLessons(text) { if (!String(text || "").trim()) return []; var lines = String(text).split("\n"); var out = []; var cur = null; for (var i = 0; i < lines.length; i++) { var ln = lines[i]; if (cwIsHead(ln)) { if (cur) out.push(cur); cur = cwNormLesson(cwHeadTitle(ln), ""); } else { if (!cur) cur = cwNormLesson("لومړی درس", ""); cur.text += (cur.text ? "\n" : "") + ln; cur.steps[0].text = cur.text; } } if (cur) out.push(cur); return out.slice(0, CW_MAX_LESSONS); }
function cwLoad() { try { if (typeof localStorage === "undefined") return { courses: [], cur: 0 }; var raw = localStorage.getItem(CW_KEY); if (!raw) return { courses: [], cur: 0 }; var s = JSON.parse(raw); if (!s || !Array.isArray(s.courses)) return { courses: [], cur: 0 }; return { courses: s.courses.slice(0, CW_MAX_COURSES), cur: s.cur || 0 }; } catch (e) { return { courses: [], cur: 0 }; } }
function cwSave(state) { try { if (typeof localStorage === "undefined") return false; localStorage.setItem(CW_KEY, JSON.stringify({ courses: (state.courses || []).slice(0, CW_MAX_COURSES), cur: state.cur || 0 })); return true; } catch (e) { return false; } }
function cwCurCourse(state) { var cs = (state && state.courses) || []; if (!cs.length) return null; return cs[Math.min(state.cur || 0, cs.length - 1)]; }
