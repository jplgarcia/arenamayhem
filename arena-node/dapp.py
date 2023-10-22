from os import environ
from arena import (Character, battle)
import logging
import requests
import json

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")


def hex_to_string(hex):
    return bytes.fromhex(hex[2:]).decode("utf-8")

# def character_from_dictionary(i, d):
#     d = d[i]
#     return Character(i, d["name"], d["weapon"], d["hp"], d["atk"], d["def"], d["spd"])
# 
# def decode(payload):
#     s = bytes.fromhex(payload[2:]).decode("utf-8")
#     d = json.loads(s)["characters"]
#     c0 = character_from_dictionary(0, d)
#     c1 = character_from_dictionary(1, d)
#     return c0, c1
 
def encode(d):
    return json.dumps(d).encode("utf-8").hex()

def send_notice(payload):
    notice = {"payload": encode(payload)}
    response = requests.post(rollup_server + "/notice", json=notice)
    logger.info(f"Received notice status {response.status_code} body {response.content}")

database = {}

class Battle:
    def __init__(self, champion_hash, champion_address):
        self.champion_hash = champion_hash 
        self.champion_address = champion_address
        self.champion_character = None
        self.challenger_address = None
        self.challenger_character = None
        self.finished = False

    def is_open(self):
        return self.challenger_character is None

    def can_begin(self):
        return self.is_open() and self.champion_character is None

    def valid_hash(self, sent_hash):
        return self.champion_hash == sent_hash

    def begin(self):
        self.winner = None # TODO

def get_champion_battle(champion_address, battle_id):
    if champion_address not in database:
        raise ValueError("battle does not exist -- invalid champion address")
    champion_battles = database[champion_address]
    if battle_id >= len(champion_battles):
        raise ValueError("battle does not exist -- invalid battle ID")
    return champion_battles[battle_id]

def collect_reward(player_address, payload):
    battle = get_champion_battle(payload["champion_address"], payload["battle_id"])
    if battle.winner != player_address:
        raise ValueError("only the winner can collect the reward")
    if battle.finished:
        raise ValueError("the reward has already been collected")
    "can withdraw => emmit voucher" # TODO
    "send notice with the voucher(?)" # TODO
    battle.finished = True

def handle_advance(data):
    logger.info(f"Received advance request data {data}")

    player_address = data["metadata"]["msg_sender"]
    payload = json.loads(hex_to_string(data["payload"]))

    match payload["method"]:
        case "create_battle":
            # TODO: stake stuff
            character_hash = payload["character_hash"]
            battle = Battle(character_hash, player_address)
            if player_address in database:
                database[player_address].append(battle)
            else:
                database[player_address] = [battle]
            send_notice({"id": len(database[player_address]) - 1})
        case "join_battle":
            champion_address = payload["champion_address"]
            if champion_address in database:
                champion_battles = database[champion_address]
                battle_id = payload["battle_id"]
                if battle_id < len(champion_battles["battles"]):
                    battle = champion_battles[battle_id]
                    if battle.is_open():
                        # TODO: stake stuff
                        battle.challenger_address = payload[player_address]
                        battle.challenger_character = payload["character"]
                    else:
                        "TODO" # TODO: battle already has two players
                else:
                   "TODO" # TODO: battle does not exist -- invalid battle id
            else:
               "TODO" # TODO: battle does not exist -- invalid champion address
        case "begin_battle":
            champion_address = player_address
            if champion_address in database:
                champion_battles = database[champion_address]
                battle_id = payload["battle_id"]
                if battle_id < len(champion_battles["battles"]):
                    battle = champion_battles[battle_id]
                    if battle.can_begin():
                        if battle.valid_hash("hash(payload['character'])"):
                            battle.champion_character = payload["character"]
                            battle.begin()
                        else:
                            battle.winner = battle.challenger_address
                    else:
                        "TODO" # TODO: battle already begun
                else:
                   "TODO" # TODO: battle does not exist -- invalid battle id
            else:
               "TODO" # TODO: battle does not exist -- invalid champion address
        case "collect_reward":
            collect_reward(player_address, payload)
            # TODO: do the same with other cases
    
    return "accept"

def handle_inspect(data):
    logger.info(f"Received inspect request data {data}")
    return "accept"

handlers = {
    "advance_state": handle_advance,
    "inspect_state": handle_inspect,
}

finish = {"status": "accept"}

while True:
    logger.info("Sending finish")
    response = requests.post(rollup_server + "/finish", json=finish)
    logger.info(f"Received finish status {response.status_code}")
    if response.status_code == 202:
        logger.info("No pending rollup request, trying again")
    else:
        rollup_request = response.json()
        data = rollup_request["data"]
        handler = handlers[rollup_request["request_type"]]
        finish["status"] = handler(rollup_request["data"])
