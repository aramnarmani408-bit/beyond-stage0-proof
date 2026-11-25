// Infrastructure (§15): the data budget (real chat-route bytes),
// a user-set daily limit, a warning at 80%. Drafts (#51) live here.
var DB_KEY="beyondx-databudget-v1",DB_USE_KEY="beyondx-data-v1",DB_WARN_KEY="beyondx-datawarn-v1",DB_LIMITS=[0,10,25,50,100];
var OFF_DRAFT_KEY="beyondx-draft-v1";
function dbLimit(){try{var s=JSON.parse(localStorage.getItem(DB_KEY)||"null");if(s&&DB_LIMITS.indexOf(s.limit)!==-1)return s.limit;}catch(e){}return 0;}
function dbSetLimit(mb){if(DB_LIMITS.indexOf(mb)===-1)return false;try{localStorage.setItem(DB_KEY,JSON.stringify({limit:mb}));}catch(e){}return true;}
function dbTodayBytes(){try{var s=JSON.parse(localStorage.getItem(DB_USE_KEY)||"null");if(s&&s.d===new Date().toISOString().slice(0,10))return s.b||0;}catch(e){}return 0;}
function dbTodayMB(){return Math.round(dbTodayBytes()/104857.6)/10;}
function dbLimitLabel(){var l=dbLimit();return l===0?"بې حده":l+" MB";}
function dbText(){var u=dbTodayMB(),l=dbLimit(),t="نن: "+u+" MB";if(l===0)return t+" (بې حده)";t+=" / "+l+" MB";if(u>=l)t+=" — حد تېر شو";else if(u>=l*0.8)t+=" — حد ته نږدې";return t;}
function dbCheck(){var l=dbLimit();if(l===0||dbTodayMB()<l*0.8)return false;var d=new Date().toISOString().slice(0,10);try{if(localStorage.getItem(DB_WARN_KEY)===d)return false;localStorage.setItem(DB_WARN_KEY,d);}catch(e){}showToast("د ډاټا بودیجه ۸۰٪ ته ورسېده");return true;}
function dbCycle(){var i=DB_LIMITS.indexOf(dbLimit());dbSetLimit(DB_LIMITS[(i+1)%DB_LIMITS.length]);return dbLimitLabel();}
function buildInfraSettings(prof){if(!prof)return;var t=setText(prof,"د ډاټا بودیجه",dbText());var r=setBtnRow(prof,"د ډاټا حد",dbLimitLabel(),function(){var b=r.children[r.children.length-1];if(b)b.textContent=dbCycle();if(t)t.textContent="د ډاټا بودیجه: "+dbText();});ppInfraRows(prof);}
var PP_ERR_KEY="beyondx-pp-errlog-v1",PP_CRASH_KEY="beyondx-pp-crash-v1",PP_RUN_KEY="beyondx-pp-run-v1";
function ppErrLogAdd(kind,status){try{var l=JSON.parse(localStorage.getItem(PP_ERR_KEY)||"[]");l.unshift({k:kind,s:status||0,t:new Date().toISOString().slice(0,19)});if(l.length>20)l.length=20;localStorage.setItem(PP_ERR_KEY,JSON.stringify(l));}catch(e){}}
if(typeof recordError==="function"){var _ppRE=recordError;recordError=function(k,s){_ppRE(k,s);ppErrLogAdd(k,s);};}
if(typeof document!=="undefined"&&document.addEventListener){document.addEventListener("visibilitychange",function(){if(document.hidden){try{localStorage.setItem(PP_RUN_KEY,"hidden");}catch(e){}if(typeof viTtsPause==="function")viTtsPause();if(typeof avatar3dStop==="function")avatar3dStop();if(typeof saveChat==="function")saveChat();}else{try{localStorage.setItem(PP_RUN_KEY,"1");}catch(e){}}});}
function ppCrashCheck(){try{if(localStorage.getItem(PP_RUN_KEY)==="hidden"){localStorage.setItem(PP_CRASH_KEY,new Date().toISOString().slice(0,19));showToast("پروګرام تېر ځل په شالید کې بند شو — پرمختګ خوندي دی");}localStorage.setItem(PP_RUN_KEY,"1");}catch(e){}}
ppCrashCheck();
function offDraftSave(){var i=document.getElementById("askInput");if(!i)return;try{localStorage.setItem(OFF_DRAFT_KEY,i.value);}catch(e){}}
function offDraftRestore(){var i=document.getElementById("askInput");if(!i||i.value)return;try{var d=localStorage.getItem(OFF_DRAFT_KEY)||"";if(d)i.value=d;}catch(e){}}
function offDraftClear(){try{localStorage.removeItem(OFF_DRAFT_KEY);}catch(e){}}
if(typeof afterAnswer==="function"){var _dbAA=afterAnswer;afterAnswer=function(){_dbAA();dbCheck();};}
offDraftRestore();
var _dbInp=document.getElementById("askInput");if(_dbInp)_dbInp.addEventListener("input",offDraftSave);
