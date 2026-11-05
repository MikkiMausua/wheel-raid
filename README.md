# 🐹 WHEEL RAID

**A community boss raid powered by a real hamster.**
Every Squeekchain round, Squeektoshi's real wheel work becomes damage against the weekly boss — the whole community fights the same boss together, live.

> Squeekchain Genesis verification: `wheel-raid` — replace this line with the exact repository line Squeekchain gives you at Verify time, and keep it in this README.

![status](https://img.shields.io/badge/Squeekchain-Sepolia-orange) ![license](https://img.shields.io/badge/license-MIT-green) ![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)

## Play it

- **Web:** open `index.html` (or the deployed site) — live boss, live wheel, join and play in the browser. No build step.
- **Telegram:** run the bot in `bot/` and play in any group: `/join` `/charge` `/cheer` `/predict` `/boss` `/leaderboard`

## How it works

| | |
|---|---|
| **Boss** | One boss per week (Mon 00:00 UTC – Sun 23:59 UTC), rotating roster of 4: Baron von Vacuum 🌀, The Sleepy Cat 🐱, Empty Seed Bowl 🥣, Dr. Vet Visit 💉. Max HP = 5,000 + 50 × last week's active players. |
| **Damage** | Per settled round: `damage = real wheel work in that round × 10 × community buffs` |
| **Rounds** | Chain rounds from the Squeekchain API. 💤 Nap = 0 work · 🐾 Jog = 1–499 · 🔥 Zoomies = 500+ |
| **Nap rule** | A nap round heals the boss 250 HP — but **3 naps in a row arm Dream Energy**: the next running round deals ×3 damage. Naps score too; the hamster is never forced or encouraged to run. |
| **Classes** | 🏃 Runner `/charge` = +10% next round · 📣 Cheerer `/cheer` = ×2 on Zoomies, +25% on Jog · 🔮 Oracle `/predict nap\|jog\|zoomies` = +50 RP if correct. **One action per player per round.** |
| **Points** | +10 RP per action, +30 RP cheer on Zoomies, +50 RP correct prediction, +200 RP Boss-Kill bonus (requires 10+ rounds that week). Weekly + all-time leaderboard. |
| **Not in the game** | No gambling, no token, no payments, no custody, no private keys. Sign-in is name (web) / signed message (bot roadmap) — never a transaction. |

## Data sources (read-only)

- `GET https://api.squeekchain.com/v1/status` — `measurement.cumulativeWorkUnits`, `distanceMm`, `rpmMilli`, `coreStatus`; `builder.anchor.settledThroughRound`, `blockHeight`, `transactionHash` (linked in the UI as the settlement source for each round)
- `GET https://api.squeekchain.com/v1/economy/state` — deployment / round context

Verified live on 2026-11-05: status returned work `3817`, block `366`, settled through round `216` (current round `217`). If the API is unreachable, the UI keeps the last good values instead of blanking.

## Run it

### Web (zero build)
```bash
git clone https://github.com/MikkiMausua/wheel-raid.git
cd wheel-raid
python3 -m http.server 8080
# open http://localhost:8080
```
Deploy the repo root as a static site (GitHub Pages, Netlify, Vercel, Cloudflare Pages — no settings needed).

### Telegram bot
```bash
cd bot
cp .env.example .env   # put your @BotFather token in BOT_TOKEN
node bot.js            # Node 18+, no npm install needed — zero dependencies
```

## Project structure

```
wheel-raid/
├── index.html            # Playable web game (standalone)
├── engine/
│   └── game-engine.js    # Shared game logic — browser + Node, single source of truth
├── bot/
│   ├── bot.js            # Telegram bot (zero dependencies)
│   ├── package.json
│   └── .env.example
├── bosses.json           # Season 1 boss roster
├── docs/
│   └── GAME-DESIGN.md    # Full design doc, balance notes, anti-slop rationale
├── SUBMISSION.md         # Squeekchain Genesis submission copy + checklist
└── LICENSE               # MIT
```

## Why this is not a dashboard

Dashboards read the chain. WHEEL RAID **changes state because of the chain**: boss HP, nap streaks, Dream Energy, player points and a weekly story that only moves when the real hamster does. The game logic (classes, buffs, nap/dream system, enrage rotation) is original and lives in `engine/game-engine.js` — the API is an input, not the product.

## License

MIT — see `LICENSE`.
