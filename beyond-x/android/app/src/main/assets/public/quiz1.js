function startQuiz() {
    quizState.pos = 0;
    quizState.score = 0;
    quizState.lock = false;
    quizState.queue = [0, 1, 2, 3, 4, 5];
    quizState.revising = false;
    quizState.kind = "word";
    saveProgress();
    showQuizQuestion();
}

function vocabItems() {
    if (typeof VOCAB === "undefined" || !Array.isArray(VOCAB)) return [];
    return VOCAB;
}
function startSentenceQuiz() {
    const items = vocabItems();
    const feedbackEl = document.getElementById("quizFeedback");
    if (items.length === 0) {
        if (feedbackEl) feedbackEl.textContent = "د جملو لغتونه نشته";
        return;
    }
    quizState.pos = 0;
    quizState.score = 0;
    quizState.lock = false;
    quizState.queue = items.map(function (it, i) { return i; });
    quizState.revising = false;
    quizState.kind = "sentence";
    saveProgress();
    showQuizQuestion();
}
function sentenceOptions(idx) {
    const items = vocabItems();
    const correct = items[idx].en;
    const ch = items[idx].chapter;
    const pool = [];
    for (let i = 0; i < items.length; i++) {
        if (i !== idx && items[i].chapter === ch) pool.push(items[i].en);
    }
    for (let i = 0; i < items.length && pool.length < 3; i++) {
        if (i !== idx && items[i].chapter !== ch) pool.push(items[i].en);
    }
    const options = [correct].concat(pool.slice(0, 3));
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = options[i]; options[i] = options[j]; options[j] = t;
    }
    return options;
}

function startRevision() {
    const feedbackEl = document.getElementById("quizFeedback");
    const weakList = quizState.kind === "sentence" ? quizState.sentWeak : quizState.weak;
    if (weakList.length === 0) {
        if (feedbackEl) feedbackEl.textContent = "کمزورې کلمې نشته — ټولې زده شوې!";
        return;
    }
    quizState.pos = 0;
    quizState.score = 0;
    quizState.lock = false;
    quizState.queue = weakList.slice();
    quizState.revising = true;
    saveProgress();
    showQuizQuestion();
}

function toggleMode() {
    if (quizState.kind !== "word") return; // direction is for the word quiz only
    quizState.mode = quizState.mode === "en-ps" ? "ps-en" : "en-ps";
    const modeBtn = document.getElementById("modeBtn");
    if (modeBtn) modeBtn.textContent = quizState.mode === "en-ps" ? "↔ پښتو ← انګلیسي" : "↔ انګلیسي ← پښتو";
    startQuiz();
}

// Phase 1 (2026-11-22): demo-box content — the local worked example (a real
// quiz question computed live from quizWords, never canned) + the recent-
// chats strip (max 3 rows, title + time, only when chats exist).
function demoQuizExample(box) {
    var idx = Math.floor(Math.random() * quizWords.length);
    var pair = quizWords[idx];
    var q = document.createElement("div");
    q.textContent = "«" + pair[0] + "» په پښتو څه کېږي؟";
    box.appendChild(q);
    var opts = [pair[1]];
    for (var i = 0; i < quizWords.length && opts.length < 4; i++) {
        if (i !== idx) opts.push(quizWords[i][1]);
    }
    for (var j = opts.length - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var t = opts[j]; opts[j] = opts[k]; opts[k] = t;
    }
    var fb = document.createElement("div");
    for (var m = 0; m < opts.length; m++) {
        const o = opts[m];
        var b = document.createElement("button");
        b.textContent = o;
        b.addEventListener("click", function () {
            fb.textContent = o === pair[1] ? "سم دی ✓" : "غلط دی — سم ځواب: " + pair[1];
        });
        box.appendChild(b);
    }
    box.appendChild(fb);
}
function demoRecentStrip(box) {
    var cs = Array.isArray(AppState.chats) ? AppState.chats : [];
    var rows = cs.filter(function (c) { return c.messages.length > 0 && c.id !== AppState.convId && !c.archived; });
    rows.sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); });
    rows = rows.slice(0, 3);
    for (var i = 0; i < rows.length; i++) {
        var c = rows[i];
        var t = "";
        if (c.updated) {
            var d = new Date(c.updated);
            t = " — " + d.getHours() + ":" + ("0" + d.getMinutes()).slice(-2);
        }
        const id = c.id;
        var b = document.createElement("button");
        b.textContent = (c.title || chatTitleOf(c, 0)) + t;
        b.addEventListener("click", function () { switchChat(id); });
        box.appendChild(b);
    }
}
