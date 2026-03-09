from os import environ
from urllib.parse import urlparse
import requests
import logging
import json

from wallet import Wallet, hex_to_str, str_to_hex
from BattleManager import BattleManager

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = "http://localhost:8080/rollup"
if "ROLLUP_HTTP_SERVER_URL" in environ:
    rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")

# Cartesi Rollups v2 portal addresses (same on every chain)
ether_portal_address  = "0xA632c5c05812c6a6149B7af5C56117d1D2603828"
erc20_portal_address  = "0xACA6586A0Cf05bD831f2501E7B4aea550dA6562D"
erc721_portal_address = "0x9E8851dadb2b77103928518846c4678d48b5e371"

wallet = Wallet()
battle_manager = BattleManager(wallet)

def encode(d):
    return "0x" + json.dumps(d).encode("utf-8").hex()

def decode_json(b):
    s = bytes.fromhex(b[2:]).decode("utf-8")
    d = json.loads(s)
    return d

def handle_advance(data):
    logger.info(f"Received advance request data {data}")
    msg_sender = data["metadata"]["msg_sender"]
    payload    = data["payload"]

    # ------------------------------------------------------------------ #
    # Portal deposits                                                       #
    # ------------------------------------------------------------------ #
    try:
        if msg_sender.lower() == erc20_portal_address.lower():
            notice_payload = wallet.erc20_deposit_process(payload)
            response = requests.post(rollup_server + "/notice", json={"payload": notice_payload})
            logger.info(f"ERC20 deposit notice status {response.status_code}")
            return "accept"

        if msg_sender.lower() == ether_portal_address.lower():
            notice_payload = wallet.ether_deposit_process(payload)
            response = requests.post(rollup_server + "/notice", json={"payload": notice_payload})
            logger.info(f"Ether deposit notice status {response.status_code}")
            return "accept"

        if msg_sender.lower() == erc721_portal_address.lower():
            notice_payload = wallet.erc721_deposit_process(payload)
            response = requests.post(rollup_server + "/notice", json={"payload": notice_payload})
            logger.info(f"ERC721 deposit notice status {response.status_code}")
            return "accept"

    except Exception as error:
        error_msg = f"Failed to process deposit '{payload}'. {error}"
        requests.post(rollup_server + "/report", json={"payload": encode(error_msg)})
        logger.debug(error_msg, exc_info=True)
        return "reject"

    # ------------------------------------------------------------------ #
    # Application methods                                                  #
    # ------------------------------------------------------------------ #
    try:
        req_json = decode_json(payload)
        logger.info(f"Decoded request: {req_json}")

        method = req_json.get("method")

        if method == "ether_transfer" and msg_sender.lower() == req_json["from"].lower():
            amount = int(req_json["amount"])
            notice_payload = wallet.ether_transfer(
                req_json["from"].lower(),
                req_json["to"].lower(),
                amount,
            )
            response = requests.post(rollup_server + "/notice", json={"payload": notice_payload})

        elif method == "ether_withdraw" and msg_sender.lower() == req_json["from"].lower():
            amount = int(req_json["amount"])
            destination, voucher_payload = wallet.ether_withdraw(
                req_json["from"].lower(),
                amount,
            )
            response = requests.post(
                rollup_server + "/voucher",
                json={"payload": voucher_payload, "destination": destination},
            )

        elif method == "erc20_transfer" and msg_sender.lower() == req_json["from"].lower():
            amount = int(req_json["amount"])
            notice_payload = wallet.erc20_transfer(
                req_json["from"].lower(),
                req_json["to"].lower(),
                req_json["erc20"].lower(),
                amount,
            )
            response = requests.post(rollup_server + "/notice", json={"payload": notice_payload})

        elif method == "erc20_withdraw" and msg_sender.lower() == req_json["from"].lower():
            amount = int(req_json["amount"])
            destination, voucher_payload = wallet.erc20_withdraw(
                req_json["from"].lower(),
                req_json["erc20"].lower(),
                amount,
            )
            response = requests.post(
                rollup_server + "/voucher",
                json={"payload": voucher_payload, "destination": destination},
            )

        elif method == "create_challenge":
            amount = int(req_json["amount"])
            result = battle_manager.create_challenge(
                msg_sender.lower(),
                req_json["fighter_hash"],
                req_json["token"].lower(),
                amount,
            )
            response = requests.post(
                rollup_server + "/notice",
                json={"payload": str_to_hex(json.dumps(result))},
            )

        elif method == "accept_challenge":
            result = battle_manager.accept_challenge(
                req_json["challenge_id"],
                msg_sender.lower(),
                req_json["fighter"],
            )
            response = requests.post(
                rollup_server + "/notice",
                json={"payload": str_to_hex(json.dumps(result))},
            )

        elif method == "start_match":
            notice_data, report_data = battle_manager.start_match(
                req_json["challenge_id"],
                msg_sender.lower(),
                req_json["fighter"],
            )
            requests.post(rollup_server + "/report",  json={"payload": str_to_hex(json.dumps(report_data))})
            requests.post(rollup_server + "/notice", json={"payload": str_to_hex(json.dumps(notice_data))})

        else:
            logger.warning(f"Unknown method: {method}")

        return "accept"

    except Exception as error:
        error_msg = f"Failed to process command '{payload}'. {error}"
        requests.post(rollup_server + "/report", json={"payload": encode(error_msg)})
        logger.debug(error_msg, exc_info=True)
        return "reject"
            

def handle_inspect(data):
    logger.info(f"Received inspect request data {data}")
    try:
        url = urlparse(hex_to_str(data["payload"]))

        if url.path.startswith("balance/"):
            info = url.path.replace("balance/", "").split("/")
            token_type, account = info[0].lower(), info[1].lower()
            token_address, token_id, amount = "", 0, 0

            if token_type == "erc20":
                token_address = info[2]
                amount = wallet.balance_get(account).erc20_get(token_address.lower())
            elif token_type == "ether":
                amount = wallet.balance_get(account).ether_get()
            elif token_type == "erc721":
                token_address = info[2]
                token_id = int(info[3]) if len(info) > 3 else 0
                owned = wallet.balance_get(account).erc721_get(token_address.lower())
                amount = 1 if token_id in owned else 0

            report = {"payload": encode({"token_id": token_id, "amount": str(amount), "token_type": token_type})}

        elif url.path.startswith("battles"):
            report = {"payload": encode(battle_manager.list_matches())}

        elif url.path.startswith("user_battles"):
            user = url.path.replace("user_battles/", "")
            report = {"payload": encode(battle_manager.list_user_matches(user))}

        else:
            report = {"payload": encode({"error": f"Unknown inspect route: {url.path}"})}

        response = requests.post(rollup_server + "/report", json=report)
        logger.info(f"Received report status {response.status_code}")
        return "accept"

    except Exception as error:
        error_msg = f"Failed to process inspect request. {error}"
        logger.debug(error_msg, exc_info=True)
        return "reject"


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