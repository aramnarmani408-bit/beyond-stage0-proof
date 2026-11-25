// Security tests (#230, app-side half) — pure logic: secret
// patterns, source scan, storage scan, CSP check, no-eval check.
// A hit names file + line + pattern only — a secret VALUE is never
// logged, shown, or sent anywhere. Patterns are built from pieces
// so this file own text never matches them (self-scan stays clean).
// One new fetch site in the pair (total 15): secFetchText here,
// same-origin only (index.html + the app own modules). It NEEDS
// connect-src 'self' in the index.html CSP — the current CSP has
// no 'self', so the browser blocks the fetch in-app until the
// coordinator adds it (7 chars); until then the source row in
// secTestFinish reports blocked, never a false pass.
var SEC_ALLOW=["beyondx-account-v1"];
function secPatterns(){return[{n:"api key",r:new RegExp("api"+"[_-]?key","i")},{n:"bearer",r:new RegExp("Bear"+"er\\s+[A-Za-z0-9\\-_.]{20,}","")},{n:"sk key",r:new RegExp("s"+"k-[A-Za-z0-9]{10,}","")},{n:"private key",r:new RegExp("-----BE"+"GIN (RSA |EC |OPENSSH )?PRIVATE KEY-----","")},{n:"password",r:new RegExp("pass"+"word[\"']?\\s*[:=]\\s*(\"[^\"]{8,}\"|'[^']{8,}'|\\S{8,})","i")},{n:"token",r:new RegExp("(access_|refresh_)?token[\"']?\\s*[:=]\\s*\"[A-Za-z0-9\\-_.]{16,}\"","i")},{n:"secret",r:new RegExp("sec"+"ret[\"']?\\s*[:=]\\s*\"[^\"]{8,}\"","i")}];}
function secFetchText(u){return fetch(u).then(function(r){if(!r.ok)throw new Error("http "+r.status);return r.text();});}
function secScanText(file,text){var hits=[],ps=secPatterns(),seen={},lines=String(text||"").split("\n");for(var i=0;i<lines.length;i++){for(var j=0;j<ps.length;j++){if(seen[ps[j].n])continue;if(ps[j].r.test(lines[i])){hits.push({file:file,line:i+1,pat:ps[j].n});seen[ps[j].n]=true;break;}}}return hits;}
function secScanPairs(pairs){var hits=[],allowed=[],ps=secPatterns();pairs.forEach(function(kv){var k=kv[0],v=String(kv[1]||"");for(var j=0;j<ps.length;j++){if(ps[j].r.test(k)||ps[j].r.test(v)){if(SEC_ALLOW.indexOf(k)!==-1)allowed.push({key:k,pat:ps[j].n});else hits.push({key:k,pat:ps[j].n});break;}}});return{hits:hits,allowed:allowed};}
function secStorageKeys(s){var ks=[];try{if(s&&typeof s.length==="number"&&typeof s.key==="function"){for(var i=0;i<s.length;i++){var k=s.key(i);if(k)ks.push(k);}return ks;}if(s&&s._s)return Object.keys(s._s);}catch(e){}return ks;}
function secScanStorage(s){var ks=secStorageKeys(s),pairs=[];ks.forEach(function(k){try{pairs.push([k,s.getItem(k)]);}catch(e){}});return secScanPairs(pairs);}
function secCspText(csp){var miss=[],bad=[],dirs={};String(csp||"").split(";").forEach(function(p){var q=p.trim();if(!q)return;var sp=q.indexOf(" ");var k=sp===-1?q:q.slice(0,sp);dirs[k]=sp===-1?"":q.slice(sp+1).trim();});if(!dirs["default-src"]||dirs["default-src"].indexOf("'self'")===-1)miss.push("default-src");if(!dirs["connect-src"])miss.push("connect-src");else{var toks=dirs["connect-src"].split(/\s+/);for(var i=0;i<toks.length;i++){if(toks[i]==="'self'")continue;if(!/^https:\/\/(\*\.)?aramnarmani408\.workers\.dev$/.test(toks[i])){bad.push("connect-src");break;}}}if(!dirs["img-src"]||dirs["img-src"].indexOf("'self'")===-1)miss.push("img-src");return{ok:miss.length===0&&bad.length===0,missing:miss,bad:bad};}
function secCspCheck(doc){try{if(doc&&typeof doc.querySelector==="function"){var m=doc.querySelector('meta[http-equiv="Content-Security-Policy"]');if(!m)return{ok:false,missing:["CSP"],bad:[],reason:"no-meta"};var c="";try{c=m.content||"";}catch(e){}if(!c&&typeof m.getAttribute==="function"){try{c=m.getAttribute("content")||"";}catch(e){}}return secCspText(c);}return{ok:false,missing:["CSP"],bad:[],reason:"no-query"};}catch(e){return{ok:false,missing:["CSP"],bad:[],reason:"error"};}}
function secNoEval(files,htmlText){var bad=[],ev="ev"+"al(",fn="Func"+"tion(";files.forEach(function(f){if(!f.text)return;if(f.text.indexOf(ev)!==-1)bad.push({file:f.name,pat:"eval"});else if(f.text.indexOf(fn)!==-1)bad.push({file:f.name,pat:"Function"});});var h=String(htmlText||"");["on"+"click=","on"+"load=","on"+"error=","java"+"script:"].forEach(function(n){if(h.indexOf(n)!==-1)bad.push({file:"index.html",pat:n});});return bad;}
