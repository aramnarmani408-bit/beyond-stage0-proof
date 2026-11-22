function showQuizQuestion() {
    const wordEl = document.getElementById("quizWord");
    const optionsEl = document.getElementById("quizOptions");
    const feedbackEl = document.getElementById("quizFeedback");
    const scoreEl = document.getElementById("quizScore");
    const resultEl = document.getElementById("quizResult");
    if (!wordEl || !optionsEl) return;
    if (feedbackEl) feedbackEl.textContent = "";
    if (resultEl) resultEl.textContent = "";
    if (scoreEl) scoreEl.textContent = quizState.score + "/" + quizState.queue.length;
    if (quizState.pos >= quizState.queue.length) {
        wordEl.textContent = "بشپړ شو!";
        const total = quizState.queue.length;
        const pct = total > 0 ? Math.round(quizState.score / total * 100) : 0;
        if (feedbackEl) feedbackEl.textContent = quizState.score + "/" + total;
        if (resultEl) {
            let r = "پایله: " + pct + "%";
            const weakList = quizState.kind === "sentence" ? quizState.sentWeak : quizState.weak;
            if (weakList.length > 0) {
                const names = weakList.map(function (i) {
                    return quizState.kind === "sentence" ? vocabItems()[i].en : quizWords[i][0];
                });
                r += " — کمزورې کلمې: " + names.join(", ");
            } else {
                r += " — ټولې کلمې زده شوې!";
            }
            resultEl.textContent = r;
        }
        while (optionsEl.firstChild) optionsEl.removeChild(optionsEl.firstChild);
        saveProgress();
        return;
    }
    quizState.lock = false;
    const modeBtn = document.getElementById("modeBtn");
    if (modeBtn) modeBtn.style.display = quizState.kind === "sentence" ? "none" : "";
    const idx = quizState.queue[quizState.pos];
    let prompt, options;
    if (quizState.kind === "sentence") {
        const item = vocabItems()[idx];
        prompt = item.example.replace(new RegExp(item.en, "i"), "___");
        wordEl.style.fontSize = "18px";
        options = sentenceOptions(idx);
    } else {
        const pair = quizWords[idx];
        const promptCol = quizState.mode === "en-ps" ? 0 : 1;
        const answerCol = 1 - promptCol;
        prompt = pair[promptCol];
        wordEl.style.fontSize = "";
        const correct = pair[answerCol];
        options = [correct];
        for (let i = 1; i <= 3; i++) {
            options.push(quizWords[(idx + i) % quizWords.length][answerCol]);
        }
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const t = options[i]; options[i] = options[j]; options[j] = t;
        }
    }
    wordEl.textContent = prompt;
    while (optionsEl.firstChild) optionsEl.removeChild(optionsEl.firstChild);
    for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        const btn = document.createElement("button");
        btn.className = "quiz-opt";
        btn.textContent = opt;
        btn.addEventListener("click", function () { answerQuiz(opt); });
        optionsEl.appendChild(btn);
    }
}

// Stage 12: the school panel is JS-built (index.html shrink, 476 chars).
// Runs at module load, before init.js wires the buttons. The #schoolPanel
// CSS rule still applies by id, so the panel starts hidden.
var SCHOOL_DEFS = "button:backChat:← خبرې|button:closeWorkspaceBtn:کارځای بند کړه|div:quizWord:|div:quizOptions:|div:quizFeedback:|span:quizScore:0/6|div:quizResult:|button:wordBtn:لغتونه|button:sentBtn:جملې|button:reviseBtn:بیا زده کړه|button:modeBtn:↔ پښتو ← انګلیسي|button:quizRestart:بیا پیل";
function buildSchoolPanel() {
    if (document.getElementById("schoolPanel")) return null;
    var m = document.getElementById("main");
    if (!m) return null;
    var p = document.createElement("div");
    p.id = "schoolPanel";
    SCHOOL_DEFS.split("|").forEach(function (d) {
        var a = d.split(":");
        var e = document.createElement(a[0]);
        e.id = a[1];
        e.textContent = a[2] || "";
        p.appendChild(e);
    });
    m.appendChild(p);
    return p;
}
buildSchoolPanel();

