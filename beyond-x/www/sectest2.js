// Security tests (#230, app-side half) — run + UI. secTestRun
// fetches index.html + every listed module (same-origin only),
// scans source + storage + CSP + no-eval, and returns
// {pass, fail, blocked, files, results}. The fetch NEEDS
// connect-src 'self' in the index.html CSP — without it the
// browser blocks the fetch and the source row reports BLOCKED
// (ok null), never a false pass or a false fail. The APK row is
// BLOCKED too: the APK key scan needs the built APK (not built
// yet — no APK until everything is complete + arman verdict).
// secTestShow builds the Pashto panel (#secTestPanel) once.
function secTestFinish(files,htmlText,htmlOk){var results=[],hits=[];files.forEach(function(f){if(f.text)hits=hits.concat(secScanText(f.name,f.text));});results.push({id:"source",name:"سرچینه کتنه",ok:htmlOk?(hits.length===0):null,blocked:!htmlOk,detail:htmlOk?(hits.length===0?"په سرچینه کې پټه کیلي نشته":"پټه کیلي وموندل شوه: "+hits[0].file+" کرښه "+hits[0].line+" ("+hits[0].pat+")" ):"سرچینه ونه لوستل شوه — کتنه ونه شوه"});var st={hits:[],allowed:[]},st2={hits:[],allowed:[]};try{st=secScanStorage(localStorage);}catch(e){}try{if(typeof sessionStorage!=="undefined")st2=secScanStorage(sessionStorage);}catch(e){}var ah=st.hits.concat(st2.hits),aa=st.allowed.concat(st2.allowed);results.push({id:"storage",name:"زېرمه کتنه",ok:ah.length===0,detail:ah.length===0?(aa.length===0?"په زېرمه کې پټه کیلي نشته":"په زېرمه کې پټه کیلي نشته — د ناستې کیلي خوندي ده ("+aa[0].key+")" ):"پټه کیلي په زېرمه کې ده: "+ah[0].key+" ("+ah[0].pat+")"});var csp={ok:false,missing:["CSP"],bad:[]};try{csp=secCspCheck(document);}catch(e){}results.push({id:"csp",name:"CSP کتنه",ok:csp.ok,detail:csp.ok?"CSP سم دی":"CSP ستونزه لري: "+csp.missing.concat(csp.bad).join(" ")});var ne=secNoEval(files,htmlText);results.push({id:"noeval",name:"eval کتنه",ok:ne.length===0,detail:ne.length===0?"eval او انلاین پېښې نشته":"ممنوع کوډ وموندل شو: "+ne[0].file+" ("+ne[0].pat+")"});results.push({id:"apk",name:"APK کیلي کتنه",ok:null,blocked:true,detail:"APK نه دی جوړ شوی — ازموینه ځنډېدلې ده"});var pass=0,fail=0,blocked=0;results.forEach(function(r){if(r.ok===true)pass++;else if(r.ok===false)fail++;if(r.blocked)blocked++;});return{pass:pass,fail:fail,blocked:blocked,files:files.length,results:results};}
function secTestRun(){var files=[];return secFetchText("index.html").then(function(htmlText){var re=/<script src=([A-Za-z0-9_.\-]+)>/g,m,names=[];while((m=re.exec(htmlText))!==null)names.push(m[1]);var chain=Promise.resolve();names.forEach(function(n){chain=chain.then(function(){return secFetchText(n).then(function(t){files.push({name:n,text:t});},function(e){files.push({name:n,text:"",error:true});});});});return chain.then(function(){return secTestFinish(files,htmlText,true);});},function(e){return secTestFinish(files,"",false);});}
function secTestSummary(r){return "امنیت: "+r.pass+" سم • "+r.fail+" ستونزه • "+r.blocked+" نه دی شوی";}
var secTestPanel=null;
function secTestRender(r){if(!secTestPanel)return;secTestPanel.textContent="";var s=document.createElement("div");s.textContent=secTestSummary(r);secTestPanel.appendChild(s);r.results.forEach(function(x){var d=document.createElement("div");d.textContent=(x.ok===true?"✓ ":x.ok===false?"✗ ":"… ")+x.name+": "+x.detail;secTestPanel.appendChild(d);});var b=document.createElement("button");b.textContent="بیا وګوره";b.addEventListener("click",function(){secTestRun().then(secTestRender);});secTestPanel.appendChild(b);}
function secTestShow(){try{if(!secTestPanel||!document.getElementById("secTestPanel")){secTestPanel=document.createElement("div");secTestPanel.id="secTestPanel";var h=document.createElement("div");h.textContent="امنیت ازموینه";secTestPanel.appendChild(h);var host=null;try{host=document.body||document.getElementById("main");}catch(e){}if(host)host.appendChild(secTestPanel);}secTestRun().then(secTestRender);}catch(e){}return secTestPanel;}

// Entry point (wave 2): a Settings row under the infra rows.
function secTestRows(prof) {
  if (!prof || typeof setBtnRow !== "function") return;
  if (typeof secTestShow === "function") setBtnRow(prof, "امنیت ازموینه", "وګوره", function () { secTestShow(); });
}
if (typeof ppInfraRows === "function") { var _stPIR = ppInfraRows; ppInfraRows = function (prof) { _stPIR(prof); secTestRows(prof); }; }
