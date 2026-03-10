import random

# ── Element effectiveness ──────────────────────────────────────────────────────
# Rows = attacker, Cols = defender  →  1.25 advantage / 0.75 resist / 1.00 neutral
# Cycle: Fire>Ice>Wind>Earth>Thunder>Water>Fire  |  Light<>Dark
ELEMENTS = ['fire', 'water', 'thunder', 'earth', 'wind', 'ice', 'light', 'dark']

ADVANTAGE_TABLE = {
    'fire':    {'fire':1.00,'water':0.75,'thunder':1.00,'earth':1.00,'wind':1.00,'ice':1.25,'light':1.00,'dark':1.00},
    'water':   {'fire':1.25,'water':1.00,'thunder':0.75,'earth':1.00,'wind':1.00,'ice':1.00,'light':1.00,'dark':1.00},
    'thunder': {'fire':1.00,'water':1.25,'thunder':1.00,'earth':0.75,'wind':1.00,'ice':1.00,'light':1.00,'dark':1.00},
    'earth':   {'fire':1.00,'water':1.00,'thunder':1.25,'earth':1.00,'wind':0.75,'ice':1.00,'light':1.00,'dark':1.00},
    'wind':    {'fire':1.00,'water':1.00,'thunder':1.00,'earth':1.25,'wind':1.00,'ice':0.75,'light':1.00,'dark':1.00},
    'ice':     {'fire':0.75,'water':1.00,'thunder':1.00,'earth':1.00,'wind':1.25,'ice':1.00,'light':1.00,'dark':1.00},
    'light':   {'fire':1.00,'water':1.00,'thunder':1.00,'earth':1.00,'wind':1.00,'ice':1.00,'light':1.00,'dark':1.25},
    'dark':    {'fire':1.00,'water':1.00,'thunder':1.00,'earth':1.00,'wind':1.00,'ice':1.00,'light':1.25,'dark':1.00},
}

# Physical elements reduce with DEF; Special with RES
PHYSICAL_ELEMENTS = {'earth', 'wind', 'ice', 'dark'}
SPECIAL_ELEMENTS  = {'fire', 'water', 'thunder', 'light'}

# ── Fixed weapon stats (feature-flagged for later) ────────────────────────────
WEAPON_HIT  = 60
WEAPON_MT   = 5
WEAPON_CRIT = 5

# ── Boon system ───────────────────────────────────────────────────────────────
BASE_STATS = {'hp': 75, 'pow': 15, 'skl': 15, 'spd': 15, 'lck': 15, 'def': 15, 'res': 15}
BOON_BONUS = {'hp':  7, 'pow':  2, 'skl':  4, 'spd':  1, 'lck':  5, 'def':  3, 'res':  3}
MAX_BOONS  = 10

def boons_to_stats(boons: dict) -> dict:
    return {stat: BASE_STATS[stat] + BOON_BONUS[stat] * int(boons.get(stat, 0))
            for stat in BASE_STATS}

# ── Character ─────────────────────────────────────────────────────────────────
class Character:
    def __init__(self, identifier, name, element, boons):
        self.identifier = identifier
        self.name    = name
        self.element = element.lower()
        stats        = boons_to_stats(boons)
        self.HP      = stats['hp']
        self.POW     = stats['pow']
        self.SKL     = stats['skl']
        self.SPD     = stats['spd']
        self.LCK     = stats['lck']
        self.DEF     = stats['def']
        self.RES     = stats['res']
        self.total_hp = self.HP

    def is_cheater(self, boons):
        if self.element not in ELEMENTS:
            return True
        if any(int(v) < 0 for v in boons.values()):
            return True
        if sum(int(v) for v in boons.values()) > MAX_BOONS:
            return True
        return False

    def defense_vs(self, attacker_element):
        return self.DEF if attacker_element in PHYSICAL_ELEMENTS else self.RES

    def is_alive(self):
        return self.HP > 0

# ── Combat helpers ────────────────────────────────────────────────────────────
def get_multiplier(atk_elem, def_elem):
    return ADVANTAGE_TABLE.get(atk_elem, {}).get(def_elem, 1.0)

def does_hit(attacker, defender, mult, rng: random.Random):
    """RNG-based hit check seeded from combined player seeds."""
    hit_rate  = (attacker.SKL * 2) + (attacker.LCK // 2) + WEAPON_HIT
    hit_rate += 15 if mult == 1.25 else (-15 if mult == 0.75 else 0)
    avoid     = (defender.SPD * 2) + defender.LCK
    chance    = max(0, min(100, hit_rate - avoid))
    return rng.randint(0, 99) < chance

def is_crit(attacker, defender, rng: random.Random):
    """RNG-based crit check."""
    crit_chance = max(0, (attacker.SKL // 2) + WEAPON_CRIT - defender.LCK)
    return rng.randint(0, 99) < crit_chance

def calculate_damage(attacker, defender, rng: random.Random):
    mult    = get_multiplier(attacker.element, defender.element)
    defense = defender.defense_vs(attacker.element)
    dmg     = (attacker.POW + WEAPON_MT - defense) * mult
    dmg     = max(dmg, 0)
    if is_crit(attacker, defender, rng):
        dmg *= 3
    return int(dmg)

def turn(attacker, defender, rng: random.Random, log):
    mult    = get_multiplier(attacker.element, defender.element)
    hit     = does_hit(attacker, defender, mult, rng)
    damage  = calculate_damage(attacker, defender, rng) if hit else 0
    defender.HP -= damage

    verb = "hits" if hit else "misses"
    log.append(f"{attacker.name} ({attacker.element}) {verb} {defender.name} for {damage} dmg.")
    log.append(f"{defender.name} HP: {max(defender.HP,0)}/{defender.total_hp}")

    return {
        "attacker_id":   attacker.identifier,
        "attacker_name": attacker.name,
        "defender_name": defender.name,
        "damage":        damage,
        "hit":           hit,
        "defender_hp":   max(defender.HP, 0) * 100 / defender.total_hp,
    }

# ── Battle ────────────────────────────────────────────────────────────────────
def battle(char1, char2, boons1, boons2, seed1: str = '', seed2: str = ''):
    """Run a battle. combined_seed = seed1 + seed2 is used to seed the RNG."""
    rng = random.Random(seed1 + seed2)

    if char1.is_cheater(boons1) or char2.is_cheater(boons2):
        return {"winner": {"id": -1, "name": "draw"}, "rounds": []}, []

    log    = []
    rounds = []
    current_round = 1

    # Faster unit attacks first
    attacker, defender = (char1, char2) if char1.SPD >= char2.SPD else (char2, char1)

    while True:
        log.append(f"--- Round {current_round} ---")
        turns = []
        rounds.append(turns)

        # First strike
        turns.append(turn(attacker, defender, rng, log))
        if not defender.is_alive():
            break

        # Counter
        turns.append(turn(defender, attacker, rng, log))
        if not attacker.is_alive():
            break

        # Double attack (SPD >= opponent + 4)
        if attacker.SPD >= defender.SPD + 4:
            log.append(f"{attacker.name} strikes again! (double)")
            turns.append(turn(attacker, defender, rng, log))
            if not defender.is_alive():
                break
        elif defender.SPD >= attacker.SPD + 4:
            log.append(f"{defender.name} strikes again! (double)")
            turns.append(turn(defender, attacker, rng, log))
            if not attacker.is_alive():
                break

        attacker, defender = defender, attacker
        current_round += 1
        if current_round > 30:   # safety cap
            break

    if char1.HP <= 0 and char2.HP <= 0:
        winner_data = {"id": -1, "name": "draw"}
    elif char2.HP <= 0:
        winner_data = {"id": char1.identifier, "name": char1.name}
        log.append(f"{char1.name} wins!")
    elif char1.HP <= 0:
        winner_data = {"id": char2.identifier, "name": char2.name}
        log.append(f"{char2.name} wins!")
    else:
        winner_data = {"id": -1, "name": "draw"}

    return {"rounds": rounds, "winner": winner_data}, log
