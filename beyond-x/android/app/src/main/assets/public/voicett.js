// TTS controls (parts list §5): a speak button on AI answers.
// Reuses voiceSpeak + the Settings voice/speed choice — TTS is NOT
// rebuilt here. Long answers speak in <=480-char chunks (the gateway
// speak cap is 500), at most 3 chunks per tap (each chunk costs one
// speak cap); re-tap continues from the next chunk. The floating bar
// stops, pauses + resumes. Never speaks while listening (VI_MODE).
var VI_SPEAK={text:"",idx:0,chunks:null,left:0};var VI_TOK=0;var VI_STOP=false;var VI_PAUSED=false;
function viChunks(text){var out=[],s=0;while(s<text.length){var e=Math.min(s+480,text.length);if(e<text.length){var sp=text.lastIndexOf(" ",e);if(sp>s)e=sp;}out.push(text.substring(s,e));s=e;while(s<text.length&&text.charAt(s)===" ")s++;}return out;}
function viSpeakLong(text){if(!text||VI_MODE!=="")return;if(VI_SPEAK.text!==text)VI_SPEAK={text:text,idx:0,chunks:null,left:0};var c=viChunks(text);if(VI_SPEAK.idx>=c.length)VI_SPEAK.idx=0;VI_SPEAK.chunks=c;VI_SPEAK.left=3;VI_STOP=false;viSpeakNext();}
function viSpeakNext(){var s=VI_SPEAK;if(!s.chunks||s.idx>=s.chunks.length){s.idx=0;viTtsBar(false);return;}if(s.left<=0){showToast("نور متن پاتې دی — بیا 🔊 کېکاږه");viTtsBar(false);return;}s.left--;var i=s.idx,txt=s.chunks[i],tok=++VI_TOK;voiceSpeak(txt,"ps").then(function(){if(VI_STOP||VI_TOK!==tok)return;s.idx=i+1;viTtsBar(true);if(voiceAudioEl)voiceAudioEl.onended=function(){if(VI_TOK===tok)viSpeakNext();};setTimeout(function(){if(VI_TOK===tok&&!VI_PAUSED)viSpeakNext();},60000);});}
function viTtsBar(show){var o=document.getElementById("voiceTtsBar");if(o){if(o.parentNode)o.parentNode.removeChild(o);else if(o.parent)o.parent.removeChild(o);}if(!show)return;var b=histFloat("voiceTtsBar");b.appendChild(voiceBtn("⏹ ودرېږه",viTtsStop));b.appendChild(voiceBtn("⏸ وقفه",viTtsPause));b.appendChild(voiceBtn("▶ دوام",viTtsResume));}
function viTtsStop(){VI_STOP=true;VI_PAUSED=false;VI_SPEAK.idx=0;VI_SPEAK.chunks=null;if(voiceAudioEl){try{voiceAudioEl.pause();}catch(e){}try{voiceAudioEl.currentTime=0;}catch(e){}}if(typeof speechSynthesis!=="undefined"){try{speechSynthesis.cancel();}catch(e){}}viTtsBar(false);}
function viTtsPause(){VI_PAUSED=true;if(voiceAudioEl){try{voiceAudioEl.pause();}catch(e){}}if(typeof speechSynthesis!=="undefined"){try{speechSynthesis.pause();}catch(e){}}}
function viTtsResume(){VI_PAUSED=false;if(voiceAudioEl){try{voiceAudioEl.play();}catch(e){}}if(typeof speechSynthesis!=="undefined"){try{speechSynthesis.resume();}catch(e){}}}
if(typeof attachActions==="function"){var _viAA=attachActions;attachActions=function(msg,text){_viAA(msg,text);var a=document.getElementById("chatArea");if(!a)return;for(var i=0;i+1<a.children.length;i++){if(a.children[i]===msg&&a.children[i+1].className==="act-row"){var b=document.createElement("button");b.textContent="🔊";b.addEventListener("click",function(){viSpeakLong(text);});a.children[i+1].appendChild(b);return;}}};}
