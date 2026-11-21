async function askBeyond(question) {
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
        let token = await ensureSession();
        let text;
        try {
            text = await xChat(question, token);
        } catch (e) {
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

