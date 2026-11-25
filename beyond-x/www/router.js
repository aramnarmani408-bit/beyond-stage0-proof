function deviceReadingGuard(q) {
    if (!/سکرین|موبایل|تلیفون/.test(q)) return null;
    if (!/ولول|لوستل/.test(q)) return null;
    if (q.indexOf("کتاب") !== -1) return null;
    if (/عکس|انځور/.test(q)) return null;
    var r = q.replace(/په (موبایل|تلیفون|سکرین) کې/g, "");
    if (/سکرین|موبایل|تلیفون/.test(r)) return "mobile";
    if (q.indexOf("متن") !== -1) return "mobile";
    return "ask";
}
function handleRequest(q) {
    if (isCapabilityQuestion(q)) {
        addMessage("زه دا کولی شم: خبرې په پښتو، کوئز، اسلامي، کتابونه، انځورونه، غږ، لوبې، ژبې، پروګرام کول، موبایل کنټرول، درس، ډیزاین او روزنه.", "ai");
        return;
    }
    const intent = analyzeIntent(q);
    const cap = CAPABILITIES[intent.capability];
    if (intent.capability === "school") { routeSchool(q, intent.mode); return; }
    if (intent.capability === "islamic") {
        if (activateWorkspace("islamic", intent.mode)) {
            buildIslamicPanel();
            showPanel("islamic");
            addMessage("اسلامي کارځای جوړ شو.", "ai");
        }
        islamicAsk(q);
        return;
    }
    if (intent.capability === "books" && typeof deviceReadingGuard === "function") {
        var dg = deviceReadingGuard(q);
        if (dg === "mobile") intent.capability = "mobile";
        else if (dg === "ask") {
            addMessage("سکرین ولولم که بل څه؟ روښانه یې کړه.", "ai");
            return;
        }
    }
    if (intent.capability === "books") {
        var bE = typeof booksCurrentEntry === "function" && booksCurrentEntry();
        var bQ = typeof isBookQuestion === "function" ? isBookQuestion(q) : true;
        if ((bE && bQ || !bQ) && activateWorkspace("books", intent.mode)) {
            buildBooksPanel();
            showPanel("books");
            addMessage("د کتابونو کارځای جوړ شو.", "ai");
        }
        if (bE && bQ) booksAsk(q); else askBeyond(q);
        return;
    }
    if (intent.capability === "images") {
        if (activateWorkspace("images", intent.mode)) {
            buildImagesPanel();
            showPanel("images");
            addMessage("د انځورونو کارځای جوړ شو.", "ai");
        }
        var p = imagesPromptFrom(q);
        if (p && imagesPromptEl) {
            imagesPromptEl.value = p;
            imagesGeneratePrompt(p, null);
        }
        return;
    }
    if (intent.capability === "voice") { routeVoice(q, intent.mode); return; }
    if (intent.capability === "games") { routeGames(q); return; }
    if (intent.capability === "polyglot") { routeLanguage(q); return; }
    if (intent.capability === "programming" && !(typeof universeDirect === "function" && universeDirect(q) === "code")) { routeCode(q, intent.mode); return; }
    if (intent.capability === "mobile") {
        if (activateWorkspace("mobile", intent.mode)) {
            buildMobilePanel();
            showPanel("mobile");
            addMessage("د موبایل کارځای جوړ شو.", "ai");
        }
        var t = typeof m2bParse === "function" && m2bParse(q); if (t) m2bRunChat(t);
        return;
    }
    if (cap.status === "planned") {
        addMessage("د " + cap.name + " لا نه دی جوړ شوی — په " + pashtoDigits(cap.stage) + "م پړاو کې راځي.", "ai");
        return;
    }
    if (typeof universeRoute === "function" && universeRoute(q)) return askBeyond(q);
    askBeyond(q);
}

function sendQuestion() {
    const input = document.getElementById("askInput");
    if (!input) return;
    var q = input.value.trim();
    if (!q) {
        if (typeof attach2HasPending === "function" && attach2HasPending()) q = ATTACH_DEFAULT_Q;
        else return;
    }
    addMessage(q, "user");
    input.value = "";
    handleRequest(q);
}

