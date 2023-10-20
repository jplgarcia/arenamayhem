import math

def calculate_damage(attacker, defender):
    # Determine weapon triangle advantage
    advantage_multiplier = 1.0
    if attacker['Weapon'] == 'sword' and defender['Weapon'] == 'axe':
        advantage_multiplier = 1.2
    elif attacker['Weapon'] == 'axe' and defender['Weapon'] == 'lance':
        advantage_multiplier = 1.2
    elif attacker['Weapon'] == 'lance' and defender['Weapon'] == 'sword':
        advantage_multiplier = 1.2

    damage = int(attacker['ATK'] * advantage_multiplier - defender['DEF'])
    damage = max(damage, 0)  # Ensure non-negative damage
    return damage

def stats_cheater_check(character):
    if (character['HP'] + character['ATK'] + character['SPD'] + character['DEF'] > 100 ):
        return -1
    if (character['HP'] > 40 ):
        return -1
    if (character['ATK'] > 40 ):
        return -1
    if (character['SPD'] > 40 ):
        return -1
    if (character['DEF'] > 40 ):
        return -1
    
    return 1
    


def battle(player1, player2):

    if (stats_cheater_check(player1) == -1 or stats_cheater_check(player2) == -1):
        print("CHEATER")
        return

    log = []
    rounds = []
    round_count = 1

    player1['Number'] = 0
    player2['Number'] = 1

    player1['HP'] = player1['HP'] * 5
    player2['HP'] = player2['HP'] * 5

    player1['TOTALHP'] = player1['HP']
    player2['TOTALHP'] = player2['HP']

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
            "striker_number": attacker['Number'],
            "striker" : attacker['Name'],
            "target": defender['Name'],
            "damage": damage,
            "targetHP": defender['HP'] * 100 / defender['TOTALHP']
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
            "striker_number": defender['Number'],
            "striker" : defender['Name'],
            "target": attacker['Name'],
            "damage": damage,
            "targetHP": attacker['HP'] * 100 / attacker['TOTALHP']
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
                "striker_number": attacker['Number'],
                "striker" : attacker['Name'],
                "target": defender['Name'],
                "damage": damage,
                "targetHP": defender['HP'] * 100 / defender['TOTALHP']
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
                "striker_number": defender['Number'],
                "striker" : defender['Name'],
                "target": attacker['Name'],
                "damage": damage,
                "targetHP": attacker['HP'] * 100 / attacker['TOTALHP']
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
    'Weapon': 'sword'
}

player2 = {
    'Name': 'BRUISER',
    'ATK': 30,
    'SPD': 20,
    'DEF': 25,
    'HP': 25,
    'Weapon': 'lance'
}

# # Example usage: tank x dps
player1 = {
    'Name': 'TANK',
    'ATK': 20,
    'SPD': 10,
    'DEF': 40,
    'HP': 30,
    'Weapon': 'lance'
}

player2 = {
    'Name': 'DPS',
    'ATK': 40,
    'SPD': 30,
    'DEF': 10,
    'HP': 20,
    'Weapon': 'axe'
}

# Example usage: bruiser x dps
# player1 = {
#     'Name': 'Bruiser',
#     'ATK': 30,
#     'SPD': 20,
#     'DEF': 25,
#     'HP': 25,
#     'Weapon': 'sword'
# }

# player2 = {
#     'Name': 'DPS',
#     'ATK': 40,
#     'SPD': 30,
#     'DEF': 10,
#     'HP': 20,
#     'Weapon': 'sword'
# }

# Example usage: tank x tank
# player1 = {
#     'Name': 'Player 1',
#     'ATK': 00,
#     'SPD': 20,
#     'DEF': 40,
#     'HP': 40,
#     'Weapon': 'sword'
# }

# player2 = {
#     'Name': 'Player 2',
#     'ATK': 0,
#     'SPD': 20,
#     'DEF': 40,
#     'HP': 40,
#     'Weapon': 'sword'
# }

battle(player1, player2)
