// BEYOND X module 12/13: answer — answerQuiz (scoring + weak words)
function answerQuiz(chosen) {
    if (quizState.lock) return;
    quizState.lock = true;
    const idx = quizState.queue[quizState.pos];
    let correct;
    if (quizState.kind === "sentence") {
        correct = vocabItems()[idx].en;
    } else {
        const answerCol = quizState.mode === "en-ps" ? 1 : 0;
        correct = quizWords[idx][answerCol];
    }
    const weakList = quizState.kind === "sentence" ? quizState.sentWeak : quizState.weak;
    const feedbackEl = document.getElementById("quizFeedback");
    const scoreEl = document.getElementById("quizScore");
    if (chosen === correct) {
        quizState.score += 1;
        if (feedbackEl) feedbackEl.textContent = "سم دی ✓";
        // A weak word answered right is no longer weak.
        const w = weakList.indexOf(idx);
        if (w !== -1) weakList.splice(w, 1);
    } else {
        if (feedbackEl) feedbackEl.textContent = "غلط دی — سم ځواب: " + correct;
        if (weakList.indexOf(idx) === -1) weakList.push(idx);
    }
    if (scoreEl) scoreEl.textContent = quizState.score + "/" + quizState.queue.length;
    quizState.pos += 1;
    saveProgress();
    setTimeout(showQuizQuestion, 1200);
}

