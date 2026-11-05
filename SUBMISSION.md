# Squeekchain Genesis — Submission Pack (copy-paste ready)

## Project name
WHEEL RAID

## Tagline (short description)
A community boss raid powered by a real hamster — every Squeekchain round, Squeektoshi's real wheel work becomes damage against the weekly boss.

## Long description (for the project board)
WHEEL RAID turns Squeekchain's live hamster into a game a whole community plays together. One boss per week. Every round, the damage dealt is Squeektoshi's real wheel work in that round (from the Squeekchain public API / SqueekCore settlement on Sepolia), multiplied by community buffs from three player classes: Runner (/charge, +10%), Cheerer (/cheer, ×2 on Zoomies), and Oracle (/predict nap|jog|zoomies, +50 RP when right).

Its signature system is the Nap rule: a nap round heals the boss, but three naps in a row arm Dream Energy and the next running round hits for ×3 — so even sleeping is dramatic, the livestream stays worth watching, and the hamster is never forced or encouraged to run.

Playable on the web and as a Telegram bot sharing one game engine. No gambling, no token, no custody, no transactions — points and a weekly leaderboard only. Each settled round links its on-chain settlement transaction.

Category: Server games and bots / Games powered by Squeekchain

## Links to fill in at submit time
- Live site: https://mikkimausua.github.io/wheel-raid/
- GitHub: https://github.com/MikkiMausua/wheel-raid
- Telegram bot: @YOUR_BOT (after @BotFather step — see checklist)

---

## Submission checklist — Direct path (not IMD)

Squeekchain FAQ (genesis/code): Direct submission = add the DNS record they give you to your own domain, add the page tag to the live site, add the repository line to the README of the public GitHub repo, then press Verify. Submitting and verifying are free.

### Done for you in this repo ✅
- [x] Finished, working build that uses Squeekchain (live API, real round settlement)
- [x] Web game playable end-to-end (join, act, predict, settle, leaderboard)
- [x] Telegram bot code, zero-dependency, with all raid commands
- [x] Shared game engine with original logic (not a fork, template, or thin API wrapper)
- [x] README with setup, data sources, game rules — with a marked line where the Genesis repository line goes
- [x] Marked comment in `index.html` `<head>` where the Genesis page tag goes
- [x] Submission name / tagline / long description written (above)
- [x] Local git repository initialised and committed
- [x] GitHub repo created and code pushed: https://github.com/MikkiMausua/wheel-raid
- [x] Live site deployed via GitHub Pages: https://mikkimausua.github.io/wheel-raid/

### Only you can do these (wallet / account steps) 👤
1. [x] Create the GitHub repo and push — DONE 2026-11-05 via API (device-flow CLI login failed twice at the token step; PAT via Secure Vault used instead).
2. [x] Deploy the live site — DONE, GitHub Pages on main branch root, build verified.
3. [ ] (Optional but recommended) Telegram bot: @BotFather → /newbot → put the token in `bot/.env` → `node bot.js` on any always-on host.
4. [ ] In Squeekchain Genesis: verify your profile wallet (a regular wallet, not a smart-contract wallet).
5. [ ] Start the Direct verification for WHEEL RAID, then paste what they give you into the 3 marked places:
   - DNS record → at your domain registrar (skip if using a provider domain they accept — follow their on-screen instruction)
   - Page tag → the marked comment in `index.html` `<head>`
   - Repository line → the marked line at the top of `README.md`
   Commit + push the two file changes, redeploy, then press **Verify**.
6. [ ] Team review → project appears on the board → Swarm Review → Squeek of Approval → Hall of Hamsters.

⚠️ Verified records are rechecked daily. Keep the live site up — if it goes down, the verification (and the Buildooooor badge, if it is your only approved project) goes with it.
