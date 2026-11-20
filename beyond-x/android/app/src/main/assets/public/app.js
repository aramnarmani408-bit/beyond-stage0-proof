const AppState = { messages: [], currentChat: 1 };

function setAction(text) {
    const el = document.getElementById("actionLine");
    if (el) el.textContent = text;
}

function addMessage(text, who) {
    const chatArea = document.getElementById("chatArea");
    if (!chatArea) return;
    const msg = document.createElement("div");
    msg.className = "msg " + who;
    msg.textContent = text;
    chatArea.appendChild(msg);
    chatArea.scrollTop = chatArea.scrollHeight;
    AppState.messages.push({ text, who });
}

function showToast(text) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = text;
    toast.style.display = "block";
    toast.style.opacity = "1";
    setTimeout(() => {
        toast.style.display = "none";
        toast.style.opacity = "0";
    }, 2500);
}

function isIdentityQuestion(q) {
    return q.indexOf("چا جوړ") !== -1 || q.indexOf("جوړ کړی") !== -1 || q.indexOf("جوړونکی") !== -1 || q.indexOf("ستا نوم") !== -1 || q.indexOf("څوک یې") !== -1;
}

async function askBeyond(question) {
    // Identity is answered LOCALLY, never by the model: the free model
    // claims OpenAI made it even when instructed otherwise (proven by
    // curl 2026-11-20 — it answered "زه د OpenAI لخوا ... جوړ شوی یم"
    // despite the BEYOND X instruction). The app states its own identity.
    if (isIdentityQuestion(question)) {
        setAction("ځواب ورکوم");
        addMessage("زه BEYOND X یم، د BEYOND AI جوړ کړی هوښیار مرستیال یم.", "ai");
        setAction("چمتو یم");
        return;
    }
    setAction("فکر کوم...");
    try {
        // Pashto-first: tell the model to answer in Pashto. Without this
        // the free model guesses the language and often answers in Persian
        // (arman's live test 2026-11-20: plain "سلام" came back in Persian;
        // with this prefix it answers in Pashto — verified by curl).
        const prompt = "په پښتو ژبه ځواب ورکړه: " + question;
        const resp = await fetch("https://text.pollinations.ai/" + encodeURIComponent(prompt));
        if (!resp.ok) throw new Error("Network");
        const data = await resp.text();
        setAction("ځواب ورکوم");
        addMessage(data, "ai");
    } catch (e) {
        addMessage("انټرنیټ نشته یا ځواب ونه رسېد — بیا هڅه وکړه", "ai");
    } finally {
        setAction("چمتو یم");
    }
}

function sendQuestion() {
    const input = document.getElementById("askInput");
    if (!input) return;
    const q = input.value.trim();
    if (!q) return;
    addMessage(q, "user");
    input.value = "";
    askBeyond(q);
}

    const drawerBtn = document.getElementById("drawerBtn");
    const drawer = document.getElementById("drawer");
    const newChatBtn = document.getElementById("newChatBtn");
    const chatArea = document.getElementById("chatArea");
    const sendBtn = document.getElementById("sendBtn");
    const askInput = document.getElementById("askInput");
    const tabs = document.querySelectorAll(".tab");

    if (drawerBtn && drawer) {
        drawerBtn.addEventListener("click", () => drawer.classList.toggle("open"));
    }

    if (newChatBtn && chatArea) {
        newChatBtn.addEventListener("click", () => {
            while (chatArea.firstChild) chatArea.removeChild(chatArea.firstChild);
            AppState.messages = [];
            AppState.currentChat++;
            setAction("چمتو یم");
        });
    }

    if (sendBtn) sendBtn.addEventListener("click", sendQuestion);
    if (askInput) {
        askInput.addEventListener("keydown", e => {
            if (e.key === "Enter") sendQuestion();
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            if (tab.dataset.tab !== "chat") {
                showToast("په راتلونکي پړاو کې راځي");
            }
        });
    });

    setAction("چمتو یم");
