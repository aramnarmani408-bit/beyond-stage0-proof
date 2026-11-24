function nEl(tag, text) {
    var e = document.createElement(tag);
    if (text) e.textContent = text;
    return e;
}
function goView(name) {
    var d = document.getElementById("drawer");
    if (d && d.classList) {
        if (name === "history") d.classList.add("open");
        else d.classList.remove("open");
    }
    if (name === "profile") {
        if (neonProfile) neonProfile.style.display = "flex";
        showPanel("profile");
        if (typeof settingsRefresh === "function") settingsRefresh();
    } else {
        if (neonProfile) neonProfile.style.display = "none";
        showPanel("chat");
    }
    Object.keys(neonNavBtns).forEach(function (k) {
        if (neonNavBtns[k].classList) neonNavBtns[k].classList.toggle("on", k === name);
    });
}
function buildNeon() {
    var main = document.getElementById("main");
    if (!main) return;
    if (typeof document !== "undefined" && document.head && !document.getElementById("neonStyle")) {
        var st = document.createElement("style");
        st.id = "neonStyle";
        st.textContent = NEON_CSS;
        document.head.appendChild(st);
    }
    var nav = document.createElement("nav");
    nav.id = "bottomNav";
    [["chat", "خبرې"], ["history", "تاریخچه"], ["profile", "پروفایل"]].forEach(function (nv) {
        var b = document.createElement("button");
        b.id = "nav" + nv[0].charAt(0).toUpperCase() + nv[0].slice(1) + "Btn";
        b.textContent = nv[1];
        b.addEventListener("click", function () { goView(nv[0]); });
        nav.appendChild(b);
        neonNavBtns[nv[0]] = b;
    });
    main.appendChild(nav);
    neonNav = nav;
    var prof = document.createElement("div");
    prof.id = "profilePanel";
    prof.style.display = "none";
    prof.appendChild(nEl("div", "BEYOND X"));
    [["شعار", "موږ به نړۍ بدلوو"], ["قانون", "قرآن کریم"], ["ژبه", "پښتو لومړی"], ["اوسنی حالت", "ډیزاین پړاو ۲"]].forEach(function (f) {
        var row = nEl("div", "");
        row.className = "fact";
        var k = nEl("span", f[0]);
        k.className = "k";
        row.appendChild(k);
        row.appendChild(nEl("span", f[1]));
        prof.appendChild(row);
    });
    var fo = nEl("div", "لومړی خلاصېدل: …");
    fo.id = "neonFirstOpen";
    prof.appendChild(fo);
    neonFirstOpenEl = fo;
    // Settings build: the rows are REAL now — language is Pashto only
    // (the gateway ignores any other language); depth is the L.A.E.
    // length default; style is the gateway persona (friend/teacher/
    // formal). The old en/full/tech options were ignored upstream.
    [["lang", "ژبه", []], ["depth", "د ځواب اوږدوالی", [["short", "لنډ"], ["medium", "منځنی"], ["long", "اوږد"]]], ["style", "د ځواب طرز", [["friend", "دوستانه"], ["teacher", "ښوونکی"], ["formal", "رسمي"]]]].forEach(function (pr) {
        var row = nEl("div", pr[1]);
        pr[2].forEach(function (opt) {
            var b = document.createElement("button");
            b.textContent = opt[1];
            b.addEventListener("click", function () { neonSetPref(pr[0], opt[0]); });
            row.appendChild(b);
            neonPrefBtns.push({ key: pr[0], value: opt[0], el: b });
        });
        if (!pr[2].length) row.appendChild(nEl("span", "پښتو"));
        prof.appendChild(row);
    });
    main.appendChild(prof);
    neonProfile = prof;
    loadNeonPrefs();
    neonMarkPrefs();
    if (neonNavBtns.chat && neonNavBtns.chat.classList) neonNavBtns.chat.classList.add("on");
}
function neonFirstOpen() {
    firstOpenMs = Date.now() - NEON_T0;
    if (neonFirstOpenEl) neonFirstOpenEl.textContent = "لومړی خلاصېدل: " + firstOpenMs + "ms";
}
// Phase 2: the home demo moved to home.js (rows, not chips).
