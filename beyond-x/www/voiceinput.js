// Voice input (parts list §5): a mic button in the composer.
// Recognition is the phone's own (Web Speech, ps-AF) first; the
// gateway Gladia route is the fallback. ASR is EXPERIMENTAL — heard
// text always lands in the composer for review, never auto-sent.
// TTS controls live in voicett.js (one file cannot pass the push limit).
var VI_MODE="";var VI_REC=null;var VI_START="";var VI_COMP=false;var VI_CANC=false;var VI_TOLD=false;
var VI_NH="غږ ونه اورېدل شو — بیا هڅه وکړه";
function viInsert(el){var a=document.getElementById("inputArea");if(!a)return;for(var i=0;i<a.children.length;i++){if(a.children[i].id==="sendBtn"){a.insertBefore(el,a.children[i]);return;}}a.appendChild(el);}
function viMicBtn(){if(typeof document==="undefined"||document.getElementById("voiceMicBtn"))return null;var b=document.createElement("button");b.id="voiceMicBtn";b.textContent="🎤";b.style.cssText="border-radius:50%;width:36px;height:36px;padding:0";b.addEventListener("click",viToggle);viInsert(b);return b;}
function viMicBusy(on){var b=document.getElementById("voiceMicBtn");if(b)b.textContent=on?"🔴":"🎤";}
function viCancelBtn(show){var o=document.getElementById("voiceCancelBtn");if(o){if(o.parentNode)o.parentNode.removeChild(o);else if(o.parent)o.parent.removeChild(o);}if(!show)return;var b=document.createElement("button");b.id="voiceCancelBtn";b.textContent="✕";b.style.cssText="border-radius:50%;width:36px;height:36px;padding:0";b.addEventListener("click",viCancel);viInsert(b);}
function viEnd(){VI_REC=null;VI_MODE="";VI_COMP=false;VI_CANC=false;viMicBusy(false);viCancelBtn(false);}
function viToggle(){if(VI_MODE==="speech"){viStopSpeech();return;}if(VI_MODE==="gateway"){if(voiceRecording)voiceStopRecording();return;}viStart();}
function viStart(){if(!VI_TOLD){VI_TOLD=true;showToast("غږیز ثبت تجربوي دی — متن وګوره بیا یې واستوه");}if(typeof navigator!=="undefined"&&navigator.permissions&&navigator.permissions.query){navigator.permissions.query({name:"microphone"}).then(function(s){if(s&&s.state==="denied")showToast("مایکروفون بند دی — په براوزر تنظیماتو کې یې فعال کړه");else viStart2();}).catch(function(){viStart2();});return;}viStart2();}
function viStart2(){var SR=typeof SpeechRecognition!=="undefined"?SpeechRecognition:(typeof webkitSpeechRecognition!=="undefined"?webkitSpeechRecognition:null);if(SR){viStartSpeech(SR);return;}if(typeof voiceHasMic==="function"&&voiceHasMic()){viStartGateway();return;}showToast("په دې وسیله کې غږیز ثبت نشته");}
function viStartSpeech(SR){var inp=document.getElementById("askInput");VI_START=inp?inp.value:"";var r=new SR();r.lang="ps-AF";r.interimResults=true;r.continuous=false;r.onresult=function(e){if(VI_MODE!=="speech")return;var t="";for(var i=0;i<e.results.length;i++)t+=e.results[i][0].transcript;if(inp)inp.value=VI_START+(VI_START&&t?" ":"")+t;};r.onend=function(){viEnd();};r.onerror=function(){viEnd();showToast(VI_NH);};VI_REC=r;VI_MODE="speech";try{r.start();}catch(e){viEnd();showToast("غږیز ثبت پیل نه شو");return;}viMicBusy(true);viCancelBtn(true);}
function viStopSpeech(){if(VI_REC){try{VI_REC.stop();}catch(e){}}viEnd();}
function viStartGateway(){VI_COMP=true;VI_CANC=false;VI_MODE="gateway";voiceStartRecording();viMicBusy(true);viCancelBtn(true);}
function viCancel(){if(VI_MODE==="speech"){viStopSpeech();var inp=document.getElementById("askInput");if(inp)inp.value=VI_START;}else if(VI_MODE==="gateway"){VI_CANC=true;if(voiceRecording)voiceStopRecording();}showToast("ثبت لغوه شو");}
if(typeof showVoiceResult==="function"){var _viSVR=showVoiceResult;showVoiceResult=function(r){if(VI_COMP){var t=r&&r.text?r.text:"";var inp=document.getElementById("askInput");if(t&&inp){inp.value=(inp.value?inp.value+" ":"")+t;showToast("متن کېښودل شو — وګوره بیا یې واستوه");}else showToast(VI_NH);viEnd();return;}_viSVR(r);};}
if(typeof voicePanelError==="function"){var _viVPE=voicePanelError;voicePanelError=function(e){if(VI_COMP){showToast("غږیز ثبت ناکام شو — بیا هڅه وکړه");viEnd();return;}_viVPE(e);};}
if(typeof voiceFinishRecording==="function"){var _viVFR=voiceFinishRecording;voiceFinishRecording=function(){if(VI_COMP&&VI_CANC){if(voiceStream){voiceStream.getTracks().forEach(function(t){try{t.stop();}catch(e){}});voiceStream=null;}setAction("چمتو یم");viEnd();return;}_viVFR();};}
viMicBtn();
