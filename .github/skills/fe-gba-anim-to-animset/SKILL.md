---
name: fe-gba-anim-to-animset
description: "How to convert a Fire Emblem GBA animation script (.txt from FEBuilderGBA / FEditorAdv) and a folder of extracted PNGs into an AnimSet for fight.js. Use when adding a new character or weapon animation to Arena Mayhem."
---

# Fire Emblem GBA Animation → AnimSet Conversion

This skill documents the step-by-step process of reading an FE GBA animation script (`.txt`) and a matching folder of PNG frames, then translating them into a `const MY_SET` AnimSet object for `fight.js`.

---

## What You Start With

A character animation pack exported from **FEBuilderGBA** or **FEditorAdv** typically contains:

```
<character>/
  Axe.txt          # animation script with frame timings and opcodes
  Axe_000.png      # individual extracted frames
  Axe_001.png
  ...
  Axe_034.png
  Axe Sheet 1.png  # spritesheet previews (ignore these)
  Axe.gif          # preview gif (ignore)
```

The `.txt` file is the authoritative source of truth for **which frames exist**, **how long each frame holds**, and **what each mode means**.

---

## Reading the .txt Format

Each line is one of three things:

| Line | Meaning |
|---|---|
| `/// - Mode N  #Description` | Starts a new animation mode (section) |
| `N p- Axe_000.png` | Display `Axe_000.png` for **N GBA frames** (1 GBA frame ≈ 16.67ms) |
| `CXX  #comment` | Engine opcode — **ignore for animation purposes** |
| `~~~` | End of mode separator |

**Only lines matching `N p- filename.png` matter.** Everything else (opcodes `CXX`, section headers, comments) is thrown away.

### Example (Mode 1 excerpt)
```
1 p- Axe_000.png       →  ['Axe_000',  1]
3 p- Axe_001.png       →  ['Axe_001',  3]
6 p- Axe_002.png       →  ['Axe_002',  6]
18 p- Axe_003.png      →  ['Axe_003', 18]
C25                    →  (skip — wing flap sound)
2 p- Axe_006.png       →  ['Axe_006',  2]
```

---

## Mode → Sequence Mapping

The `.txt` modes map to AnimSet sequence keys like this:

| .txt Mode | Description | AnimSet key |
|---|---|---|
| Mode 1 | Melee attack (normal hit) | `attack` |
| Mode 3 | Melee critical hit | `crit` |
| Mode 7 | Dodge melee | `dodge` |
| Mode 8 | Dodge ranged | `dodge` (same frames, merge or pick one) |
| Mode 9 | Equipped standing | `idle` |
| Mode 10 | Standing motions | `idle` (same as 9) |
| Mode 12 | Attack missed | `miss` |

Additional sequences you must define manually (not in .txt):

| AnimSet key | What to use |
|---|---|
| `hurt` | Stand still — simplest is `['Axe_000', 30]` |
| `die` | Blink twice then vanish: `['Axe_000', 10], ['__clear__', 8], ['Axe_000', 10], ['__clear__', 8]` |
| `dead` | Hold invisible: `['__clear__', 999]` |

---

## Identifying the Impact Frames

### impactFrame (normal hit and crit)
In Mode 1, scan for the first frame **immediately before** the `C1A` (Normal hit) or `C08` (Critical hit) opcode. In the Maligknt Knight script this is `Axe_006`.

```
2 p- Axe_006.png
C24           <-- "slash air" sound
2 p- Axe_007.png
C04           <-- "prepare HP depletion"
C1A           <-- Normal hit lands HERE   → impactFrame = 'Axe_006'
```

### missImpactFrame
In Mode 12, scan for the frame around the moment the swing completes and returns with nothing happening. Look for frames that appear *instead of* the hit frames. In the Maligknt Knight script, `Axe_033` is the frame replacing the normal hit moment.

```
2 p- Axe_006.png
2 p- Axe_032.png
1 p- Axe_033.png    ← missImpactFrame = 'Axe_033'
C04
```

---

## Frames to Skip or Remove

Inspect each PNG before finalising the sequence. Common issues:

- **Two characters visible in the same frame** — this happens for frames like Axe_007, Axe_008, Axe_009 in the Maligknt Knight pack (the *defender* is composited into the attacker's frames in the original GBA engine). **Remove these frames from all sequences**; use the preceding or following frame to fill any gap.
- **Spritesheet files** (`Axe Sheet 1.png`, etc.) — not individual frames, ignore entirely.
- **Preview `.gif`** — ignore.

When you remove frames from a sequence, adjust the duration of the surrounding frame to compensate so the overall timing feels right.

---

## Step-by-Step Conversion Walkthrough

### 1. Open the `.txt` and list the modes you need

Scan for `/// - Mode` headers. Note which modes are present and which AnimSet keys they correspond to (see table above).

### 2. Extract frame lines for each mode

For each mode, copy only the `N p- filename.png` lines into a scratch list, dropping the frame extension and prefix:

```
// Raw from Mode 1:
1 p- Axe_000.png  →  ['Axe_000',  1]
3 p- Axe_001.png  →  ['Axe_001',  3]
...
```

### 3. Find impactFrame and missImpactFrame

Use the opcode comment technique described above.

### 4. Review the PNGs for two-character frames

Open any frame that appears only during the hit window (immediately after `impactFrame`). If you see two characters, omit those frames from the sequence.

### 5. Add the manual sequences (hurt, die, dead)

These are not in the `.txt` at all — add them with the standard patterns:
```js
hurt: [ ['STAND_FRAME', 30] ],
die:  [ ['STAND_FRAME', 10], ['__clear__', 8], ['STAND_FRAME', 10], ['__clear__', 8] ],
dead: [ ['__clear__', 999] ],
```
Replace `STAND_FRAME` with whatever the character's neutral standing frame is (`Axe_000` in Maligknt).

### 6. Write the AnimSet object

```js
const MY_SET = {
  baseUrl:         '/assets/img/<folder>/',
  impactFrame:     'FrameName',
  missImpactFrame: 'FrameName',
  sequences: {
    idle:   [ /* Mode 9/10 frames */ ],
    attack: [ /* Mode 1 frames, impact frame included */ ],
    crit:   [ /* Mode 3 frames, impact frame included */ ],
    miss:   [ /* Mode 12 frames, missImpactFrame included */ ],
    hurt:   [ /* stand still */ ],
    dodge:  [ /* Mode 7 frames */ ],
    die:    [ /* blink out */ ],
    dead:   [ /* hold clear */ ],
  },
};
```

### 7. Register and use

```js
// In fight.js, add to the registry:
ANIM_SETS['my-key'] = MY_SET;

// On the fighter object from FightModal (or test data):
{ animSetKey: 'my-key' }
```

---

## Complete Reference Example (Maligknt Knight Axe)

This is the actual result of applying the process above to `Axe.txt`:

```js
const MALIGKNT_AXE = {
  baseUrl:         '/assets/img/maligknt/',
  impactFrame:     'Axe_006',    // frame just before C1A in Mode 1
  missImpactFrame: 'Axe_033',   // replacement frame in Mode 12 whiff window

  sequences: {
    idle:   [ ['Axe_000', 16] ],                        // Mode 9/10

    attack: [                                             // Mode 1, Axe_007/008/009 removed
      ['Axe_000',  1], ['Axe_001',  3], ['Axe_002',  6], ['Axe_003', 18],
      ['Axe_004',  4], ['Axe_005',  3],
      ['Axe_006',  5],   // impactFrame
      ['Axe_010',  4], ['Axe_011',  4], ['Axe_012',  4],
      ['Axe_013',  5], ['Axe_014',  4], ['Axe_015',  4], ['Axe_016',  4],
      ['Axe_017',  4], ['Axe_018',  4], ['Axe_019',  4],
      ['Axe_020',  3], ['Axe_021',  3], ['Axe_022',  3], ['Axe_023',  3],
      ['Axe_000',  1],
    ],

    crit: [                                               // Mode 3, same removal
      ['Axe_000',  1], ['Axe_001',  3], ['Axe_002',  6], ['Axe_003',  3],
      ['Axe_004',  3], ['Axe_024',  3], ['Axe_025',  4],
      ['Axe_026',  3], ['Axe_027',  3], ['Axe_028',  3],
      ['Axe_026',  3], ['Axe_027',  3], ['Axe_028',  3],
      ['Axe_029',  3], ['Axe_025',  6], ['Axe_004',  7], ['Axe_005',  3],
      ['Axe_006',  5],   // impactFrame
      ['Axe_010',  4], ['Axe_011',  4], ['Axe_012',  4],
      ['Axe_013',  5], ['Axe_014',  4], ['Axe_015',  4], ['Axe_016',  4],
      ['Axe_017',  4], ['Axe_018',  4], ['Axe_019',  4],
      ['Axe_020',  3], ['Axe_021',  3], ['Axe_022',  3], ['Axe_023',  3],
      ['Axe_000',  1],
    ],

    miss: [                                               // Mode 12
      ['Axe_000',  1], ['Axe_001',  3], ['Axe_002',  6], ['Axe_003', 18],
      ['Axe_004',  4], ['Axe_005',  3], ['Axe_006',  2], ['Axe_032',  2],
      ['Axe_033',  1],   // missImpactFrame
      ['Axe_034',  4], ['Axe_010',  4], ['Axe_011',  4], ['Axe_012',  4],
      ['Axe_013',  5], ['Axe_014',  4], ['Axe_015',  4], ['Axe_016',  4],
      ['Axe_017',  4], ['Axe_018',  4], ['Axe_019',  4],
      ['Axe_020',  3], ['Axe_021',  3], ['Axe_022',  3], ['Axe_023',  3],
      ['Axe_000',  1],
    ],

    hurt:  [ ['Axe_000', 30] ],                          // stand still
    dodge: [ ['Axe_000', 4], ['Axe_030', 4], ['Axe_031', 1], ['Axe_030', 4], ['Axe_000', 4] ],
    die:   [ ['Axe_000', 10], ['__clear__', 8], ['Axe_000', 10], ['__clear__', 8] ],
    dead:  [ ['__clear__', 999] ],
  },
};
```

---

## Timing Notes

- `1 GBA frame = 1000/60 ≈ 16.67 ms` — the engine constant `FRAME_MS` in fight.js
- Frame counts in the `.txt` are exact GBA frame counts; copy them directly
- If a frame is cut (two-character removal), extend the adjacent frame's count by the removed frame's count to keep timing smooth
