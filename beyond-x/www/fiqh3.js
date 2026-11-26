// Stage 3 Phase 2 — Fiqh (3/3): the fiqh book. The rulings open
// in the ornate book viewer (never plain chat) — topics are the
// book's chapters (باب ...). The disclaimer is the first chapter:
// X PRESENTS rulings, NEVER issues fatwas.
var FIQH_TOPICS = FIQH_TAHARA.concat(FIQH_SALAT);
var FIQH_DISCLAIMER = "دا کتاب د فقهې احکام وړاندې کوي — فتوا نه صادروي. هر حکم له بهشتي زیور (مولانا اشرف علي تهانوي؛ دیوبند) څخه دی؛ له برخې او باب سره. که د کومې نوې مسئلې لپاره فتوا غواړې؛ له مفتی څخه پوښتنه وکړه.";
function fiqhBookText() {
  var t = "باب پېژندنه\n" + FIQH_DISCLAIMER + "\n\n";
  FIQH_TOPICS.forEach(function (tp) {
    t += "باب " + tp.t + "\n";
    tp.rules.forEach(function (r) { t += r.q + "\n" + r.a + "\nحواله: " + r.c + "\n\n"; });
  });
  return t;
}
function fiqhOpen() { var h = document.getElementById("hifzCtl"); if (h) h.style.display = "none"; ornateOpenText("فقه — بهشتي زیور", fiqhBookText(), "book"); showPanel("ornate"); return true; }
