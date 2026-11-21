async function xBooks(path, token, body) {
    var ctrl = (typeof AbortController !== "undefined") ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, CHAT_TIMEOUT_MS);
    var resp;
    try {
        resp = await fetch(BOOKS_BASE + path, {
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
    if (resp.status === 404) throw new Error("NotFound");
    if (!resp.ok) throw new Error("Network");
    var data = await resp.json();
    if (!data || (data.status !== "success" && data.status !== "partial") || !data.response
        || data.response.identity !== "beyondx") throw new Error("Bad response");
    return data.response;
}
async function booksSearch() {
    var q = booksSearchEl.value.trim();
    if (!q) return;
    return booksPanelCall("/books/search?q=" + encodeURIComponent(q), function (r) {
        if (!Array.isArray(r.results)) throw new Error("Bad response");
        showBookSearchResults(r.results);
    });
}
async function booksOpen(ia, file, title, author) {
    buildBooksPanel();
    showPanel("books");
    try {
        var r = await xBooks("/books/resolve?ia=" + encodeURIComponent(ia) + (file ? "&file=" + encodeURIComponent(file) : ""), await ensureSession());
        if (r.readable === false) { booksClear(); booksAdd(r.reasonText || "دا کتاب نشي لوستل کېدلی."); return; }
        booksLib.current = booksAddEntry(ia, r.file, title || r.title || ia, author || r.author || "", r.totalPagesEstimate || 0);
        saveBooks();
        booksClear();
        booksAdd(booksLib.books[booksLib.current].title);
        return booksLoadPage(booksLib.books[booksLib.current].page || 1);
    } catch (e) { booksPanelError(e); }
}
async function booksLoadPage(page) {
    var entry = booksCurrentEntry();
    if (!entry) return;
    return booksPanelCall("/books/page?ia=" + encodeURIComponent(entry.ia) + "&file=" + encodeURIComponent(entry.file) + "&page=" + page, function (r) {
        if (typeof r.text !== "string" || r.text.length === 0) throw new Error("Bad response");
        showBookPage(r);
    });
}
async function booksAsk(q) {
    var entry = booksCurrentEntry();
    if (!entry) { addMessage("لومړی یو کتاب پرانیزه — بیا ترې پوښتنه وکړه.", "ai"); return; }
    setAction("فکر کوم...");
    try {
        var r = await xBooks("/books/ask", await ensureSession(), { message: { text: q }, ia: entry.ia, file: entry.file });
        if (typeof r.text !== "string" || r.text.length === 0) throw new Error("Bad response");
        addMessage(r.text, "ai");
        if (r.sources) showBookSources(r.sources);
    } catch (e) {
        var m = e.message;
        if (m === "RateLimit") recordError("rate_limit", 429);
        else if (m === "Timeout") recordError("timeout", 0);
        else if (m !== "NotFound") recordError(m === "Session" ? "session" : m === "Bad response" ? "bad_contract" : "network", 0);
        var msgs = { RateLimit: "ډېرې غوښتنې وشوې — لږ وروسته بیا هڅه وکړه", Timeout: "ځواب وځنډېد — بیا هڅه وکړه", NotFound: "دا کتاب ونه موندل شو." };
        addMessage(msgs[m] || "انټرنیټ نشته یا ځواب ونه رسېد — بیا هڅه وکړه", "ai");
    } finally {
        setAction("چمتو یم");
    }
}
