// BEYOND X module 9/13: router — handleRequest + sendQuestion + panels
// Request router: discovery, activation, honest planned answers.
function handleRequest(q) {
    if (isCapabilityQuestion(q)) {
        addMessage("زه دا کولی شم: خبرې په پښتو او د ښوونځي کوئز (د انګلیسي لغتونه او جملې) او اسلامي (قرآن او حدیث) او کتابونه (لټون او لوستل) او انځورونه (جوړول او پوهېدل) او غږ (ثبتول او اورېدل) او لوبې (لوبې کول او جوړول) او ژبې (ژباړه او زده کړه) او پروګرام کول (کوډ ولیکه او وچلوه) او موبایل کنټرول (موبایل وپېژنه او کنټرول یې کړه). په راتلونکو پړاوونو کې راځي: NEON (۱۱م).", "ai");
        return;
    }
    const intent = analyzeIntent(q);
    const cap = CAPABILITIES[intent.capability];
    if (intent.capability === "school") {
        if (activateWorkspace("school", intent.mode)) {
            showPanel("school");
            addMessage("د ښوونځي کوئز دې لپاره جوړ شو — لوبه وکړه!", "ai");
        }
        askBeyond(q);
        return;
    }
    if (intent.capability === "islamic") {
        if (activateWorkspace("islamic", intent.mode)) {
            buildIslamicPanel();
            showPanel("islamic");
            addMessage("اسلامي کارځای دې لپاره جوړ شو — د قرآن او حدیث څخه ځواب درکوم.", "ai");
        }
        islamicAsk(q);
        return;
    }
    if (intent.capability === "books") {
        if (activateWorkspace("books", intent.mode)) {
            buildBooksPanel();
            showPanel("books");
            addMessage("د کتابونو کارځای دې لپاره جوړ شو — کتاب ولټوه او ولوله.", "ai");
        }
        // A question about the open book goes to the grounded
        // pipeline; anything else gets a generic chat answer (the
        // grounded answer needs an open book — a v1 limit).
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
        // The message usually IS the prompt: strip the trigger
        // words and generate from the rest; a bare trigger just
        // opens the panel.
        var p = imagesPromptFrom(q);
        if (p && imagesPromptEl) {
            imagesPromptEl.value = p;
            imagesGeneratePrompt(p, null);
        }
        return;
    }
    if (intent.capability === "voice") {
        if (activateWorkspace("voice", intent.mode)) {
            buildVoicePanel();
            showPanel("voice");
            addMessage("د غږ کارځای دې لپاره جوړ شو — په پښتو وغږېږه او واوره.", "ai");
            // "واوره" (listen) speaks the last answer; anything
            // else just opens the panel — recording needs a tap.
            if (q.indexOf("واوره") !== -1) voiceSpeakLast();
        }
        return;
    }
    if (intent.capability === "games") { routeGames(q); return; }
    if (intent.capability === "polyglot") { routeLanguage(q); return; }
    if (intent.capability === "programming") {
        if (activateWorkspace("programming", intent.mode)) {
            buildCodePanel();
            showPanel("code");
            addMessage("د پروګرام کولو کارځای دې لپاره جوړ شو — کوډ ولیکه، وچلوه او وګوره.", "ai");
        }
        // Prefill only — generating needs the user's tap.
        var c = codePromptFrom(q);
        if (c && codeGenIn) codeGenIn.value = c;
        return;
    }
    if (intent.capability === "mobile") {
        if (activateWorkspace("mobile", intent.mode)) {
            buildMobilePanel();
            showPanel("mobile");
            addMessage("د موبایل کارځای دې لپاره جوړ شو — خپل موبایل وپېژنه، تشخیص کړه او کنټرول یې کړه.", "ai");
        }
        return;
    }
    if (cap.status === "planned") {
        addMessage("د " + cap.name + " سیستم لا نه دی جوړ شوی — په " + pashtoDigits(cap.stage) + "م پړاو کې راځي. اوس زه دا کولی شم: خبرې په پښتو او د ښوونځي کوئز.", "ai");
        return;
    }
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

