# WHEEL RAID — Squeekchain Community Boss Raid Bot
### Concept + IMD Build Brief | ပြင်ဆင်သူ: Thi Ha Naing အတွက် | 2026-11-05

---

## 1. One-Line Pitch

**EN:** A community boss raid powered by a real hamster. Every 10-minute SqueekCore round, Squeektoshi's real wheel passes become the raid's damage — the whole community fights the same boss together, live.

**MM:** တကယ့် hamster ပြေးတာနဲ့ အားဖြည့်တဲ့ အဖွဲ့လိုက် Boss Raid game။ 10 မိနစ်တိုင်း round တစ်ခုမှာ Squeektoshi တကယ်ပြေးခဲ့တဲ့ wheel passes အရေအတွက်က Boss ကို ထိတဲ့ damage ဖြစ်သွားတယ်။ တစ်ယောက်တည်း ဆော့တာ မဟုတ်ဘူး — community တစ်ခုလုံး Boss တစ်ကောင်တည်းကို အတူတိုက်တာ။

**အဆိုပြုထားတဲ့ နာမည် (ရွေးရန်):**
- **A) WHEEL RAID** — တိုတယ်၊ မှတ်မိလွယ်တယ်၊ wheel + raid နှစ်ခုလုံး ပါတယ် [အကြံပြုဆုံး]
- B) Squeek Raid: Boss Week
- C) Hamster Boss Hunt

---

## 2. ဘာလို့ ဒီ Project က Approval ရနိုင်တာလဲ

Squeekchain Genesis page က `Build this` လို့ အတိအလင်း ရေးထားတဲ့ အထဲမှာ ဒါ ပါတယ်:

> "Server games and bots — Bots that turn the hamster into a game your community plays together: **weekly boss raids powered by its real distance**, fantasy hamster leagues, or a living story every round moves forward."

ဒီ concept က အဲဒီ ဥပမာကိုပဲ တိုက်ရိုက် တကယ် ဆော့လို့ရတဲ့ product အဖြစ် ပြောင်းထားတာ။

**Skip list နဲ့ မငြိအောင်:**
- ❌ Read-only dashboard မဟုတ်ဘူး — state ပြောင်းတယ် (Boss HP, player points, leaderboard)
- ❌ Thin API wrapper မဟုတ်ဘူး — ကိုယ်ပိုင် game logic, boss AI, season system ရှိတယ်
- ❌ Copy မဟုတ်ဘူး — အောက်မှာ ရှိပြီးသား project တွေနဲ့ ကွာခြားချက် ကြည့်ပါ

**ရှိပြီးသား Project တွေနဲ့ ကွာခြားချက်:**

| Project | သူတို့ လုပ်ထားတာ | WHEEL RAID က ကွာတာ |
| :--- | :--- | :--- |
| #2 Squeekout.fun | တစ်ယောက်ချင်း nerve game, wheel ပေါ်က ဘယ်ချိန် ဆင်းမလဲ | အဖွဲ့လိုက် Co-op, Boss HP အတူချ |
| #11 Squeek or Sleep | တစ်ယောက်ချင်း prediction (nap/jog/zoomies) | Prediction က အစိတ်အပိုင်း တစ်ခုပဲ, အဓိက က Raid |
| #8/#9 Dashboard | Data ပြရုံပဲ | Data ကို game damage အဖြစ် သုံးတယ် |

---

## 3. Core Loop — ဘယ်လို ဆော့ရတာလဲ (30 စက္ကန့်နဲ့ နားလည်အောင်)

```
1. JOIN   → Wallet နဲ့ sign-in (signed message, gas မလိုဘူး — #11 လုပ်ထားတဲ့ ပုံစံအတိုင်း)
2. CHOOSE → Class တစ်ခု ရွေး (Round တိုင်း ပြန်ပြောင်းလို့ရ)
3. PLAY   → Round (10 မိနစ်) တိုင်း action တစ်ခု လုပ်
4. WATCH  → Hamster တကယ်ပြေးတဲ့ passes က damage ဖြစ်ပြီး Boss HP ကျသွားတာကို live ကြည့်
5. WIN    → တစ်ပတ်အတွင်း Boss သေရင် တစ်ဖွဲ့လုံး reward ရတယ်, မသေရင် Boss က နောက်တစ်ပတ် ပိုကြမ်းလာတယ်
```

Player မရှိတဲ့ round မှာတောင် game က မရပ်ဘူး — hamster ပြေးနေသရွေ့ Boss က damage ထိနေတယ်။ Player တွေက damage ကို **ပိုကြမ်းအောင် မြှင့်**ပေးတဲ့ အခန်းက ပါရတာ။

---

## 4. Game စည်းကမ်းအသေးစိတ်

### 4.1 Round System
- SqueekCore round = **10 မိနစ်** (chain ရဲ့ ကိုယ်ပိုင် round အတိုင်း, ကိုယ်ထူကိုယ်ထ ဖန်တီးထားတာ မဟုတ်ဘူး)
- Round data ကို SqueekCore on Sepolia က `RoundRecorded / BatchSettled` event + Squeekchain public API (`/v1/status`, `/v1/economy/state`) ကနေ ဖတ်တယ် — ကိုယ့် server က result ကို မဖန်တီးဘူး, စာရင်းမလိမ်ဘူး
- Round အမျိုးအစား ( #11 ရဲ့ သတ်မှတ်ချက် အတိုင်း):
  - 💤 **Nap:** 0 passes
  - 🐾 **Jog:** 1–499 passes
  - 🔥 **Zoomies:** 500+ passes

### 4.2 Boss System
- **တစ်ပတ် = Boss တစ်ကောင်** (Monday 00:00 UTC စပြီး Sunday 23:59 UTC ပိတ်)
- Boss HP ဥပမာ ပုံသေနည်း (IMD မှာ balance ပြန်ညှိရန်):
  ```
  Boss_Max_HP = 50,000 + (ပြီးခဲ့တဲ့ အပတ် active player အရေအတွက် × 500)
  Round_Damage = Wheel_Passes_in_Round × (1 + Community_Buff)
  ```
- Boss မသေဘဲ အပတ်ကုန်ရင်: Boss က **Enrage +20% HP** နဲ့ နောက်အပတ် ပြန်လာတယ် (story ဆက်သွားတယ်, အရှုံး မဟုတ်ဘူး)

**Boss Roster (Season 1 — ဟာသ, မှတ်မိလွယ်, share လုပ်ချင်စရာ):**
1. **Baron von Vacuum** — အသံဆူတဲ့ စုပ်စက်, hamster အကြောက်ဆုံး
2. **The Sleepy Cat** — Nap round များရင် သူက ပိုအားပြည့်လာတယ်
3. **Empty Seed Bowl, The Devourer** — Seed မရှိတဲ့ ပန်းကန်
4. **Dr. Vet Visit** — အားလုံးကြောက်တဲ့ ဆေးခန်း

### 4.3 Player Classes & Actions (Round တိုင်း 1 action သာ)
Player spam လုပ်ပြီး game ကို မဖျက်နိုင်အောင် — round တစ်ခုမှာ action တစ်ခု, wallet တစ်ခုကို တစ်ခါပဲ။

| Class | Action | သက်ရောက်မှု |
| :--- | :--- | :--- |
| 🏃 Runner | `/charge` | နောက် round damage ကို +10% (စုဆောင်းလို့ မရ) |
| 📣 Cheerer | `/cheer` | Hamster Zoomies ဖြစ်ရင် damage ×2, Jog ဆို +25%, Nap ဆို 0 |
| 🔮 Oracle | `/predict nap/jog/zoomies` | မှန်ရင် Raid Points အများဆုံးရ + နောက် round buff, မှားရင် အမှတ် မရ (ဆုံးရှုံးတာ မရှိ) |

### 4.4 Nap ကို အလကား မဖြစ်စေတဲ့ စည်းကမ်း — အရေးကြီးဆုံး Design
တခြား game အများစုမှာ hamster အိပ်ရင် ပျင်းစရာကောင်းတယ်။ ဒီမှာတော့:
- Nap round မှာ Boss က **heal 500 HP** လုပ်တယ် နဲ့ **community ကို counter-attack 1 ကြိမ်** တိုက်တယ်
- ဒါပေမယ့် Nap 3 round ဆက်တိုက် ဖြစ်ရင် **"Dream Energy"** ပြည့်ပြီး နောက် Jog/Zoomies round ရဲ့ damage က ×3 ဖြစ်တယ်
- ဆိုလိုတာက: အိပ်တာကို လူတွေက စောင့်ကြည့်ချင်လာတယ်, livestream ကို မပိတ်တော့ဘူး — "His wheel time is never forced, naps score too" ဆိုတဲ့ Squeekchain ရဲ့ မူနဲ့ ကိုက်တယ်

### 4.5 Squeek NFT Holder အကျိုးအမြတ်
- Holder ဖြစ်ရုံနဲ့ အလိုအလျောက် အမှတ်ပိုရတာ မဟုတ်ဘူး — **ဆော့မှ ရတယ်**
- ဒါပေမယ့် staked Squeek power ရှိရင် Raid Points ကို **+5% ကနေ +25% အထိ multiplier** (level / power အလိုက်, SqueekFi Planner #10 ရဲ့ power formula ကို ကိုးကား)
- Holder မဟုတ်သူလည်း free ဆော့လို့ရတယ် — community ကြီးလာဖို့ အတားအဆီး မထားဘူး

### 4.6 Points & Reward
- **Raid Points (RP):** Action မှန်မှု, round တက်ကြွမှု, Boss kill ပါဝင်မှု အလိုက် ရ
- **Leaderboard:** အပတ်စဉ် + All-time နှစ်မျိုးလုံး (Public web page မှာ live�ြ)
- **Boss Kill Reward:** အဲဒီအပတ် round 10 ခုနဲ့ အထက် ပါဝင်သူတိုင်း **Season NFT Badge (non-transferable, claim ကိုယ်တိုင် လုပ်ရ, project က custody မကိုင်ဘူး)** အတွက် eligible ဖြစ်တယ်
- Real money / token လောင်းကြေး **လုံးဝ မပါဘူး** — ဒါကြောင့် gambling လို့ မြင်ခံရမယ့် အန္တရာယ် မရှိဘူး

---

## 5. ဘယ်မှာ ဆော့ရမှာလဲ — Platform ရွေးချယ်မှု

| Platform | အခန်း | အကြောင်းရင်း |
| :--- | :--- | :--- |
| **Telegram Bot** | **MVP အဓိက** | Bot API အလွယ်ဆုံး, group ထဲမှာ အတူဆော့လို့ရ, Myanmar user အများဆုံး သုံးတဲ့ chat app ထဲက တစ်ခု |
| **Web Page** | Boss HP live bar, leaderboard, season story | Genesis verification အတွက် live site လိုတယ်, share လုပ်ဖို့ link လိုတယ် |
| Discord Bot | V2 | Squeekchain community က Discord/Telegram ဘက်မှာ ရှိရင် ထပ်ထည့် |
| Facebook Page | ကြေညာ / Recap channel ပဲ, game အဓိက မဟုတ် | Facebook ရဲ့ bot/API ကန့်သတ်ချက် များလို့ game engine အဖြစ် မသုံးဘူး — မင်းရဲ့ Page skill ကို Boss kill recap, meme, weekly story post အဖြစ် သုံးတာ ပိုထိရောက်တယ် |

---

## 6. MVP Scope — IMD ကို ပထမဆုံး Job အဖြစ် ပေးရမယ့် အတိုင်းအတာ

**MVP (V1) မှာ ပါရမယ့်ဟာ:**
1. Telegram Bot: `/join`, `/choose`, `/charge`, `/cheer`, `/predict`, `/status`, `/leaderboard`
2. Wallet sign-in: signed message only, no gas, no private key ကိုင်တာ မရှိဘူး
3. Live Boss HP engine: 10-min round တိုင်း Squeekchain API + SqueekCore event ကို ဖတ်ပြီး damage တွက်
4. Nap / Dream Energy စည်းကမ်း (အပိုင်း 4.4)
5. Web page 1 ခု: Live Boss HP bar, လက်ရှိ round အခြေအနေ (nap/jog/zoomies), leaderboard top 20, Boss story
6. Admin: Boss အသစ် တစ်ပတ်တစ်ခါ လဲဖို့, HP ပြင်ဖို့

**V2 (နောက်မှ):** Discord bot, Season Badge NFT claim page, Fantasy League mode, AI boss dialogue (Boss က round အလိုက် စကားပြောတာ)

**မပါရမယ့်ဟာ:** ကိုယ်ပိုင် token, လောင်းကြေး, custody wallet, dashboard-only mode

---

## 7. IMD Build Brief — Copy-Paste ပေးလို့ရတဲ့ English မူရင်း

> IMD ကို job ပေးတဲ့အခါ ဒီအတိုင်း ကူးထည့်ပါ။ ပထမဆုံး job ကို ကိုယ့် Genesis profile မှာ verified လုပ်ထားတဲ့ wallet (regular wallet, smart-contract wallet မဟုတ်) ကနေ pay လုပ်ရမယ်လို့ page မှာ ပြောထားတယ်။

```
Project: WHEEL RAID — Community Boss Raid Bot for Squeekchain

Build a Telegram bot + single web page that runs a weekly co-op boss raid
powered by Squeektoshi's real wheel activity on Squeekchain.

DATA SOURCES (read-only, no signing, no custody):
- Squeekchain public API: GET /v1/status and /v1/economy/state (wheel status, RPM, passes)
- SqueekCore on Sepolia: RoundRecorded and BatchSettled events for 10-minute rounds
- Round types: Nap = 0 passes, Jog = 1-499 passes, Zoomies = 500+ passes
- If API is down, keep last good values, never blank the UI

GAME RULES:
- One boss per week (Mon 00:00 UTC - Sun 23:59 UTC). Boss Max HP = 50,000 + (last week's active players x 500)
- Per round damage = wheel passes in that round x (1 + community buff)
- Players sign in with a wallet signed message only (no gas, no transaction)
- One action per wallet per round. Classes/actions:
  Runner /charge = +10% damage next round (non-stacking)
  Cheerer /cheer = x2 damage if Zoomies, +25% if Jog, 0 if Nap
  Oracle /predict nap|jog|zoomies = bonus Raid Points + buff if correct, no penalty if wrong
- Nap rule: boss heals 500 HP and counter-attacks on a Nap round.
  3 consecutive Naps fill Dream Energy: next Jog/Zoomies round damage x3.
- Squeek NFT holders who play get a Raid Points multiplier +5% to +25% by staked power. Non-holders can play free.
- No gambling, no token, no custody, no payment handling.

DELIVERABLES:
1. Telegram bot with commands: /join /choose /charge /cheer /predict /status /leaderboard
2. Web page: live Boss HP bar, current round status, Top 20 weekly + all-time leaderboard, current boss story card
3. Simple admin config for weekly boss name/HP/story
4. README with setup, data sources, and game rules

Acceptance: Bot settles each round from on-chain/API data with a linkable
source per round, leaderboard updates after settlement, page refreshes
without manual action, and the game runs a full week unattended.
```

---

## 8. Genesis မှာ တင်ဖို့ Checklist

Page FAQ အရ:
1. ☐ Genesis profile မှာ wallet verify လုပ်ထား (regular wallet)
2. ☐ IMD နဲ့ ဆောက်ရင်: ပထမဆုံး job ကို အဲဒီ verified wallet ကနေပဲ pay လုပ်
3. ☐ ကိုယ်တိုင် ဆောက်ရင်: သူတို့ပေးတဲ့ DNS record + page tag + GitHub README line ထည့်ပြီး Verify နှိပ်
4. ☐ Team review → Board ပေါ်တက်
5. ☐ Swarm Review (AI panel) → **Squeek of Approval** → အကောင်းဆုံးတွေက **Hall of Hamsters**
6. ⚠️ Verified record ကို နေ့တိုင်း ပြန်စစ်တယ် — site ပျက်သွားရင်, badge ပျောက်မယ်။ Site ကို မပိတ်မိစေနဲ့

---

## 9. Launch Plan — မင်းရဲ့ Facebook Skill ကို သုံးမယ့်နေရာ

Code က IMD က လုပ်ပေးရင်, လူရဖို့က မင်းအလုပ် — အဲဒါက မင်း အကျွမ်းဆုံးပဲ:
- **Week 0:** Teaser — "Boss လာနေပြီ" meme 3 ခု, Boss silhouette ပဲ�ြ, HP မပြ
- **Week 1:** Boss 1 (Baron von Vacuum) launch, Telegram group link ကို Page pin ထား
- **နေ့တိုင်း:** Round recap မဟုတ်ဘူး, **Story recap** — "ဒီနေ့ Cat က Nap 3 ခါ ပေးလို့ Dream Energy ပြည့်သွားတယ်" လိုမျိုး ဇာတ်လမ်းအဖြစ် ရေး
- **Boss Kill နေ့:** Kill မှာ ပါဝင်သူတွေရဲ့ နာမည် စာရင်းနဲ့ ကျေးဇူးတင် post — လူတွေ share အလုပ်ဆုံးက ဒါပဲ

---

## 10. အန္တရာယ်နဲ့ ကြိုကာကွယ်မှု

| အန္တရာယ် | ကာကွယ်မှု |
| :--- | :--- |
| "Slop / copy" လို့ ထင်ခံရတာ | Game logic မူရင်း + round settlement ကို on-chain event link နဲ့ သက်သေပြ |
| Hamster အကြာကြီး အိပ်နေရင် ပျင်းစရာ ဖြစ်တာ | Dream Energy စည်းကမ်း (4.4) က Nap ကို စိတ်လှုပ်ရှားစရာ ပြောင်းထားတယ် |
| Spam / bot အကောင့် farming | Wallet sign-in + round လျှင် 1 action ကန့်သတ်ချက် |
| Site down သွားပြီး badge ပျောက်တာ | ရိုးရှင်းတဲ့ hosting, auto-restart, API down ရင် last-good-value ပြတဲ့ fallback |

---

*နောက်တစ်ဆင့် ဆုံးဖြတ်ရန်: (1) နာမည် A/B/C ရွေးပါ, (2) Telegram ပဲ အရင် စ မလား, Discord ပါ တစ်ခါတည်း ထည့်မလား, (3) IMD ကို ဒီ brief အတိုင်း တင်မလား, ကိုယ်တိုင် dev ရှာပြီး ဆောက်မလား။*
