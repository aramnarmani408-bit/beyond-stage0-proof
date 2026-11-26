// Stage 3 Phase 2 — Fiqh (1/3): tahara rulings (wudhu, ghusl,
// tayammum, masah). Every ruling is verified against the live
// Bahishti Zewar text (archive.org item BahishtiZewar, Islamic
// Bulletin compilation, vols 1-2-3 + 4-5-6-7) 2026-11-26. Each
// ruling carries its citation (book + part + chapter) and the exact
// English anchor phrase it rests on. X presents rulings, never
// issues fatwas. No fetch. Pashto-first.
var FIQH_TAHARA = [
  { t: "وضو", rules: [
    { q: "د وضو فرضونه کوم دي؟",
      a: "د وضو څلور فرض دي: ۱) ټول مخ یو ځل وینځل؛ ۲) دواړه لاسونه تر څنګلو پورې یو ځل وینځل؛ ۳) د سر څلورمه برخه مسح کول یو ځل؛ ۴) دواړه پښې تر بجلکو پورې یو ځل وینځل. که یو فرض هم پاتې شي؛ یا د ویښتانو هومره ځای وچ پاتې شي؛ وضو نه دی شوی.",
      c: "بهشتي زیور — برخه ۱؛ باب وضو",
      e: "There are four fardh acts in wudhu: 1. To wash the entire face once. 2. To wash both hands up to and including the elbows once. 3. To make masah of one-quarter of the head once. 4. To wash both feet up to and including the ankles once." },
    { q: "وضو په څه ماتېږي؟",
      a: "وضو په دې ماتېږي: ۱) غایطه؛ بول او باد تېرېدل؛ ۲) وینه یا د زخم اوبه چې وبهېږي — که وینه د زخم په خوله پاتې شي او ونه بهېږي؛ وضو نه ماتېږي؛ ۳) د خولې ډک قی کول؛ ۴) ژور خوب؛ ۵) بېهوښه کېدل.",
      c: "بهشتي زیور — برخه ۱؛ باب وضو",
      e: "The passing of stool, urine and wind breaks wudhu. If a person vomits out food, water or bile, and it is a mouthful, wudhu will break." }
  ] },
  { t: "غسل او تیمم", rules: [
    { q: "د غسل فرضونه کوم دي؟",
      a: "د غسل درې فرض دي: ۱) خوله په داسې ډول وینځل چې اوبه هر ځای ته ورسېږي؛ ۲) پوزه تر نرم هډوکي پورې وینځل؛ ۳) په ټول بدن اوبه تویول. که د ویښتانو هومره ځای هم وچ پاتې شي؛ غسل نه دی شوی.",
      c: "بهشتي زیور — برخه ۱؛ باب غسل",
      e: "The fardh acts are only three: (a) To gargle the mouth in such a way that water reaches everywhere. (b) To wash the nose up to the soft bone. (c) To pour water over the entire body." },
    { q: "تیمم کله او څنګه کېږي؟",
      a: "تیمم هغه وخت کېږي چې اوبه نه وي یا اوبه ناروغۍ ته زیان ورسوي. که اوبه تر یو میل (شاوخوا ۱.۶ کیلومتره) پورې وي؛ باید راوړل شي؛ که تر دې لرې وي؛ تیمم کافي دی. طریقه: دواړه ورغوي په پاکه ځمکه کېږده او ټول مخ پرې وموښه؛ بیا دویم ځل ورغوي کېږده او دواړه لاسونه تر څنګلو پورې وموښه. په زړه کې نیت ضروري دی — بې نیت تیمم نه کېږي. له تیمم څخه هماغه پاکي حاصلېږي لکه له وضو او غسل څخه.",
      c: "بهشتي زیور — برخه ۱؛ باب تیمم",
      e: "Both palms should be placed on pure ground and the entire face must be wiped with them. Place the palms on the ground for a second time and wipe each hand up to and including the elbows." },
    { q: "پر څرمني موزو مسح څومره وخت کېږي؟",
      a: "مسافر درې ورځې او درې شپې (۷۲ ساعته) مسح کولای شي؛ غیر مسافر یوه ورځ او یوه شپه (۲۴ ساعته). دا وخت له هغه وخته شمېرل کېږي چې وضو مات شي؛ نه له هغه وخته چې موزې واغوستل شي. مسح باید د درېو ګوتو هومره وي — له دې کم مسح نه کېږي. مسح په تلي؛ پوندو او غاړو نه کېږي. هر څه چې وضو ماتوي؛ مسح هم ماتوي؛ موزې ایستل هم مسح ماتوي.",
      c: "بهشتي زیور — برخه ۱؛ باب مسح پر څرمني موزو",
      e: "The person who is on a journey can make masah on the leather socks for a period of three days and three nights (72 hours). As for the one who is not travelling, for him the period is one day and one night (24 hours)." }
  ] }
];
