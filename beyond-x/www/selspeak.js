// Selection speak (parts list §11): speak the text the user selects.
// Reuses viSpeakLong (voicett.js) — the same <=480-char chunking, the
// same 3-chunk-per-tap cap, the same floating stop/pause/resume bar.
// Never speaks while listening (VI_MODE). A small floating "🔊 واورئ"
// button appears while a speakable selection sits inside the chat
// area; it hides when the selection is cleared or turns unspeakable.
// The selection is read through the bare global getSelection (guarded
// for the harness stub DOM, where it is undefined) — never via the
// global object property, so the no-window static check still holds.
var SELSPEAK_MAX=1440;
function selspeakClean(raw){if(!raw)return "";var t=String(raw).replace(/\s+/g," ").trim();if(t.length>SELSPEAK_MAX)t=t.slice(0,SELSPEAK_MAX).trim();return t;}
function selspeakOk(text){var t=selspeakClean(text);if(!t)return false;return /[\p{L}\p{N}]/u.test(t);}
function selspeakInChat(node){var a=null;if(typeof document!=="undefined"&&document.getElementById)a=document.getElementById("chatArea");if(!a)return false;var n=node;while(n){if(n===a)return true;n=n.parentNode;}return false;}
function selspeakText(){if(typeof getSelection==="undefined")return "";var s=null;try{s=getSelection();}catch(e){return "";}if(!s||typeof s.toString!=="function")return "";if(s.anchorNode&&!selspeakInChat(s.anchorNode))return "";return selspeakClean(s.toString());}
function selspeakSpeak(text){var t=selspeakClean(text);if(!selspeakOk(t))return false;if(typeof VI_MODE!=="undefined"&&VI_MODE!=="")return false;if(typeof viSpeakLong!=="function")return false;selspeakHide();viSpeakLong(t);return true;}
function selspeakShow(){if(typeof document==="undefined")return null;var old=document.getElementById("selspeakBtn");if(old)return old;if(typeof histFloat!=="function")return null;var w=histFloat("selspeakBtn");var b=document.createElement("button");b.textContent="🔊 واورئ";b.addEventListener("mousedown",function(e){e.preventDefault();});b.addEventListener("click",function(){selspeakSpeak(selspeakText());});w.appendChild(b);return w;}
function selspeakHide(){if(typeof document==="undefined")return;var b=document.getElementById("selspeakBtn");if(b){if(b.parentNode)b.parentNode.removeChild(b);else if(b.parent)b.parent.removeChild(b);}}
function selspeakOnChange(){if(typeof VI_MODE!=="undefined"&&VI_MODE!==""){selspeakHide();return;}if(!selspeakOk(selspeakText())){selspeakHide();return;}selspeakShow();}
if(typeof document!=="undefined"&&document.addEventListener){document.addEventListener("selectionchange",selspeakOnChange);}
