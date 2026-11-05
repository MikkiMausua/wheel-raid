/**
 * WHEEL RAID — shared game engine
 * Works in Node.js (Telegram bot) and in the browser (web game).
 * Data source: Squeekchain public API — no signing, no custody, no private keys.
 *   GET https://api.squeekchain.com/v1/status
 * Fields used (verified live 2026-11-05):
 *   measurement.cumulativeWorkUnits  -> total wheel work (passes proxy)
 *   measurement.distanceMm           -> total distance
 *   measurement.rpmMilli             -> current RPM x1000
 *   measurement.coreStatus           -> IDLE / RUNNING
 *   builder.anchor.settledThroughRound / transactionHash
 */
'use strict';

const BOSSES = [
  { id: 0, name: 'Baron von Vacuum', emoji: '🌀', title: 'The Loudest Terror in the House',
    story: 'Every squeak of the wheel wakes him. Every run makes him weaker.',
    weakness: 'Zoomies rounds deal full damage — he cannot suck up speed.' },
  { id: 1, name: 'The Sleepy Cat', emoji: '🐱', title: 'Nap-Powered Nightmare',
    story: 'She grows stronger when Squeektoshi sleeps. Wake the wheel, break her power.',
    weakness: 'Dream Energy: 3 naps in a row charge a x3 strike against her.' },
  { id: 2, name: 'Empty Seed Bowl, The Devourer', emoji: '🥣', title: 'He Who Is Never Filled',
    story: 'An empty bowl with an endless appetite. Only a running hamster can outrun hunger.',
    weakness: 'Steady Jog rounds chip him down — consistency beats bursts.' },
  { id: 3, name: 'Dr. Vet Visit', emoji: '💉', title: 'The Appointment Nobody Wanted',
    story: 'He arrives with a scale, a thermometer, and bad news. The community holds the line.',
    weakness: 'Cheerers: a loud community scares him off — Cheer buffs count double.' },
];

// Balance: live total work on 2026-11-05 was 3,817 units over ~200 rounds
// (~19/round average), so HP and multipliers are scaled to real data, not fantasy numbers.
const CONFIG = {
  bossBaseHP: 5000,
  hpPerLastWeekPlayer: 50,
  damagePerWorkUnit: 10,
  napHeal: 250,
  dreamNapStreak: 3,
  dreamMultiplier: 3,
  points: { action: 10, correctPrediction: 50, bossKillShare: 200, cheerZoomies: 30 },
};

function classifyRound(workUnits) {
  if (!workUnits || workUnits <= 0) return 'nap';
  if (workUnits < 500) return 'jog';
  return 'zoomies';
}
function roundEmoji(t) { return t === 'nap' ? '💤' : t === 'jog' ? '🐾' : '🔥'; }

function weekIndex(date = new Date()) {
  // ISO-like week number from epoch — good enough for weekly boss rotation
  return Math.floor(date.getTime() / (7 * 24 * 3600 * 1000));
}
function currentBoss(date = new Date()) {
  return BOSSES[weekIndex(date) % BOSSES.length];
}
function bossMaxHP(activePlayersLastWeek = 0) {
  return CONFIG.bossBaseHP + activePlayersLastWeek * CONFIG.hpPerLastWeekPlayer;
}

/**
 * Settle one round.
 * state: { bossHP, bossMaxHP, consecutiveNaps, dreamArmed, buffNextRound (0.10 etc),
 *          cheerCount, players: { id: {name, points, lastRound, prediction, action} } }
 * round: { roundId, workUnits }
 * Returns { state, report }
 */
function settleRound(state, round) {
  const type = classifyRound(round.workUnits);
  let multiplier = 1 + (state.buffNextRound || 0);
  let cheerBuff = 0;
  if (state.cheerCount > 0) {
    if (type === 'zoomies') cheerBuff = 1.0;       // x2 total via +100%
    else if (type === 'jog') cheerBuff = 0.25;
  }
  multiplier += cheerBuff;
  let dreamUsed = false;
  if (state.dreamArmed && type !== 'nap') { multiplier *= CONFIG.dreamMultiplier; dreamUsed = true; }

  let damage = Math.round(round.workUnits * CONFIG.damagePerWorkUnit * multiplier);
  let healed = 0;
  const report = { roundId: round.roundId, workUnits: round.workUnits, type, emoji: roundEmoji(type),
    multiplier, damage: 0, healed: 0, dreamUsed, bossKilled: false, pointsAwarded: {} };

  if (type === 'nap') {
    healed = CONFIG.napHeal;
    state.bossHP = Math.min(state.bossMaxHP, state.bossHP + healed);
    state.consecutiveNaps = (state.consecutiveNaps || 0) + 1;
    if (state.consecutiveNaps >= CONFIG.dreamNapStreak) state.dreamArmed = true;
    report.healed = healed;
  } else {
    state.bossHP = Math.max(0, state.bossHP - damage);
    report.damage = damage;
    state.consecutiveNaps = 0;
    if (dreamUsed) state.dreamArmed = false;
    if (state.bossHP <= 0) report.bossKilled = true;
  }

  // Points: everyone who acted this round + oracle bonuses
  for (const [id, p] of Object.entries(state.players || {})) {
    if (p.lastRound !== round.roundId) continue;
    let pts = CONFIG.points.action;
    if (p.action === 'cheer' && type === 'zoomies') pts += CONFIG.points.cheerZoomies;
    if (p.prediction && p.prediction === type) pts += CONFIG.points.correctPrediction;
    if (report.bossKilled && p.roundsPlayed >= 10) pts += CONFIG.points.bossKillShare;
    p.points = (p.points || 0) + pts;
    report.pointsAwarded[id] = pts;
    p.prediction = null; p.action = null;
  }
  state.buffNextRound = 0; state.cheerCount = 0;
  return { state, report };
}

function parseStatus(json) {
  if (!json || !json.measurement) return null;
  const m = json.measurement;
  const settled = json.builder && json.builder.anchor ? Number(json.builder.anchor.settledThroughRound) : null;
  return {
    work: Number(m.cumulativeWorkUnits),
    distanceMm: Number(m.distanceMm),
    rpm: Number(m.rpmMilli) / 1000,
    coreStatus: m.coreStatus,
    freshness: m.freshness,
    observedAt: m.observedAt,
    settledThroughRound: settled,
    currentRound: settled != null ? settled + 1 : null,
    blockHeight: json.builder && json.builder.anchor ? Number(json.builder.anchor.blockHeight) : null,
    settlementTx: json.builder && json.builder.anchor ? json.builder.anchor.transactionHash : null,
  };
}

const API = { status: 'https://api.squeekchain.com/v1/status', economy: 'https://api.squeekchain.com/v1/economy/state' };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BOSSES, CONFIG, API, classifyRound, roundEmoji, weekIndex, currentBoss, bossMaxHP, settleRound, parseStatus };
}
if (typeof window !== 'undefined') {
  window.WheelRaid = { BOSSES, CONFIG, API, classifyRound, roundEmoji, weekIndex, currentBoss, bossMaxHP, settleRound, parseStatus };
}
