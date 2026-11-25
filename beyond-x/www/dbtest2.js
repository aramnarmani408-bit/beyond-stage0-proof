// DB / storage self-tests (#229) part 2: guest-data migration
// through the REAL accRegister path (mocked backend in tests),
// and the update-baseline helpers. Depends on part 1 (dbtGuestKey,
// dbtGuestRead) + acc.js (accRegister) + updates.js (ppUpdate*).
// The server must acknowledge the migration (migrated.guest) before
// any local data moves; on any failure the guest key stays put.
// No fetch here — accRegister makes the one backend call.
async function dbtMigrateGuest(email,pw,name){
  var gk=dbtGuestKey();
  var g=dbtGuestRead();
  if(!g.ok)return{ok:false,reason:g.reason,kept:true};
  if(typeof accRegister!=="function")return{ok:false,reason:"no-acc",kept:true};
  var r=null;
  try{r=await accRegister(email,pw,name);}
  catch(e){return{ok:false,reason:"throw",kept:true};}
  if(!r||!r.ok){
    var kept=false;
    try{kept=localStorage.getItem(gk)!==null;}catch(e){}
    return{ok:false,reason:"backend",error:(r&&r.error)||"",kept:kept};
  }
  var ack=!!(r.data&&r.data.migrated&&r.data.migrated.guest===true);
  if(!ack)return{ok:false,reason:"no-ack",kept:true};
  try{localStorage.setItem(DBT_ACCT_CHATS,g.raw);}
  catch(e){return{ok:false,reason:"save",kept:true};}
  var back=null;
  try{back=localStorage.getItem(DBT_ACCT_CHATS);}catch(e){}
  if(back!==g.raw)return{ok:false,reason:"verify",kept:true};
  try{localStorage.removeItem(gk);}catch(e){}
  var gone=false;
  try{gone=localStorage.getItem(gk)===null;}catch(e){}
  return{ok:gone,chats:g.chats,messages:g.messages,serverAck:true,accountKey:DBT_ACCT_CHATS};
}
function dbtUpdateSetBaseline(ver){
  try{
    if(typeof ppUpdateSave!=="function"||typeof ppUpdateRecord!=="function")return false;
    var old=ppUpdateRecord();
    var applied=(old&&Array.isArray(old.applied))?old.applied:[];
    return ppUpdateSave({gw:"",be:ver,seenAt:Date.now(),applied:applied});
  }catch(e){return false;}
}
function dbtUpdateCheck(expected){
  try{
    if(typeof ppUpdateRecord!=="function"||typeof ppVersionNew!=="function")return{ok:false,reason:"no-updates"};
    var r=ppUpdateRecord();
    if(!r||typeof r.be!=="string")return{ok:false,reason:"shape"};
    var isNew=ppVersionNew(r.be,expected);
    return{ok:r.be===expected&&!isNew,stored:r.be,isNew:isNew};
  }catch(e){return{ok:false,reason:"throw"};}
}

// Entry point (wave 2): a Settings row under the infra rows.
function dbTestRows(prof) {
  if (!prof || typeof setBtnRow !== "function") return;
  if (typeof dbTestShow === "function") setBtnRow(prof, "ډېټابېس ازموینه", "وګوره", function () { dbTestShow(); });
}
if (typeof ppInfraRows === "function") { var _dbPIR = ppInfraRows; ppInfraRows = function (prof) { _dbPIR(prof); dbTestRows(prof); }; }
