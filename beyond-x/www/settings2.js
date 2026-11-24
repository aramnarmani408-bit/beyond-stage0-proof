// Settings build (parts list §4): the SET store + sections A.
// Every row changes something real; what cannot work is ABSENT
// (named in settings-build-record.md, never a dead row).
var SET_KEY="beyondx-settings-v1";
var setPrefs={ttsVoice:"gul",ttsRate:"1",lowres:"off",lowdata:"off",motion:"on",wsResume:"on",showSources:"on"};
var SET_OPTS={ttsVoice:["gul","lat"],ttsRate:["0.75","1","1.25"],lowres:["on","off"],lowdata:["on","off"],motion:["on","off"],wsResume:["on","off"],showSources:["on","off"]};
function loadSetPrefs(){try{var s=JSON.parse(localStorage.getItem(SET_KEY)||"null");if(!s)return;Object.keys(SET_OPTS).forEach(function(k){if(SET_OPTS[k].indexOf(s[k])!==-1)setPrefs[k]=s[k];});}catch(e){}}
function saveSetPrefs(){try{localStorage.setItem(SET_KEY,JSON.stringify(setPrefs));}catch(e){}}
function setSetPref(k,v){if(!SET_OPTS[k]||SET_OPTS[k].indexOf(v)===-1)return false;setPrefs[k]=v;saveSetPrefs();applySetPrefs();return true;}
function ttsVoiceId(l){if(l==="en")return"en-US-AriaNeural";return setPrefs.ttsVoice==="lat"?"ps-AF-LatifaNeural":"ps-AF-GulNawazNeural";}
function setLowQ(){return setPrefs.lowdata==="on"||setPrefs.lowres==="on";}
function applySetPrefs(){loadSetPrefs();var b=typeof document!=="undefined"?document.body:null;if(b&&b.classList){b.classList.toggle("set-nomotion",setPrefs.motion==="off"||setPrefs.lowres==="on");b.classList.toggle("set-lowres",setPrefs.lowres==="on");}if(setPrefs.lowres==="on"&&typeof avatar3dStop==="function")avatar3dStop();}
applySetPrefs();
// The regenerable caches (chats, prefs, memory, feedback are not caches).
var SET_CACHE_KEYS=["beyondx-images-v1","beyondx-books-v1","beyondx-games-v1","beyondx-language-v1","beyondx-code-v1","beyondx-mobile-v1","beyondx-universe-v1","beyondx-school-v1"];
function settingsCacheSizes(){var t=0,p=[];SET_CACHE_KEYS.forEach(function(k){try{var v=localStorage.getItem(k);if(v){t+=v.length;p.push(k.replace("beyondx-","").replace("-v1","")+" "+Math.round(v.length/1024)+"KB");}}catch(e){}});return{total:t,text:p.length?p.join(" • ")+" • ټول "+Math.round(t/1024)+"KB":"خالي دی"};}
function settingsClearCache(){var n=0;SET_CACHE_KEYS.forEach(function(k){try{if(localStorage.getItem(k)){localStorage.removeItem(k);n++;}}catch(e){}});return n;}
function settingsFeedback(){var u=0,d=0;try{JSON.parse(localStorage.getItem("beyondx-feedback-v1")||"[]").forEach(function(f){if(f.g)u++;else d++;});}catch(e){}return{up:u,down:d,text:u+d===0?"لا نظر نشته":"👍 "+pashtoDigits(u)+" • 👎 "+pashtoDigits(d)};}
function settingsUsageText(){if(typeof gatewayUsage==="undefined"||!gatewayUsage)return"—";return pashtoDigits(gatewayUsage.used_ip||0)+"/۳۰";}
function settingsPerms(){return Promise.all(["microphone","camera","notifications"].map(function(n){return mobilePerm(n);})).then(function(s){var o={microphone:s[0],camera:s[1],notifications:s[2]};["usage-stats","accessibility","screen-capture"].forEach(function(c){o[c]=mobileStatus(c);});return o;});}
var setUsageRow=null;
function settingsRefresh(){if(setUsageRow)setUsageRow.textContent="نننۍ کارونه: "+settingsUsageText();}
var settings2Built=false;
function buildSettings2(prof){
if(settings2Built||!prof)return;settings2Built=true;
setOptRow(prof,"غږیز غږ","ttsVoice",[["gul","ګل نواز"],["lat","لطیفه"]],true);
setOptRow(prof,"د غږ سرعت","ttsRate",[["0.75","ورو"],["1","عادي"],["1.25","ګړندی"]],true);
setConfirmRow(prof,"ټولې خبرې","ټولې ړنګې کړه",function(){AppState.chats=[];AppState.messages=[];AppState.convId="conv-"+Date.now();try{localStorage.removeItem(CHAT_KEY);}catch(e){}if(typeof histPersist==="function")histPersist([],"");var a=document.getElementById("chatArea");if(a)while(a.firstChild)a.removeChild(a.firstChild);renderChatList();renderDemo();showToast("ټولې خبرې ړنګې شوې");});
setText(prof,"اتومات سرلیک","د لومړۍ پوښتنې څخه");
setOptRow(prof,"کارځای بېرته پرانیزه","wsResume",[["on","هو"],["off","نه"]],true);
setBtnRow(prof,"د کارځای ډاټا","پاکه کړه",function(){if(typeof universeClear==="function")universeClear();try{localStorage.removeItem(WS_KEY);}catch(e){}showToast("د کارځای ډاټا پاکه شوه");});
setOptRow(prof,"سرچینې وښیه","showSources",[["on","هو"],["off","نه"]],true);
setText(prof,"ستا ډاټا","یوازې ستا په وسیله کې ده");
setBtnRow(prof,"زما یادونه","ړنګه کړه",function(){if(typeof laeClearMemory==="function")laeClearMemory();showToast("یادونه ړنګه شوه");});
setText(prof,"ناسته","مېلمه");
if(typeof buildSettings3==="function")buildSettings3(prof);
}
