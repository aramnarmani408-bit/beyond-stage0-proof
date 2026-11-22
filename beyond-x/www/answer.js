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

// Phase 1: history-list rendering + row actions (chatstore/ui are at the push limit; D21 forbids a new module).
function chatGroupOf(u) {
    var d = new Date(u), n = new Date();
    if (d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()) return "نن";
    var y = new Date(n.getTime() - 86400000);
    if (d.getFullYear() === y.getFullYear() && d.getMonth() === y.getMonth() && d.getDate() === y.getDate()) return "پرون";
    return "مخکې";
}
function chatLastMsg(c) {
    if (!c.messages.length) return "";
    return c.messages[c.messages.length - 1].text.slice(0, 40);
}
function chatById(id) {
    for (var i = 0; i < AppState.chats.length; i++) if (AppState.chats[i].id === id) return AppState.chats[i];
    return null;
}
function chatMutate(id, fn) {
    var c = chatById(id);
    if (!c) return;
    fn(c);
    saveChat();
    renderChatList();
}
function chatPin(id) {
    chatMutate(id, function (c) { c.pinned = !c.pinned; });
}
function chatArchive(id) {
    chatMutate(id, function (c) { c.archived = !c.archived; });
}
var chatDeleteArm = null;
function chatDelete(id) {
    if (chatDeleteArm !== id) {
        chatDeleteArm = id;
        renderChatList();
        return;
    }
    chatDeleteArm = null;
    var wasActive = id === AppState.convId;
    AppState.chats = AppState.chats.filter(function (c) { return c.id !== id; });
    if (wasActive) {
        AppState.convId = "";
        if (AppState.chats.length) {
            var t = AppState.chats.slice().sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); })[0];
            AppState.convId = t.id;
            AppState.messages = t.messages.slice();
        } else {
            AppState.convId = "conv-" + Date.now();
            AppState.messages = [];
        }
        renderChatMessages();
        if (AppState.messages.length === 0) renderDemo(); else hideDemo();
    }
    saveChat();
    renderChatList();
}
function chatRenameStart(id, li, main) {
    var c = chatById(id);
    if (!c || !li || !main) return;
    main.style.display = "none";
    var inp = document.createElement("input");
    inp.value = c.title || "";
    inp.style.background = "#0A0A1F";
    inp.style.color = "#F1F5F9";
    inp.style.border = "1px solid #00F5FF";
    inp.style.borderRadius = "8px";
    inp.style.padding = "8px";
    inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter") chatRenameSave(id, inp.value);
    });
    li.appendChild(inp);
    if (inp.focus) inp.focus();
}
function chatRenameSave(id, name) {
    chatMutate(id, function (c) {
        var n = (name || "").trim().slice(0, 30);
        if (n) { c.title = n; c.renamed = true; }
    });
}
// Phase 1: drawer search + Settings (D16). Called once from init.js.
function buildDrawerControls() {
    var d = document.getElementById("drawer");
    if (!d) return;
    var si = document.createElement("input");
    si.id = "chatSearch"; si.placeholder = "لټون"; si.style.order = "1";
    si.addEventListener("input", function () { chatSearch(si.value); });
    d.appendChild(si);
    var sb = document.createElement("button");
    sb.id = "drawerSettingsBtn"; sb.textContent = "ترتیبات"; sb.style.order = "3";
    sb.addEventListener("click", function () { goView("profile"); });
    d.appendChild(sb);
}
