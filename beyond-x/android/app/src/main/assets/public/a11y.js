// Accessibility (parts list §11): screen-reader labels, touch
// targets, visible focus, high contrast, reduced motion, readable
// Pashto text. Font size already exists as a theme pref (theme.js
// applyTheme sets the root font size); this module does not duplicate
// it. Status is already text + color (xcoreLine), not color alone.
var A11Y_CSS="body.a11y-contrast{--tx:#000;--bg:#FFF;--sf:#FFF;--mu:#222;--bd:#000;--ac:#03C;--bb:#CCE0FF;--cd:#EEE}#sendBtn,#attachBtn,#voiceMicBtn,#voiceCancelBtn{min-width:44px!important;min-height:44px!important}:focus{outline:2px solid var(--ac);outline-offset:1px}.msg{line-height:1.8}";
if(typeof document!=="undefined"&&document.head&&!document.getElementById("a11yStyle")){var a11yst=document.createElement("style");a11yst.id="a11yStyle";a11yst.textContent=A11Y_CSS;document.head.appendChild(a11yst);}
function a11yLabel(id,txt){var e=typeof document!=="undefined"?document.getElementById(id):null;if(e&&e.setAttribute)e.setAttribute("aria-label",txt);}
function a11yLabels(){a11yLabel("askInput","خپله پوښتنه ولیکئ");a11yLabel("sendBtn","واستوه");a11yLabel("attachBtn","انځور ضمیمه کړه");a11yLabel("voiceMicBtn","غږیز ثبت");a11yLabel("voiceCancelBtn","لغوه کړه");a11yLabel("drawerBtn","مینیو");a11yLabel("newChatBtn","نوې خبرې");a11yLabel("jumpBtn","وروستی پیغام");a11yLabel("stopBtn","ودروه");}
function a11yContrastOn(){return typeof themePrefs!=="undefined"&&themePrefs.contrast==="on";}
if(typeof attachActions==="function"){var _a11yAA=attachActions;attachActions=function(msgEl,text){_a11yAA(msgEl,text);var area=document.getElementById("chatArea");if(!area)return;for(var i=area.children.length-1;i>=0;i--){if(area.children[i].className!=="act-row")continue;var row=area.children[i];for(var j=0;j<row.children.length;j++){var b=row.children[j],t=b.textContent;if(t==="کاپي")b.setAttribute("aria-label","ځواب کاپي کړه");else if(t==="بیا جوړ کړه")b.setAttribute("aria-label","ځواب بیا جوړ کړه");else if(t==="👍")b.setAttribute("aria-label","ګټور و");else if(t==="👎")b.setAttribute("aria-label","ګټور نه و");else if(t==="🔊")b.setAttribute("aria-label","ځواب واوره");}return;}};}
if(typeof viCancelBtn==="function"){var _a11yVC=viCancelBtn;viCancelBtn=function(show){_a11yVC(show);if(show)a11yLabel("voiceCancelBtn","لغوه کړه");};}
if(typeof buildChatButtons==="function"){var _a11yBCB=buildChatButtons;buildChatButtons=function(){_a11yBCB();a11yLabels();};}
if(typeof applySetPrefs==="function"){var _a11yASP=applySetPrefs;applySetPrefs=function(){_a11yASP();if(typeof setPrefs!=="undefined"&&setPrefs.motion==="off"&&typeof avatar3dStop==="function")avatar3dStop();};}
a11yLabels();
