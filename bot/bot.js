/**
 * WHEEL RAID — Telegram Bot
 * No dependencies. Node 18+ (native fetch). Long-polling via getUpdates.
 * Setup:
 *   1. Talk to @BotFather -> /newbot -> copy the token
 *   2. cp .env.example .env  and put BOT_TOKEN in .env  (or export BOT_TOKEN=...)
 *   3. node bot.js
 * Commands: /start /join /charge /cheer /predict /status /boss /leaderboard /help
 * Game state is shared for the whole bot (one raid) and saved to data/state.json.
 * Settlement: polls the Squeekchain API every 20s; when the chain round changes,
 * the finished round is settled with its real wheel-work delta.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const E = require('../engine/game-engine.js');

// --- tiny .env loader (no deps) ---
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
    }
  }
} catch (_) {}

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  console.error('Missing BOT_TOKEN. Create bot/.env from bot/.env.example — see README.');
  process.exit(1);
}
const TG = `https://api.telegram.org/bot${TOKEN}`;
const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
fs.mkdirSync(DATA_DIR, { recursive: true });

function freshState() {
  const boss = E.currentBoss();
  return { bossId: boss.id, bossMaxHP: E.bossMaxHP(0), bossHP: E.bossMaxHP(0),
    consecutiveNaps: 0, dreamArmed: false, buffNextRound: 0, cheerCount: 0,
    players: {}, week: E.weekIndex() };
}
let state = freshState();
try { if (fs.existsSync(STATE_FILE)) state = { ...freshState(), ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) }; } catch (_) {}
if (state.week !== E.weekIndex()) {
  const keep = state.players;
  state = freshState(); state.players = keep;
  state.bossMaxHP = E.bossMaxHP(Object.keys(keep).length); state.bossHP = state.bossMaxHP;
}
function save() { fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); }

let lastStatus = null, currentRound = null, roundStartWork = null;
const raidChats = new Set(); // chats that used /join or /start — settlement reports go here

async function tg(method, body) {
  const res = await fetch(`${TG}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
  return res.json();
}
function send(chatId, text) { return tg('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }); }

function bossText() {
  const b = E.BOSSES[state.bossId];
  const pct = Math.max(0, Math.round(state.bossHP / state.bossMaxHP * 100));
  const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
  return `${b.emoji} <b>${b.name}</b> — ${b.title}\n${bar} ${state.bossHP.toLocaleString()} / ${state.bossMaxHP.toLocaleString()} HP (${pct}%)` +
    (state.dreamArmed ? '\n✨ <b>DREAM ENERGY ARMED</b> — next running round deals ×3!' : `\nNap streak: ${state.consecutiveNaps}/${E.CONFIG.dreamNapStreak} for Dream Energy`);
}
function statusText() {
  if (!lastStatus) return 'Wheel data is loading… try again in a few seconds.';
  const s = lastStatus;
  return `🐹 <b>Squeektoshi</b>: ${s.coreStatus === 'IDLE' ? '💤 Sleeping / Idle' : '🏃 Running'} · ${s.rpm.toFixed(1)} RPM\n` +
    `Round #${s.currentRound} · Total work ${s.work.toLocaleString()} · Distance ${(s.distanceMm / 1000).toFixed(1)} m · Block ${s.blockHeight}\n` +
    `Source: api.squeekchain.com/v1/status`;
}
function playerFor(msg) {
  const id = 'tg:' + msg.from.id;
  if (!state.players[id]) state.players[id] = { name: msg.from.first_name || 'Raider', points: 0, roundsPlayed: 0, lastRound: null, action: null, prediction: null };
  return [id, state.players[id]];
}
function act(msg, action) {
  const [, p] = playerFor(msg);
  if (p.lastRound === currentRound && p.action) return '⏳ You already acted in this round. One action per round!';
  p.action = action; p.lastRound = currentRound; p.roundsPlayed += 1;
  if (action === 'charge') state.buffNextRound = Math.max(state.buffNextRound, 0.10);
  if (action === 'cheer') state.cheerCount += 1;
  save();
  return action === 'charge' ? '🏃 Charged! Next round damage +10%.' : '📣 Cheering! Zoomies rounds will hit ×2 for the raid.';
}

async function handle(msg) {
  if (!msg.text) return;
  const chatId = msg.chat.id;
  const [cmd, ...args] = msg.text.trim().split(/\s+/);
  const command = cmd.split('@')[0].toLowerCase();
  if (command === '/start' || command === '/join') {
    raidChats.add(chatId); playerFor(msg); save();
    return send(chatId, `⚔️ Welcome to <b>WHEEL RAID</b>, ${msg.from.first_name || 'Raider'}!\n\n${bossText()}\n\n${statusText()}\n\nPlay: /charge 🏃 · /cheer 📣 · /predict nap|jog|zoomies 🔮\nOne action per round. The hamster's real wheel work is the damage.`);
  }
  if (command === '/boss') return send(chatId, bossText());
  if (command === '/status') return send(chatId, statusText() + '\n\n' + bossText());
  if (command === '/charge') return send(chatId, act(msg, 'charge'));
  if (command === '/cheer') return send(chatId, act(msg, 'cheer'));
  if (command === '/predict') {
    const choice = (args[0] || '').toLowerCase();
    if (!['nap', 'jog', 'zoomies'].includes(choice)) return send(chatId, 'Usage: /predict nap · /predict jog · /predict zoomies');
    const [, p] = playerFor(msg);
    if (p.lastRound !== currentRound) { p.lastRound = currentRound; p.roundsPlayed += 1; }
    p.prediction = choice; if (!p.action) p.action = 'predict';
    save();
    return send(chatId, `🔮 Prediction locked: <b>${choice}</b> for round #${currentRound}. Correct = +${E.CONFIG.points.correctPrediction} RP.`);
  }
  if (command === '/leaderboard') {
    const rows = Object.values(state.players).sort((a, b) => b.points - a.points).slice(0, 20);
    const text = rows.length ? rows.map((p, i) => `${i + 1}. ${p.name} — <b>${p.points} RP</b> (${p.roundsPlayed} rounds)`).join('\n') : 'No raiders yet.';
    return send(chatId, '🏆 <b>Leaderboard</b>\n' + text);
  }
  if (command === '/help') return send(chatId, '🐹 <b>WHEEL RAID</b>\n/start join · /boss boss HP · /status live wheel · /charge /cheer /predict nap|jog|zoomies · /leaderboard\n\nOne boss per week. Nap = boss heals, but 3 naps in a row arm Dream Energy (×3 next hit). No gambling, no token — naps score too.');
}

async function pollChain() {
  try {
    const res = await fetch(E.API.status, { cache: 'no-store' });
    const parsed = E.parseStatus(await res.json());
    if (!parsed) return;
    if (currentRound === null) { currentRound = parsed.currentRound; roundStartWork = parsed.work; }
    if (parsed.currentRound !== null && parsed.currentRound !== currentRound) {
      const workDelta = Math.max(0, parsed.work - roundStartWork);
      const { report } = E.settleRound(state, { roundId: currentRound, workUnits: workDelta });
      let text = `${report.emoji} <b>Round #${report.roundId} settled: ${report.type.toUpperCase()}</b> · work ${report.workUnits}` +
        (report.damage ? `\n⚔️ ${report.damage} damage (×${report.multiplier.toFixed(2)})` : '') +
        (report.healed ? `\n💚 Boss healed ${report.healed} HP` : '') +
        (report.dreamUsed ? '\n✨ DREAM STRIKE!' : '');
      if (report.bossKilled) {
        const nb = E.BOSSES[(state.bossId + 1) % E.BOSSES.length];
        state.bossId = nb.id; state.bossMaxHP = E.bossMaxHP(Object.keys(state.players).length); state.bossHP = state.bossMaxHP;
        text += `\n\n🏆 <b>BOSS KILLED!</b> Raiders with 10+ rounds earned +${E.CONFIG.points.bossKillShare} RP.\n🆕 Next boss: ${nb.emoji} ${nb.name}`;
      }
      text += '\n\n' + bossText();
      save();
      for (const chatId of raidChats) send(chatId, text).catch(() => {});
      currentRound = parsed.currentRound; roundStartWork = parsed.work;
    }
    lastStatus = parsed;
  } catch (e) { console.error('chain poll failed:', e.message); }
}

async function main() {
  console.log('WHEEL RAID bot starting…');
  await pollChain();
  setInterval(pollChain, 20000);
  let offset = 0;
  for (;;) {
    try {
      const res = await tg('getUpdates', { offset, timeout: 30 });
      for (const u of res.result || []) {
        offset = u.update_id + 1;
        if (u.message) handle(u.message).catch(e => console.error(e));
      }
    } catch (e) { console.error('getUpdates failed:', e.message); await new Promise(r => setTimeout(r, 3000)); }
  }
}
main();
