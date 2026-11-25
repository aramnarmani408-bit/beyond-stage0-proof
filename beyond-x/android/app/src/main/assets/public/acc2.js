// BEYOND X module 105/106: accounts profile + admin (JD17).
// Profile / security / notifications API + Admin dashboard UI.
// Admin calls go through accApi — the SERVER checks the role.
async function accUpdate(patch) { var r = await accApi("/auth/me", "PATCH", patch); if (r.ok && r.data && r.data.user) { var a = accGet(); if (a) accSet({ user: r.data.user, access_token: a.access_token, refresh_token: a.refresh_token }); } return r; }
async function accChangePw(cur, next) {
  if (!accValidPw(next)) return { ok: false, error: "نوی پټ نوم باید لږ تر لږه ۸ توري وي" };
  var r = await accApi("/auth/change-password", "POST", { current_password: cur, new_password: next });
  if (r.ok) accSet({ user: r.data.user, access_token: r.data.access_token, refresh_token: r.data.refresh_token });
  return r;
}
async function accRecover(email) {
  if (!accValidEmail(email)) return { ok: false, error: "سمه برېښنالیک ولیکه" };
  return accApi("/auth/recover", "POST", { email: email.trim().toLowerCase() });
}
async function accDelete(pw) { var r = await accApi("/auth/me", "DELETE", { password: pw }); if (r.ok) accSet(null); return r; }
async function accNotifs() { return accApi("/auth/notifications", "GET"); }
async function accNotifPrefs(p) { return accApi("/auth/notifications/prefs", "PATCH", { prefs: p }); }
function accInputRow(parent, label, type, ph, val) {
  var r = document.createElement("div");
  r.textContent = label;
  var i = document.createElement("input");
  i.type = type; i.placeholder = ph || ""; i.value = val || "";
  r.appendChild(i);
  parent.appendChild(r);
  return i;
}
function accRenderDelete(box, say) {
  var delPw = accInputRow(box, "پټ نوم (ړنګول)", "password", "");
  setConfirmRow(box, "حساب ړنګول", "حساب ړنګ کړه", function () {
    accDelete(delPw.value).then(function (r) {
      if (r.ok) { say("حساب ړنګ شو"); accRender(); }
      else say(r.error || "و نه شو");
    });
  });
}
function accRenderSecurity(box, say) {
  var cur = accInputRow(box, "اوسنی پټ نوم", "password", "");
  var nxt = accInputRow(box, "نوی پټ نوم", "password", "لږ تر لږه ۸ توري");
  setBtnRow(box, "پټ نوم بدلول", "بدل کړه", function () {
    accChangePw(cur.value, nxt.value).then(function (r) { say(r.ok ? "پټ نوم بدل شو — نورې ناستې بندې شوې" : (r.error || "و نه شو")); });
  });
}
// Admin dashboard (#35, #218): users, audit log, pending recoveries,
// broadcast. Visible ONLY when the stored user is an admin — and
// every call is re-checked server-side.
function accRenderAdmin(box, out) {
  var h = document.createElement("div");
  h.textContent = "ادمین — یوازې ارمان";
  box.appendChild(h);
  setBtnRow(box, "شمېرې", "وګوره", function () {
    accApi("/admin/stats", "GET").then(function (r) {
      if (!r.ok) { out.textContent = r.error || "و نه شو"; return; }
      var s = r.data.stats || {};
      out.textContent = "کارنان " + pashtoDigits(s.users || 0) + " • ادمینان " + pashtoDigits(s.admins || 0) + " • ناستې " + pashtoDigits(s.active_sessions || 0) + " • مېلمه لېږدونه " + pashtoDigits(s.guest_migrations || 0) + " • د بیا جوړولو غوښتنې " + pashtoDigits(s.pending_resets || 0);
    });
  });
  setBtnRow(box, "کارنان", "وګوره", function () {
    accApi("/admin/users", "GET").then(function (r) {
      if (!r.ok) { out.textContent = r.error || "و نه شو"; return; }
      out.textContent = "کارنان: " + (r.data.users || []).map(function (x) { return x.email + " (" + x.role + ")"; }).join(" • ");
    });
  });
  setBtnRow(box, "د کړنو تاریخچه", "وګوره", function () {
    accApi("/admin/actions", "GET").then(function (r) {
      if (!r.ok) { out.textContent = r.error || "و نه شو"; return; }
      out.textContent = "کړنې: " + (r.data.actions || []).slice(0, 10).map(function (x) { return x.action + " → " + x.target; }).join(" • ");
    });
  });
  setBtnRow(box, "د بیا جوړولو غوښتنې", "وګوره", function () {
    accApi("/admin/recoveries", "GET").then(function (r) {
      if (!r.ok) { out.textContent = r.error || "و نه شو"; return; }
      var list = (r.data.recoveries || []).map(function (x) { return x.email; }).join(" • ");
      out.textContent = "غوښتنې: " + (list || "نشه");
    });
  });
  var bt = accInputRow(box, "د خبرتیا سرلیک", "text", "");
  var bb = accInputRow(box, "د خبرتیا متن", "text", "");
  setBtnRow(box, "ټولو ته خبرتیا", "واستوه", function () {
    accApi("/admin/notifications", "POST", { type: "updates", title: bt.value, body: bb.value }).then(function (r) { out.textContent = r.ok ? "خبرتیا واستول شوه" : (r.error || "و نه شو"); });
  });
}
