// Partial parts (item 5) — offline: #158 Offline queue UI (the
// queued questions are listed, each deletable, with a clear-all),
// #160 Offline answers (a local cache of past answers — when
// offline and the question was answered before, the cached answer
// is shown, labelled cached; otherwise a clear message that general
// questions need the network), #161 Offline sync (the flush
// dedupes: a queued question already answered is skipped, with a
// sync status), #212 Slow network (a slow connection is detected
// and low-data mode is offered).
var PP_OFF_CACHE_KEY="beyondx-pp-offcache-v1";
// --- #158 Offline queue UI ---
function ppQueuePanel(){var p=document.getElementById("ppQueuePanel");if(p)return p;var d=wsPanel("ppQueuePanel");d.appendChild(wsEl("div","په تمه پوښتنې"));var list=wsEl("div","");list.id="ppQueueList";d.appendChild(list);d.appendChild(wsBtn("ټولې ړنګې کړې",function(){if(typeof offQueueSave==="function")offQueueSave([]);ppQueueRender();}));return d;}
function ppQueueRender(){var p=ppQueuePanel();var list=document.getElementById("ppQueueList");if(!list)return;wsClear(list);var q=typeof offQueueLoad==="function"?offQueueLoad():[];if(!q.length){list.appendChild(wsEl("div","هېڅ په تمه پوښتنه نشته."));return;}for(var i=0;i<q.length;i++){var row=wsEl("div","");row.textContent=q[i].q||"";var x=wsBtn("✕",function(it){return function(){var l=offQueueLoad().filter(function(e){return e!==it;});offQueueSave(l);ppQueueRender();};}(q[i]));row.appendChild(x);list.appendChild(row);}}
function ppShowQueue(show){var p=document.getElementById("ppQueuePanel");if(!p){if(show){ppQueuePanel();ppQueueRender();}return;}if(show)ppQueueRender();wsShow(p,show);}
function ppOpenQueue(){ppQueuePanel();ppQueueRender();showPanel("queue");}
function ppAddQueueBtn(){var a=document.getElementById("inputArea");if(!a||document.getElementById("ppQueueBtn"))return;var b=bEl("button","","⏳");b.id="ppQueueBtn";b.addEventListener("click",ppOpenQueue);a.appendChild(b);}
function ppQueueBtnUp(){var b=document.getElementById("ppQueueBtn");if(!b)return;var n=typeof offQueueCount==="function"?offQueueCount():0;b.textContent=n?"⏳ "+n:"⏳";}
if(typeof showPanel==="function"){var _p2SP=showPanel;showPanel=function(n){_p2SP(n);ppShowQueue(n==="queue");};}
if(typeof buildChatButtons==="function"){var _p2BCB=buildChatButtons;buildChatButtons=function(){_p2BCB();ppAddQueueBtn();ppQueueBtnUp();};}
if(typeof offUpdate==="function"){var _p2OU=offUpdate;offUpdate=function(){_p2OU();ppQueueBtnUp();};}
// --- #160 Offline answers: a local cache of past answers ---
function ppOffCacheGet(q){try{var s=JSON.parse(localStorage.getItem(PP_OFF_CACHE_KEY)||"null");if(!s)return null;return s[q]||null;}catch(e){return null;}}
function ppOffCachePut(q,a){try{var s=JSON.parse(localStorage.getItem(PP_OFF_CACHE_KEY)||"null")||{};s[q]=a;var ks=Object.keys(s);if(ks.length>50)delete s[ks[0]];localStorage.setItem(PP_OFF_CACHE_KEY,JSON.stringify(s));}catch(e){}}
if(typeof addMessage==="function"){var _p2AM=addMessage;addMessage=function(t,w){_p2AM(t,w);if(w==="ai"&&typeof AppState!=="undefined"&&AppState.lastQuestion&&t&&t.length>10&&!ppOffCacheGet(AppState.lastQuestion))ppOffCachePut(AppState.lastQuestion,t);};}
if(typeof offLocalAnswer==="function"){var _p2OLA=offLocalAnswer;offLocalAnswer=function(q){var c=ppOffCacheGet(q);if(c){addMessage(c+" (خوندي شوی ځواب — آفلاین)","ai");return true;}return _p2OLA(q);};}
// --- #161 Offline sync: dedupe on push + skip answered on flush ---
if(typeof offQueuePush==="function"){var _p2OQP=offQueuePush;offQueuePush=function(q){var l=offQueueLoad();for(var i=0;i<l.length;i++)if(l[i].q===q){showToast("دا پوښتنه مخکې ساتل شوې");return false;}return _p2OQP(q);};}
if(typeof offFlush==="function"){var _p2OF=offFlush;offFlush=function(){var l=offQueueLoad(),kept=[],skipped=0;for(var i=0;i<l.length;i++){if(ppOffCacheGet(l[i].q))skipped++;else kept.push(l[i]);}if(skipped){offQueueSave(kept);showToast(skipped+" ساتل شوې پوښتنې مخکې ځواب شوې — تېرې شوې");}return _p2OF();};}
// --- #212 Slow network ---
function ppSlowNet(){var slow=false;try{if(navigator.connection&&navigator.connection.effectiveType&&(navigator.connection.effectiveType==="2g"||navigator.connection.effectiveType==="slow-2g"))slow=true;}catch(e){}if(slow){showToast("انټرنیټ ورو دی — د ټیټ ډاټا حالت چالان شو");if(typeof setLowQ==="function")setLowQ(true);}return slow;}
if(typeof document!=="undefined"&&document.addEventListener)document.addEventListener("visibilitychange",function(){if(!document.hidden)ppSlowNet();});
ppSlowNet();
