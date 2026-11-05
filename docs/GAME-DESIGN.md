# WHEEL RAID — Game Design Doc

## Design pillars
1. **Real hamster, real stakes.** All damage comes from Squeektoshi's actual wheel work (Squeekchain API / SqueekCore, Sepolia). The server never invents a result; every settled round links its settlement transaction.
2. **Co-op, not solo.** One shared boss. Buffs are community-wide, so one player's /cheer helps everyone.
3. **Naps are content.** Most hamster games go dead when he sleeps. The Nap → Dream Energy system makes sleep build tension toward a ×3 strike.
4. **No extraction.** No gambling, no token, no payments, no custody. Points + story only.

## Balance (from live data, 2026-11-05)
Live check of `api.squeekchain.com/v1/status`: cumulative work 3,817 units at settled round 216 — roughly 19 work/round on average, with long idle (nap) stretches. The original concept draft used 50,000 HP, which real data would take months to burn. Shipped balance:

| Constant | Value | Why |
|---|---|---|
| Boss base HP | 5,000 | ≈ 26 average rounds of un-buffed damage — killable inside a week with buffs, not guaranteed |
| Damage per work unit | 10 | Turns ~19 work into ~190 base damage per active round |
| Nap heal | 250 | One nap undoes ~1.3 active rounds — painful, not fatal |
| Dream streak | 3 naps → ×3 next hit | Rewards staying through sleep stretches |
| HP per last-week player | +50 | Boss scales as the raid grows |

All constants live in `CONFIG` in `engine/game-engine.js` — tune there only.

## Anti-abuse
- One action per player per round (web: name/wallet id; bot: Telegram user id).
- Actions affect buffs/points, never the underlying round result — you cannot fake the hamster.
- Points have no monetary value and are non-transferable, so farming has no payoff beyond the leaderboard.

## Anti-slop rationale (for Swarm Review)
- Not a dashboard/explorer/tracker: chain data is an input; the product is original game state and logic.
- Not a fork/template/copy: closest shipped projects are a solo nerve game (#2 Squeekout) and a solo prediction game (#11 Squeek or Sleep). WHEEL RAID is co-op, boss-based, and its prediction is a sub-system of one class.
- Not a thin API wrapper: engine includes boss rotation, enrage-by-growth HP scaling, class buffs, nap streaks, Dream Energy, kill bonuses, weekly reset.
- The concept is literally the example Squeekchain lists under "Build this — Server games and bots: weekly boss raids powered by its real distance."

## Roadmap
- V1 (this repo): Web game + Telegram bot, Season 1 (4 bosses), weekly + all-time board.
- V2: Wallet signed-message sign-in in the bot (no gas), Squeek NFT holder RP multiplier (+5%…+25% by staked power), Discord bot reusing the same engine.
- V3: Season badge claim page (non-transferable, self-claim, no custody), AI boss dialogue per round.
