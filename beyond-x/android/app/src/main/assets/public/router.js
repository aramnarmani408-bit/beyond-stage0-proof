function deviceReadingGuard(q) {
    var hasDevice = /سکرین|موبایل|تلیفون/.test(q);
    if (!hasDevice) return null;
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
        addMessage("زه دا کولی شم: خبرې په پښتو او د ښوونځي کوئز (د انګلیسي لغتونه او جملې) او اسلامي (قرآن او حدیث) او کتابونه (لټون او لوستل) او انځورونه (جوړول او پوهېدل) او غږ (ثبتول او اورېدل) او لوبې (لوبې کول او جوړول) او ژبې (ژباړه او زده کړه) او پروګرام کول (کوډ ولیکه او وچلوه) او موبایل کنټرول (موبایل وپېژنه او کنټرول یې کړه) او درس او ډیزاین او روزنه او کوډ کارځای او پرېکړه.", "ai");
        return;
    }
    const intent = analyzeIntent(q);
    const cap = CAPABILITIES[intent.capability];
    if (intent.capability === "school") { routeSchool(q, intent.mode); return; }
    if (intent.capability === "islamic") {
        if (activateWorkspace("islamic", intent.mode)) {
            buildIslamicPanel();
            showPanel("islamic");
            addMessage("اسلامي کارځای دې لپاره جوړ شو — د قرآن او حدیث څخه ځواب درکوم.", "ai");
        }
        islamicAsk(q);
        return;
    }
    if (intent.capability === "books" && typeof deviceReadingGuard === "function") {
        var dg = deviceReadingGuard(q);
        if (dg === "mobile") intent.capability = "mobile";
        else if (dg === "ask") {
            addMessage("سکرین ولولم که بل څه؟ مهرباني وکړه روښانه یې کړه.", "ai");
            return;
        }
    }
    if (intent.capability === "books") {
        if (activateWorkspace("books", intent.mode)) {
            buildBooksPanel();
            showPanel("books");
            addMessage("د کتابونو کارځای دې لپاره جوړ شو — کتاب ولټوه او ولوله.", "ai");
        }
        if (booksCurrentEntry() && isBookQuestion(q)) booksAsk(q);
        else askBeyond(q);
        return;
    }
    if (intent.capability === "images") {
        if (activateWorkspace("images", intent.mode)) {
            buildImagesPanel();
            showPanel("images");
            addMessage("د انځورونو کارځای دې لپاره جوړ شو — انځور جوړ کړه او وپوهېږه.", "ai");
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
            addMessage("د موبایل کارځای دې لپاره جوړ شو — خپل موبایل وپېژنه، تشخیص کړه او کنټرول یې کړه.", "ai");
        }
        var t = typeof m2bParse === "function" && m2bParse(q); if (t) m2bRunChat(t);
        return;
    }
    if (cap.status === "planned") {
        addMessage("د " + cap.name + " سیستم لا نه دی جوړ شوی — په " + pashtoDigits(cap.stage) + "م پړاو کې راځي.", "ai");
        return;
    }
    if (typeof universeRoute === "function" && universeRoute(q)) return askBeyond(q);
    askBeyond(q);
}

function sendQuestion() {
    const input = document.getElementById("askInput");
    if (!input) return;
    const q = input.value.trim();
    if (!q) return;
    addMessage(q, "user");
    input.value = "";
    handleRequest(q);
}

