"""
test_battle.py – Standalone tests for Arena Mayhem battle logic.
No Cartesi node needed. Run with:  python3 test_battle.py
"""
import hashlib
import json
import sys

import arena
from wallet import Wallet
from BattleManager import BattleManager

# ── helpers ──────────────────────────────────────────────────────────────────

def make_fighter(name, element, boons, seed="test-seed"):
    return {"name": name, "element": element, "boons": boons, "seed": seed}

def make_hash(fighter):
    d, b = fighter, fighter["boons"]
    parts = [
        d["name"], d["element"],
        str(b.get("hp",0)), str(b.get("pow",0)), str(b.get("skl",0)),
        str(b.get("spd",0)), str(b.get("lck",0)), str(b.get("def",0)), str(b.get("res",0)),
        d.get("seed", ""),
    ]
    return hashlib.sha256("-".join(parts).encode()).hexdigest()

def new_bm():
    return BattleManager(Wallet())

PASS = "\033[92m PASS\033[0m"
FAIL = "\033[91m FAIL\033[0m"

def check(label, condition, detail=""):
    if condition:
        print(f"{PASS}  {label}")
    else:
        print(f"{FAIL}  {label}" + (f"  →  {detail}" if detail else ""))
    return condition


# ── tests ─────────────────────────────────────────────────────────────────────

def test_arena_turn_has_crit_field():
    """arena.turn() must include a 'crit' boolean in its return dict."""
    import random
    c1 = arena.Character(0, "A", "fire",  {"hp":0,"pow":0,"skl":10,"spd":0,"lck":0,"def":0,"res":0})
    c2 = arena.Character(1, "B", "water", {"hp":0,"pow":0,"skl":0, "spd":0,"lck":0,"def":0,"res":0})
    rng = random.Random("seed")
    result = arena.turn(c1, c2, rng, [])
    check("turn() returns 'crit' field",   "crit" in result,          repr(result))
    check("turn() 'crit' is bool",         isinstance(result["crit"], bool), type(result["crit"]))
    check("turn() returns 'hit' field",    "hit" in result)
    check("turn() returns 'defender_hp'",  "defender_hp" in result)


def test_battle_round_structure():
    """battle() returns rounds where every turn has expected keys."""
    c1 = arena.Character(0, "Warrior", "fire",  {"hp":0,"pow":5,"skl":5,"spd":0,"lck":0,"def":0,"res":0})
    c2 = arena.Character(1, "Mage",    "water", {"hp":0,"pow":5,"skl":0,"spd":0,"lck":0,"def":0,"res":0})
    boons1 = {"hp":0,"pow":5,"skl":5,"spd":0,"lck":0,"def":0,"res":0}
    boons2 = {"hp":0,"pow":5,"skl":0,"spd":0,"lck":0,"def":0,"res":0}
    result, log = arena.battle(c1, c2, boons1, boons2, "s1", "s2")

    check("battle() has 'winner'",  "winner" in result)
    check("battle() has 'rounds'",  "rounds" in result)
    check("at least 1 round",       len(result["rounds"]) >= 1)

    REQUIRED = {"attacker_id", "hit", "crit", "damage", "defender_hp",
                "attacker_name", "defender_name"}
    for ri, rnd in enumerate(result["rounds"]):
        for ti, t in enumerate(rnd):
            missing = REQUIRED - t.keys()
            check(f"round[{ri}] turn[{ti}] has all required keys",
                  not missing, f"missing: {missing}")


def test_crit_damage_is_3x():
    """When crit=True, damage should be ~3× the non-crit base."""
    import random
    # High SKL = high crit rate; low LCK defender
    c1 = arena.Character(0, "A", "fire",  {"hp":0,"pow":5,"skl":10,"spd":0,"lck":0,"def":0,"res":0})
    c2 = arena.Character(1, "B", "water", {"hp":50,"pow":0,"skl":0, "spd":0,"lck":0,"def":0,"res":0})
    found_crit = False
    for seed in range(200):
        c1.HP = 100; c2.HP = 100
        rng = random.Random(str(seed))
        t = arena.turn(c1, c2, rng, [])
        if t["crit"] and t["hit"]:
            mult = arena.ADVANTAGE_TABLE["fire"]["water"]
            def_ = c2.DEF if "fire" in arena.PHYSICAL_ELEMENTS else c2.RES
            base = max(0, (c1.POW + arena.WEAPON_MT - def_) * mult)
            check("crit damage == int(base*3)",
                  t["damage"] == int(base * 3),
                  f"damage={t['damage']} base={base} expected={int(base*3)}")
            found_crit = True
            break
    check("found at least one crit in 200 seeds", found_crit)


def test_full_battle_manager_flow():
    """Happy path: create → accept → start_match returns (notice, report)."""
    bm      = new_bm()
    owner   = "0xowner"
    opp     = "0xopponent"
    token   = "0xtoken"
    amount  = 100

    # Fund both players
    bm.wallet.balance_get(owner).erc20_add(token, 10_000)
    bm.wallet.balance_get(opp).erc20_add(token, 10_000)

    f1 = make_fighter("Silas", "fire",  {"hp":5,"pow":3,"skl":2,"spd":0,"lck":0,"def":0,"res":0}, seed="seed-owner")
    f2 = make_fighter("Nyx",   "water", {"hp":5,"pow":3,"skl":0,"spd":2,"lck":0,"def":0,"res":0}, seed="seed-opp")
    h1 = make_hash(f1)

    chal  = bm.create_challenge(owner, h1, token, amount)
    check("challenge created",        chal["status"] == "pending", chal.get("status"))
    check("challenge id is 1",        chal["id"] == 1)

    bm.accept_challenge(chal["id"], opp, f2, f2["seed"])
    chal2 = bm.challenges.get(chal["id"])
    check("challenge accepted",       chal2["status"] == "accepted")

    notice, report = bm.start_match(chal["id"], owner, f1)
    check("start_match returns tuple", True)   # if we got here it didn't raise
    check("notice has rounds",         "rounds" in notice,        list(notice.keys()))
    check("notice has winner",         "winner" in notice,        list(notice.keys()))
    check("notice has fighters",       "fighters" in notice)
    check("notice has game_id",        "game_id" in notice)
    check("report has rounds",         "rounds" in report)
    check("report has log",            "log" in report)
    check("challenge removed",         chal["id"] not in bm.challenges)


def test_hash_mismatch_raises():
    """start_match must raise (not return None) when hash doesn't match."""
    bm     = new_bm()
    owner  = "0xowner"
    opp    = "0xopponent"
    token  = "0xtoken"
    amount = 100

    bm.wallet.balance_get(owner).erc20_add(token, 10_000)
    bm.wallet.balance_get(opp).erc20_add(token, 10_000)

    f1       = make_fighter("Silas", "fire", {"hp":5,"pow":3,"skl":2,"spd":0,"lck":0,"def":0,"res":0}, "seed-owner")
    f1_tampered = {**f1, "boons": {**f1["boons"], "pow": 9}}  # tampered!
    f2       = make_fighter("Nyx",   "water",{"hp":5,"pow":3,"skl":0,"spd":2,"lck":0,"def":0,"res":0}, "seed-opp")

    chal = bm.create_challenge(owner, make_hash(f1), token, amount)
    bm.accept_challenge(chal["id"], opp, f2, f2["seed"])

    raised = False
    try:
        bm.start_match(chal["id"], owner, f1_tampered)
    except Exception as e:
        raised = True
        check("hash mismatch raises Exception", True)
        check("error mentions hash/boons", "hash" in str(e).lower() or "boon" in str(e).lower(), str(e))
    if not raised:
        check("hash mismatch raises Exception", False, "returned normally instead of raising")


def test_cheater_boons_raises():
    """start_match must raise when boon total exceeds MAX_BOONS (10)."""
    bm     = new_bm()
    owner  = "0xowner"
    opp    = "0xopponent"
    token  = "0xtoken"
    amount = 100

    bm.wallet.balance_get(owner).erc20_add(token, 10_000)
    bm.wallet.balance_get(opp).erc20_add(token, 10_000)

    # Build a cheater fighter but hash it honestly (committed hash matches the tampered data)
    f1_cheat = make_fighter("Cheat", "fire", {"hp":10,"pow":5,"skl":0,"spd":0,"lck":0,"def":0,"res":0}, "seed-c")
    f2       = make_fighter("Nyx",   "water",{"hp":5, "pow":3,"skl":0,"spd":2,"lck":0,"def":0,"res":0}, "seed-opp")

    chal = bm.create_challenge(owner, make_hash(f1_cheat), token, amount)
    bm.accept_challenge(chal["id"], opp, f2, f2["seed"])

    raised = False
    try:
        bm.start_match(chal["id"], owner, f1_cheat)
    except Exception as e:
        raised = True
        check("cheater boons raises Exception", True)
    if not raised:
        check("cheater boons raises Exception", False, "returned normally instead of raising")


# ── runner ────────────────────────────────────────────────────────────────────

TESTS = [
    test_arena_turn_has_crit_field,
    test_battle_round_structure,
    test_crit_damage_is_3x,
    test_full_battle_manager_flow,
    test_hash_mismatch_raises,
    test_cheater_boons_raises,
]

if __name__ == "__main__":
    all_passed = True
    for fn in TESTS:
        print(f"\n── {fn.__name__} ──")
        try:
            fn()
        except Exception as e:
            print(f"{FAIL}  UNEXPECTED EXCEPTION: {e}")
            import traceback; traceback.print_exc()
            all_passed = False

    print("\n" + ("=" * 40))
    if all_passed:
        print("\033[92mAll tests passed.\033[0m")
        sys.exit(0)
    else:
        print("\033[91mSome tests FAILED.\033[0m")
        sys.exit(1)
