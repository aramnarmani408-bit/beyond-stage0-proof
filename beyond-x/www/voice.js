// BEYOND X module 22/24: voice — panel + rendering.
var voicePanelEl = null;
var voiceTranscriptEl = null;
var voiceStatusEl = null;
var voiceTextEl = null;
var voiceAudioEl = null;
var voiceLastAudio = null;
var VOICE_BASE = "https://beyond-build-gateway.aramnarmani408.workers.dev/api/v1/x";
function voiceEl(tag, text) {
    var el = document.createElement(tag);
    el.textContent = text;
    return el;
}
function voiceBtn(text, fn) {
    var b = voiceEl("button", text);
    b.addEventListener("click", fn);
    return b;
}
function voiceAdd(text) {
    if (text) voiceTranscriptEl.appendChild(voiceEl("div", text));
}
function voiceClear() {
    while (voiceTranscriptEl.firstChild) voiceTranscriptEl.removeChild(voiceTranscriptEl.firstChild);
}
function buildVoicePanel() {
    if (voicePanelEl) return voicePanelEl;
    var panel = document.createElement("div");
    panel.id = "voicePanel";
    panel.style.display = "none";
    panel.style.flex = "1";
    panel.style.flexDirection = "column";
    panel.style.gap = "12px";
    panel.appendChild(voiceBtn("← بیرته", function () { showPanel("chat"); }));
    panel.appendChild(voiceEl("div", "غږ"));
    panel.appendChild(voiceEl("div", "پښتو پېژندل لا کمزوری دی — ازمایښتي دی."));
    panel.appendChild(voiceBtn("ثبت کړه", voiceStartRecording));
    panel.appendChild(voiceBtn("ودروه", voiceStopRecording));
    voiceTranscriptEl = document.createElement("div");
    panel.appendChild(voiceTranscriptEl);
    var actions = document.createElement("div");
    actions.appendChild(voiceBtn("واوره", voiceSpeakLast));
    actions.appendChild(voiceBtn("غږیزې خبرې", voiceChat));
    panel.appendChild(actions);
    voiceStatusEl = document.createElement("div");
    panel.appendChild(voiceStatusEl);
    document.getElementById("main").appendChild(panel);
    voicePanelEl = panel;
    voiceRefreshStatus();
    return panel;
}
function showVoicePanel(show) {
    if (voicePanelEl) voicePanelEl.style.display = show ? "flex" : "none";
}
function showVoiceResult(r) {
    voiceClear();
    voiceAdd("پېژندل شوی متن: " + r.text);
    if (r.warning === "low_confidence") voiceAdd("شاید سم ونه پېژندل شو");
    voiceTextEl = document.createElement("input");
    voiceTextEl.value = r.text;
    voiceTextEl.style.cssText = "background:#0A0A1F;color:#F1F5F9;";
    voiceTranscriptEl.appendChild(voiceTextEl);
    voiceTranscriptEl.appendChild(voiceBtn("لیږل", function () {
        var q = voiceTextEl.value.trim();
        if (!q) return;
        addMessage(q, "user");
        handleRequest(q);
    }));
}
function showVoiceStatus(providers) {
    while (voiceStatusEl.firstChild) voiceStatusEl.removeChild(voiceStatusEl.firstChild);
    Object.keys(providers).forEach(function (k) {
        var v = providers[k];
        voiceStatusEl.appendChild(voiceEl("div", k + ": " + (v.ok === true ? "سم دی ✓" : v.ok === false ? "کار نه کوي" : "نامعلوم")));
    });
}
function voicePanelError(e) {
    voiceClear();
    var m = e.message || "";
    if (m.indexOf("Failed: ") === 0) voiceAdd("غږ ونه پېژندل شو — " + m.slice(8));
    else if (m === "RateLimit") voiceAdd("ډېرې غوښتنې وشوې — لږ وروسته بیا هڅه وکړه");
    else if (m === "TooBig") voiceAdd("غږ ډېر لوی دی — تر ۲ میګابایټ پورې.");
    else if (m === "NoMic") voiceAdd("مایکروفون اجازه نه ده ورکړل شوې — په متن ولیکئ.");
    else if (m === "NoSpeech") voiceAdd("کوم غږ ونه اورېدل شو — بیا هڅه وکړه.");
    else voiceAdd("انټرنیټ نشته یا ځواب ونه رسېد — بیا هڅه وکړه");
}
