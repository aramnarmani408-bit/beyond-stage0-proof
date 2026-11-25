// Updates (#203 + #213) part 2: notice text, the version check,
// Settings rows, and the runtime hooks (buildSettings3 + checkGateway).
// Part 1 (updates.js) holds the pure logic, storage, migration
// registry and compatibility checks. No new fetch here — the one
// backend /health GET lives in ppUpdateCheck below.
// The checkGateway hook calls ppUpdateCheck EAGERLY, beside the
// gateway call — never in a .then: a .then fires a microtask later,
// and a fetch issued there can land inside a later "no fetch"
// window (proven by the harness §8 identity gate). The backend
// fetch is issued in the same synchronous window as the gateway
// /health fetch, so it is counted with it, never after it.
// First sight of a version is a silent baseline (no notice): only
// a CHANGE from a version the app has already seen is news.
function ppUpdateNoticeText(ver){return "نوې نسخه شته: "+ver+" — د تازه کولو لپاره بیا پرانیزه";}
function ppUpdateFailText(){return "نوې نسخه نه شو کتلای — انټرنیټ وګوره";}
function ppUpdateStatusText(){var r=ppUpdateRecord();var t=r.be||"—";if(r.seenAt){var d=new Date(r.seenAt);t+=" • وروستی کتنه: "+d.getHours()+":"+("0"+d.getMinutes()).slice(-2);}else t+=" • تر اوسه نه ده کتل شوې";return t;}
function ppUpdateStatusUp(){if(ppUpdStatusRow)ppUpdStatusRow.textContent="نسخه: "+ppUpdateStatusText();}
function ppUpdateNoticeUp(ver){if(typeof document==="undefined")return;var prof=document.getElementById("profilePanel");if(!prof)return;if(!ppUpdNoticeRow){ppUpdNoticeRow=bEl("div","ppUpdateRow","");ppUpdNoticeRow.appendChild(bEl("span","ppUpdateRowText",ppUpdateNoticeText(ver)));var b=bEl("button","","بیا پرانیزه");b.addEventListener("click",function(){if(typeof location!=="undefined"&&location.reload)location.reload();});ppUpdNoticeRow.appendChild(b);prof.appendChild(ppUpdNoticeRow);return;}var t=document.getElementById("ppUpdateRowText");if(t)t.textContent=ppUpdateNoticeText(ver);}
async function ppUpdateCheck(force){var now=Date.now();if(!force&&now-ppUpdLastCheck<PP_UPD_MIN_MS)return{ok:false,skipped:true};var live="";try{var resp=await fetch(PP_UPD_BE);var d=await resp.json();if(!resp.ok)throw new Error("status");if(d&&typeof d.version==="string")live=d.version;}catch(e){if(typeof ppErrLogAdd==="function")ppErrLogAdd("gateway",0);if(now-ppUpdLastFailToast>PP_UPD_MIN_MS){ppUpdLastFailToast=now;if(typeof showToast==="function")showToast(ppUpdateFailText());}ppUpdateStatusUp();return{ok:false,error:"fetch"};}ppUpdLastCheck=now;var r=ppUpdateRecord();if(!live){r.seenAt=now;ppUpdateSave(r);ppUpdateStatusUp();return{ok:true,isNew:false,version:""};}var from=r.be;if(!from&&!r.seenAt){r.be=live;r.seenAt=now;ppUpdateSave(r);ppUpdateStatusUp();return{ok:true,isNew:false,version:live,firstSeen:true};}var isNew=ppVersionNew(from,live);if(isNew)ppUpdateMigrate(from,live);else{r.be=live;r.seenAt=now;ppUpdateSave(r);}if(isNew){if(typeof showToast==="function")showToast(ppUpdateNoticeText(live));ppUpdateNoticeUp(live);}ppUpdateStatusUp();return{ok:true,isNew:isNew,version:live};}
function ppUpdateRows(prof){if(!prof)return;ppUpdStatusRow=setText(prof,"نسخه",ppUpdateStatusText());setBtnRow(prof,"نوې نسخه وګوره","اوس وګوره",function(){ppUpdateCheck(true);});setBtnRow(prof,"کېش پاکول + بیا پرانیزه","پاکه کړه + بیا پرانیزه",function(){if(typeof settingsClearCache==="function")settingsClearCache();if(typeof location!=="undefined"&&location.reload)location.reload();});}
if(typeof buildSettings3==="function"){var _upBS3=buildSettings3;buildSettings3=function(prof){_upBS3(prof);ppUpdateRows(prof);};}
if(typeof checkGateway==="function"){var _upCG=checkGateway;checkGateway=function(){ppUpdateCheck(false);return _upCG();};}
