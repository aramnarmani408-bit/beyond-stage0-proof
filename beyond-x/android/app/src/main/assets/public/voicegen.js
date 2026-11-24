async function xVoice(path, token, body) {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, CHAT_TIMEOUT_MS);
    var resp;
    try {
        resp = await fetch(VOICE_BASE + path, {
            method: body ? "POST" : "GET",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: body ? JSON.stringify(body) : undefined,
            signal: ctrl ? ctrl.signal : undefined
        });
    } catch (e) {
        clearTimeout(timer);
        throw new Error(e.name === "AbortError" ? "Timeout" : "Network");
    }
    clearTimeout(timer);
    if (resp.status === 429) throw new Error("RateLimit");
    if (resp.status === 401) { sessionToken = null; sessionExpiry = 0; throw new Error("Unauthorized"); }
    if (!resp.ok) throw new Error("Network");
    var data = await resp.json();
    if (!data || (data.status !== "success" && data.status !== "partial" && data.status !== "failed") || !data.response
        || data.response.identity !== "beyondx") throw new Error("Bad response");
    return data.response;
}
async function voiceTranscribe(b64, mimeType, chat) {
    setAction("فکر کوم...");
    try {
        var r = await xVoice("/voice/transcribe", await ensureSession(), { audio: b64, mimeType: mimeType, lang: "ps" });
        if (!r.text) {
            if (r.reason === "no speech detected") voicePanelError(new Error("NoSpeech"));
            else voicePanelError(new Error("Failed: " + (r.reason || "نامعلومه ستونزه")));
            return;
        }
        showVoiceResult(r);
        if (chat) voiceChatAnswer(r.text);
    } catch (e) { voicePanelError(e); }
    finally { setAction("چمتو یم"); }
}
async function voiceSpeak(text, lang) {
    var l = lang || "ps";
    setAction("فکر کوم...");
    try {
        var r = await xVoice("/voice/speak", await ensureSession(), { text: text, lang: l, voice: (typeof ttsVoiceId === "function" ? ttsVoiceId(l) : undefined) });
        if (!r.audio) {
            if (!voiceSpeakDevice(text, l)) voicePanelError(new Error("Failed: " + (r.reason || "نامعلومه ستونزه")));
            return;
        }
        if (!voicePlayAudio(r.audio, r.mimeType || "audio/mpeg")) voiceSpeakDevice(text, l);
    } catch (e) {
        if (!voiceSpeakDevice(text, l)) voicePanelError(e);
    }
    finally { setAction("چمتو یم"); }
}
function voiceSpeakLast() {
    var last = null;
    var ms = AppState.messages;
    for (var i = ms.length - 1; i >= 0; i--) {
        if (ms[i].who === "ai") { last = ms[i].text; break; }
    }
    if (!last) { voiceAdd("لومړی یوه پوښتنه وکړه — بیا ځواب واوره."); return; }
    voiceSpeak(last.slice(0, 500), voiceLangOf(last));
}
async function voiceChatAnswer(text) {
    setAction("فکر کوم...");
    chatState.status = "busy";
    renderXcore();
    addMessage(text, "user");
    try {
        var token = await ensureSession();
        var answer;
        try { answer = await xChat(text, token); }
        catch (e) {
            if (e.message !== "Unauthorized") throw e;
            sessionToken = null; sessionExpiry = 0;
            token = await ensureSession();
            answer = await xChat(text, token);
        }
        addMessage(answer, "ai");
        chatState.status = "ready";
        voiceSpeak(answer.slice(0, 500), voiceLangOf(answer));
    } catch (e) {
        chatState.status = "failed";
        addMessage(e.message === "RateLimit" ? "ډېرې غوښتنې وشوې — لږ وروسته بیا هڅه وکړه" : "انټرنیټ نشته یا ځواب ونه رسېد — بیا هڅه وکړه", "ai");
    } finally { setAction("چمتو یم"); renderXcore(); }
}
async function voiceRefreshStatus() {
    try {
        var r = await xVoice("/voice/status", await ensureSession());
        if (r.providers) showVoiceStatus(r.providers);
    } catch (e) { /* best-effort */ }
}
