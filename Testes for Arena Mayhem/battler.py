import random
import math

def calculate_damage(attacker, defender):
    # Determine weapon triangle advantage
    advantage_multiplier = 1.0
    if attacker['Weapon'] == 'Sword' and defender['Weapon'] == 'Axe':
        advantage_multiplier = 1.2
    elif attacker['Weapon'] == 'Axe' and defender['Weapon'] == 'Lance':
        advantage_multiplier = 1.2
    elif attacker['Weapon'] == 'Lance' and defender['Weapon'] == 'Sword':
        advantage_multiplier = 1.2

    damage = int(attacker['ATK'] * advantage_multiplier - defender['DEF'])
    damage = max(damage, 0)  # Ensure non-negative damage
    return damage

def battle(player1, player2):
    log = []
    rounds = []
    round_count = 1

    player1['HP'] = player1['HP'] * 5
    player2['HP'] = player2['HP'] * 5

    player1['ATK'] = player1['ATK'] + 10
    player2['ATK'] = player2['ATK'] + 10

    # Determine attack order based on SPD
    if player1['SPD'] > player2['SPD']:
        attacker, defender = player1, player2
    elif player2['SPD'] > player1['SPD']:
        attacker, defender = player2, player1
    else:
        attacker, defender = player1, player2
        
    while player1['HP'] > 0 and player2['HP'] > 0:
        log.append(f"Round {round_count}:")
        round_count += 1
        round = []
        rounds.append(round)

        # Calculate damage for the first attack
        damage = calculate_damage(attacker, defender)
        defender['HP'] -= damage

        log.append(f"{attacker['Name']} attacks {defender['Name']} with {attacker['Weapon']} for {damage} damage.")
        log.append(f"{defender['Name']}'s HP: {defender['HP']}")
        round.append({
            "striker" : attacker['Name'],
            "target": defender['Name'],
            "damage": damage,
            "targetHP": defender['HP']
        })

        # Check if the defender is knocked out
        if defender['HP'] <= 0:
            break

        # Calculate damage for the counter attack
        damage = calculate_damage(defender, attacker)
        attacker['HP'] -= damage
        log.append(f"{defender['Name']} Counter strikes {attacker['Name']} with {defender['Weapon']} for {damage} damage.")
        log.append(f"{attacker['Name']}'s HP: {attacker['HP']}")
        round.append({
            "striker" : defender['Name'],
            "target": attacker['Name'],
            "damage": damage,
            "targetHP": attacker['HP']
        })

        # Check if the defender is knocked out
        if attacker['HP'] <= 0:
            break

        # Check if the attacker can strike again
        if attacker['SPD'] >= defender['SPD'] + 5:
            damage = calculate_damage(attacker, defender)
            defender['HP'] -= damage

            log.append(f"{attacker['Name']} strikes again for {damage} damage.")
            log.append(f"{defender['Name']}'s HP: {defender['HP']}")
            round.append({
                "striker" : attacker['Name'],
                "target": defender['Name'],
                "damage": damage,
                "targetHP": defender['HP']
            })
            # Check if the defender is knocked out
            if defender['HP'] <= 0:
                break

        # Check if the defender can strike again
        if defender['SPD'] >= attacker['SPD'] + 5:
            damage = calculate_damage(defender, attacker)
            attacker['HP'] -= damage

            log.append(f"{defender['Name']} strikes again for {damage} damage.")
            log.append(f"{attacker['Name']}'s HP: {attacker['HP']}")
            round.append({
                "striker" : defender['Name'],
                "target": attacker['Name'],
                "damage": damage,
                "targetHP": attacker['HP']
            })
            # Check if the defender is knocked out
            if attacker['HP'] <= 0:
                break

        # Boost ATK for the next round
        player1['ATK'] = player1['ATK'] + (2* math.sqrt(round_count))
        player2['ATK'] = player2['ATK'] + (2* math.sqrt(round_count))

        temp = attacker
        attacker = defender
        defender = temp


    # Determine the winner
    if player1['HP'] <= 0:
        log.append(f"{player2['Name']} wins!")
    else:
        log.append(f"{player1['Name']} wins!")

    # Print the battle log
    for entry in log:
        print(entry)

    print (rounds)

# Example usage: tank x bruiser
player1 = {
    'Name': 'TANK',
    'ATK': 20,
    'SPD': 10,
    'DEF': 40,
    'HP': 30,
    'Weapon': 'Sword'
}

player2 = {
    'Name': 'BRUISER',
    'ATK': 30,
    'SPD': 20,
    'DEF': 25,
    'HP': 25,
    'Weapon': 'Sword'
}

# # Example usage: tank x dps
# player1 = {
#     'Name': 'TANK',
#     'ATK': 20,
#     'SPD': 10,
#     'DEF': 40,
#     'HP': 30,
#     'Weapon': 'Sword'
# }

# player2 = {
#     'Name': 'DPS',
#     'ATK': 40,
#     'SPD': 30,
#     'DEF': 10,
#     'HP': 20,
#     'Weapon': 'Sword'
# }

# Example usage: bruiser x dps
# player1 = {
#     'Name': 'Bruiser',
#     'ATK': 30,
#     'SPD': 20,
#     'DEF': 25,
#     'HP': 25,
#     'Weapon': 'Sword'
# }

# player2 = {
#     'Name': 'DPS',
#     'ATK': 40,
#     'SPD': 30,
#     'DEF': 10,
#     'HP': 20,
#     'Weapon': 'Sword'
# }

# Example usage: tank x tank
# player1 = {
#     'Name': 'Player 1',
#     'ATK': 10,
#     'SPD': 10,
#     'DEF': 40,
#     'HP': 40,
#     'Weapon': 'Sword'
# }

# player2 = {
#     'Name': 'Player 2',
#     'ATK': 10,
#     'SPD': 10,
#     'DEF': 40,
#     'HP': 40,
#     'Weapon': 'Sword'
# }

battle(player1, player2)
