// Settings build (parts list §4): sections B (storage, permissions,
// help, sources, data budget, low-resource, feedback).
var settings3Built=false;
function buildSettings3(prof){
if(settings3Built||!prof)return;settings3Built=true;
var sz=setText(prof,"کېش",settingsCacheSizes().text);
setConfirmRow(prof,"کېش","پاک کړه",function(){var b=settingsCacheSizes().total;var n=settingsClearCache();if(sz)sz.textContent="کېش: "+settingsCacheSizes().text;showToast(n+" کېش پاک شو ("+Math.round(b/1024)+"KB خلاص شو)");});
setText(prof,"د تاریخچې حد","۵۰ خبرې × ۵۰ پیغامونه");
var hs=setText(prof,"تاریخچه ذخیره","…");
function histRowsUp(){if(typeof histStatus==="function")histStatus().then(function(s){if(!s.mode){setTimeout(histRowsUp,100);return;}hs.textContent="تاریخچه ذخیره: "+(s.mode==="sqlite"?"SQLite":"لنډمهاله")+" • "+s.chats+" خبرې • "+s.messages+" پیغامونه • "+Math.round(s.used/1024)+"KB";});if(typeof histQuota==="function")histQuota().then(function(q){qs.textContent="ذخیره اندازه: "+Math.round(q.used/1024)+"KB / "+Math.round(q.quota/1024)+"KB"+(q.over?" — ډک شوی":"");});}
setBtnRow(prof,"صادرول","ټولې خبرې TXT",function(){if(typeof histExportAllText==="function")histDownload("beyondx-all.txt",histExportAllText("txt"));});
setBtnRow(prof,"صادرول","ټولې خبرې JSON",function(){if(typeof histExportAllText==="function")histDownload("beyondx-all.json",histExportAllText("json"));});
setBtnRow(prof,"را واردول","JSON فایل غوره کړه",function(){if(typeof histImportPick==="function")histImportPick();});
var qs=setText(prof,"ذخیره اندازه","…");
setBtnRow(prof,"ذخیره پاکول","آرشیف شوي ړنګ کړه",function(){if(typeof histCleanup==="function")histCleanup().then(function(n){showToast(n+" آرشیف شوي خبرې ړنګې شوې");});});
setBtnRow(prof,"تاریخچه ترمیم","وګوره + ترمیم کړه",function(){if(typeof histRecover==="function")histRecover().then(function(r){showToast(r.ok?(r.restored?"له بیک اپ څخه بېرته راغله":"تاریخچه سمه ده"):":ترمیم ونه شو");});});
var ms=setText(prof,"حافظه","…");
function memRowsUp(){if(!histMode){setTimeout(memRowsUp,100);return;}if(typeof memQuota==="function")memQuota().then(function(q){ms.textContent="حافظه: "+q.count+" یادونه • "+Math.round(q.used/1024)+"KB / "+Math.round(q.quota/1024)+"KB"+(q.over?" — ډک شوی":"");});}
setBtnRow(prof,"حافظه","وګوره / سم کړه",function(){if(typeof memToggleList==="function")memToggleList(prof);});
setConfirmRow(prof,"حافظه","ټولې یادونه ړنګ کړه",function(){if(typeof memDeleteAll==="function")memDeleteAll().then(function(n){showToast(n+" یادونه ړنګې شوې");memRowsUp();});});
setOptRow(prof,"حرکت","motion",[["on","چالان"],["off","بند"]],true);
setOptRow(prof,"لوړ کانټراسټ","contrast",[["off","بند"],["on","چالان"]]);
var pr=setText(prof,"اجازې","…"),nr=setText(prof,"نیټیو اجازې","…");
settingsPerms().then(function(p){pr.textContent="اجازې: مایک "+(p.microphone||"—")+" • کامره "+(p.camera||"—")+" • خبرتیاوې "+(p.notifications||"—");nr.textContent="نیټیو اجازې: کارول "+(p["usage-stats"]||"—")+" • لاسرسی "+(p.accessibility||"—")+" • سکرین "+(p["screen-capture"]||"—");});
setText(prof,"اجازې بدلول","په انډرایډ تنظیماتو کې");
setBtnRow(prof,"مرسته","د موبایل مرسته پرانیزه",function(){if(typeof buildMobilePanel==="function")buildMobilePanel();showPanel("mobile");});
setText(prof,"د سرچینو ترجیح","ویب څېړنه لا فعاله نه ده");
setOptRow(prof,"کم ډاټا","lowdata",[["on","چالان"],["off","بند"]],true);
setText(prof,"محرمیت","خبرې ستا په تلیفون کې خوندي کېږي؛ ګیټ وې ته یوازې ستا پوښتنه ځي؛ انځورونه په سرور کې نه خوندي کېږي؛ غږیز ثبت ستا په خوښه دی.");
var vs=setText(prof,"پښتو غږ","…");
function ppVoiceStatusUp(){var has=false;try{if(typeof speechSynthesis!=="undefined"){var v2=speechSynthesis.getVoices()||[];for(var i=0;i<v2.length;i++){if((v2[i].lang||"").toLowerCase().indexOf("ps")===0){has=true;break;}}}}catch(e){}vs.textContent="پښتو غږ: "+(has?"د وسیلې پښتو غږ شته":"د وسیلې پښتو غږ نشته — د ګیټ وې له لارې پښتو غږ (Edge TTS) شته");}ppVoiceStatusUp();
if(typeof buildInfraSettings==="function")buildInfraSettings(prof);
setUsageRow=setText(prof,"نننۍ کارونه",settingsUsageText());
setOptRow(prof,"کم سرچینې حالت","lowres",[["on","چالان"],["off","بند"]],true);
var fr=setText(prof,"نظرونه",settingsFeedback().text);
setBtnRow(prof,"نظرونه","ړنګ کړه",function(){try{localStorage.removeItem("beyondx-feedback-v1");}catch(e){}if(fr)fr.textContent="نظرونه: "+settingsFeedback().text;showToast("نظرونه ړنګ شول");});
histRowsUp();
memRowsUp();
}
