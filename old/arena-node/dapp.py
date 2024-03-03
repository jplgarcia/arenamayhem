from os import environ
from arena import (Character, battle)
import logging
import requests
import json

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")

def character_from_dictionary(i, d):
    d = d[i]
    return Character(i, d["name"], d["weapon"], d["hp"], d["atk"], d["def"], d["spd"])

def decode(payload):
    s = bytes.fromhex(payload[2:]).decode("utf-8")
    d = json.loads(s)["characters"]
    c0 = character_from_dictionary(0, d)
    c1 = character_from_dictionary(1, d)
    return c0, c1

def encode(d):
    return json.dumps(d).encode("utf-8").hex()

def handle_advance(data):
    logger.info(f"Received advance request data {data}")

    c0, c1 = decode(data["payload"])
    logger.info(f"These are the characters: {c0} and {c1}")

    result, _ = battle(c0, c1)
    logger.info(f"The winner is: {result['winner']}")

    notice = {"payload": encode(result)}
    response = requests.post(rollup_server + "/notice", json=notice)
    logger.info(f"Received notice status {response.status_code} body {response.content}")

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
