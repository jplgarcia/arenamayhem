---
name: arena-mayhem-guide
description: "Complete reference for the Arena Mayhem codebase. Use when asking about how the game works, what each file does, the battle system, frontend components, backend logic, blockchain integration, animation engine, fighter stats, or how to add new features."
---

# Arena Mayhem — Codebase Guide

## What Is Arena Mayhem?

A blockchain-backed 1v1 fighting game built on **Cartesi Rollups v2**. Players wager ERC-20 tokens, forge secret fighters, and watch deterministic GBA-style sprite battles play out on-chain. Neither player can cheat because fighters are committed by hash before either is revealed.

---

## Game Flow (End to End)

```
Player A                              Cartesi Node (am-node)
  │                                          │
  ├─ create_challenge(fighter_hash, wager) ──► stores hash + escrows 2× wager
  │                                          │
Player B                                     │
  ├─ accept_challenge(fighter, seed) ────────► stores fighter, escrows 1× wager
  │                                          │
Player A                                     │
  ├─ start_match(full_fighter + seed) ───────► hash verified → battle() runs
  │                                          │  → Notice posted (full battle record)
  │                                          │  → winner gets escrow payout
  │                                          │
  └─ FightModal polls Notices ───────────────► replays animation locally
```

The **commit-reveal scheme** prevents front-running: Player A commits only a SHA-256 hash of their fighter at creation time. Player B cannot see the fighter before committing their own. Player A reveals the full fighter at `start_match`, and the hash is verified on-chain.

---

## Project Structure

```
arenamayhem/
├── next-front/          # Next.js 14 frontend
│   ├── app/             # Pages (routes)
│   ├── components/      # Shared UI components
│   ├── lib/             # Blockchain/RPC helpers
│   └── public/js/       # fight.js (animation engine)
└── am-node/             # Cartesi backend (Python)
    ├── dapp.py          # Entry point / request router
    ├── BattleManager.py # Challenge lifecycle
    ├── arena.py         # Combat simulation
    └── wallet.py        # In-dapp asset ledger
```

---

## Frontend Pages (`next-front/app/`)

### `page.tsx` — My Fighters (home)
The player's battle dashboard.
- Fetches owned challenges via `POST /inspect/<dappAddress>` body `user_battles/<account>`
- **Forge a Challenge**: opens `FighterModal` (create mode) → sends `create_challenge` input with only the fighter's SHA-256 hash; saves full fighter to `localStorage` keyed by hash
- **Commence** (when `accepted`): reopens `FighterModal` (locked/read-only) → sends `start_match` revealing full fighter + seed; polls every 5s for the Notice result, then opens `FightModal`

### `challenges/page.tsx` — The Pit
Open challenge board — all `pending` challenges not owned by the connected wallet.
- "Enter the Fray" opens `FighterModal` for a fresh fighter and sends `accept_challenge`

### `history/page.tsx` — The Chronicles
Completed battle history for the connected wallet, fetched via `getUserBattles()` (scans Cartesi Notices). "Watch Replay" opens `FightModal` for any past battle.

### `about/page.tsx` — The Lore
Static flavour text page.

### `assets/page.tsx` — The Vault
Deposit/withdraw ERC-20 tokens into the Cartesi rollup and execute withdrawal vouchers.

---

## Frontend Components (`next-front/components/`)

### `FighterModal.tsx`
Modal for building/viewing a fighter. Exports the `Fighter` and `Boons` TypeScript interfaces used everywhere.

Fields:
- **Name** — free text
- **Seed** — auto `crypto.randomUUID()`, re-rollable (hidden when `locked=true`)
- **Element** — 8 choices (Fire / Water / Thunder / Earth / Wind / Ice / Light / Dark) with inline type chart
- **Boon Budget** — 10 points across 7 stats (HP, POW, SKL, SPD, LCK, DEF, RES) via +/− buttons

When `locked=true` all fields are read-only — used when the original challenger reveals their saved fighter at `start_match`.

### `FightModal.tsx`
Battle animation overlay.
- 625×280px `.arena` div with background image, two `<canvas>` elements, two HP bars
- `ResizeObserver` scales the arena via CSS `transform: scale()` to fit any screen width
- Calls `window.fight(battle.rounds, battle.fighters)` on mount
- Shows winner name and collapsible Round Log

### `Header.tsx`
Sticky top bar. Logo left, MetaMask connect/disconnect right. Responsive — abbreviated on mobile.

### `Nav.tsx`
Sidebar on desktop (`md:flex`), bottom tab bar on mobile (`md:hidden`). Five links matching the five pages. Active link gets amber left-bar indicator.

### `VoucherModal.tsx`
Lists unexecuted ERC-20 withdrawal vouchers and calls `executeOutput` on-chain to claim them.

---

## Lib Layer (`next-front/lib/`)

### `config.ts`
Reads env vars: `NEXT_PUBLIC_DAPP_ADDRESS`, `NEXT_PUBLIC_ERC20_ADDRESS`, `NEXT_PUBLIC_CHAIN_ID` (default `31337`), `NEXT_PUBLIC_NODE_URL`, `NEXT_PUBLIC_RPC_URL`. Exports a single `config` object.

### `ethereum.ts`
Client-side wallet layer using `viem` + `@cartesi/viem`.
- `initWallet()` — requests MetaMask accounts, creates `WalletClient` extended with Cartesi L1 actions
- `addInput(jsonString)` — sends hex-encoded JSON as a Cartesi input
- `depositERC20(amount)` — checks/sets allowance then calls `depositERC20Tokens`
- `depositEther(amount)` / `depositERC721(tokenAddr, tokenId)` — other portal deposits
- `executeVoucher(output)` — executes a withdrawal voucher on L1

### `inspect.ts`
Wraps `POST /inspect/:dappId`. `getERC20Balance(user, token)` and `getEtherBalance(user)` parse hex-encoded JSON reports.

### `rpc.ts`
Uses `@cartesi/rpc` JSON-RPC to query the Cartesi node.
- `getUserBattles(user)` — scans all Notices, returns those where `owner_id` or `opponent_id` matches user and that have a `rounds` array
- `getVouchers()` — returns withdrawal vouchers for VoucherModal

---

## Animation Engine (`next-front/public/js/fight.js`)

Standalone vanilla JS loaded globally via `<Script strategy="afterInteractive">`. Exposes one global: `window.fight(rounds, players)`.

### AnimSet Structure
```js
{
  baseUrl:         '/assets/img/maligknt/',  // sprite PNG directory
  impactFrame:     'Axe_006',                // frame name when hit lands
  missImpactFrame: 'Axe_033',                // frame name during whiff
  sequences: {
    idle:   [[frameName, gbaFrames], ...],
    attack: [...],   // normal hit
    crit:   [...],   // critical
    miss:   [...],   // whiff
    hurt:   [...],   // defender reaction (currently: stand still)
    dodge:  [...],   // defender sidestep
    die:    [...],   // blink-out
    dead:   [...],   // hold invisible
  }
}
```

Frame duration is in GBA frames (1 GBA frame = 1000/60 ≈ 16.67ms). `'__clear__'` is a special frame name that hides the canvas.

The registry `ANIM_SETS` allows adding more character sprite sets:
```js
ANIM_SETS['my-character'] = MY_ANIM_SET;
// Pass on fighter object: { animSetKey: 'my-character' }
```

### Current ANIM_SETS Registry
| key | constant | sprite folder | weapon |
|---|---|---|---|
| `maligknt-axe` | `MALIGKNT_AXE`      | `/assets/img/maligknt/`     | Axe |
| `vanguard`     | `VANGUARD_SWORD`    | `/assets/img/Vanguard/`     | Sword |
| `samurai`      | `SAMURAI_SWORD`     | `/assets/img/Samurai/`      | Sword |
| `dragoon`      | `DRAGOON_LANCE`     | `/assets/img/Dragoon/`      | Lance |
| `berserker`    | `BERSERKER_AXE`     | `/assets/img/Berserker/`    | Axe |
| `viking`       | `VIKING_AXE`        | `/assets/img/Viking/`       | Axe |
| `marksman`     | `MARKSMAN_BOW`      | `/assets/img/Marksman/`     | Bow |
| `queen`        | `QUEEN_AXE`         | `/assets/img/Queen/`        | Axe |
| `sorcerer`     | `SORCERER_MAGIC`    | `/assets/img/Sorcerer/`     | Magic |
| `paladin`      | `PALADIN_LANCE`     | `/assets/img/Paladin/`      | Lance |
| `rogue`        | `ROGUE_SWORD`       | `/assets/img/Rogue/`        | Sword |
| `mage-knight`  | `MAGE_KNIGHT_MAGIC` | `/assets/img/Mage Knight/`  | Magic |
| `valkyrie`     | `VALKYRIE_MAGIC`    | alias of `MAGE_KNIGHT_MAGIC` (TODO: own folder) | Magic |

### Per-Turn Sequence
1. Preload all PNGs via `preloadAnimSet()` (fires `new Image()` for each frame URL)
2. Idle loop starts on both fighters
3. For each turn: pick attacker sequence (`attack`/`crit`/`miss`), compute `impactOffset()` (ms until impact frame)
4. At impact: update HP bar, show floating label — `CRIT! 42` (gold), `42` (red), or `MISS` (grey)
5. Defender plays `hurt` or `dodge`
6. Final round: loser blinks out via `die` → `dead`, winner idles for 3s

### Double-Wide (488×160) PNG Frames
FEBuilderGBA exports some frames as **488×160** instead of the standard **248×160**. These pack two layers side by side:
- **Left 244px** — OBJ sprite layer (character body)
- **Right 244px** — BG/MAP tilemap layer (weapon flash / spell effect tiles)

Both halves must be composited at the **same canvas position**: BG layer first, then OBJ layer on top. The renderer detects width=488, slices each half via `_chromaKeySlice()`, and draws them in order.

Affected characters and their double-wide frame ranges:
| Character | Double-wide frames |
|---|---|
| maligknt   | Axe_007–009 |
| Vanguard   | Sword_016–022, Sword_112–153 |
| Dragoon    | Lance_016–018 |
| Berserker  | Axe_008–016 |
| Viking     | Axe_016–020, Axe_044 |
| Queen      | Axe_015 |
| Paladin    | Lance_028–029 |

### Chroma Key Colors
All sprite backgrounds use a "GBA green screen" color that is keyed to transparent. Not all exports use the same exact shade. The `_isChroma(r,g,b)` function handles all known variants:

| Character(s) | Background color |
|---|---|
| Most classes (maligknt, Vanguard, Berserker, Viking, Samurai, Dragoon, Sorcerer, Rogue, Marksman, Mage Knight) | `rgb(168, 208, 160)` — standard |
| Paladin | `rgb(160, 208, 168)` — R and B swapped vs standard |
| Queen | `rgb(160, 200, 152)` — slightly darker shade |

Extra colors are listed in `CHROMA_EXTRAS` array in `fight.js`. When adding a new sprite set whose background doesn't key out, check its `palette[0]` in the indexed PNG's PLTE chunk (it is always palette index 0) and add the color to `CHROMA_EXTRAS` if needed.

### Adding a New Sprite Set
1. Put PNGs in `public/assets/img/<character>/`
2. Check if background color matches an existing entry in `CHROMA_EXTRAS`; add it if not
3. Define a new `const MY_SET = { baseUrl, impactFrame, missImpactFrame, sequences }` in `fight.js`
4. Register: `ANIM_SETS['my-key'] = MY_SET`
5. Pass `{ animSetKey: 'my-key' }` on the fighter object from `FightModal`

### Animation Preview Tool
A standalone test page at `next-front/public/anim-preview.html` (served at `http://localhost:3000/anim-preview.html`).
- Dropdowns for P1/P2 class — all 13 registry keys
- Per-player sequence buttons auto-generated from the AnimSet (idle/dead loop, others play once)
- "Run turn" — fires a single P1→P2 turn with configurable hit type and damage
- "Full demo fight" — runs 5 scripted rounds covering hit, crit, miss, and lethal finish
- Requires no build step; uses the live Next.js dev server for asset URLs

---

## Backend (`am-node/`)

### `dapp.py` — Entry Point

Routes Cartesi advance/inspect requests.

**Advance routes (state-changing):**
| method | handler |
|---|---|
| Portal addresses | `wallet.*_deposit_process()` |
| `create_challenge` | `battle_manager.create_challenge()` |
| `accept_challenge` | `battle_manager.accept_challenge()` |
| `start_match` | `battle_manager.start_match()` → posts Notice + Report |
| `ether_transfer` / `erc20_transfer` | `wallet.*_transfer()` |
| `ether_withdraw` / `erc20_withdraw` | `wallet.*_withdraw()` (creates voucher) |

**Inspect routes (read-only):**
| route | returns |
|---|---|
| `balance/erc20/<user>/<token>` | `{amount, token_type}` |
| `balance/ether/<user>` | same for ETH |
| `battles` | all challenges |
| `user_battles/<user>` | owner's challenges |

### `BattleManager.py` — Challenge Lifecycle

In-memory dict `self.challenges` keyed by integer IDs.

**`create_challenge(owner, fighter_hash, token, amount)`**
- Requires ≥ `2×amount` ERC-20 balance (wager + stake/collateral)
- Escrows both; status → `pending`

**`accept_challenge(challenge_id, opponent, fighter, seed)`**
- Validates boon budget (`is_cheater()`)
- Escrows `amount` from opponent; status → `accepted`

**`start_match(challenge_id, sender, fighter)`**
- Only the challenge owner can call
- Recomputes SHA-256 of `name-element-hp-pow-skl-spd-lck-def-res-seed`
- Hash mismatch or invalid boons → opponent gets all 3× amounts, raises Exception
- Calls `arena.battle()` and distributes prize (draw = refund; winner takes escrow)
- Deletes challenge, returns `(notice_payload, report_payload)`

### `arena.py` — Combat Simulation

Deterministic RNG seeded from `seed1 + seed2` (concatenated strings).

**Stats** (from boons via `boons_to_stats()`):
| Stat | Base | Per Boon |
|---|---|---|
| HP | 24 | +8 |
| POW | 5 | +3 |
| SKL | 5 | +3 |
| SPD | 5 | +3 |
| LCK | 0 | +4 |
| DEF | 3 | +2 |
| RES | 3 | +2 |

**Per-turn logic:**
1. **Hit check**: `hit_rate = SKL×2 + LCK÷2 + 60` (±15 element); `avoid = SPD×2 + LCK`; `chance = clamp(0, hit_rate−avoid, 100)`
2. **Damage**: `max(0, POW + 5 − DEF_or_RES) × element_mult` (DEF for physical elements; RES for special)
3. **Crit**: `crit_chance = max(0, SKL÷2 + 5 − LCK)` → damage ×3
4. Returns `{attacker_id, damage, hit: bool, crit: bool, defender_hp: pct}`

**Round structure**: faster unit (SPD) attacks first → counter → optional double strike (SPD diff ≥ 4). Roles swap each round. Max 30 rounds.

**Element chart** (1.25 strong / 0.75 resisted):
- Fire > Ice > Wind > Earth > Thunder > Water > Fire (circular)
- Light ↔ Dark (mutual 1.25 vs each other)
- Physical elements (Earth, Wind, Ice, Dark) use DEF; Special (Fire, Water, Thunder, Light) use RES

### `wallet.py` — In-Dapp Asset Ledger
Tracks ERC-20 and ETH balances as an in-memory dict. Provides `balance_get()`, `erc20_add/sub()`, `ether_add/sub()`. Transfer and withdrawal operations are logged. Vouchers for on-chain withdrawals are created here.

---

## Fighter Object Shape

```ts
interface Boons {
  hp: number;   // 0–10 points each
  pow: number;
  skl: number;
  spd: number;
  lck: number;
  def: number;
  res: number;
  // sum must equal 10
}

interface Fighter {
  name: string;
  element: 'Fire'|'Water'|'Thunder'|'Earth'|'Wind'|'Ice'|'Light'|'Dark';
  boons: Boons;
  seed: string;          // UUID, kept secret until start_match
  animSetKey?: string;   // optional: key into fight.js ANIM_SETS registry
}
```

## Battle Record Shape (from Notices)

```ts
interface Turn {
  attacker_id: 0 | 1;
  damage: number;
  hit: boolean;
  crit: boolean;
  defender_hp: number;   // percentage 0–100
}

interface BattleRecord {
  game_id: number;
  owner_id: string;        // hex address
  opponent_id: string;
  fighters: [Fighter, Fighter];
  rounds: Turn[][];        // array of rounds, each round is array of turns
  winner: { id: 0|1|-1, name: string };
}
```

---

## Running Locally

```bash
# Backend (requires Docker + Cartesi CLI)
cd am-node
DAPP_ADDRESS=0x... cartesi run

# Frontend
cd next-front
DAPP_ADDRESS=0x... npm run dev
```

Tests (no Cartesi required):
```bash
cd am-node
python3 test_battle.py
```
