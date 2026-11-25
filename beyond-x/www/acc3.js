// BEYOND X module 106/106: accounts Settings panel (JD17).
// #15, #27, #32, #33, #216 (email; Google OWED), #217. Re-renders
// into its own box after every auth change.
var accBox = null;
function accRender() {
  if (!accBox) return;
  while (accBox.firstChild) accBox.removeChild(accBox.firstChild);
  var head = document.createElement("div");
  head.textContent = "حساب";
  accBox.appendChild(head);
  setText(accBox, "ناسته", accRoleLabel());
  var msg = document.createElement("div");
  accBox.appendChild(msg);
  function say(t) { msg.textContent = t; }
  var u = accUser();
  if (!u) {
    var em = accInputRow(accBox, "برېښنالیک", "email", "you@example.com");
    var pw = accInputRow(accBox, "پټ نوم", "password", "لږ تر لږه ۸ توري");
    var nm = accInputRow(accBox, "نوم", "text", "ستا نوم");
    setBtnRow(accBox, "نوم لیکنه", "حساب جوړ کړه", function () {
      accRegister(em.value, pw.value, nm.value).then(function (r) {
        if (r.ok) { say("حساب جوړ شو — مېلمه خبرې ولېږدېدې"); accRender(); }
        else say(r.error || "نوم لیکنه ونه شوه");
      });
    });
    setBtnRow(accBox, "ننوتل", "ننوتل", function () {
      accLogin(em.value, pw.value).then(function (r) {
        if (r.ok) { say("ننوتل وشو"); accRender(); }
        else say(r.error || "ننوتل ونه شو");
      });
    });
    setBtnRow(accBox, "پټ نوم هېر شوی", "بیا جوړول", function () {
      accRecover(em.value).then(function (r) { say(r.ok ? "لار واستول شوه که حساب وي" : (r.error || "و نه شو")); });
    });
    setText(accBox, "ګوګل ننوتل", "لا نه دی چمتو — د ګوګل پیرودونکي ته اړتیا ده");
    setText(accBox, "مېلمه", "ستا خبرې یوازې ستا په وسیله کې دي");
    return;
  }
  setText(accBox, "برېښنالیک", u.email);
  setText(accBox, "د حساب ډول", accRoleLabel());
  var nm2 = accInputRow(accBox, "نوم", "text", "", u.name || "");
  setBtnRow(accBox, "نوم خوندي کړه", "خوندي کړه", function () {
    accUpdate({ name: nm2.value }).then(function (r) { say(r.ok ? "نوم خوندي شو" : (r.error || "و نه شو")); });
  });
  var av = document.createElement("div");
  av.textContent = "اواتار";
  ACC_AVATARS.forEach(function (a) {
    var b = document.createElement("button");
    b.textContent = a;
    b.style.fontWeight = u.avatar === a ? "700" : "";
    b.addEventListener("click", function () {
      accUpdate({ avatar: a }).then(function (r) { say(r.ok ? "اواتار خوندي شو" : (r.error || "و نه شو")); });
    });
    av.appendChild(b);
  });
  accBox.appendChild(av);
  setText(accBox, "عکس", "د عکس پورته کول لا نه دي چمتو — R2 ته اړتیا ده");
  setText(accBox, "تاریخچه خوندي کول", u.opt_in_history ? "هو" : "نه");
  setBtnRow(accBox, "تاریخچه", u.opt_in_history ? "بند کړه" : "چالان کړه", function () {
    var next = !accUser().opt_in_history;
    accUpdate({ opt_in_history: next }).then(function (r) {
      if (r.ok) { say(next ? "تاریخچه به خوندي شي" : "تاریخچه به نه خوندي کېږي"); accRender(); }
      else say(r.error || "و نه شو");
    });
  });
  accRenderSecurity(accBox, say);
  var np = document.createElement("div");
  accBox.appendChild(np);
  setBtnRow(accBox, "خبرتیاوې", "وګوره", function () {
    accNotifs().then(function (r) {
      if (!r.ok) { say(r.error || "خبرتیاوې و نه شوې"); return; }
      var d = r.data || {};
      var p = d.prefs || { master: true, types: {} };
      np.textContent = (d.notifications || []).map(function (n) { return n.title; }).join(" • ") || "خبرتیا نشه";
      [["master", "ټولې"], ["reminders", "یادونې"], ["updates", "تازه معلومات"], ["system", "سیسټم"]].forEach(function (x) {
        var b = document.createElement("button");
        var on = x[0] === "master" ? p.master : p.types[x[0]] !== false;
        b.textContent = x[1] + ": " + (on ? "چالانې" : "بندې");
        b.addEventListener("click", function () {
          var q = JSON.parse(JSON.stringify(p));
          if (x[0] === "master") q.master = !q.master; else q.types[x[0]] = !q.types[x[0]];
          accNotifPrefs(q).then(function (r2) { say(r2.ok ? "خبرتیاوې بدلې شوې" : (r2.error || "و نه شو")); });
        });
        np.appendChild(b);
      });
      say("خبرتیاوې تازه شوې");
    });
  });
  setText(accBox, "د سرور غوښتنې نن", accCountText());
  setBtnRow(accBox, "وتل", "وتل", function () {
    accLogout().then(function () { say("وتل وشو"); accRender(); });
  });
  accRenderDelete(accBox, say);
  if (accIsAdmin()) accRenderAdmin(accBox, msg);
}
function buildAccountsSettings(prof) {
  if (accBox || !prof) return;
  accBox = document.createElement("div");
  prof.appendChild(accBox);
  accRender();
}
