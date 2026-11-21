// BEYOND X module 1/13: core — app state, quiz data, progress, capability registry
const AppState = { messages: [], currentChat: 1, lastError: null, convId: null };

// Real content: family words from textbook answer #277 (Grade 4 English).
const quizWords = [["father", "پلار"], ["mother", "مور"], ["brother", "ورور"], ["sister", "خور"], ["son", "زوی"], ["daughter", "لور"]];

const quizState = { pos: 0, score: 0, lock: false,
    queue: [0, 1, 2, 3, 4, 5], weak: [], mode: "en-ps", revising: false,
    kind: "word", sentWeak: [] };

// Progress persistence (localStorage, guarded): position, score,
// weak words and mode survive closing + reopening the app — the
// WebView persists localStorage across restarts. If storage is
// unavailable the quiz still works, just without persistence.
const SCHOOL_KEY = "beyondx-school-v1";
function saveProgress() {
    try {
        if (typeof localStorage === "undefined") return;
        localStorage.setItem(SCHOOL_KEY, JSON.stringify({
            pos: quizState.pos, score: quizState.score,
            weak: quizState.weak, mode: quizState.mode,
            revising: quizState.revising, queue: quizState.queue,
            kind: quizState.kind, sentWeak: quizState.sentWeak
        }));
    } catch (e) { /* storage unavailable — the quiz still works */ }
}
function loadProgress() {
    try {
        if (typeof localStorage === "undefined") return false;
        const raw = localStorage.getItem(SCHOOL_KEY);
        if (!raw) return false;
        const s = JSON.parse(raw);
        if (!s || !Array.isArray(s.queue) || !Array.isArray(s.weak)) return false;
        quizState.pos = s.pos || 0;
        quizState.score = s.score || 0;
        quizState.weak = s.weak;
        quizState.mode = s.mode === "ps-en" ? "ps-en" : "en-ps";
        quizState.revising = s.revising === true;
        quizState.queue = s.queue;
        quizState.kind = s.kind === "sentence" ? "sentence" : "word";
        quizState.sentWeak = Array.isArray(s.sentWeak) ? s.sentWeak : [];
        return true;
    } catch (e) { return false; }
}

// ---------- Dynamic Workspace Engine v1 ----------
// Capability registry: what exists (verified) vs what is
// planned (with its stage). Planned systems are NEVER claimed.
const CAPABILITIES = {
    chat: { name: "خبرې", status: "available", stage: 1 },
    school: { name: "ښوونځی", status: "available", stage: 2 },
    islamic: { name: "اسلامي", status: "planned", stage: 3 },
    books: { name: "کتابونه", status: "planned", stage: 4 },
    images: { name: "انځورونه", status: "planned", stage: 5 },
    voice: { name: "غږ", status: "planned", stage: 6 },
    games: { name: "لوبې", status: "planned", stage: 7 },
    polyglot: { name: "ژبې", status: "planned", stage: 8 },
    programming: { name: "پروګرام کول", status: "planned", stage: 9 },
    mobile: { name: "موبایل کنټرول", status: "planned", stage: 10 },
    neon: { name: "NEON", status: "planned", stage: 11 }
};

// Lifecycle statuses (Pashto labels shown in the UI).
const WS_LABELS = {
    requested: "غوښتل شوی", analyzing: "تحلیلېږي",
    building: "جوړېږي", activating: "فعالېږي",
    testing: "ازمېښت کېږي", ready: "چمتو دی",
    failed: "ناکام شو", "dependency-missing": "اړتیا نشته",
    "permission-required": "اجازه پکار ده",
    "gateway-unavailable": "ګیټوې نشته",
    "verification-failed": "تایید ناکام شو"
};

