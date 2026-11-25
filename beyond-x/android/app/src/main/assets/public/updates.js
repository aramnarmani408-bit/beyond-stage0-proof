// Updates (#203 + #213): new-version detection, notice, failure,
// migration, compatibility, recovery. The app bundle changes only
// on a rebuild, so "a new version" means the BACKEND changed:
// GET beyondx-backend /health returns {version:"1.0.0"} (verified
// live 2026-11-25). The gateway /health publishes NO version
// ({ok,service,time} only; /api/v1/x/health and /version are 404),
// so the gateway version stays "" (unknown) and never claims an
// update. One new fetch site (total 14): the backend /health GET,
// run on the checkGateway cycle, throttled to 5 min on success;
// a failed check retries on the next cycle, but its toast is
// throttled to 5 min too (log every failure, never spam the user).
var PP_UPD_KEY="beyondx-updates-v1",PP_UPD_BE="https://beyondx-backend.aramnarmani408.workers.dev/health",PP_UPD_MIN_MS=300000;
var PP_UPD_MIGS=[],ppUpdLastCheck=0,ppUpdLastFailToast=0,ppUpdNoticeRow=null,ppUpdStatusRow=null;
function ppVersionNew(stored,live){return typeof live==="string"&&live!==""&&stored!==live;}
function ppUpdateQuarantineName(key,ver){return key+".corrupt-"+String(ver||"x").replace(/[^A-Za-z0-9.-]/g,"-");}
function ppUpdateLoad(){try{var s=JSON.parse(localStorage.getItem(PP_UPD_KEY)||"null");if(s&&typeof s==="object")return s;}catch(e){}return null;}
function ppUpdateSave(r){try{localStorage.setItem(PP_UPD_KEY,JSON.stringify(r));return true;}catch(e){return false;}}
function ppUpdateRecord(){var r=ppUpdateLoad();if(r&&typeof r.gw==="string"&&typeof r.be==="string"&&Array.isArray(r.applied))return r;return{gw:"",be:"",seenAt:0,applied:[]};}
function ppUpdateRecover(){var raw=null;try{raw=localStorage.getItem(PP_UPD_KEY);}catch(e){return false;}if(!raw)return false;var ok=false;try{var s=JSON.parse(raw);ok=!!s&&typeof s.be==="string"&&Array.isArray(s.applied);}catch(e){}if(ok)return false;try{localStorage.setItem(ppUpdateQuarantineName(PP_UPD_KEY,"bad"),raw);localStorage.removeItem(PP_UPD_KEY);}catch(e){}if(typeof showToast==="function")showToast("د نسخې ثبت خراب و — له سره پیل شو");return true;}
function ppUpdateKeys(){var k=[];if(typeof CHAT_KEY==="string")k.push([CHAT_KEY,"chats"]);if(typeof SET_KEY==="string")k.push([SET_KEY,"obj"]);if(typeof MEM_KEY==="string")k.push([MEM_KEY,"rows"]);if(typeof ACC_KEY==="string")k.push([ACC_KEY,"obj"]);return k;}
function ppUpdateKeyShape(key,kind){try{var raw=localStorage.getItem(key);if(!raw)return{ok:true,empty:true};var s=JSON.parse(raw);if(!s||typeof s!=="object")return{ok:false};if(kind==="chats")return{ok:Array.isArray(s.chats)||Array.isArray(s.messages)};if(kind==="rows")return{ok:Array.isArray(s.rows)};return{ok:true};}catch(e){return{ok:false,corrupt:true};}}
function ppUpdateCompatible(){var bad=[];ppUpdateKeys().forEach(function(kv){if(!ppUpdateKeyShape(kv[0],kv[1]).ok)bad.push(kv[0]);});return{ok:bad.length===0,bad:bad};}
function ppUpdateCheckKeys(){var q=[];ppUpdateKeys().forEach(function(kv){var r=ppUpdateKeyShape(kv[0],kv[1]);if(r.ok||!r.corrupt)return;var n=ppUpdateQuarantineName(kv[0],ppUpdateRecord().be||"x");try{localStorage.setItem(n,localStorage.getItem(kv[0]));localStorage.removeItem(kv[0]);}catch(e){}q.push(kv[0]);});return{quarantined:q};}
function ppUpdateRegisterMig(id,fn){if(typeof id!=="string"||!id||typeof fn!=="function")return false;for(var i=0;i<PP_UPD_MIGS.length;i++)if(PP_UPD_MIGS[i].id===id)return false;PP_UPD_MIGS.push({id:id,fn:fn});return true;}
function ppUpdateMigrate(fromV,toV){var r=ppUpdateRecord(),done=[];for(var i=0;i<PP_UPD_MIGS.length;i++){var m=PP_UPD_MIGS[i];if(r.applied.indexOf(m.id)!==-1)continue;var ok=false;try{ok=m.fn(fromV,toV)===true;}catch(e){}if(ok){r.applied.push(m.id);done.push(m.id);}}if(toV){r.be=toV;r.seenAt=Date.now();}ppUpdateSave(r);return{applied:done,record:r};}
ppUpdateRegisterMig("keys-v1",function(){ppUpdateCheckKeys();return true;});
ppUpdateRecover();
(function(){var c=ppUpdateCompatible();if(!c.ok){ppUpdateMigrate("","");if(typeof showToast==="function")showToast("خرابه ډاټا وموندل شوه: "+c.bad.join(" • ")+" — خوندي شوه — له سره پیل شو");}})();
