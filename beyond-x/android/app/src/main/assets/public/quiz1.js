// BEYOND X module 10/13: quiz1 — quiz start, sentence quiz, revision, mode
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

// Sentence-completion quiz data: the 87 textbook words that have a
// verbatim example sentence (vocab.js, generated from the verified
// extraction). Guarded — the word quiz works without it.
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
// Distractors: words from the same chapter first, then others.
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

// Revision queue: the words the learner got wrong, re-presented
// until they answer them right. The weak list is the mastery
// record — it survives restarts (saved with the progress).
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

// Direction toggle: English→Pashto (default) or Pashto→English
// (the reverse exercise — the same real words, the other way).
function toggleMode() {
    if (quizState.kind !== "word") return; // direction is for the word quiz only
    quizState.mode = quizState.mode === "en-ps" ? "ps-en" : "en-ps";
    const modeBtn = document.getElementById("modeBtn");
    if (modeBtn) modeBtn.textContent = quizState.mode === "en-ps" ? "↔ پښتو ← انګلیسي" : "↔ انګلیسي ← پښتو";
    startQuiz();
}

