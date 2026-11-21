// BEYOND X module 23/24: voicelib — recorder + playback + device voices.
var voiceRecorder = null;
var voiceChunks = [];
var voiceRecording = false;
var voiceRecordTimer = null;
var voiceStream = null;
var voiceMime = "";
var voiceChatMode = false;
var VOICE_MAX_SECONDS = 60;
var VOICE_RECORDER_MIMES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
function voiceHasMic() {
    return typeof navigator !== "undefined" && !!navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function";
}
function voicePickMime() {
    if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return "";
    for (var i = 0; i < VOICE_RECORDER_MIMES.length; i++) {
        if (MediaRecorder.isTypeSupported(VOICE_RECORDER_MIMES[i])) return VOICE_RECORDER_MIMES[i];
    }
    return "";
}
function voiceTooBig(b64) { return b64.length > 2800000; }
function voiceLangOf(s) { return /[\u0600-\u06FF]/.test(s) ? "ps" : "en"; }
function voiceChat() {
    voiceChatMode = true;
    voiceStartRecording();
}
function voiceStartRecording() {
    if (voiceRecording) return;
    if (!voiceHasMic() || typeof MediaRecorder === "undefined") { voicePanelError(new Error("NoMic")); return; }
    voiceMime = voicePickMime();
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        voiceStream = stream;
        voiceChunks = [];
        voiceRecorder = new MediaRecorder(stream, voiceMime ? { mimeType: voiceMime } : undefined);
        voiceRecorder.ondataavailable = function (e) { if (e.data && e.data.size > 0) voiceChunks.push(e.data); };
        voiceRecorder.onstop = voiceFinishRecording;
        voiceRecorder.start();
        voiceRecording = true;
        setAction("ثبتېږي...");
        voiceRecordTimer = setTimeout(voiceStopRecording, VOICE_MAX_SECONDS * 1000);
    }).catch(function () { voicePanelError(new Error("NoMic")); });
}
function voiceStopRecording() {
    if (voiceRecordTimer) { clearTimeout(voiceRecordTimer); voiceRecordTimer = null; }
    if (voiceRecorder && voiceRecording) {
        try { voiceRecorder.stop(); } catch (e) { /* already stopped */ }
    }
    voiceRecording = false;
    setAction("چمتو یم");
}
function voiceFinishRecording() {
    voiceRecording = false;
    if (voiceStream) {
        voiceStream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) { /* ignore */ } });
        voiceStream = null;
    }
    setAction("چمتو یم");
    if (typeof FileReader === "undefined" || typeof Blob === "undefined") { voicePanelError(new Error("NoMic")); return; }
    var blob = new Blob(voiceChunks, { type: voiceMime || "audio/webm" });
    var reader = new FileReader();
    reader.onload = function () {
        var b64 = (String(reader.result).split(",")[1]) || "";
        if (!b64) { voicePanelError(new Error("NoSpeech")); return; }
        if (voiceTooBig(b64)) { voicePanelError(new Error("TooBig")); return; }
        voiceTranscribe(b64, voiceMime || "audio/webm", voiceChatMode);
        voiceChatMode = false;
    };
    reader.readAsDataURL(blob);
}
function voicePlayAudio(b64, mimeType) {
    if (typeof Audio === "undefined") return false;
    voiceLastAudio = { b64: b64, mimeType: mimeType };
    if (!voiceAudioEl) voiceAudioEl = new Audio();
    voiceAudioEl.src = "data:" + mimeType + ";base64," + b64;
    try { voiceAudioEl.play(); } catch (e) { return false; }
    return true;
}
function voiceSpeakDevice(text, lang) {
    if (typeof speechSynthesis === "undefined") return false;
    try {
        speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.lang = lang === "ps" ? "ps-AF" : "en-US";
        var voices = speechSynthesis.getVoices ? speechSynthesis.getVoices() : [];
        for (var i = 0; i < voices.length; i++) {
            if (voices[i].lang && voices[i].lang.indexOf(lang === "ps" ? "ps" : "en") === 0) { u.voice = voices[i]; break; }
        }
        speechSynthesis.speak(u);
        return true;
    } catch (e) { return false; }
}
