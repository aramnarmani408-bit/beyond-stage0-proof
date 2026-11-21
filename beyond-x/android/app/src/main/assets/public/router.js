// BEYOND X module 9/13: router — handleRequest + sendQuestion + panels
// The Engine's request router: discovery through chat, activation
// for available systems, honest "planned" answers for the rest.
function handleRequest(q) {
    if (isCapabilityQuestion(q)) {
        addMessage("زه دا کولی شم: خبرې په پښتو او د ښوونځي کوئز (د انګلیسي لغتونه او جملې). په راتلونکو پړاوونو کې راځي: اسلامي (۳م پړاو)، کتابونه (۴م)، انځورونه (۵م)، غږ (۶م)، لوبې (۷م)، ژبې (۸م)، پروګرام کول (۹م)، موبایل کنټرول (۱۰م).", "ai");
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

function showPanel(name) {
    const chatPanel = document.getElementById("chatPanel");
    const schoolPanel = document.getElementById("schoolPanel");
    if (chatPanel) chatPanel.style.display = name === "chat" ? "flex" : "none";
    if (schoolPanel) schoolPanel.style.display = name === "school" ? "flex" : "none";
}

