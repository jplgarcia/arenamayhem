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
//  ANIMATION SET: Vanguard (Sword)
//  Sprites: /assets/img/Vanguard/Sword_000.png ... Sword_160.png
// ============================================================
const VANGUARD_SWORD = {
  baseUrl:         '/assets/img/Vanguard/',
  impactFrame:     'Sword_015',
  missImpactFrame: 'Sword_159',
  sequences: {
    idle: [['Sword_000', 1]],
    attack: [
      ['Sword_000', 1], ['Sword_001', 2], ['Sword_002', 1], ['Sword_003', 1], ['Sword_004', 2],
      ['Sword_005', 2], ['Sword_006', 5], ['Sword_007', 3], ['Sword_008', 4], ['Sword_009', 2],
      ['Sword_010', 1], ['Sword_011', 1], ['Sword_012', 1], ['Sword_013', 1], ['Sword_014', 1],
      ['Sword_015', 3], // <-- impactFrame
      ['Sword_016', 3], ['Sword_017', 1], ['Sword_018', 1], ['Sword_019', 1], ['Sword_020', 1],
      ['Sword_021', 1], ['Sword_022', 4], ['Sword_023', 2], ['Sword_024', 1], ['Sword_025', 1],
      ['Sword_026', 1], ['Sword_027', 1], ['Sword_028', 1], ['Sword_029', 1], ['Sword_030', 1],
      ['Sword_031', 1], ['Sword_032', 1], ['Sword_033', 1], ['Sword_034', 1],
      ['Sword_035', 4], ['Sword_036', 2], ['Sword_037', 2], ['Sword_038', 1], ['Sword_039', 1],
      ['Sword_040', 1], ['Sword_041', 1], ['Sword_042', 2], ['Sword_043', 1], ['Sword_044', 2],
      ['Sword_045', 1], ['Sword_046', 2], ['Sword_047', 1], ['Sword_048', 2], ['Sword_049', 1],
      ['Sword_050', 2], ['Sword_051', 1], ['Sword_052', 1], ['Sword_053', 2], ['Sword_054', 1],
      ['Sword_055', 1], ['Sword_056', 1],
      ['Sword_057', 3], ['Sword_058', 2], ['Sword_059', 2], ['Sword_060', 3], ['Sword_061', 2],
      ['Sword_062', 2], ['Sword_063', 1], ['Sword_064', 2], ['Sword_000', 3],
    ],
    crit: [
      ['Sword_000', 1],
      ['Sword_065', 1], ['Sword_066', 1], ['Sword_067', 1], ['Sword_068', 1], ['Sword_069', 1],
      ['Sword_070', 1], ['Sword_071', 1], ['Sword_072', 1], ['Sword_073', 1], ['Sword_074', 1],
      ['Sword_075', 1], ['Sword_076', 1], ['Sword_077', 1], ['Sword_078', 2], ['Sword_079', 2],
      ['Sword_080', 2], ['Sword_081', 2], ['Sword_082', 2], ['Sword_083', 2], ['Sword_084', 2],
      ['Sword_085', 3], ['Sword_086', 3], ['Sword_087', 2], ['Sword_088', 2], ['Sword_089', 2],
      ['Sword_090', 2], ['Sword_091', 1], ['Sword_092', 1], ['Sword_093', 1], ['Sword_094', 1],
      ['Sword_095', 2], ['Sword_096', 2], ['Sword_097', 2], ['Sword_098', 2], ['Sword_099', 2],
      ['Sword_100', 2], ['Sword_101', 2], ['Sword_102', 2], ['Sword_103', 2], ['Sword_104', 2],
      ['Sword_105', 2], ['Sword_106', 2], ['Sword_107', 2], ['Sword_108', 2], ['Sword_109', 2],
      ['Sword_110', 2], ['Sword_111', 2],
      ['Sword_112', 1], ['Sword_113', 1], ['Sword_114', 1], // <-- impactFrame zone; use Sword_015 as anchor
      // return sequence mirrors attack return path
      ['Sword_021', 1], ['Sword_022', 4], ['Sword_023', 2], ['Sword_024', 1], ['Sword_025', 1],
      ['Sword_026', 1], ['Sword_027', 1], ['Sword_028', 1], ['Sword_029', 1], ['Sword_030', 1],
      ['Sword_031', 1], ['Sword_032', 1], ['Sword_033', 1], ['Sword_034', 1],
      ['Sword_035', 4], ['Sword_036', 2], ['Sword_037', 2], ['Sword_038', 1], ['Sword_039', 1],
      ['Sword_040', 1], ['Sword_041', 1], ['Sword_042', 2], ['Sword_043', 1], ['Sword_044', 2],
      ['Sword_045', 1], ['Sword_046', 2], ['Sword_047', 1], ['Sword_048', 2], ['Sword_049', 1],
      ['Sword_050', 2], ['Sword_051', 1], ['Sword_052', 1], ['Sword_053', 2], ['Sword_054', 1],
      ['Sword_055', 1], ['Sword_056', 1],
      ['Sword_057', 3], ['Sword_058', 3], ['Sword_059', 2], ['Sword_060', 2], ['Sword_060', 3],
      ['Sword_061', 2], ['Sword_062', 2], ['Sword_063', 1], ['Sword_064', 2], ['Sword_000', 3],
    ],
    miss: [
      ['Sword_000', 1], ['Sword_001', 2], ['Sword_002', 1], ['Sword_003', 1], ['Sword_004', 2],
      ['Sword_005', 2], ['Sword_006', 5], ['Sword_007', 3], ['Sword_008', 4], ['Sword_009', 2],
      ['Sword_010', 1], ['Sword_011', 1], ['Sword_012', 1], ['Sword_013', 1], ['Sword_014', 3],
      ['Sword_015', 3],
      ['Sword_159', 3], ['Sword_160', 1], // <-- missImpactFrame
      ['Sword_023', 2], ['Sword_024', 1], ['Sword_025', 1], ['Sword_026', 1], ['Sword_027', 1],
      ['Sword_028', 1], ['Sword_029', 1], ['Sword_030', 1], ['Sword_031', 1], ['Sword_032', 1],
      ['Sword_033', 1], ['Sword_034', 1],
      ['Sword_035', 4], ['Sword_036', 2], ['Sword_037', 2], ['Sword_038', 1], ['Sword_039', 1],
      ['Sword_040', 1], ['Sword_041', 1], ['Sword_042', 2], ['Sword_043', 1], ['Sword_044', 2],
      ['Sword_045', 1], ['Sword_046', 2], ['Sword_047', 1], ['Sword_048', 2], ['Sword_049', 1],
      ['Sword_050', 2], ['Sword_051', 1], ['Sword_052', 1], ['Sword_053', 2], ['Sword_054', 1],
      ['Sword_055', 1], ['Sword_056', 1],
      ['Sword_057', 5], ['Sword_058', 3], ['Sword_059', 2], ['Sword_060', 2], ['Sword_061', 2],
      ['Sword_062', 2], ['Sword_063', 1], ['Sword_064', 2], ['Sword_000', 3],
    ],
    hurt:  [['Sword_000', 30]],
    dodge: [['Sword_000', 1], ['Sword_157', 3], ['Sword_158', 1], ['Sword_157', 3], ['Sword_000', 1]],
    die:   [['Sword_000', 10], ['__clear__', 8], ['Sword_000', 10], ['__clear__', 8]],
    dead:  [['__clear__', 999]],
  },
};

// ============================================================
//  ANIMATION SET: Samurai (Sword)
//  Sprites: /assets/img/Samurai/Sword_000.png ... Sword_090.png
// ============================================================
const SAMURAI_SWORD = {
  baseUrl:         '/assets/img/Samurai/',
  impactFrame:     'Sword_020',
  missImpactFrame: 'Sword_028',
  sequences: {
    idle: [['Sword_000', 1]],
    attack: [
      ['Sword_000', 1], ['Sword_001', 3], ['Sword_002', 3], ['Sword_003', 3], ['Sword_004', 3],
      ['Sword_005', 3], ['Sword_006', 3], ['Sword_007', 3], ['Sword_008', 2], ['Sword_009', 2],
      ['Sword_010', 2], ['Sword_011', 15], ['Sword_012', 3], ['Sword_013', 3], ['Sword_014', 3],
      ['Sword_015', 3], ['Sword_016', 3], ['Sword_017', 3], ['Sword_018', 3], ['Sword_018', 3],
      ['Sword_019', 2],
      ['Sword_020', 2], // <-- impactFrame
      ['Sword_021', 2], ['Sword_022', 3], ['Sword_023', 3], ['Sword_024', 4], ['Sword_025', 4],
      ['Sword_024', 4], ['Sword_026', 4], ['Sword_027', 4], ['Sword_028', 4], ['Sword_029', 3],
      ['Sword_030', 3], ['Sword_031', 4], ['Sword_032', 4], ['Sword_033', 5], ['Sword_034', 6],
      ['Sword_035', 8], ['Sword_036', 10], ['Sword_037', 8],
      ['Sword_004', 2], ['Sword_003', 2], ['Sword_002', 2], ['Sword_001', 2],
    ],
    crit: [
      ['Sword_000', 1], ['Sword_038', 2], ['Sword_039', 2], ['Sword_000', 2], ['Sword_040', 2],
      ['Sword_041', 2], ['Sword_040', 2], ['Sword_038', 2], ['Sword_039', 2], ['Sword_000', 2],
      ['Sword_040', 2], ['Sword_041', 1], ['Sword_040', 1], ['Sword_038', 1], ['Sword_039', 1],
      ['Sword_042', 1], ['Sword_000', 1], ['Sword_042', 1], ['Sword_000', 1], ['Sword_043', 1],
      ['Sword_001', 1], ['Sword_044', 1], ['Sword_002', 1], ['Sword_045', 1], ['Sword_003', 1],
      ['Sword_046', 1], ['Sword_037', 1], ['Sword_046', 1], ['Sword_037', 1], ['Sword_046', 1],
      ['Sword_037', 1], ['Sword_046', 1], ['Sword_008', 2], ['Sword_047', 2], ['Sword_010', 2],
      ['Sword_048', 2], ['Sword_011', 2], ['Sword_048', 2], ['Sword_011', 2], ['Sword_048', 2],
      ['Sword_011', 2], ['Sword_011', 1], ['Sword_048', 1], ['Sword_011', 1],
      ['Sword_049', 2], ['Sword_050', 2], ['Sword_051', 2], ['Sword_052', 2], ['Sword_053', 2],
      ['Sword_018', 2],
      ['Sword_054', 3], ['Sword_055', 3], ['Sword_056', 3], ['Sword_057', 3], ['Sword_058', 3],
      ['Sword_059', 3], ['Sword_060', 3], ['Sword_061', 3], ['Sword_062', 3], ['Sword_063', 3],
      ['Sword_064', 3], ['Sword_065', 3], // <-- impactFrame zone
      ['Sword_066', 3], ['Sword_067', 3], ['Sword_068', 3], ['Sword_069', 3], ['Sword_070', 3],
      ['Sword_071', 3], ['Sword_072', 3], ['Sword_073', 3], ['Sword_074', 3], ['Sword_075', 3],
      ['Sword_074', 3], ['Sword_075', 3], ['Sword_074', 3], ['Sword_074', 2], ['Sword_075', 2],
      ['Sword_074', 2], ['Sword_075', 2], ['Sword_074', 2], ['Sword_074', 2], ['Sword_075', 2],
      ['Sword_074', 2], ['Sword_075', 2], ['Sword_074', 2],
      ['Sword_023', 20], ['Sword_024', 2], ['Sword_025', 12], ['Sword_024', 2], ['Sword_026', 10],
      ['Sword_076', 3], ['Sword_077', 3], ['Sword_078', 3], ['Sword_079', 3], ['Sword_078', 3],
      ['Sword_079', 3], ['Sword_078', 3], ['Sword_079', 3], ['Sword_080', 3], ['Sword_081', 3],
      ['Sword_082', 4], ['Sword_083', 4], ['Sword_084', 3], ['Sword_001', 3], ['Sword_000', 2],
    ],
    miss: [
      ['Sword_000', 1], ['Sword_001', 3], ['Sword_002', 3], ['Sword_003', 3], ['Sword_004', 3],
      ['Sword_005', 3], ['Sword_006', 3], ['Sword_007', 3], ['Sword_008', 2], ['Sword_009', 2],
      ['Sword_010', 2], ['Sword_011', 15], ['Sword_012', 3], ['Sword_013', 3], ['Sword_014', 3],
      ['Sword_015', 3], ['Sword_016', 3], ['Sword_017', 3], ['Sword_018', 3], ['Sword_018', 3],
      ['Sword_019', 2], ['Sword_020', 2], ['Sword_021', 2], ['Sword_022', 3], ['Sword_023', 3],
      ['Sword_028', 4], // <-- missImpactFrame
      ['Sword_029', 3], ['Sword_030', 3], ['Sword_031', 4], ['Sword_032', 4], ['Sword_033', 5],
      ['Sword_034', 6], ['Sword_035', 8], ['Sword_036', 10], ['Sword_037', 8],
      ['Sword_004', 2], ['Sword_003', 2], ['Sword_002', 2], ['Sword_001', 2],
    ],
    hurt:  [['Sword_000', 30]],
    dodge: [['Sword_000', 1], ['Sword_089', 2], ['Sword_090', 1], ['Sword_089', 2]],
    die:   [['Sword_000', 10], ['__clear__', 8], ['Sword_000', 10], ['__clear__', 8]],
    dead:  [['__clear__', 999]],
  },
};

// ============================================================
//  ANIMATION SET: Dragoon (Lance)
//  Sprites: /assets/img/Dragoon/Lance_000.png ... Lance_080.png
// ============================================================
const DRAGOON_LANCE = {
  baseUrl:         '/assets/img/Dragoon/',
  impactFrame:     'Lance_015',
  missImpactFrame: 'Lance_080',
  sequences: {
    idle: [['Lance_000', 3]],
    attack: [
      ['Lance_000', 5], ['Lance_001', 3], ['Lance_002', 3], ['Lance_003', 3], ['Lance_004', 1],
      ['Lance_005', 1], ['Lance_006', 1], ['Lance_007', 8], ['Lance_008', 4], ['Lance_009', 3],
      ['Lance_010', 3], ['Lance_011', 3], ['Lance_012', 3], ['Lance_013', 3], ['Lance_014', 3],
      ['Lance_015', 3], // <-- impactFrame
      ['Lance_016', 1], ['Lance_017', 3], ['Lance_018', 3], ['Lance_019', 3], ['Lance_020', 5],
      ['Lance_021', 2], ['Lance_022', 5], ['Lance_023', 4], ['Lance_024', 3], ['Lance_025', 2],
      ['Lance_026', 1], ['Lance_000', 3],
    ],
    crit: [
      ['Lance_000', 3], ['Lance_027', 3], ['Lance_028', 3], ['Lance_029', 3], ['Lance_030', 5],
      ['Lance_031', 3], ['Lance_032', 3], ['Lance_033', 25], ['Lance_034', 3], ['Lance_035', 3],
      ['Lance_036', 3], ['Lance_037', 3], ['Lance_038', 3], ['Lance_039', 3], ['Lance_040', 3],
      ['Lance_041', 3], ['Lance_042', 2], ['Lance_043', 15], ['Lance_044', 2], ['Lance_045', 2],
      ['Lance_046', 32], ['Lance_046', 4], ['Lance_047', 2],
      ['Lance_016', 5], // <-- impactFrame zone
      ['Lance_017', 3], ['Lance_018', 3], ['Lance_019', 3], ['Lance_020', 15], ['Lance_021', 2],
      ['Lance_022', 5], ['Lance_023', 4], ['Lance_024', 3], ['Lance_025', 2], ['Lance_026', 1],
      ['Lance_000', 3],
    ],
    miss: [
      ['Lance_000', 5], ['Lance_001', 3], ['Lance_002', 3], ['Lance_003', 3], ['Lance_004', 1],
      ['Lance_005', 1], ['Lance_006', 1], ['Lance_007', 8], ['Lance_008', 4], ['Lance_009', 3],
      ['Lance_010', 3], ['Lance_011', 3], ['Lance_012', 3], ['Lance_013', 3], ['Lance_014', 3],
      ['Lance_015', 3],
      ['Lance_080', 2], ['Lance_080', 5], // <-- missImpactFrame
      ['Lance_019', 3], ['Lance_020', 5], ['Lance_021', 2], ['Lance_022', 5], ['Lance_023', 4],
      ['Lance_024', 3], ['Lance_025', 2], ['Lance_026', 1], ['Lance_000', 3],
    ],
    hurt:  [['Lance_000', 30]],
    dodge: [['Lance_000', 2], ['Lance_078', 3], ['Lance_079', 15], ['Lance_079', 15], ['Lance_078', 3], ['Lance_000', 2]],
    die:   [['Lance_000', 10], ['__clear__', 8], ['Lance_000', 10], ['__clear__', 8]],
    dead:  [['__clear__', 999]],
  },
};

// ============================================================
//  ANIMATION SET: Berserker (Axe)
//  Sprites: /assets/img/Berserker/Axe_000.png ... Axe_068.png
// ============================================================
const BERSERKER_AXE = {
  baseUrl:         '/assets/img/Berserker/',
  impactFrame:     'Axe_009',
  missImpactFrame: 'Axe_060',
  sequences: {
    idle: [['Axe_000', 1]],
    attack: [
      ['Axe_000', 1], ['Axe_001', 2], ['Axe_002', 2], ['Axe_003', 2], ['Axe_004', 4],
      ['Axe_005', 6], ['Axe_006', 1], ['Axe_007', 1], ['Axe_008', 1],
      ['Axe_009', 1], // <-- impactFrame
      ['Axe_010', 5], ['Axe_011', 3], ['Axe_012', 2], ['Axe_013', 1], ['Axe_014', 5],
      ['Axe_015', 2], ['Axe_016', 2], ['Axe_017', 5], ['Axe_018', 3], ['Axe_019', 5],
      ['Axe_020', 5],
    ],
    crit: [
      ['Axe_000', 1],
      ['Axe_021', 6], ['Axe_022', 6], ['Axe_023', 6], ['Axe_024', 6], ['Axe_025', 6],
      ['Axe_026', 6], ['Axe_027', 6], ['Axe_028', 6], ['Axe_029', 6], ['Axe_030', 6],
      ['Axe_031', 6], ['Axe_032', 6], ['Axe_033', 1], ['Axe_034', 6], ['Axe_035', 5],
      ['Axe_036', 12], ['Axe_037', 2], ['Axe_038', 1], ['Axe_039', 2], ['Axe_040', 2],
      ['Axe_041', 1], ['Axe_042', 2], ['Axe_043', 1], ['Axe_044', 2], ['Axe_045', 1],
      ['Axe_046', 2], ['Axe_047', 2], ['Axe_048', 1], ['Axe_049', 2], ['Axe_050', 2],
      ['Axe_051', 1], ['Axe_052', 2], ['Axe_053', 1], ['Axe_054', 2], ['Axe_055', 1],
      ['Axe_039', 2], ['Axe_040', 2], ['Axe_041', 1], ['Axe_042', 2], ['Axe_043', 2],
      ['Axe_044', 2], ['Axe_045', 1], ['Axe_046', 2], ['Axe_047', 2], ['Axe_048', 1],
      ['Axe_049', 2], ['Axe_002', 2], ['Axe_056', 3], ['Axe_057', 5],
      ['Axe_005', 2], ['Axe_005', 3], ['Axe_006', 1], ['Axe_007', 1], ['Axe_008', 1],
      ['Axe_009', 1], // <-- impactFrame
      ['Axe_010', 2], ['Axe_011', 5], ['Axe_012', 2], ['Axe_013', 2], ['Axe_014', 5],
      ['Axe_015', 3], ['Axe_016', 5], ['Axe_017', 5], ['Axe_018', 1], ['Axe_019', 1], ['Axe_020', 1],
      ['Axe_021', 6], ['Axe_022', 6], ['Axe_023', 6], ['Axe_024', 6], ['Axe_025', 6], ['Axe_026', 6],
    ],
    miss: [
      ['Axe_000', 1], ['Axe_001', 2], ['Axe_002', 3], ['Axe_003', 3], ['Axe_004', 5],
      ['Axe_005', 8], ['Axe_006', 1], ['Axe_007', 1],
      ['Axe_060', 1], ['Axe_061', 1], // <-- missImpactFrame
      ['Axe_062', 5], ['Axe_063', 3], ['Axe_064', 2], ['Axe_065', 1], ['Axe_066', 5],
      ['Axe_067', 2], ['Axe_068', 2], ['Axe_017', 5], ['Axe_018', 1], ['Axe_019', 1], ['Axe_020', 1],
    ],
    hurt:  [['Axe_000', 30]],
    dodge: [['Axe_000', 1], ['Axe_058', 3], ['Axe_059', 1], ['Axe_058', 3]],
    die:   [['Axe_000', 10], ['__clear__', 8], ['Axe_000', 10], ['__clear__', 8]],
    dead:  [['__clear__', 999]],
  },
};

// ============================================================
//  ANIMATION SET: Viking (Axe)
//  Sprites: /assets/img/Viking/Axe_000.png ... Axe_060.png
// ============================================================
const VIKING_AXE = {
  baseUrl:         '/assets/img/Viking/',
  impactFrame:     'Axe_015',
  missImpactFrame: 'Axe_057',
  sequences: {
    idle: [['Axe_000', 1]],
    attack: [
      ['Axe_000', 1], ['Axe_001', 4], ['Axe_002', 4], ['Axe_003', 9], ['Axe_004', 5],
      ['Axe_005', 3], ['Axe_006', 1], ['Axe_007', 1], ['Axe_008', 2], ['Axe_009', 2],
      ['Axe_010', 2], ['Axe_011', 9], ['Axe_012', 3], ['Axe_013', 3], ['Axe_014', 2],
      ['Axe_015', 2], // <-- impactFrame
      ['Axe_016', 3], ['Axe_017', 4], ['Axe_018', 3], ['Axe_019', 3], ['Axe_020', 3],
      ['Axe_021', 3], ['Axe_022', 4], ['Axe_023', 4], ['Axe_024', 3], ['Axe_025', 3],
      ['Axe_026', 2], ['Axe_027', 5], ['Axe_028', 9], ['Axe_029', 4],
      ['Axe_030', 3], ['Axe_031', 3], ['Axe_000', 3],
    ],
    crit: [
      ['Axe_000', 1], ['Axe_001', 4], ['Axe_002', 4], ['Axe_003', 9], ['Axe_004', 5],
      ['Axe_005', 3],
      ['Axe_032', 2], ['Axe_033', 2], ['Axe_034', 2], ['Axe_035', 2], ['Axe_036', 2],
      ['Axe_037', 2], ['Axe_038', 2], ['Axe_039', 2], ['Axe_040', 2],
      ['Axe_041', 2], ['Axe_042', 2], ['Axe_043', 2],
      ['Axe_041', 2], ['Axe_042', 2], ['Axe_043', 2],
      ['Axe_041', 2], ['Axe_042', 2], ['Axe_043', 2],
      ['Axe_041', 2], ['Axe_042', 2], ['Axe_043', 2],
      ['Axe_041', 2], ['Axe_042', 2], ['Axe_043', 2],
      ['Axe_041', 2], ['Axe_042', 2], ['Axe_043', 2],
      ['Axe_041', 2],
      ['Axe_015', 2], // <-- impactFrame
      ['Axe_044', 3], ['Axe_017', 4], ['Axe_018', 3], ['Axe_019', 3], ['Axe_020', 3],
      ['Axe_021', 3], ['Axe_022', 4], ['Axe_023', 4], ['Axe_024', 3], ['Axe_025', 3],
      ['Axe_026', 2], ['Axe_027', 5], ['Axe_028', 9], ['Axe_029', 4],
      ['Axe_030', 3], ['Axe_031', 3], ['Axe_000', 3],
    ],
    miss: [
      ['Axe_000', 1], ['Axe_001', 4], ['Axe_002', 4], ['Axe_003', 9], ['Axe_004', 5],
      ['Axe_005', 3], ['Axe_006', 1], ['Axe_007', 1], ['Axe_008', 2], ['Axe_009', 2],
      ['Axe_010', 2], ['Axe_011', 9], ['Axe_012', 3], ['Axe_013', 3], ['Axe_014', 2],
      ['Axe_015', 2],
      ['Axe_057', 3], ['Axe_058', 4], ['Axe_059', 9], // <-- missImpactFrame
      ['Axe_020_miss', 3], ['Axe_060', 3], ['Axe_021', 3], ['Axe_022', 4], ['Axe_023', 4],
      ['Axe_024', 3], ['Axe_025', 3], ['Axe_026', 2], ['Axe_027', 5], ['Axe_028', 9],
      ['Axe_029', 4], ['Axe_030', 3], ['Axe_031', 3], ['Axe_000', 3],
    ],
    hurt:  [['Axe_000', 30]],
    dodge: [['Axe_000', 1], ['Axe_045', 3], ['Axe_046', 3], ['Axe_047', 3], ['Axe_046', 3], ['Axe_048', 3]],
    die:   [['Axe_000', 10], ['__clear__', 8], ['Axe_000', 10], ['__clear__', 8]],
    dead:  [['__clear__', 999]],
  },
};

// ============================================================
//  ANIMATION SET: Marksman (Bow)
//  Sprites: /assets/img/Marksman/Bow_000.png ... Bow_050.png
// ============================================================
const MARKSMAN_BOW = {
  baseUrl:         '/assets/img/Marksman/',
  impactFrame:     'Bow_013',   // frame just before C05 (arrow release) in Mode 1
  missImpactFrame: 'Bow_013',   // Mode 12 is identical to Mode 1
  sequences: {
    idle: [['Bow_000', 1]],
    attack: [
      ['Bow_000', 2], ['Bow_001', 4], ['Bow_002', 4], ['Bow_003', 4], ['Bow_004', 4],
      ['Bow_005', 2], ['Bow_006', 2], ['Bow_007', 4], ['Bow_008', 3], ['Bow_009', 6],
      ['Bow_010', 6], ['Bow_011', 6], ['Bow_012', 12],
      ['Bow_013', 2], // <-- impactFrame (arrow fires at C05)
      ['Bow_014', 3], ['Bow_015', 6], ['Bow_016', 7], ['Bow_017', 6], ['Bow_018', 6],
      ['Bow_001', 6], ['Bow_000', 3],
    ],
    crit: [
      ['Bow_000', 2], ['Bow_001', 4], ['Bow_019', 4], ['Bow_020', 3],
      ['Bow_021', 2], ['Bow_022', 3], ['Bow_022', 3],
      ['Bow_023', 2], ['Bow_024', 2], ['Bow_025', 3], ['Bow_026', 3],
      ['Bow_027', 3], ['Bow_028', 3],
      ['Bow_029', 6], ['Bow_030', 12], ['Bow_031', 6], ['Bow_032', 6],
      ['Bow_033', 6], ['Bow_034', 6], ['Bow_033', 6], ['Bow_034', 4],
      ['Bow_033', 4], ['Bow_034', 4],
      ['Bow_013', 2], // <-- impactFrame (same name so engine offset works)
      ['Bow_036', 2], ['Bow_037', 2], ['Bow_038', 4], ['Bow_039', 4],
      ['Bow_040', 4], ['Bow_041', 6], ['Bow_042', 3],
      ['Bow_043', 6], ['Bow_044', 4], ['Bow_045', 6],
      ['Bow_046', 7], ['Bow_047', 6], ['Bow_048', 4],
      ['Bow_000', 3],
    ],
    miss: [
      ['Bow_000', 2], ['Bow_001', 4], ['Bow_002', 4], ['Bow_003', 4], ['Bow_004', 4],
      ['Bow_005', 2], ['Bow_006', 2], ['Bow_007', 4], ['Bow_008', 3], ['Bow_009', 6],
      ['Bow_010', 6], ['Bow_011', 6], ['Bow_012', 12],
      ['Bow_013', 2], // <-- missImpactFrame
      ['Bow_014', 3], ['Bow_015', 6], ['Bow_016', 7], ['Bow_017', 6], ['Bow_018', 6],
      ['Bow_001', 6], ['Bow_000', 3],
    ],
    hurt:  [['Bow_000', 30]],
    dodge: [['Bow_000', 1], ['Bow_020', 2], ['Bow_049', 2], ['Bow_050', 2], ['Bow_049', 4], ['Bow_020', 3], ['Bow_000', 3]],
    die:   [['Bow_000', 10], ['__clear__', 8], ['Bow_000', 10], ['__clear__', 8]],
    dead:  [['__clear__', 999]],
  },
};
const MARKSMAN = MARKSMAN_BOW;

// ============================================================
//  ANIMATION SET: Queen (Axe)
//  Sprites: /assets/img/Queen/Axe_000.png ... Axe_077.png
// ============================================================
const QUEEN_AXE = {
  baseUrl:         '/assets/img/Queen/',
  impactFrame:     'Axe_015',
  missImpactFrame: 'Axe_015',
  sequences: {
    idle: [['Axe_000', 1]],
    attack: [
      ['Axe_000', 1], ['Axe_001', 6], ['Axe_002', 6], ['Axe_003', 6], ['Axe_004', 4],
      ['Axe_005', 16], ['Axe_006', 3], ['Axe_007', 3], ['Axe_008', 3], ['Axe_009', 3],
      ['Axe_010', 3], ['Axe_011', 3], ['Axe_012', 2], ['Axe_013', 2], ['Axe_014', 1],
      ['Axe_015', 2], // <-- impactFrame
      ['Axe_016', 3], ['Axe_017', 1], ['Axe_018', 2], ['Axe_019', 2], ['Axe_020', 1],
      ['Axe_021', 4], ['Axe_022', 6], ['Axe_023', 1], ['Axe_024', 1], ['Axe_025', 1],
      ['Axe_026', 1], ['Axe_027', 7], ['Axe_028', 3], ['Axe_029', 4], ['Axe_030', 5],
      ['Axe_031', 5], ['Axe_032', 6], ['Axe_033', 8], ['Axe_034', 10], ['Axe_035', 5],
      ['Axe_036', 3], ['Axe_000', 6],
    ],
    crit: [
      ['Axe_000', 10], ['Axe_037', 6], ['Axe_002', 6], ['Axe_003', 10], ['Axe_038', 6],
      ['Axe_039', 3], ['Axe_040', 2], ['Axe_041', 2], ['Axe_042', 2], ['Axe_043', 2],
      ['Axe_044', 2], ['Axe_045', 2], ['Axe_046', 2], ['Axe_047', 2], ['Axe_048', 2],
      ['Axe_049', 2], ['Axe_050', 2], ['Axe_051', 2], ['Axe_052', 2], ['Axe_053', 2],
      ['Axe_054', 2], ['Axe_055', 3], ['Axe_056', 7], ['Axe_057', 10],
      ['Axe_058', 3], ['Axe_059', 3], ['Axe_060', 3], ['Axe_061', 2], ['Axe_062', 2],
      ['Axe_063', 3], ['Axe_064', 2], ['Axe_065', 2], ['Axe_066', 3], ['Axe_067', 5],
      ['Axe_068', 5], ['Axe_069', 5], ['Axe_070', 2], ['Axe_071', 3], ['Axe_072', 2],
      ['Axe_066', 3], ['Axe_067', 5], ['Axe_068', 5], ['Axe_069', 4], ['Axe_070', 1],
      ['Axe_073', 2], ['Axe_072', 1], ['Axe_066', 2], ['Axe_067', 3], ['Axe_068', 3],
      ['Axe_069', 3], ['Axe_070', 1], ['Axe_071', 2], ['Axe_072', 1], ['Axe_066', 2],
      ['Axe_067', 3], ['Axe_068', 3], ['Axe_069', 3], ['Axe_070', 1], ['Axe_071', 2],
      ['Axe_072', 1], ['Axe_066', 2], ['Axe_067', 3], ['Axe_068', 3], ['Axe_069', 3],
      ['Axe_070', 1], ['Axe_071', 2], ['Axe_072', 1], ['Axe_066', 2], ['Axe_067', 3],
      ['Axe_068', 3], ['Axe_069', 2],
      ['Axe_007', 1], ['Axe_008', 1], ['Axe_009', 1], ['Axe_010', 1], ['Axe_011', 1],
      ['Axe_012', 1], ['Axe_013', 1], ['Axe_014', 1], ['Axe_015', 3], // <-- impactFrame
      ['Axe_016', 3], ['Axe_017', 1], ['Axe_018', 1], ['Axe_019', 1], ['Axe_074', 1],
      ['Axe_021', 4], ['Axe_022', 6], ['Axe_023', 1], ['Axe_024', 1], ['Axe_025', 1],
      ['Axe_075', 1], ['Axe_027', 7], ['Axe_028', 3], ['Axe_029', 4], ['Axe_030', 5],
      ['Axe_031', 5], ['Axe_032', 6], ['Axe_033', 8], ['Axe_034', 10], ['Axe_035', 3],
      ['Axe_036', 2], ['Axe_000', 6],
    ],
    // Mode 12 is identical to Mode 1 (no distinct miss frames)
    miss: [
      ['Axe_000', 1], ['Axe_001', 6], ['Axe_002', 6], ['Axe_003', 6], ['Axe_004', 4],
      ['Axe_005', 16], ['Axe_006', 3], ['Axe_007', 3], ['Axe_008', 3], ['Axe_009', 3],
      ['Axe_010', 3], ['Axe_011', 3], ['Axe_012', 2], ['Axe_013', 2], ['Axe_014', 1],
      ['Axe_015', 2], // <-- missImpactFrame
      ['Axe_016', 3], ['Axe_017', 1], ['Axe_018', 2], ['Axe_019', 2], ['Axe_020', 1],
      ['Axe_021', 4], ['Axe_022', 6], ['Axe_023', 1], ['Axe_024', 1], ['Axe_025', 1],
      ['Axe_026', 1], ['Axe_027', 7], ['Axe_028', 3], ['Axe_029', 4], ['Axe_030', 5],
      ['Axe_031', 5], ['Axe_032', 6], ['Axe_033', 8], ['Axe_034', 10], ['Axe_035', 5],
      ['Axe_036', 3], ['Axe_000', 6],
    ],
    hurt:  [['Axe_000', 30]],
    dodge: [['Axe_000', 1], ['Axe_076', 3], ['Axe_077', 1], ['Axe_076', 3], ['Axe_000', 1]],
    die:   [['Axe_000', 10], ['__clear__', 8], ['Axe_000', 10], ['__clear__', 8]],
    dead:  [['__clear__', 999]],
  },
};

// ============================================================
//  ANIMATION SET: Sorcerer (Magic)
//  Sprites: /assets/img/Sorcerer/Magic_000.png ... Magic_044.png
// ============================================================
const SORCERER_MAGIC = {
  baseUrl:         '/assets/img/Sorcerer/',
  impactFrame:     'Magic_014',
  missImpactFrame: 'Magic_014',
  sequences: {
    idle: [['Magic_000', 4]],
    attack: [
      ['Magic_000', 1], ['Magic_001', 6], ['Magic_002', 6], ['Magic_003', 4], ['Magic_004', 4],
      ['Magic_005', 4], ['Magic_006', 4], ['Magic_007', 4], ['Magic_008', 4], ['Magic_009', 4],
      ['Magic_010', 6], ['Magic_011', 3], ['Magic_012', 3], ['Magic_010', 3], ['Magic_013', 2],
      ['Magic_014', 2], // <-- impactFrame (just before C05 spell)
      ['Magic_015', 4], ['Magic_016', 4], ['Magic_017', 4], ['Magic_018', 1],
      ['Magic_019', 4], ['Magic_020', 2], ['Magic_021', 2], ['Magic_022', 2],
      ['Magic_023', 2], ['Magic_000', 1],
    ],
    crit: [
      ['Magic_000', 1], ['Magic_001', 6], ['Magic_002', 6], ['Magic_003', 4], ['Magic_004', 4],
      ['Magic_024', 4], ['Magic_006', 4], ['Magic_025', 4], ['Magic_008', 4], ['Magic_026', 4],
      ['Magic_012', 3], ['Magic_027', 3], ['Magic_011', 3], ['Magic_028', 3], ['Magic_029', 3],
      ['Magic_030', 3], ['Magic_031', 3], ['Magic_032', 3], ['Magic_033', 3], ['Magic_034', 3],
      ['Magic_035', 4], ['Magic_036', 6], ['Magic_037', 4], ['Magic_038', 6],
      ['Magic_035', 4], ['Magic_036', 6], ['Magic_037', 4], ['Magic_038', 6],
      ['Magic_012', 3], ['Magic_039', 3], ['Magic_040', 3], ['Magic_041', 3], ['Magic_010', 3],
      ['Magic_042', 2],
      ['Magic_014', 2], // <-- impactFrame
      ['Magic_015', 4], ['Magic_016', 4], ['Magic_017', 4], ['Magic_018', 1],
      ['Magic_019', 4], ['Magic_020', 2], ['Magic_021', 2], ['Magic_022', 2],
      ['Magic_023', 2], ['Magic_000', 1],
    ],
    // Mode 12 is identical (spell always fires)
    miss: [
      ['Magic_000', 1], ['Magic_001', 6], ['Magic_002', 6], ['Magic_003', 4], ['Magic_004', 4],
      ['Magic_005', 4], ['Magic_006', 4], ['Magic_007', 4], ['Magic_008', 4], ['Magic_009', 4],
      ['Magic_010', 6], ['Magic_011', 3], ['Magic_012', 3], ['Magic_010', 3], ['Magic_013', 2],
      ['Magic_014', 2], // <-- missImpactFrame
      ['Magic_015', 4], ['Magic_016', 4], ['Magic_017', 4], ['Magic_018', 1],
      ['Magic_019', 4], ['Magic_020', 2], ['Magic_021', 2], ['Magic_022', 2],
      ['Magic_023', 2], ['Magic_000', 1],
    ],
    hurt:  [['Magic_000', 30]],
    dodge: [['Magic_000', 1], ['Magic_043', 3], ['Magic_044', 1], ['Magic_043', 3]],
    die:   [['Magic_000', 10], ['__clear__', 8], ['Magic_000', 10], ['__clear__', 8]],
    dead:  [['__clear__', 999]],
  },
};

// ============================================================
//  ANIMATION SET: Paladin (Lance)
//  Sprites: /assets/img/Paladin/Lance_000.png ... Lance_074.png
// ============================================================
const PALADIN_LANCE = {
  baseUrl:         '/assets/img/Paladin/',
  impactFrame:     'Lance_026',
  missImpactFrame: 'Lance_073',
  sequences: {
    idle: [['Lance_000', 3]],
    attack: [
      ['Lance_000', 3], ['Lance_001', 4], ['Lance_002', 4], ['Lance_003', 3], ['Lance_004', 4],
      ['Lance_005', 4], ['Lance_006', 4], ['Lance_007', 4], ['Lance_008', 5], ['Lance_009', 4],
      ['Lance_010', 4], ['Lance_011', 1], ['Lance_012', 2], ['Lance_013', 1], ['Lance_014', 4],
      ['Lance_015', 4], ['Lance_016', 4], ['Lance_017', 4], ['Lance_018', 4], ['Lance_019', 4],
      ['Lance_020', 4], ['Lance_021', 4], ['Lance_022', 8], ['Lance_023', 4], ['Lance_024', 5],
      ['Lance_025', 6],
      ['Lance_026', 2], // <-- impactFrame
      ['Lance_027', 2], ['Lance_028', 20], ['Lance_029', 5], ['Lance_030', 5], ['Lance_031', 5],
      ['Lance_032', 4], ['Lance_033', 5], ['Lance_034', 5], ['Lance_035', 4], ['Lance_036', 5],
      ['Lance_000', 3],
    ],
    crit: [
      ['Lance_000', 3], ['Lance_001', 4], ['Lance_002', 4], ['Lance_003', 3], ['Lance_004', 4],
      ['Lance_005', 4], ['Lance_006', 4], ['Lance_007', 4], ['Lance_008', 5], ['Lance_009', 4],
      ['Lance_010', 4], ['Lance_011', 1], ['Lance_012', 2], ['Lance_013', 1], ['Lance_014', 4],
      ['Lance_015', 4], ['Lance_016', 4], ['Lance_017', 4], ['Lance_018', 4], ['Lance_019', 4],
      ['Lance_020', 4], ['Lance_021', 4],
      ['Lance_037', 2], ['Lance_038', 2], ['Lance_039', 2], ['Lance_040', 2], ['Lance_041', 2],
      ['Lance_042', 2], ['Lance_043', 2], ['Lance_044', 2], ['Lance_045', 2], ['Lance_046', 2],
      ['Lance_047', 2], ['Lance_048', 2], ['Lance_049', 2], ['Lance_050', 8], ['Lance_051', 4],
      ['Lance_052', 4],
      ['Lance_026', 2], // <-- impactFrame
      ['Lance_053', 2], ['Lance_028', 20], ['Lance_029', 5], ['Lance_030', 5], ['Lance_031', 5],
      ['Lance_032', 4], ['Lance_033', 5], ['Lance_034', 5], ['Lance_035', 4], ['Lance_036', 5],
      ['Lance_000', 3],
    ],
    miss: [
      ['Lance_000', 3], ['Lance_001', 4], ['Lance_002', 4], ['Lance_003', 3], ['Lance_004', 4],
      ['Lance_005', 4], ['Lance_006', 4], ['Lance_007', 4], ['Lance_008', 5], ['Lance_009', 4],
      ['Lance_010', 4], ['Lance_011', 1], ['Lance_012', 2], ['Lance_013', 1], ['Lance_014', 4],
      ['Lance_015', 4], ['Lance_016', 4], ['Lance_017', 4], ['Lance_018', 4], ['Lance_019', 4],
      ['Lance_020', 4], ['Lance_021', 4], ['Lance_022', 8], ['Lance_023', 4], ['Lance_024', 5],
      ['Lance_025', 6], ['Lance_026', 2], ['Lance_027', 2],
      ['Lance_073', 20], // <-- missImpactFrame
      ['Lance_074', 5], ['Lance_030', 5], ['Lance_031', 5], ['Lance_032', 4], ['Lance_033', 5],
      ['Lance_034', 5], ['Lance_035', 4], ['Lance_036', 5], ['Lance_000', 3],
    ],
    hurt:  [['Lance_000', 30]],
    dodge: [['Lance_000', 1], ['Lance_067', 1], ['Lance_068', 1], ['Lance_069', 3], ['Lance_068', 3]],
    die:   [['Lance_000', 10], ['__clear__', 8], ['Lance_000', 10], ['__clear__', 8]],
    dead:  [['__clear__', 999]],
  },
};

// ============================================================
//  ANIMATION SET: Rogue (Sword)
//  Sprites: /assets/img/Rogue/Sword_000.png ... Sword_090.png
// ============================================================
const ROGUE_SWORD = {
  baseUrl:         '/assets/img/Rogue/',
  impactFrame:     'Sword_023',
  missImpactFrame: 'Sword_023',
  sequences: {
    idle: [['Sword_000', 4]],
    attack: [
      ['Sword_000', 2], ['Sword_001', 4], ['Sword_002', 4], ['Sword_003', 3], ['Sword_004', 3],
      ['Sword_005', 2], ['Sword_006', 2], ['Sword_007', 2], ['Sword_008', 2], ['Sword_009', 2],
      ['Sword_010', 2], ['Sword_011', 12], ['Sword_012', 3], ['Sword_013', 3], ['Sword_014', 4],
      ['Sword_015', 2], ['Sword_016', 2], ['Sword_017', 2], ['Sword_018', 2], ['Sword_019', 2],
      ['Sword_020', 3], ['Sword_021', 8], ['Sword_022', 3],
      ['Sword_023', 2], // <-- impactFrame
      ['Sword_024', 3], ['Sword_025', 3], ['Sword_026', 8], ['Sword_027', 4], ['Sword_028', 4],
      ['Sword_029', 4], ['Sword_030', 4], ['Sword_031', 3], ['Sword_032', 2], ['Sword_033', 2],
      ['Sword_034', 2], ['Sword_035', 2], ['Sword_036', 2], ['Sword_037', 2], ['Sword_038', 2],
      ['Sword_039', 2], ['Sword_040', 3], ['Sword_041', 3], ['Sword_042', 2], ['Sword_043', 2],
      ['Sword_044', 3], ['Sword_000', 2],
    ],
    crit: [
      ['Sword_000', 2], ['Sword_001', 4], ['Sword_002', 4], ['Sword_003', 3], ['Sword_004', 3],
      ['Sword_005', 2], ['Sword_045', 2], ['Sword_046', 2], ['Sword_047', 2], ['Sword_005', 2],
      ['Sword_048', 6], ['Sword_049', 4], ['Sword_050', 2], ['Sword_051', 2], ['Sword_052', 2],
      ['Sword_050', 2], ['Sword_051', 2], ['Sword_052', 2], ['Sword_050', 2], ['Sword_051', 2],
      ['Sword_052', 2], ['Sword_050', 2], ['Sword_053', 5], ['Sword_054', 5], ['Sword_055', 2],
      ['Sword_056', 2], ['Sword_057', 2], ['Sword_016', 24], ['Sword_058', 2], ['Sword_059', 3],
      ['Sword_060', 2], ['Sword_016', 6], ['Sword_061', 2], ['Sword_062', 3], ['Sword_063', 2],
      ['Sword_016', 6], ['Sword_064', 2],
      ['Sword_065', 2], ['Sword_066', 3], ['Sword_067', 2], ['Sword_068', 2], ['Sword_068', 4],
      ['Sword_069', 3], ['Sword_070', 2], ['Sword_071', 2], ['Sword_035', 2], ['Sword_036', 2],
      ['Sword_037', 2], ['Sword_072', 2], ['Sword_039', 2], ['Sword_040', 3], ['Sword_041', 3],
      ['Sword_042', 2], ['Sword_043', 2], ['Sword_044', 3], ['Sword_000', 2],
    ],
    // Mode 12 uses same frames as Mode 1 (no distinct whiff)
    miss: [
      ['Sword_000', 2], ['Sword_001', 4], ['Sword_002', 4], ['Sword_003', 3], ['Sword_004', 3],
      ['Sword_005', 2], ['Sword_006', 2], ['Sword_007', 2], ['Sword_008', 2], ['Sword_009', 2],
      ['Sword_010', 2], ['Sword_011', 12], ['Sword_012', 3], ['Sword_013', 3], ['Sword_014', 4],
      ['Sword_015', 2], ['Sword_016', 2], ['Sword_017', 2], ['Sword_018', 2], ['Sword_019', 2],
      ['Sword_020', 3], ['Sword_021', 8], ['Sword_022', 3],
      ['Sword_023', 2], // <-- missImpactFrame
      ['Sword_024', 3], ['Sword_025', 3], ['Sword_026', 8], ['Sword_027', 4], ['Sword_028', 4],
      ['Sword_029', 4], ['Sword_030', 4], ['Sword_031', 3], ['Sword_032', 2], ['Sword_033', 2],
      ['Sword_034', 2], ['Sword_035', 2], ['Sword_036', 2], ['Sword_037', 2], ['Sword_038', 2],
      ['Sword_039', 2], ['Sword_040', 3], ['Sword_041', 3], ['Sword_042', 2], ['Sword_043', 2],
      ['Sword_044', 3], ['Sword_000', 2],
    ],
    hurt:  [['Sword_000', 30]],
    dodge: [['Sword_000', 1], ['Sword_089', 3], ['Sword_090', 2], ['Sword_089', 3], ['Sword_000', 1]],
    die:   [['Sword_000', 10], ['__clear__', 8], ['Sword_000', 10], ['__clear__', 8]],
    dead:  [['__clear__', 999]],
  },
};

// ============================================================
//  ANIMATION SET: Mage Knight (Magic)
//  Sprites: /assets/img/Mage Knight/Magic_000.png ... Magic_082.png
// ============================================================
const MAGE_KNIGHT_MAGIC = {
  baseUrl:         '/assets/img/Mage Knight/',
  impactFrame:     'Magic_018',
  missImpactFrame: 'Magic_018',
  sequences: {
    idle: [['Magic_000', 1]],
    attack: [
      ['Magic_000', 1], ['Magic_001', 4], ['Magic_002', 4], ['Magic_003', 4], ['Magic_004', 4],
      ['Magic_005', 4], ['Magic_006', 2], ['Magic_007', 1], ['Magic_008', 2], ['Magic_009', 1],
      ['Magic_010', 2], ['Magic_011', 1], ['Magic_010', 2], ['Magic_012', 1], ['Magic_010', 2],
      ['Magic_013', 1], ['Magic_010', 2], ['Magic_014', 1], ['Magic_010', 2], ['Magic_015', 1],
      ['Magic_010', 2], ['Magic_016', 1], ['Magic_010', 2], ['Magic_009', 1], ['Magic_010', 2],
      ['Magic_011', 1], ['Magic_010', 2], ['Magic_012', 1], ['Magic_010', 2], ['Magic_013', 1],
      ['Magic_010', 2], ['Magic_014', 1], ['Magic_010', 2], ['Magic_015', 1], ['Magic_010', 2],
      ['Magic_016', 1], ['Magic_010', 2], ['Magic_009', 1], ['Magic_010', 2],
      ['Magic_009', 12], ['Magic_017', 6],
      ['Magic_018', 1], // <-- impactFrame (just before C05)
      ['Magic_018', 2], ['Magic_019', 2], ['Magic_020', 3], ['Magic_021', 2], ['Magic_022', 1],
      ['Magic_022', 3], ['Magic_023', 4], ['Magic_024', 4], ['Magic_025', 4], ['Magic_000', 3],
    ],
    crit: [
      ['Magic_000', 1], ['Magic_026', 4], ['Magic_027', 5], ['Magic_028', 5], ['Magic_029', 24],
      ['Magic_030', 2], ['Magic_029', 1], ['Magic_031', 2], ['Magic_029', 1], ['Magic_032', 2],
      ['Magic_029', 1], ['Magic_030', 2], ['Magic_029', 1], ['Magic_031', 2], ['Magic_029', 1],
      ['Magic_032', 2], ['Magic_029', 1], ['Magic_033', 2], ['Magic_034', 1], ['Magic_035', 2],
      ['Magic_034', 1], ['Magic_036', 2], ['Magic_034', 1], ['Magic_033', 2], ['Magic_034', 1],
      ['Magic_035', 2], ['Magic_034', 1], ['Magic_036', 2], ['Magic_034', 1], ['Magic_033', 2],
      ['Magic_034', 1], ['Magic_035', 2], ['Magic_034', 1], ['Magic_036', 2], ['Magic_034', 1],
      ['Magic_033', 2], ['Magic_034', 1], ['Magic_035', 2], ['Magic_034', 1], ['Magic_036', 2],
      ['Magic_034', 1], ['Magic_029', 2], ['Magic_034', 1], ['Magic_029', 2], ['Magic_034', 1],
      ['Magic_037', 2], ['Magic_038', 1], ['Magic_039', 2], ['Magic_040', 1], ['Magic_041', 2],
      ['Magic_042', 1], ['Magic_043', 2], ['Magic_044', 1], ['Magic_045', 1], ['Magic_046', 1],
      ['Magic_045', 1], ['Magic_046', 1], ['Magic_045', 1], ['Magic_046', 1], ['Magic_047', 1],
      ['Magic_048', 1], ['Magic_049', 1], ['Magic_050', 1], ['Magic_051', 1], ['Magic_052', 1],
      ['Magic_053', 1], ['Magic_054', 1], ['Magic_055', 1], ['Magic_056', 1],
      ['Magic_057', 2], ['Magic_058', 1], ['Magic_057', 2], ['Magic_058', 1], ['Magic_059', 2],
      ['Magic_060', 1], ['Magic_061', 2], ['Magic_062', 1], ['Magic_063', 2], ['Magic_064', 1],
      ['Magic_063', 2], ['Magic_065', 1], ['Magic_066', 2],
      ['Magic_018', 1], // <-- impactFrame (just before C05)
      ['Magic_067', 1], ['Magic_068', 2], ['Magic_069', 1], ['Magic_070', 2], ['Magic_071', 1],
      ['Magic_072', 1], ['Magic_072', 3], ['Magic_066', 3], ['Magic_073', 3],
      ['Magic_074', 4], ['Magic_075', 4], ['Magic_076', 4], ['Magic_077', 5], ['Magic_078', 5],
      ['Magic_079', 4], ['Magic_080', 4], ['Magic_000', 3],
    ],
    miss: [
      ['Magic_000', 1], ['Magic_001', 4], ['Magic_002', 4], ['Magic_003', 4], ['Magic_004', 4],
      ['Magic_005', 4], ['Magic_006', 2], ['Magic_007', 1], ['Magic_008', 2], ['Magic_009', 1],
      ['Magic_010', 2], ['Magic_011', 1], ['Magic_010', 2], ['Magic_012', 1], ['Magic_010', 2],
      ['Magic_013', 1], ['Magic_010', 2], ['Magic_014', 1], ['Magic_010', 2], ['Magic_015', 1],
      ['Magic_010', 2], ['Magic_016', 1], ['Magic_010', 2], ['Magic_009', 1], ['Magic_010', 2],
      ['Magic_011', 1], ['Magic_010', 2], ['Magic_012', 1], ['Magic_010', 2], ['Magic_013', 1],
      ['Magic_010', 2], ['Magic_014', 1], ['Magic_010', 2], ['Magic_015', 1], ['Magic_010', 2],
      ['Magic_016', 1], ['Magic_010', 2], ['Magic_009', 1], ['Magic_010', 2],
      ['Magic_009', 12], ['Magic_017', 6],
      ['Magic_018', 1], // <-- missImpactFrame
      ['Magic_018', 2], ['Magic_019', 2], ['Magic_020', 3], ['Magic_021', 2], ['Magic_022', 1],
      ['Magic_022', 3], ['Magic_023', 4], ['Magic_024', 4], ['Magic_025', 4], ['Magic_000', 3],
    ],
    hurt:  [['Magic_000', 30]],
    dodge: [['Magic_000', 1], ['Magic_081', 3], ['Magic_082', 1], ['Magic_082', 3], ['Magic_081', 3]],
    die:   [['Magic_000', 10], ['__clear__', 8], ['Magic_000', 10], ['__clear__', 8]],
    dead:  [['__clear__', 999]],
  },
};

// ============================================================
//  ANIMATION SET: Valkyrie — no folder found; alias Mage Knight.
//  Add real assets under /assets/img/Valkyrie/ and replace.
// ============================================================
const VALKYRIE_MAGIC = MAGE_KNIGHT_MAGIC; // TODO: add sprite folder

// ============================================================
//  Registry - add more sets here or at runtime:
//    ANIM_SETS['mykey'] = MY_ANIM_SET;
// ============================================================
const ANIM_SETS = {
  'maligknt-axe':  MALIGKNT_AXE,
  'vanguard':      VANGUARD_SWORD,
  'samurai':       SAMURAI_SWORD,
  'dragoon':       DRAGOON_LANCE,
  'berserker':     BERSERKER_AXE,
  'viking':        VIKING_AXE,
  'marksman':      MARKSMAN,
  'queen':         QUEEN_AXE,
  'sorcerer':      SORCERER_MAGIC,
  'paladin':       PALADIN_LANCE,
  'rogue':         ROGUE_SWORD,
  'mage-knight':   MAGE_KNIGHT_MAGIC,
  'valkyrie':      VALKYRIE_MAGIC,
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

// Some sprite sets were exported with a slightly different background shade.
// All of these are "GBA green screen" variants and must be treated as transparent.
// Format: [R, G, B]
const CHROMA_EXTRAS = [
  [160, 208, 168],  // Paladin (R/B channels swapped vs standard)
  [160, 200, 152],  // Queen
];

function _isChroma(r, g, b) {
  if (r === CHROMA_R && g === CHROMA_G && b === CHROMA_B) return true;
  for (let i = 0; i < CHROMA_EXTRAS.length; i++) {
    const e = CHROMA_EXTRAS[i];
    if (r === e[0] && g === e[1] && b === e[2]) return true;
  }
  return false;
}

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
    if (_isChroma(d[i], d[i+1], d[i+2])) d[i+3] = 0;
  }
  ctx.putImageData(id, 0, 0);
  _frameCache[url] = off;
  return off;
}

/**
 * Chroma-key a horizontal slice of an image into a cached offscreen canvas.
 * Used for double-wide (488px) frames that pack OBJ + BG layers side by side.
 */
function _chromaKeySlice(img, cacheKey, sx, sliceW) {
  if (_frameCache[cacheKey]) return _frameCache[cacheKey];
  const off = document.createElement('canvas');
  off.width  = sliceW;
  off.height = img.naturalHeight;
  const ctx = off.getContext('2d');
  ctx.drawImage(img, sx, 0, sliceW, img.naturalHeight, 0, 0, sliceW, img.naturalHeight);
  const id = ctx.getImageData(0, 0, sliceW, img.naturalHeight);
  const d  = id.data;
  for (let i = 0; i < d.length; i += 4) {
    if (_isChroma(d[i], d[i+1], d[i+2])) d[i+3] = 0;
  }
  ctx.putImageData(id, 0, 0);
  _frameCache[cacheKey] = off;
  return off;
}

// FEBuilderGBA exports double-wide (488×160) PNGs for frames that use both
// an OBJ sprite layer (left 244px) and a BG/MAP tilemap layer (right 244px).
// Both halves must be composited at the same canvas position: BG first, then OBJ.
const DOUBLE_WIDE = 488;
const HALF_W      = 244; // DOUBLE_WIDE / 2

function _setFrame(player, animSet, frameName) {
  const canvas = _getEl(player);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;   // nearest-neighbour — crisp pixel art at any scale
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (frameName === '__clear__') return;
  const url = animSet.baseUrl + frameName + '.png';
  const img = _imgCache[url];
  if (img && img.complete && img.naturalWidth) {
    const SCALE = 1.5;
    if (img.naturalWidth === DOUBLE_WIDE) {
      // Double-wide frame: composite BG layer (right half) then OBJ layer (left half)
      const dw = Math.floor(HALF_W * SCALE);
      const dh = Math.floor(img.naturalHeight * SCALE);
      const x  = Math.floor((canvas.width - dw) / 2);
      const y  = canvas.height - dh + 20;
      const objLayer = _chromaKeySlice(img, url + '#obj', 0,      HALF_W);
      const bgLayer  = _chromaKeySlice(img, url + '#bg',  HALF_W, HALF_W);
      ctx.drawImage(bgLayer,  x, y, dw, dh);
      ctx.drawImage(objLayer, x, y, dw, dh);
    } else {
      const off = _chromaKey(img);
      // center horizontally, bottom-align
      const x = Math.floor((canvas.width  - off.width  * SCALE) / 2);
      const y = canvas.height - off.height * SCALE + 20;
      ctx.drawImage(off, x, y, off.width * SCALE, off.height * SCALE);
    }
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
//  Elemental hit effects
// ============================================================

/**
 * Colour palettes per element: [outer/dark, mid, bright, highlight/white]
 * Drawn back-to-front so layer 3 always reads on top.
 */
const ELEM_COLORS = {
  Fire:    ['#cc2200', '#ff6600', '#ffaa00', '#ffff88'],
  Water:   ['#0044aa', '#1177ee', '#44aaff', '#bbddff'],
  Thunder: ['#999900', '#eecc00', '#ffffff', '#bbccff'],
  Earth:   ['#4a2000', '#8b5500', '#c89040', '#e8cc90'],
  Wind:    ['#009933', '#22cc55', '#77ffaa', '#ddfff0'],
  Ice:     ['#2255bb', '#4488dd', '#99bbff', '#ddeeff'],
  Light:   ['#ffbb00', '#ffee44', '#ffffff', '#fff8aa'],
  Dark:    ['#330066', '#7711bb', '#bb44ee', '#550099'],
};

/**
 * Pixel-art glyph stencils — one per element.
 * Format: array of layers, each { ci (color index 0-3), cells [[col,row],...] }
 * col/row = integer offsets from glyph centre; right/down = positive.
 * Rendered at `bs` (block size) pixels per cell.
 */
const ELEM_STENCILS = {

  // 🔥 Upward flame — wide base, pointed tip
  Fire: [
    { ci:0, cells: [                                    // outer red body
      [-2,1],[-1,1],[0,1],[1,1],[2,1],
      [-2,0],[-1,0],[0,0],[1,0],[2,0],
      [-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],
      [-1,-2],[0,-2],[1,-2],
      [0,-3],
    ]},
    { ci:1, cells: [                                    // orange mid
      [-1,0],[0,0],[1,0],
      [-1,-1],[0,-1],[1,-1],
      [0,-2],
    ]},
    { ci:2, cells: [ [0,-1],[0,-2] ] },                 // yellow core
    { ci:3, cells: [ [0,-3] ] },                        // white tip
  ],

  // 🌊 Water wave — base trough + two crests + centre jet
  // 💧 Water droplet — round body tapering to a point at top
  Water: [
    { ci:0, cells: [                                    // dark outer body
      [0,-4],
      [-1,-3],[0,-3],[1,-3],
      [-2,-2],[-1,-2],[0,-2],[1,-2],[2,-2],
      [-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],
      [-2,0], [-1,0], [0,0], [1,0], [2,0],
      [-2,1], [-1,1], [0,1], [1,1], [2,1],
      [-1,2], [0,2], [1,2],
    ]},
    { ci:1, cells: [                                    // mid-blue inner
      [-1,-2],[0,-2],[1,-2],
      [-1,-1],[0,-1],[1,-1],
      [-1,0], [0,0], [1,0],
      [0,1],  [1,1],
    ]},
    { ci:2, cells: [ [-1,-3],[-1,-2],[-1,-1] ] },      // left-side highlight shimmer
    { ci:3, cells: [ [0,-4] ] },                        // bright tip
  ],

  // ⛰ Two mountains — tall left peak, shorter right peak, rocky base
  Earth: [
    { ci:0, cells: [                                    // ground / base rows
      [-5,1],[-4,1],[-3,1],[-2,1],[-1,1],[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],
      [-5,0],[-4,0],[-3,0],[-2,0],[-1,0],[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],
      // right smaller peak
      [2,-1],[3,-1],[4,-1],[3,-2],
    ]},
    { ci:1, cells: [                                    // left big peak body
      [-2,-1],[-1,-1],[0,-1],[1,-1],
      [-2,-2],[-1,-2],[0,-2],
      [-2,-3],[-1,-3],
      [-1,-4],
    ]},
    { ci:2, cells: [ [-2,-2],[-2,-3],[-1,-3] ] },      // sunlit left slope
    { ci:3, cells: [ [-1,-4] ] },                       // peak highlight
  ],

  // ❄ Snowflake — 4 orthogonal arms + 4 diagonal arms + branch ticks + centre crystal
  Ice: [
    { ci:0, cells: [                                    // arm cells (all 8 arms)
      [-4,0],[-3,0],[-2,0],[-1,0],[0,0],[1,0],[2,0],[3,0],[4,0],   // horizontal
      [0,-4],[0,-3],[0,-2],[0,-1],[0,1],[0,2],[0,3],[0,4],          // vertical
      [-3,-3],[-2,-2],[-1,-1],[1,1],[2,2],[3,3],                    // diagonal ↘
      [3,-3],[2,-2],[1,-1],[-1,1],[-2,2],[-3,3],                    // diagonal ↙
    ]},
    { ci:1, cells: [                                    // branch ticks on orthogonal arms
      [-3,-1],[-3,1],[3,-1],[3,1],[-2,-1],[-2,1],[2,-1],[2,1],
      [-1,-3],[1,-3],[-1,3],[1,3],[-1,-2],[1,-2],[-1,2],[1,2],
    ]},
    { ci:2, cells: [                                    // branch ticks on diagonal arms
      [-2,-3],[-3,-2],[2,-3],[3,-2],
      [-3,2],[-2,3],[2,3],[3,2],
    ]},
    { ci:3, cells: [                                    // bright centre crystal
      [-1,-1],[0,-1],[1,-1],[-1,0],[0,0],[1,0],[-1,1],[0,1],[1,1],
    ]},
  ],

  // ☀ Sun — filled disc + 8 radiating rays
  Light: [
    { ci:0, cells: [                                    // sun disc
      [-1,-2],[0,-2],[1,-2],
      [-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],
      [-2,0], [-1,0], [0,0], [1,0], [2,0],
      [-2,1], [-1,1], [0,1], [1,1], [2,1],
      [-1,2], [0,2], [1,2],
    ]},
    { ci:1, cells: [                                    // 8 rays (3 cells each)
      [0,-3],[0,-4],[0,-5], [0,3],[0,4],[0,5],
      [-3,0],[-4,0],[-5,0], [3,0],[4,0],[5,0],
      [-2,-2],[-3,-3],[-4,-4], [2,-2],[3,-3],[4,-4],
      [-2,2],[-3,3],[-4,4],   [2,2],[3,3],[4,4],
    ]},
    { ci:2, cells: [ [0,-5],[0,5],[-5,0],[5,0],[-4,-4],[4,-4],[-4,4],[4,4] ] }, // ray tips
    { ci:3, cells: [                                    // bright centre
      [-1,-1],[0,-1],[1,-1],[-1,0],[0,0],[1,0],[-1,1],[0,1],[1,1],
    ]},
  ],

  // 🌙 Crescent moon — left-facing (shadow on right side)
  Dark: [
    { ci:0, cells: [                                    // moon body
      [0,-4],[1,-4],
      [-1,-3],[0,-3],[1,-3],[2,-3],
      [-2,-2],[-1,-2],[0,-2],
      [-2,-1],[-1,-1],[0,-1],
      [-2,0], [-1,0], [0,0],
      [-2,1], [-1,1], [0,1],
      [-1,2],[0,2],[1,2],[2,2],
      [0,3],[1,3],
    ]},
    { ci:1, cells: [                                    // inner shadow depth
      [-1,-2],[0,-2],[-1,-1],[0,-1],[-1,0],[0,0],[-1,1],[0,1],
    ]},
    { ci:2, cells: [                                    // bright outer rim
      [-2,-2],[-2,-1],[-2,0],[-2,1],[-1,-3],[0,-4],[-1,3],[0,3],
    ]},
    { ci:3, cells: [ [0,-4],[-2,-2],[-2,1],[0,3] ] },  // highlight points
  ],

  // 🌪 Wind tornado — wide funnel top tapering to a point at bottom
  Wind: [
    { ci:0, cells: [                                    // outer funnel body
      [-4,-4],[-3,-4],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[4,-4],
      [-3,-3],[-2,-3],[-1,-3],[0,-3],[1,-3],[2,-3],[3,-3],
      [-2,-2],[-1,-2],[0,-2],[1,-2],[2,-2],
      [-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],
      [-1,0], [0,0], [1,0],
      [-1,1], [0,1], [1,1],
      [0,2], [0,3], [0,4],
    ]},
    { ci:1, cells: [                                    // inner swirl shading
      [-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],
      [-1,-3],[0,-3],[1,-3],
      [0,-2],[1,-2],
      [-1,-1],[0,-1],
    ]},
    { ci:2, cells: [                                    // bright swirl lines
      [-3,-3],[3,-3],
      [-2,-2],[2,-2],
      [-1,0],[1,0],
      [0,2],[0,3],
    ]},
    { ci:3, cells: [ [0,4] ] },                         // funnel tip
  ],

  // ⚡ Thunder — handled separately via _drawBolt()
  Thunder: [],
};

/**
 * Pixel-art zigzag lightning bolt.
 * Each row: [col_start_offset_from_centre, width_in_blocks].
 */
const _BOLT_ROWS = [
  [-2, 3], [-1, 2], [-1, 3], [0, 2], [0, 2], [-1, 2],
];

// ── Particles ───────────────────────────────────────────────

/**
 * Build a particle list for an elemental hit.  Particles are larger
 * than the old system and don't travel as high.
 */
function _spawnEffect(element, cx, cy, isCrit) {
  const scale  = isCrit ? 1.5 : 1.0;
  const colors = ELEM_COLORS[element] || ELEM_COLORS.Fire;
  const ps     = Math.round(14 * scale);  // large so particles are clearly visible
  const R      = Math.random.bind(Math);
  const list   = [];

  function addP(vx, vy, grav, ci, sm) {
    list.push({
      x:     cx + (R() - 0.5) * 14 * scale,
      y:     cy + (R() - 0.5) * 8  * scale,
      vx:    vx * scale,
      vy:    vy * scale,
      grav:  (grav || 0) * scale,
      color: colors[ci % colors.length],
      ps:    Math.round(ps * (sm || 1)),
    });
  }

  switch (element) {
    case 'Fire':
      for (let i = 0; i < 28; i++)
        addP((R()-0.5)*4.0, -(1.2+R()*3.5), 0.07, i%4, R()>0.6 ? 0.7 : 1.0);
      break;
    case 'Water':
      for (let i = 0; i < 26; i++) {
        const a  = R() * Math.PI * 2;
        const sp = 1.5 + R() * 3.0;
        addP(Math.cos(a)*sp, Math.sin(a)*sp * 0.6, 0.08, i%4, 0.9);
      }
      break;
    case 'Earth':
      for (let i = 0; i < 24; i++) {
        const side = i%2 ? 1 : -1;
        addP(side*(2.5+R()*3.5), -(0.6+R()*2.2), 0.14, i%4, 1.5);
      }
      break;
    case 'Wind':
      for (let i = 0; i < 24; i++) {
        const side = i%2 ? 1 : -1;
        addP(side*(3.5+R()*4.0), -(R()*1.2), -0.01, i%3, 0.7);
      }
      break;
    case 'Ice':
      for (let i = 0; i < 22; i++) {
        const a  = (i/22) * Math.PI * 2;
        const sp = 2.5 + R() * 2.0;
        addP(Math.cos(a)*sp, Math.sin(a)*sp, 0.02, i%3, 1.0);
      }
      break;
    case 'Light':
      for (let i = 0; i < 22; i++) {
        const a = (i/22) * Math.PI * 2;
        addP(Math.cos(a)*6.0, Math.sin(a)*6.0 * 0.5, 0, i%3, 0.8);
      }
      break;
    case 'Dark':
      for (let i = 0; i < 26; i++) {
        const a  = R() * Math.PI * 2;
        const sp = 0.8 + R() * 2.0;
        addP(Math.cos(a)*sp, Math.sin(a)*sp * 0.5 - 0.4, -0.02, i%4, 1.2);
      }
      break;
    case 'Thunder':
      for (let i = 0; i < 22; i++) {
        const side = i%2 ? 1 : -1;
        addP(side*(1.5+R()*3.0), -(0.6+R()*2.0), 0.05, i%4, 0.9);
      }
      break;
    default:
      for (let i = 0; i < 26; i++)
        addP((R()-0.5)*4.0, -(1.2+R()*3.2), 0.06, i%4, 1.0);
  }
  return { list, element };
}

/** Step and draw particles at normalized time t (0..1). */
function _drawParticles(ctx, effect, t) {
  const STEPS = 20;  // lower = slower travel = easier to see
  const steps = t * STEPS;
  ctx.save();
  for (const p of effect.list) {
    const x = p.x + p.vx * steps;
    const y = p.y + p.vy * steps + 0.5 * p.grav * steps * steps;
    let alpha;
    if (effect.element === 'Dark') {
      alpha = Math.max(0, 1 - t) * (0.6 + 0.4 * Math.sin(t * Math.PI * 6));
    } else if (effect.element === 'Light') {
      alpha = Math.max(0, 1 - t * 2.2);
    } else {
      alpha = Math.max(0, 1 - t * 1.2);
    }
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = p.color;
    ctx.fillRect(Math.round(x - p.ps/2), Math.round(y - p.ps/2), p.ps, p.ps);
  }
  ctx.restore();
}

// ── Rendering ────────────────────────────────────────────────

/**
 * Draw one frame of a stencil-based elemental effect.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string}  element
 * @param {number}  cx, cy   glyph centre in canvas px
 * @param {number}  bs       block size in px
 * @param {number}  t        normalised time 0..1
 */
function _drawElemFrame(ctx, element, cx, cy, bs, t) {
  if (element === 'Thunder') { _drawBolt(ctx, cx, cy, bs, t); return; }

  // Envelope: pop-in 0→0.12, hold 0.12→0.55, float-fade 0.55→1.0
  let scale, alpha;
  if (t < 0.12) {
    scale = 0.4 + 0.6 * (t / 0.12);
    alpha = t / 0.12;
  } else if (t < 0.55) {
    scale = 1.0; alpha = 1.0;
  } else {
    scale = 1.0;
    alpha = Math.max(0, 1 - (t - 0.55) / 0.45);
  }
  const floatY = t > 0.55 ? ((t - 0.55) / 0.45) * 28 : 0;
  const eff_bs = bs * scale;

  const stencil = ELEM_STENCILS[element];
  const palette = ELEM_COLORS[element];
  if (!stencil || !palette) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;

  for (const layer of stencil) {
    ctx.fillStyle = palette[layer.ci];
    const sz = Math.max(1, Math.round(eff_bs));
    for (const [col, row] of layer.cells) {
      ctx.fillRect(
        Math.round(cx + col * eff_bs - eff_bs * 0.5),
        Math.round(cy + row * eff_bs - eff_bs * 0.5 - floatY),
        sz, sz
      );
    }
  }
  ctx.restore();
}

/** Animated pixel-art zigzag lightning bolt. */
function _drawBolt(ctx, cx, cy, bs, t) {
  const palette = ELEM_COLORS.Thunder;
  const boltH   = _BOLT_ROWS.length * bs;
  const originY = cy - boltH;

  let alpha, mainColor;
  if (t < 0.08) {
    alpha = t / 0.08; mainColor = '#ffffff';
  } else if (t < 0.5) {
    alpha = 1.0;
    mainColor = (t > 0.3 && Math.random() < 0.3) ? palette[1] : palette[0];
  } else {
    alpha = Math.max(0, 1 - (t - 0.5) / 0.5);
    mainColor = palette[0];
  }

  ctx.save();

  // Glow halo (colour[3], 1px bigger each side)
  ctx.fillStyle   = palette[3];
  ctx.globalAlpha = alpha * 0.55;
  for (let i = 0; i < _BOLT_ROWS.length; i++) {
    const [dc, dw] = _BOLT_ROWS[i];
    ctx.fillRect(cx + dc * bs - 1, originY + i * bs, dw * bs + 2, bs + 1);
  }
  // Main bolt
  ctx.globalAlpha = alpha;
  ctx.fillStyle   = mainColor;
  for (let i = 0; i < _BOLT_ROWS.length; i++) {
    const [dc, dw] = _BOLT_ROWS[i];
    ctx.fillRect(cx + dc * bs, originY + i * bs, dw * bs, bs);
  }
  // White highlight (left edge of each row)
  if (t < 0.5) {
    ctx.fillStyle   = '#ffffff';
    ctx.globalAlpha = alpha * 0.85;
    for (let i = 0; i < _BOLT_ROWS.length; i++) {
      const [dc] = _BOLT_ROWS[i];
      ctx.fillRect(cx + dc * bs, originY + i * bs, Math.max(2, Math.round(bs * 0.4)), bs);
    }
  }
  ctx.restore();
}

/**
 * Overlay a pixel-art elemental hit effect on the arena canvas.
 * @param {number}  player   defender index (0 or 1)
 * @param {string}  element  one of the 8 element names
 * @param {boolean} isCrit   larger / longer effect on crits
 */
function showElementEffect(player, element, isCrit) {
  if (!element) return;
  const arena = document.querySelector('.arena');
  if (!arena) return;

  // Particles: halfway between centre (293/333) and outer offset (240/390)
  // P1: 254, P2: 376
  const cx      = player === 0 ? 254 : 376;
  const partCy  = 195;  // hit zone — body of the fighter
  const glyphCy = 113;  // symbol position
  const bs      = isCrit ? 11 : 8;  // 50% bigger than before
  const dur     = isCrit ? 950 : 680;

  const ov = document.createElement('canvas');
  ov.width  = 625;
  ov.height = 280;
  ov.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:5;image-rendering:pixelated;';
  arena.appendChild(ov);

  const ctx      = ov.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const particles = _spawnEffect(element, cx, partCy, isCrit);
  const t0       = performance.now();

  function tick(now) {
    const t = Math.min(1, (now - t0) / dur);
    ctx.clearRect(0, 0, 625, 280);
    _drawParticles(ctx, particles, t);
    _drawElemFrame(ctx, element, cx, glyphCy, bs, t);
    if (t < 1) requestAnimationFrame(tick);
    else        ov.remove();
  }
  requestAnimationFrame(tick);
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
          showElementEffect(def, players[atk].element, turn.crit);
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
