import math

def calculate_damage(attacker, defender):
    # Determine weapon triangle advantage
    advantage_multiplier = 1.0
    if ((attacker.weapon == 'sword' and defender.weapon == 'axe')
     or (attacker.weapon == 'axe'   and defender.weapon == 'lance')
     or (attacker.weapon == 'lance' and defender.weapon == 'sword')):
        advantage_multiplier = 1.2

    damage = int(attacker.ATK * advantage_multiplier - defender.DEF)
    damage = max(damage, 0)  # Ensure non-negative damage
    return damage

class Character:
    def __init__(self, identifier, name, weapon, HP, ATK, DEF, SPD):
        self.identifier = identifier
        self.name = name 
        self.weapon = weapon 
        self.HP = HP
        self.ATK = ATK
        self.DEF = DEF
        self.SPD = SPD 

        self.total_hp = HP

    def is_cheater(self):
        threshold_all = 100
        threshold_single = 40
        sum_stats = self.HP + self.ATK + self.SPD + self.DEF
        return (sum_stats > threshold_all
            or self.HP > threshold_single
            or self.ATK > threshold_single
            or self.DEF > threshold_single
            or self.SPD > threshold_single
            or self.HP < 1
            or self.ATK < 1
            or self.DEF < 1
            or self.SPD < 1)

    def is_faster_than(self, character):
        return self.SPD > character.SPD + 5

    def is_alive(self):
        return self.HP > 0

def turn(attacker, defender, log):
    damage = calculate_damage(attacker, defender)
    defender.HP -= damage

    log.append(f"{attacker.name} attacks {defender.name} with {attacker.weapon} for {damage} damage.")
    log.append(f"{defender.name}'s HP: {defender.HP} - {defender.HP*100/defender.total_hp}")

    return {
        "attacker_id"   : attacker.identifier,
        "attacker_name" : attacker.name,
        "defender_name" : defender.name,
        "damage"        : damage,
        "defender_hp"   : defender.HP * 100 / defender.total_hp
    }
    
def battle(char1, char2):
    if (char1.is_cheater() or char2.is_cheater()):
        return {"winner": -1, "rounds": []}

    log = []
    rounds = []
    current_round = 1

    char1.HP       *=  5; char2.HP       *=  5
    char1.total_hp *=  5; char2.total_hp *=  5
    char1.ATK      += 10; char2.ATK      += 10

    # the attack order for the first round is based on SPD
    attacker, defender = char1, char2
    if char2.SPD > char1.SPD:
        attacker, defender = defender, attacker

    while True:
        log.append(f"Round {current_round}:")
        turns = []
        rounds.append(turns)

        # first strike
        turns.append(turn(attacker, defender, log))
        if not defender.is_alive():
            break

        # counter strike
        turns.append(turn(defender, attacker, log))
        if not attacker.is_alive():
            break

        # extra strike
        faster, slower = None, None
        if attacker.is_faster_than(defender):
            faster, slower = attacker, defender
        elif defender.is_faster_than(attacker):
            faster, slower = defender, attacker

        if faster is not None and slower is not None:
            log.append(f"{faster.name} strikes again.")
            turns.append(turn(faster, slower, log))
            if not slower.is_alive():
                break

        # boosts ATK for the next round
        boost = 2 * math.sqrt(current_round)
        char1.ATK += boost
        char2.ATK += boost

        attacker, defender = defender, attacker
        current_round += 1
        

    # Determine the winner
    winner = char1 if char2.HP <= 0 else char2
    log.append(f"{winner.name} wins!")
    result = {
        "rounds": rounds,
        "winner": {
            "id"   : winner.identifier,
            "name" : winner.name,
        }
    }

    return result, log

# c1 = Character(0, "TANK", "lance", 30, 20, 40, 10)
# c2 = Character(1, "DPS",  "axe",   20, 40, 10, 30)
# result, log = battle(c1, c2)
# print(result)
# for entry in log:
#     print(entry)
