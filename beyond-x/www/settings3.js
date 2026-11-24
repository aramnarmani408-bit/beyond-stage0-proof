// Settings build (parts list §4): sections B (storage, permissions,
// help, sources, data budget, low-resource, feedback).
var settings3Built=false;
function buildSettings3(prof){
if(settings3Built||!prof)return;settings3Built=true;
var sz=setText(prof,"کېش",settingsCacheSizes().text);
setConfirmRow(prof,"کېش","پاک کړه",function(){var n=settingsClearCache();if(sz)sz.textContent="کېش: "+settingsCacheSizes().text;showToast(n+" کېش پاک شو");});
setText(prof,"د تاریخچې حد","۵۰ خبرې × ۵۰ پیغامونه");
setOptRow(prof,"حرکت","motion",[["on","چالان"],["off","بند"]],true);
var pr=setText(prof,"اجازې","…"),nr=setText(prof,"نیټیو اجازې","…");
settingsPerms().then(function(p){pr.textContent="اجازې: مایک "+(p.microphone||"—")+" • کامره "+(p.camera||"—")+" • خبرتیاوې "+(p.notifications||"—");nr.textContent="نیټیو اجازې: کارول "+(p["usage-stats"]||"—")+" • لاسرسی "+(p.accessibility||"—")+" • سکرین "+(p["screen-capture"]||"—");});
setText(prof,"اجازې بدلول","په انډرایډ تنظیماتو کې");
setBtnRow(prof,"مرسته","د موبایل مرسته پرانیزه",function(){if(typeof buildMobilePanel==="function")buildMobilePanel();showPanel("mobile");});
setText(prof,"د سرچینو ترجیح","ویب څېړنه لا فعاله نه ده");
setOptRow(prof,"کم ډاټا","lowdata",[["on","چالان"],["off","بند"]],true);
setUsageRow=setText(prof,"نننۍ کارونه",settingsUsageText());
setOptRow(prof,"کم سرچینې حالت","lowres",[["on","چالان"],["off","بند"]],true);
var fr=setText(prof,"نظرونه",settingsFeedback().text);
setBtnRow(prof,"نظرونه","ړنګ کړه",function(){try{localStorage.removeItem("beyondx-feedback-v1");}catch(e){}if(fr)fr.textContent="نظرونه: "+settingsFeedback().text;showToast("نظرونه ړنګ شول");});
}
