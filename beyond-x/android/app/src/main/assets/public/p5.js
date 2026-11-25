// Partial parts (item 5) — overflow 2: #201/#202/#29/#200 rows,
// #101 sent files, #148 shortcuts, #119 image delete.
function ppErrLogText(){try{var l=JSON.parse(localStorage.getItem(PP_ERR_KEY)||"[]");if(!l.length)return"هېڅ تېروتنه نشته";return l[0].k+" "+l[0].s+" • ټول "+l.length;}catch(e){return"";}}
function ppStorageText(){var out=[];try{["chats","images","workspaces","memory","gwcount"].forEach(function(k){var v=localStorage.getItem("beyondx-"+k+"-v1");if(v)out.push(k+" "+Math.round(v.length/1024)+"KB");});}catch(e){}return out.length?out.join(" • "):"خالي دی";}
function ppInfraRows(prof){
setText(prof,"تېروتنې",ppErrLogText());
setBtnRow(prof,"تېروتنې پاکې کړې","پاک کړه",function(){try{localStorage.removeItem(PP_ERR_KEY);}catch(e){}});
var c="";try{c=localStorage.getItem(PP_CRASH_KEY)||"";}catch(err){}
setText(prof,"وروستی بندېدل",c||"نشه");
setText(prof,"اجازې","مایکروفون/کامره/خبرتیاوې: د غوښتنې پر مهال پوښتل کېږي");
setText(prof,"ذخیره (هره برخه)",ppStorageText());
setBtnRow(prof,"لیږل شوي فایلونه","وښایه",function(){if(typeof ppSentFiles==="function")ppSentFiles();});
setBtnRow(prof,"لیږل شوي فایلونه ړنګ کړه","ړنګ کړه",function(){if(typeof ppSentFilesClear==="function")ppSentFilesClear();});
setBtnRow(prof,"کېش پاک کړه","پاک کړه",function(){var n=typeof settingsClearCache==="function"?settingsClearCache():0;showToast(n+" کېش پاک شو");});
}
async function ppSentFiles(){if(typeof histNative!=="function"||!histNative()){showToast("لیږل شوي فایلونه په دې وسیله کې نشته");return;}try{var c=await histExec("SELECT COUNT(*) AS n FROM message_images",[]);var n=(c&&c.ok&&c.rows&&c.rows[0])?c.rows[0].n:0;showToast(n+" لیږل شوي فایلونه");}catch(e){showToast("لیږل شوي فایلونه ونه لوستل شول");}}
async function ppSentFilesClear(){if(typeof histNative!=="function"||!histNative())return;try{await histExec("DELETE FROM message_images",[]);showToast("لیږل شوي فایلونه ړنګ شول");}catch(e){showToast("فایلونه ړنګ نه شول");}}
if(typeof document!=="undefined"&&document.addEventListener){document.addEventListener("keydown",function(e){if(!e.ctrlKey&&!e.metaKey)return;var k=(e.key||"").toLowerCase();if(k==="enter"){e.preventDefault();if(typeof sendQuestion==="function")sendQuestion();}else if(k==="k"){e.preventDefault();var i=document.getElementById("askInput");if(i)i.focus();}else if(k==="n"){e.preventDefault();if(typeof newChat==="function")newChat();}else if(k==="escape"){if(typeof showPanel==="function")showPanel("chat");}});}
if(typeof showImagesHistory==="function"){var _p4SIH=showImagesHistory;showImagesHistory=function(){_p4SIH();if(!imagesHistoryEl||!imagesLib.items.length)return;for(var i=0;i<imagesHistoryEl.children.length;i++){var d=imagesHistoryEl.children[i];if(!d||d._ppDel||d.tagName==="BUTTON")continue;d._ppDel=true;var x=imagesEl("button","✕");(function(it,idx){x.addEventListener("click",function(e){e.stopPropagation();imagesLib.items.splice(idx,1);saveImages();showImagesHistory();if(typeof ppUndoPush==="function")ppUndoPush("انځور ړنګ شو",function(){imagesLib.items.splice(idx,0,it);saveImages();showImagesHistory();});});})(imagesLib.items[i],i);d.appendChild(x);}var c=imagesEl("button","ټول ړنګ کړه");c.addEventListener("click",function(){imagesLib.items=[];saveImages();showImagesHistory();});imagesHistoryEl.appendChild(c);};}
