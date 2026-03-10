/**
 * fight.js - Generic Fire Emblem GBA Battle Animation Engine
 *
 * Supports any number of animation sets (different characters/weapons).
 * Each set describes its own base URL, frame names, durations, and sequences.
 *
 * How to add a new animation set:
 *   1. Define a new const following the AnimSet structure below.
 *   2. Optionally register it: ANIM_SETS['mykey'] = MY_SET;
 *   3. On the fighter object passed to fight(), set animSet: MY_SET
 *      (or animSetKey: 'mykey' if you registered it).
 *
 * AnimSet structure:
 * {
 *   baseUrl:          string,   // e.g. '/assets/img/maligknt/'
 *   impactFrame:      string,   // frame name where the hit lands (for normal & crit)
 *   missImpactFrame:  string,   // frame name that marks the whiff moment
 *   sequences: {
 *     idle:   [[frameName, gbaFrames], ...],
 *     attack: [...],  // Mode 1 - normal hit
 *     crit:   [...],  // Mode 3 - critical
 *     miss:   [...],  // Mode 12 - whiff
 *     hurt:   [...],  // defender stagger
 *     dodge:  [...],  // Mode 7 - sidestep
 *     die:    [...],  // death sequence, ends frozen
 *     dead:   [...],  // hold last frame
 *   }
 * }
 */

'use strict';

const FRAME_MS = 1000 / 60; // ~16.67 ms per GBA frame

// ============================================================
//  ANIMATION SET: Maligknt Knight (Axe)
//  Sprites: /assets/img/maligknt/Axe_000.png ... Axe_034.png
// ============================================================
const MALIGKNT_AXE = {
  baseUrl:         '/assets/img/maligknt/',
  impactFrame:     'Axe_006',
  missImpactFrame: 'Axe_033',
  sequences: {

    // Mode 9/10 - standing idle
    idle: [
      ['Axe_000', 16],
    ],

    // Mode 1 - normal melee hit
    attack: [
      ['Axe_000',  1], ['Axe_001',  3], ['Axe_002',  6], ['Axe_003', 18],
      ['Axe_004',  4], ['Axe_005',  3],
      ['Axe_006',  5], // <-- impactFrame
      ['Axe_010',  4], ['Axe_011',  4], ['Axe_012',  4],
      ['Axe_013',  5], ['Axe_014',  4], ['Axe_015',  4], ['Axe_016',  4],
      ['Axe_017',  4], ['Axe_018',  4], ['Axe_019',  4],
      ['Axe_020',  3], ['Axe_021',  3], ['Axe_022',  3], ['Axe_023',  3],
      ['Axe_000',  1],
    ],

    // Mode 3 - critical hit (axe spin before strike)
    crit: [
      ['Axe_000',  1], ['Axe_001',  3], ['Axe_002',  6], ['Axe_003',  3],
      ['Axe_004',  3], ['Axe_024',  3], ['Axe_025',  4],
      ['Axe_026',  3], ['Axe_027',  3], ['Axe_028',  3],
      ['Axe_026',  3], ['Axe_027',  3], ['Axe_028',  3],
      ['Axe_029',  3], ['Axe_025',  6], ['Axe_004',  7],
      ['Axe_005',  3],
      ['Axe_006',  5], // <-- impactFrame
      ['Axe_010',  4], ['Axe_011',  4], ['Axe_012',  4],
      ['Axe_013',  5], ['Axe_014',  4], ['Axe_015',  4], ['Axe_016',  4],
      ['Axe_017',  4], ['Axe_018',  4], ['Axe_019',  4],
      ['Axe_020',  3], ['Axe_021',  3], ['Axe_022',  3], ['Axe_023',  3],
      ['Axe_000',  1],
    ],

    // Mode 12 - miss (whiff)
    miss: [
      ['Axe_000',  1], ['Axe_001',  3], ['Axe_002',  6], ['Axe_003', 18],
      ['Axe_004',  4], ['Axe_005',  3], ['Axe_006',  2], ['Axe_032',  2],
      ['Axe_033',  1], // <-- missImpactFrame
      ['Axe_034',  4], ['Axe_010',  4], ['Axe_011',  4], ['Axe_012',  4],
      ['Axe_013',  5], ['Axe_014',  4], ['Axe_015',  4], ['Axe_016',  4],
      ['Axe_017',  4], ['Axe_018',  4], ['Axe_019',  4],
      ['Axe_020',  3], ['Axe_021',  3], ['Axe_022',  3], ['Axe_023',  3],
      ['Axe_000',  1],
    ],

    // Hurt - stand still
    hurt: [
      ['Axe_000', 30],
    ],

    // Mode 7 - dodge (sidestep)
    dodge: [
      ['Axe_000',  4], ['Axe_030',  4], ['Axe_031',  1],
      ['Axe_030',  4], ['Axe_000',  4],
    ],

    // Die - blink twice then vanish
    die: [
      ['Axe_000', 10], ['__clear__', 8],
      ['Axe_000', 10], ['__clear__', 8],
    ],

    // Dead - stay invisible
    dead: [
      ['__clear__', 999],
    ],
  },
};

// ============================================================
//  Registry - add more sets here or at runtime:
//    ANIM_SETS['mykey'] = MY_ANIM_SET;
// ============================================================
const ANIM_SETS = {
  'maligknt-axe': MALIGKNT_AXE,
};

/** Resolve a fighter's animation set. Priority:
 *    fighter.animSet  (direct object) > fighter.animSetKey (registry lookup) > default
 */
function resolveAnimSet(fighter) {
  if (fighter && fighter.animSet) return fighter.animSet;
  if (fighter && fighter.animSetKey && ANIM_SETS[fighter.animSetKey]) {
    return ANIM_SETS[fighter.animSetKey];
  }
  return MALIGKNT_AXE;
}

// Crit is provided directly by the backend in turn.crit (bool).

// ============================================================
//  Animation engine
// ============================================================
const _timers   = [null, null];
const _imgCache   = {};  // url -> HTMLImageElement
const _frameCache = {};  // url -> offscreen canvas (chroma-keyed)

const CHROMA_R = 168, CHROMA_G = 208, CHROMA_B = 160;

function _getEl(player) {
  return document.getElementById(player === 0 ? 'player1' : 'player2');
}

/** Chroma-key an Image into an offscreen canvas (cached). */
function _chromaKey(img) {
  const url = img.src;
  if (_frameCache[url]) return _frameCache[url];
  const off = document.createElement('canvas');
  off.width  = img.naturalWidth;
  off.height = img.naturalHeight;
  const ctx = off.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const id = ctx.getImageData(0, 0, off.width, off.height);
  const d  = id.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] === CHROMA_R && d[i+1] === CHROMA_G && d[i+2] === CHROMA_B) d[i+3] = 0;
  }
  ctx.putImageData(id, 0, 0);
  _frameCache[url] = off;
  return off;
}

function _setFrame(player, animSet, frameName) {
  const canvas = _getEl(player);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (frameName === '__clear__') return;
  const url = animSet.baseUrl + frameName + '.png';
  const img = _imgCache[url];
  if (img && img.complete && img.naturalWidth) {
    const off = _chromaKey(img);
    // center horizontally, bottom-align
    const x = Math.floor((canvas.width  - off.width  * 1.2) / 2);
    const y = canvas.height - off.height * 1.2;
    ctx.drawImage(off, x, y, off.width * 1.2, off.height * 1.2);
  }
}

function _stopAnim(player) {
  if (_timers[player] !== null) {
    clearTimeout(_timers[player]);
    _timers[player] = null;
  }
}

/**
 * Play a named animation sequence on a player.
 * Returns a Promise that resolves when done (never resolves if loop=true).
 * @param {number}  player   0 or 1
 * @param {object}  animSet  result of resolveAnimSet()
 * @param {string}  seqName  sequence key: 'idle','attack','crit','miss','hurt','dodge','die','dead'
 * @param {boolean} loop     whether to loop forever
 */
function playAnim(player, animSet, seqName, loop) {
  loop = loop === true;
  _stopAnim(player);
  const seq = animSet.sequences[seqName] || animSet.sequences.idle;
  return new Promise(function(resolve) {
    let i = 0;
    function step() {
      if (i >= seq.length) {
        if (loop) { i = 0; } else { resolve(); return; }
      }
      const frameName = seq[i][0];
      const dur       = seq[i][1];
      i++;
      _setFrame(player, animSet, frameName);
      _timers[player] = setTimeout(step, dur * FRAME_MS);
    }
    step();
  });
}

function idleLoop(player, animSet) {
  playAnim(player, animSet, 'idle', true);
}

/** Returns the ms elapsed before the impact frame in a given sequence. */
function impactOffset(animSet, seqName) {
  const seq         = animSet.sequences[seqName] || animSet.sequences.idle;
  const impactName  = seqName === 'miss' ? animSet.missImpactFrame : animSet.impactFrame;
  let ms = 0;
  for (let i = 0; i < seq.length; i++) {
    if (seq[i][0] === impactName) break;
    ms += seq[i][1] * FRAME_MS;
  }
  return ms;
}

// ============================================================
//  HP bar
// ============================================================
function setHP(player, pct) {
  const bar = document.getElementById(player === 0 ? 'hp1-bar' : 'hp2-bar');
  if (bar) bar.style.width = Math.max(0, (200 * pct) / 100) + 'px';
}

function wait(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

/** Show a floating combat label above a player's position in the arena. */
function showLabel(player, text, color, big) {
  const arena = document.querySelector('.arena');
  if (!arena) return;
  const lbl = document.createElement('div');
  lbl.className = 'combat-label';
  lbl.textContent = text;
  lbl.style.color = color;
  if (big) lbl.style.fontSize = '28px';
  const cx = player === 0 ? 'calc(50% - 20px)' : 'calc(50% + 20px)';
  lbl.style.left = cx;
  lbl.style.top  = '10%';
  arena.appendChild(lbl);
  lbl.addEventListener('animationend', function() { lbl.remove(); });
}

// ============================================================
//  Main fight function
// ============================================================
/**
 * @param {Array} rounds   Array of rounds from the backend.
 *                         Each round = array of turns.
 *                         Turn = { attacker_id, hit, crit, damage, defender_hp }
 * @param {Array} players  [fighter0, fighter1]
 *                         Each fighter: { animSet?, animSetKey? }
 *                         animSet:    direct AnimSet object (highest priority)
 *                         animSetKey: key into ANIM_SETS registry
 *                         Falls back to MALIGKNT_AXE if neither is set.
 */
function preloadAnimSet(animSet) {
  const seen = new Set();
  for (const seq of Object.values(animSet.sequences)) {
    for (const [frameName] of seq) {
      if (frameName === '__clear__') continue;
      const url = animSet.baseUrl + frameName + '.png';
      if (!seen.has(url)) {
        seen.add(url);
        if (!_imgCache[url]) {
          const img = new Image();
          img.src = url;
          _imgCache[url] = img;
        }
      }
    }
  }
}

async function fight(rounds, players) {
  const sets = [resolveAnimSet(players[0]), resolveAnimSet(players[1])];

  preloadAnimSet(sets[0]);
  preloadAnimSet(sets[1]);

  setHP(0, 100);
  setHP(1, 100);
  idleLoop(0, sets[0]);
  idleLoop(1, sets[1]);
  await wait(1500);

  for (let ri = 0; ri < rounds.length; ri++) {
    const round  = rounds[ri];
    const isLast = ri === rounds.length - 1;

    for (let ti = 0; ti < round.length; ti++) {
      const turn   = round[ti];
      const atk    = turn.attacker_id;   // 0 or 1
      const def    = atk === 0 ? 1 : 0;
      const hit    = turn.hit;
      const atkSet = sets[atk];
      const defSet = sets[def];

      // Pick attacker sequence
      let atkSeq;
      if (!hit) {
        atkSeq = 'miss';
      } else if (turn.crit) {
        atkSeq = 'crit';
      } else {
        atkSeq = 'attack';
      }

      const defSeq  = hit ? 'hurt' : 'dodge';
      const offset  = impactOffset(atkSet, atkSeq);

      const atkPromise = playAnim(atk, atkSet, atkSeq);
      const defPromise = wait(offset).then(function() {
        if (hit) {
          setHP(def, turn.defender_hp);
          if (turn.crit) {
            showLabel(def, 'CRIT!  ' + turn.damage, '#fbbf24', true);
          } else {
            showLabel(def, String(turn.damage), '#f87171', false);
          }
        } else {
          showLabel(def, 'MISS', '#d1d5db', false);
        }
        return playAnim(def, defSet, defSeq);
      });

      await Promise.all([atkPromise, defPromise]);
      await wait(150);
    }

    if (isLast) {
      const lastTurn = round[round.length - 1];
      const winner   = lastTurn.attacker_id;
      const loser    = winner === 0 ? 1 : 0;

      setHP(loser, 0);
      idleLoop(winner, sets[winner]);
      await playAnim(loser, sets[loser], 'die');
      playAnim(loser, sets[loser], 'dead', true);
      await wait(3000);
      _stopAnim(winner);
      _stopAnim(loser);
    } else {
      idleLoop(0, sets[0]);
      idleLoop(1, sets[1]);
      await wait(1000);
    }
  }
}
