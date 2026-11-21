// BEYOND X module 8/13: ask — askBeyond (local identity, 401 retry, errors)
async function askBeyond(question) {
    // Identity is answered LOCALLY, never by the model: the free model
    // claims OpenAI made it even when instructed otherwise (proven
    // 2026-11-20). The app states its own identity.
    if (isIdentityQuestion(question)) {
        setAction("ځواب ورکوم");
        addMessage("زه BEYOND X یم، د BEYOND AI جوړ کړی هوښیار مرستیال یم.", "ai");
        setAction("چمتو یم");
        return;
    }
    setAction("فکر کوم...");
    chatState.status = "busy";
    renderXcore();
    try {
        // The app NEVER calls a model directly. It talks to BEYOND's
        // gateway (keys server-side, Safety Net lanes, identity +
        // Pashto enforced, every answer validated). Raw question,
        // no prefix — the gateway applies its own system prompt.
        let token = await ensureSession();
        let text;
        try {
            text = await xChat(question, token);
        } catch (e) {
            // One refresh + one retry on 401, then the honest message.
            if (e.message !== "Unauthorized") throw e;
            sessionToken = null;
            sessionExpiry = 0;
            token = await ensureSession();
            text = await xChat(question, token);
        }
        setAction("ځواب ورکوم");
        addMessage(text, "ai");
        chatState.status = "ready";
    } catch (e) {
        chatState.status = "failed";
        if (e.message === "RateLimit") {
            recordError("rate_limit", 429);
            addMessage("ډېرې غوښتنې وشوې — لږ وروسته بیا هڅه وکړه", "ai");
        } else if (e.message === "Timeout") {
            recordError("timeout", 0);
            addMessage("ځواب وځنډېد — بیا هڅه وکړه", "ai");
        } else {
            recordError(e.message === "Session" ? "session" : e.message === "Bad response" ? "bad_contract" : "network", 0);
            addMessage("انټرنیټ نشته یا ځواب ونه رسېد — بیا هڅه وکړه", "ai");
        }
    } finally {
        setAction("چمتو یم");
        renderXcore();
    }
}

