// BEYOND X module 26/27: gamesgen — Games gateway calls.
var gamesPollTimer = null;
var gamesPollCount = 0;
var gamesPendingDesc = "";
var GAMES_POLL_MS = 15000;
var GAMES_MAX_POLLS = 40;
async function xGames(path, token, body) {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, CHAT_TIMEOUT_MS);
    var resp;
    try {
        resp = await fetch(GAMES_BASE + path, {
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
async function gamesRequest(description) {
    setAction("فکر کوم...");
    try {
        var r = await xGames("/games/request", await ensureSession(), { description: description });
        if (!r.game_id) {
            gamesPanelError(new Error("Failed: " + (r.reason || "نامعلومه ستونزه")));
            return null;
        }
        gamesPendingDesc = description;
        gamesPollCount = 0;
        if (gamesPollTimer) { clearTimeout(gamesPollTimer); gamesPollTimer = null; }
        gamesPollStatus(r.game_id);
        return r;
    } catch (e) { gamesPanelError(e); return null; }
    finally { setAction("چمتو یم"); }
}
async function gamesPollStatus(id) {
    try {
        var r = await xGames("/games/status?id=" + encodeURIComponent(id), await ensureSession());
        if (r.status === "ready") {
            gamesShowPlay(r.play_url, r.apk_url);
            gamesAddSaved(id, gamesPendingDesc, r.play_url, r.apk_url);
            return;
        }
        if (r.status === "failed") {
            gamesPanelError(new Error("Failed: " + (r.reason || "نامعلومه ستونزه")));
            return;
        }
        gamesPollCount++;
        if (gamesPollCount >= GAMES_MAX_POLLS) {
            gamesPanelError(new Error("Failed: جوړېدل ډېر وخت ونیو — بیا هڅه وکړه"));
            return;
        }
        gamesClear();
        gamesAdd("جوړېږي...");
        gamesAdd("لومړی ځل ~۹ مېګابایټ ښکته کېږي");
        gamesPollTimer = setTimeout(function () { gamesPollStatus(id); }, GAMES_POLL_MS);
    } catch (e) { gamesPanelError(e); }
}
function gamesShowPlay(url, apkUrl) {
    while (gamesPlayEl.firstChild) gamesPlayEl.removeChild(gamesPlayEl.firstChild);
    var f = document.createElement("iframe");
    f.src = url;
    f.setAttribute("sandbox", "allow-scripts");
    f.style.width = "100%";
    f.style.height = "400px";
    gamesPlayEl.appendChild(f);
    if (apkUrl) gamesPlayEl.appendChild(gamesEl("div", "APK: " + apkUrl));
    gamesClear();
    gamesAdd("لوبه چمتو ده — ولوبېږه!");
}
async function gamesRequestFromPanel() {
    var d = gamesInputEl.value.trim();
    if (!d) { gamesPanelError(new Error("NoDescription")); return; }
    gamesClear();
    gamesAdd("جوړېږي...");
    await gamesRequest(d);
}
