// BEYOND X local profile photo, part 2: UI (parts #15 / #217).
// Builds the photo section inside the profile panel: a preview image,
// the letter-avatar fallback, the file picker, the remove button, and
// the honest server-side note. The photo replaces the a1-a8 letter
// avatar while it is set; removing it reverts to the letter avatar.
// Hook (coordinator, acc3.js accRender, after the avatar row):
//   if (typeof photoWsShow === "function") photoWsShow();
// photoWsApply(el) is the hook for the header avatar image.
function photoWsApply(el) {
  if (!el) return false;
  var url = photoWsGet();
  if (!url) return false;
  el.src = url;
  return true;
}
var photoWsEls = null;
function photoWsBind(box) {
  if (!box) { photoWsEls = null; return; }
  var e = { img: null, lt: null, msg: null };
  var kids = box.children || [];
  var i = 0;
  for (i = 0; i < kids.length; i++) {
    if (kids[i].id === "photoWsImg") e.img = kids[i];
    if (kids[i].id === "photoWsLetter") e.lt = kids[i];
    if (kids[i].id === "photoWsMsg") e.msg = kids[i];
  }
  photoWsEls = e;
}
function photoWsRefresh() {
  var url = photoWsGet();
  var e = photoWsEls;
  if ((!e || !e.img) && typeof document !== "undefined" && document.getElementById) {
    var img2 = document.getElementById("photoWsImg");
    var lt2 = document.getElementById("photoWsLetter");
    if (img2 || lt2) e = { img: img2, lt: lt2, msg: null };
  }
  if (!e || !e.img) return false;
  if (url) { e.img.src = url; e.img.style.display = ""; }
  else { e.img.src = ""; e.img.style.display = "none"; }
  if (e.lt) {
    e.lt.style.display = url ? "none" : "";
    if (!url) {
      var u = null;
      try { if (typeof accUser === "function") u = accUser(); } catch (e2) {}
      e.lt.textContent = (u && u.avatar) ? ("اواتار: " + u.avatar) : "هېڅ عکس نشته";
    }
  }
  return true;
}
function photoWsInit(panel) {
  if (typeof document === "undefined" || !panel) return null;
  var kids = panel.children || [];
  var i = 0;
  for (i = 0; i < kids.length; i++) {
    if (kids[i].id === "photoWsBox") { photoWsBind(kids[i]); photoWsRefresh(); return kids[i]; }
  }
  var box = document.createElement("div");
  box.id = "photoWsBox";
  var t = document.createElement("div");
  t.textContent = "خپل عکس";
  box.appendChild(t);
  var img = document.createElement("img");
  img.id = "photoWsImg";
  img.width = 96;
  img.height = 96;
  img.alt = "عکس";
  img.style.borderRadius = "50%";
  box.appendChild(img);
  var lt = document.createElement("div");
  lt.id = "photoWsLetter";
  box.appendChild(lt);
  var inp = document.createElement("input");
  inp.id = "photoWsInput";
  inp.type = "file";
  inp.accept = "image/*";
  box.appendChild(inp);
  var msg = document.createElement("div");
  msg.id = "photoWsMsg";
  box.appendChild(msg);
  function say(s) { msg.textContent = s; }
  inp.addEventListener("change", function () {
    var f = (inp.files && inp.files[0]) || null;
    photoWsOnFile(f, say);
  });
  var rm = document.createElement("button");
  rm.id = "photoWsRemoveBtn";
  rm.textContent = "عکس ړنګ کړه";
  rm.addEventListener("click", function () {
    photoWsRemove();
    photoWsRefresh();
    say("عکس ړنګ شو — اواتار بېرته راغی");
  });
  box.appendChild(rm);
  var note = document.createElement("div");
  note.textContent = "د سرور عکس لا نه دی چمتو — R2 ته اړتیا ده";
  box.appendChild(note);
  panel.appendChild(box);
  photoWsBind(box);
  photoWsRefresh();
  return box;
}
function photoWsShow() {
  if (typeof document === "undefined") return false;
  var panel = null;
  try { if (typeof accBox !== "undefined" && accBox) panel = accBox; } catch (e) {}
  if (!panel && document.getElementById) panel = document.getElementById("profilePanel");
  if (!panel) return false;
  return !!photoWsInit(panel);
}
