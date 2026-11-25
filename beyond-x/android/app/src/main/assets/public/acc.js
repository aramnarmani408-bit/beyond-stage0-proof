// BEYOND X module 104/106: accounts core (JD17, REQ-ACCOUNT-001).
// X's OWN backend (Workers + D1, free) — the FOUNDATION of X's
// independence (REQ-INDEP-001). Server-side role check on EVERY
// protected request; the app never trusts its own role flag.
// 15-min access token + refresh rotation; tokens in localStorage.
// Guest data migrates on registration. Google + photo upload OWED.
var ACCOUNTS_BASE = "https://beyondx-backend.aramnarmani408.workers.dev";
var ACC_KEY = "beyondx-account-v1";
var ACC_COUNT_KEY = "beyondx-be-count-v1";
var ACC_AVATARS = ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8"];
function accGet() { try { return JSON.parse(localStorage.getItem(ACC_KEY) || "null"); } catch (e) { return null; } }
function accSet(a) { try { if (a) localStorage.setItem(ACC_KEY, JSON.stringify(a)); else localStorage.removeItem(ACC_KEY); } catch (e) {} }
function accUser() { var a = accGet(); return a && a.user ? a.user : null; }
function accIsAdmin() { var u = accUser(); return !!(u && u.role === "admin"); }
function accRoleLabel() { var u = accUser(); if (!u) return "مېلمه"; return u.role === "admin" ? "ادمین" : "کارن"; }
function accGuestId() { try { if (typeof sessionToken === "string" && sessionToken) return sessionToken.split(".")[0]; } catch (e) {} return ""; }
function accGuestCounts() { try { var cs = (typeof AppState !== "undefined" && AppState.chats) ? AppState.chats : []; var m = 0; cs.forEach(function (c) { m += (c.messages || []).length; }); return { chats: cs.length, messages: m }; } catch (e) { return { chats: 0, messages: 0 }; } }
function accValidEmail(e) { return typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()); }
function accValidPw(p) { return typeof p === "string" && p.length >= 8 && p.length <= 128; }
function accCount() { try { var s = JSON.parse(localStorage.getItem(ACC_COUNT_KEY) || "null"), d = new Date().toISOString().slice(0, 10); if (!s || s.d !== d) s = { d: d, c: 0 }; s.c++; localStorage.setItem(ACC_COUNT_KEY, JSON.stringify(s)); return s.c; } catch (e) { return 0; } }
function accCountText() { try { var s = JSON.parse(localStorage.getItem(ACC_COUNT_KEY) || "null"); return s ? pashtoDigits(s.c) : "۰"; } catch (e) { return "۰"; } }
// The ONE network call site in these modules (total app fetch is 13).
async function accApi(path, method, body, noRetry) {
  var a = accGet();
  var headers = { "Content-Type": "application/json" };
  if (a && a.access_token) headers.Authorization = "Bearer " + a.access_token;
  var r;
  try { r = await fetch(ACCOUNTS_BASE + path, { method: method || "GET", headers: headers, body: body ? JSON.stringify(body) : undefined }); }
  catch (e) { return { ok: false, status: 0, error: "انټرنیټ نشته یا سرور ته لاسرسی نشته" }; }
  accCount();
  var data = null;
  try { data = await r.json(); } catch (e) {}
  if (r.status === 401 && a && a.refresh_token && !noRetry) {
    var rf = await accApi("/auth/refresh", "POST", { refresh_token: a.refresh_token }, true);
    if (rf.ok && rf.data && rf.data.access_token) {
      accSet({ user: rf.data.user || a.user, access_token: rf.data.access_token, refresh_token: rf.data.refresh_token });
      return accApi(path, method, body, true);
    }
    accSet(null);
    return { ok: false, status: 401, error: "بیا ننوتل اړین دي" };
  }
  if (!r.ok) return { ok: false, status: r.status, error: (data && data.error) || "سرور تېروتنه" };
  return { ok: true, status: r.status, data: data };
}
async function accRegister(email, pw, name) {
  if (!accValidEmail(email)) return { ok: false, error: "سمه برېښنالیک ولیکه" };
  if (!accValidPw(pw)) return { ok: false, error: "پټ نوم باید لږ تر لږه ۸ توري وي" };
  var g = accGuestCounts();
  var r = await accApi("/auth/register", "POST", { email: email.trim().toLowerCase(), password: pw, name: name || "", guest_session_id: accGuestId(), guest_data: g });
  if (r.ok) accSet({ user: r.data.user, access_token: r.data.access_token, refresh_token: r.data.refresh_token });
  return r;
}
async function accLogin(email, pw) {
  if (!accValidEmail(email) || typeof pw !== "string" || !pw) return { ok: false, error: "برېښنالیک او پټ نوم ولیکه" };
  var r = await accApi("/auth/login", "POST", { email: email.trim().toLowerCase(), password: pw });
  if (r.ok) accSet({ user: r.data.user, access_token: r.data.access_token, refresh_token: r.data.refresh_token });
  return r;
}
async function accLogout() {
  var a = accGet();
  if (a && a.refresh_token) { try { await accApi("/auth/logout", "POST", { refresh_token: a.refresh_token }, true); } catch (e) {} }
  accSet(null);
  return { ok: true };
}
