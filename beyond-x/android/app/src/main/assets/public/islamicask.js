// BEYOND X module 14/15: islamicask — Islamic gateway calls (Bearer session, 60 s abort, identity checked).
async function xIslamic(path, token, body) {
    var ctrl = (typeof AbortController !== "undefined") ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, CHAT_TIMEOUT_MS);
    var resp;
    try {
        resp = await fetch(ISLAMIC_BASE + path, {
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
function islamicPanelError(e) {
    islamicClear();
    islamicAdd(e.message === "NotFound" ? "دا سرچینه ونه موندل شوه — حواله وګورئ." : "انټرنیټ نشته یا ځواب ونه رسېد — بیا هڅه وکړه");
}
async function islamicPanelCall(path, render) {
    buildIslamicPanel();
    try {
        render(await xIslamic(path, await ensureSession()));
    } catch (e) { islamicPanelError(e); }
}
async function islamicAsk(q) {
    setAction("فکر کوم...");
    try {
        var r = await xIslamic("/islamic/ask", await ensureSession(), { message: { text: q } });
        if (r.type === "ayah" || r.type === "hadith") {
            buildIslamicPanel();
            showPanel("islamic");
            islamicClear();
            showIslamicSource(r);
        } else {
            if (typeof r.text !== "string" || r.text.length === 0) throw new Error("Bad response");
            addMessage(r.text, "ai");
            if (r.sources) showIslamicSources(r.sources);
        }
    } catch (e) {
        var m = e.message;
        if (m === "RateLimit") recordError("rate_limit", 429);
        else if (m === "Timeout") recordError("timeout", 0);
        else if (m !== "NotFound") recordError(m === "Session" ? "session" : m === "Bad response" ? "bad_contract" : "network", 0);
        var msgs = { RateLimit: "ډېرې غوښتنې وشوې — لږ وروسته بیا هڅه وکړه", Timeout: "ځواب وځنډېد — بیا هڅه وکړه", NotFound: "دا سرچینه ونه موندل شوه — حواله وګورئ." };
        addMessage(msgs[m] || "انټرنیټ نشته یا ځواب ونه رسېد — بیا هڅه وکړه", "ai");
    } finally {
        setAction("چمتو یم");
    }
}
async function islamicSearch() {
    var q = islamicSearchEl.value.trim();
    if (!q) return;
    return islamicPanelCall("/quran/search?q=" + encodeURIComponent(q), function (r) {
        if (!Array.isArray(r.results)) throw new Error("Bad response");
        islamicClear();
        if (r.results.length === 0) { islamicAdd("هیڅ ونه موندل شو."); return; }
        r.results.forEach(function (it) {
            var d = islamicEl("div", it.ref + " — " + (it.snippet || ""));
            d.addEventListener("click", function () { showAyah(it.ref); });
            islamicResultEl.appendChild(d);
        });
    });
}
async function showAyah(ref) {
    return islamicPanelCall("/quran/ayah/" + ref, function (r) {
        if (typeof r.text !== "string" || r.text.length === 0) throw new Error("Bad response");
        islamicClear();
        showIslamicSource(r);
    });
}
