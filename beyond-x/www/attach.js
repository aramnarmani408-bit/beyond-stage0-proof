// Chat attach + vision: + button in the composer; picks an image, holds it
// pending, and on send routes the question to /images/analyze (not the
// router). v1 = IMAGES ONLY. No new fetch — the call reuses xImages.
var attachPending=null,attachInputEl=null,attachPreviewEl=null;
var ATTACH_DEFAULT_Q="په دې انځور کې څه دي؟";
function attachBuildBtn(){
if(typeof document==="undefined")return null;
var area=document.getElementById("inputArea");
if(!area||document.getElementById("attachBtn"))return null;
var b=document.createElement("button");
b.id="attachBtn";b.textContent="+";
b.style.cssText="border-radius:50%;width:36px;height:36px;padding:0";
b.addEventListener("click",function(){if(attachInputEl)attachInputEl.click();});
area.insertBefore(b,area.firstChild);
attachInputEl=document.createElement("input");
attachInputEl.type="file";attachInputEl.accept="image/*";attachInputEl.style.display="none";
attachInputEl.addEventListener("change",function(){attachPick(attachInputEl.files?attachInputEl.files[0]:null);attachInputEl.value="";});
area.appendChild(attachInputEl);
return b;
}
function attachPick(file){
if(!file)return;
if(!file.type||file.type.indexOf("image/")!==0){showToast("یوازې انځورونه");return;}
if(typeof FileReader==="undefined"){showToast(NOUP);return;}
var reader=new FileReader();
reader.onload=function(){imagesDownscaleTo(reader.result,function(b64){if(!b64){showToast("انځور ونه لوستل شو — بل انځور هڅه وکړه");return;}attachSetPending(b64,file.name||"");});};
reader.readAsDataURL(file);
}
function attachSetPending(b64,name){
if(!b64||imagesTooBig(b64)){showToast("انځور ډېر لوی دی — تر ۲ میګابایټ پورې.");return false;}
attachPending={b64:b64,dataUrl:"data:image/jpeg;base64,"+b64,name:name||""};
attachShowPreview();
var inp=document.getElementById("askInput");
if(inp&&!inp.value.trim())inp.value=ATTACH_DEFAULT_Q;
return true;
}
function attachShowPreview(){
if(typeof document==="undefined")return;
attachClearPreview();
var panel=document.getElementById("chatPanel");
var area=document.getElementById("inputArea");
if(!panel||!area||!attachPending)return;
var img=document.createElement("img");
img.id="attachPreview";
img.src=attachPending.dataUrl;
img.style.cssText="width:48px;height:48px;object-fit:cover;border-radius:8px";
img.addEventListener("click",attachClear);
panel.insertBefore(img,area);
attachPreviewEl=img;
}
function attachClearPreview(){if(!attachPreviewEl)return;var p=attachPreviewEl.parentNode||attachPreviewEl.parent;if(p)p.removeChild(attachPreviewEl);attachPreviewEl=null;}
function attachClear(){
attachPending=null;
attachClearPreview();
var inp=document.getElementById("askInput");
if(inp&&inp.value===ATTACH_DEFAULT_Q)inp.value="";
}
function attachThumbOnLastUser(){
if(typeof document==="undefined"||!attachPending)return;
var area=document.getElementById("chatArea");
if(!area)return;
var msgs=area.children;
for(var i=msgs.length-1;i>=0;i--){
if(msgs[i].className&&msgs[i].className.indexOf("msg user")!==-1){
if(msgs[i].children.length>0)return;
var img=document.createElement("img");
img.src=attachPending.dataUrl;
img.style.cssText="display:block;max-width:120px;border-radius:8px";
msgs[i].appendChild(img);
return;
}
}
}
async function attachSend(question){
if(!attachPending)return;
attachThumbOnLastUser();
setAction("فکر کوم...");
gs("generating");
var b64=attachPending.b64;
try{
var token=await ensureSession();
var r=await xImages("/images/analyze",token,{image:b64,mimeType:"image/jpeg",question:question});
if(!r||typeof r.text!=="string"||!r.text)throw new Error("Bad response");
addMessage(r.text,"ai");
if(typeof maybeWow==="function")maybeWow();
if(typeof laeMarkAnswered==="function")laeMarkAnswered();
if(typeof afterAnswer==="function")afterAnswer();
attachClear();
setAction("چمتو یم");
gs("completed");
}catch(e){
var m=e.message||"";
if(m==="RateLimit")addMessage("ډېرې غوښتنې وشوې — لږ وروسته بیا هڅه وکړه","ai");
else if(m==="Timeout")addMessage("ځواب وځنډېد — بیا هڅه وکړه","ai");
else if(m==="Unauthorized")addMessage("ناسته پای ته ورسېده — بیا هڅه وکړه","ai");
else addMessage("انځور ونه لوستل شو — بیا هڅه وکړه","ai");
gs("failed");
setAction("چمتو یم");
}
}
if(typeof handleRequest==="function"){
var _attachHandleRequest=handleRequest;
handleRequest=function(q){
if(attachPending){attachSend(q);return;}
_attachHandleRequest(q);
};
}
attachBuildBtn();
