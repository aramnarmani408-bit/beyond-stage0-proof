# BEYOND X — Stage 1 shell

Capacitor shell carrying the Factory-verified stage-1 pages. Copied from
`day7/shell/` (the Day 7 proof shell — the original is untouched); only
`www/` content, the synced Android assets copies, and branding were changed
in this copy.

## Provenance

- `www/index.html` + `www/app.js` = round 7 run #3556's files (Lab files
  13669/13670), COMPLETED + VERIFIED 2026-11-20 (artifact-run-3556 v0.2.0).
- Verification: two independent reads (getfactoryrun + getLabProject #3129,
  byte-identical), Lab review "FINAL VERDICT: PASS", node --check PASS,
  21/21 spec checks (7 tabs, chat wiring, askBeyond contract, no canned
  answers, CSP verbatim incl. 'unsafe-inline').
- SHA-256: index.html
  `0c4c49590b2dac116bda077f08ed84d9df3288c726ddaea166d7bdf3214dfdf0`
  (2,668 chars); app.js
  `e2c89c7bf5ec69f11af27b78acd3933cf048511573d4cbab97160a2686d1187c`
  (2,883 chars). Total 5,551 chars. The same bytes are also synced into
  `android/app/src/main/assets/public/` (verified by hash), so the tree is
  self-consistent even if a build step skips `cap sync`.
- Run #3556's build was chosen over run #3554's (6,909 chars) because it is
  smaller and its index.html is under the 4,500-char target. Run 1's verified
  files are preserved at `../round7-verified/run1-3554-*` as the backup set.

## Branding

- appName: BEYOND X (capacitor.config.js, package.json, manifest, strings.xml,
  android assets capacitor.config.json).
- appId: `com.beyondx.app` — renamed from `com.beyond.day7proof` at the
  cloud-build step (2026-11-20, arman's decision) before the first test APK:
  capacitor.config.js + build.gradle namespace/applicationId + MainActivity
  package (`com/beyondx/app/`) + strings.xml + synced capacitor.config.json.
  The old id survives only in this provenance note.
- The workflow file is still named `day7-capacitor-proof.yml` (copied with
  the shell); the BEYOND X cloud-build step stages its own push payload and
  workflow name.

## Build

Same route as the Day 7 proof: `npm install`, `npx cap sync android`,
cloud build (GitHub Actions) → APK. No secrets in this shell. The app
fetches `https://text.pollinations.ai/` directly (public, no key, CORS-enabled);
on failure it shows the verbatim Pashto error message — never a fake answer.

## What is in the app (stage 1 only)

Chat shell: drawer + 7 tabs + chat area + ask box + toast. Non-chat tabs
show the "coming in a future stage" toast. School, Islamic, textbooks,
images, voice, games are NOT built yet — they come in later stages, from
the same place. Debug/unsigned for the test APK; release signing is a
separate human-approved operation (arman requires the final APK SIGNED).

## Next stages

Stage 2+ pages replace `www/index.html` + `www/app.js` from later verified
Factory runs, from the same place — nothing is rebuilt from scratch.
