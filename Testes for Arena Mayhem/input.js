let players = [
    {
        'Name': 'TANK',
        'ATK': 20,
        'SPD': 10,
        'DEF': 40,
        'HP': 30,
        'Weapon': 'lance'
    },
    {
        'Name': 'DPS',
        'ATK': 40,
        'SPD': 30,
        'DEF': 10,
        'HP': 20,
        'Weapon': 'axe'
    }
]

// let input = [[{'striker_number': 1, 'striker': 'DPS', 'target': 'TANK', 'damage': 20, 'targetHP': 86.66666666666667}, {'striker_number': 0, 'striker': 'TANK', 'target': 'DPS', 'damage': 20, 'targetHP': 80.0}, {'striker_number': 1, 'striker': 'DPS', 'target': 'TANK', 'damage': 20, 'targetHP': 73.33333333333333}], [{'striker_number': 0, 'striker': 'TANK', 'target': 'DPS', 'damage': 22, 'targetHP': 58.0}, {'striker_number': 1, 'striker': 'DPS', 'target': 'TANK', 'damage': 23, 'targetHP': 58.0}, {'striker_number': 1, 'striker': 'DPS', 'target': 'TANK', 'damage': 23, 'targetHP': 42.666666666666664}], [{'striker_number': 1, 'striker': 'DPS', 'target': 'TANK', 'damage': 27, 'targetHP': 24.666666666666668}, {'striker_number': 0, 'striker': 'TANK', 'target': 'DPS', 'damage': 26, 'targetHP': 32.0}, {'striker_number': 1, 'striker': 'DPS', 'target': 'TANK', 'damage': 27, 'targetHP': 6.666666666666667}], [{'striker_number': 0, 'striker': 'TANK', 'target': 'DPS', 'damage': 30, 'targetHP': 2.0}, {'striker_number': 1, 'striker': 'DPS', 'target': 'TANK', 'damage': 32, 'targetHP': -14.666666666666666}]]

let input = [[{'attacker_id': 1, 'attacker_name': 'DPS', 'defender_name': 'TANK', 'damage': 20, 'defender_hp': 86.66666666666667}, {'attacker_id': 0, 'attacker_name': 'TANK', 'defender_name': 'DPS', 'damage': 20, 'defender_hp': 80.0}, {'attacker_id': 1, 'attacker_name': 'DPS', 'defender_name': 'TANK', 'damage': 20, 'defender_hp': 73.33333333333333}], [{'attacker_id': 0, 'attacker_name': 'TANK', 'defender_name': 'DPS', 'damage': 22, 'defender_hp': 58.0}, {'attacker_id': 1, 'attacker_name': 'DPS', 'defender_name': 'TANK', 'damage': 22, 'defender_hp': 58.666666666666664}, {'attacker_id': 1, 'attacker_name': 'DPS', 'defender_name': 'TANK', 'damage': 22, 'defender_hp': 44.0}], [{'attacker_id': 1, 'attacker_name': 'DPS', 'defender_name': 'TANK', 'damage': 25, 'defender_hp': 27.333333333333332}, {'attacker_id': 0, 'attacker_name': 'TANK', 'defender_name': 'DPS', 'damage': 24, 'defender_hp': 34.0}, {'attacker_id': 1, 'attacker_name': 'DPS', 'defender_name': 'TANK', 'damage': 25, 'defender_hp': 10.666666666666666}], [{'attacker_id': 0, 'attacker_name': 'TANK', 'defender_name': 'DPS', 'damage': 28, 'defender_hp': 6.0}, {'attacker_id': 1, 'attacker_name': 'DPS', 'defender_name': 'TANK', 'damage': 29, 'defender_hp': -8.666666666666666}]]