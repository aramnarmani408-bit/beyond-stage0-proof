// DB / storage self-tests (#229) part 3: the runner + the Pashto
// report panel. dbTestRun(opts) -> {pass, fail, skip, results[]}.
// Migration needs a TEST account + fixture; with none it reports
// SKIPPED (never a fake account in the live app). A fixture seeds
// only an EMPTY guest key and migrates only when the guest key holds
// exactly that fixture — real guest data is never clobbered.
// REINSTALL is always skipped (needs the release APK + A10 test).
function dbtRes(id,name,ok,detail){return{id:id,name:name,ok:ok,detail:detail};}
async function dbtMigRun(opts){
  var gk=dbtGuestKey();
  if(!opts.email||!opts.pw)return dbtRes("migration","مېلمه ډاټا لېږد",null,"پاتې — ازموینې حساب نشته");
  if(!opts.fixture)return dbtRes("migration","مېلمه ډاټا لېږد",null,"پاتې — فکسچر نشته");
  var raw=null;
  try{raw=localStorage.getItem(gk);}catch(e){}
  var fixRaw=JSON.stringify(opts.fixture);
  if(raw&&raw!==fixRaw)return dbtRes("migration","مېلمه ډاټا لېږد",null,"پاتې — مېلمه ډاټا شته ده");
  if(!raw){
    try{localStorage.setItem(gk,fixRaw);}
    catch(e){return dbtRes("migration","مېلمه ډاټا لېږد",false,"فکسچر و نه لیکل شو");}
  }
  var m=await dbtMigrateGuest(opts.email,opts.pw,opts.name||"");
  if(m.ok){
    // Test hygiene only: the migrated copy IS the test fixture, so
    // remove it again (the real migration leaves it under the
    // account key). The guest key is already cleared by the move.
    try{if(localStorage.getItem(DBT_ACCT_CHATS)===fixRaw)localStorage.removeItem(DBT_ACCT_CHATS);}catch(e){}
    try{if(typeof accSet==="function")accSet(null);}catch(e){}
    return dbtRes("migration","مېلمه ډاټا لېږد",true,dbtDigits(m.chats)+" خبرې • "+dbtDigits(m.messages)+" پیغامونه ولېږدېدل");
  }
  // On failure NOTHING is cleaned up: the guest key still holds the
  // user's data (the kept:true promise).
  return dbtRes("migration","مېلمه ډاټا لېږد",false,"لېږد و نه شو ("+(m.reason||"نامعلومه")+")"+(m.kept?" • مېلمه ډاټا پاتې ده":" • مېلمه ډاټا له منځه لاړه!"));
}
async function dbTestRun(opts){
  opts=opts||{};
  var results=[];
  var st;
  try{st=dbtStorage();}catch(e){st=dbtRes("storage","سیمه ییز خوندي کول",false,"تېروتنه");}
  results.push(st);
  results.push(await dbtMigRun(opts));
  var base=opts.baseline||DBT_BASE;
  var up;
  if(typeof ppUpdateSave==="function"&&typeof ppUpdateRecord==="function"){
    dbtUpdateSetBaseline(base);
    var c=dbtUpdateCheck(base);
    if(c.ok)up=dbtRes("update","د نسخې ثبت پاتې کېږي",true,"نسخه "+base+" خوندي ده • نوې نسخه نشته");
    else up=dbtRes("update","د نسخې ثبت پاتې کېږي",false,"ثبت نه دی پاتې: "+(c.reason||("خوندي: "+(c.stored||"—"))));
  }else{
    up=dbtRes("update","د نسخې ثبت پاتې کېږي",null,"پاتې — د تازه کولو ماډل نشته");
  }
  results.push(up);
  var q;
  try{q=dbtQuarantineTest();}catch(e){q=dbtRes("quarantine","خرابې کیلي قرنطین",false,"تېروتنه");}
  results.push(q);
  results.push(dbtRes("reinstall","بیا نصبول",null,"پاتې — APK ته اړتیا ده"));
  var pass=0,fail=0,skip=0;
  results.forEach(function(r){if(r.ok===true)pass++;else if(r.ok===false)fail++;else skip++;});
  var summary={pass:pass,fail:fail,skip:skip,results:results,at:Date.now()};
  try{localStorage.setItem(DBT_KEY,JSON.stringify(summary));}catch(e){}
  return summary;
}
function dbTestShow(summary){
  if(typeof document==="undefined")return null;
  if(!summary){
    try{var s=localStorage.getItem(DBT_KEY);if(s)summary=JSON.parse(s);}catch(e){}
  }
  if(!summary)return null;
  var old=null;
  try{old=document.getElementById("dbTestPanel");}catch(e){}
  if(old){var par=old.parentNode||old.parent;if(par&&par.removeChild)par.removeChild(old);}
  var p=document.createElement("div");
  p.id="dbTestPanel";
  var h=document.createElement("div");
  h.textContent="ډاټابېس ازموینې";
  p.appendChild(h);
  var s2=document.createElement("div");
  s2.textContent="بریالي: "+dbtDigits(summary.pass)+" • ناکام: "+dbtDigits(summary.fail)+" • پاتې: "+dbtDigits(summary.skip);
  p.appendChild(s2);
  summary.results.forEach(function(r){
    var row=document.createElement("div");
    var w=r.ok===true?"بریالی":(r.ok===false?"ناکام":"پاتې");
    row.textContent=r.name+" — "+w+(r.detail?" • "+r.detail:"");
    p.appendChild(row);
  });
  var b=document.createElement("button");
  b.textContent="بیا ازموینه";
  b.addEventListener("click",function(){dbTestRun().then(function(s){dbTestShow(s);});});
  p.appendChild(b);
  var note=document.createElement("div");
  note.textContent="بیا نصبول: APK + په A10 ازموینه پاتې ده";
  p.appendChild(note);
  document.body.appendChild(p);
  return p;
}
