from os import environ
from urllib.parse import urlparse
import requests
import logging
import json
import cartesi_wallet.wallet as Wallet
from cartesi_wallet.util import hex_to_str, str_to_hex
from BattleManager import BattleManager

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = "http://localhost:8080/rollup"
if "ROLLUP_HTTP_SERVER_URL" in environ:
    rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")

dapp_relay_address = "0xF5DE34d6BbC0446E2a45719E718efEbaaE179daE"
ether_portal_address = "0xFfdbe43d4c855BF7e0f105c400A50857f53AB044"
erc20_portal_address = "0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB"
erc721_portal_address = "0x237F8DD094C0e47f4236f12b4Fa01d6Dae89fb87"

wallet = Wallet
battle_manager = BattleManager(wallet)
rollup_address = ""

def encode(d):
    return "0x" + json.dumps(d).encode("utf-8").hex()

def decode_json(b):
    s = bytes.fromhex(b[2:]).decode("utf-8")
    d = json.loads(s)
    return d

def handle_advance(data):
    logger.info(f"Received advance request data {data}")
    msg_sender = data["metadata"]["msg_sender"]
    payload = data["payload"]
    print(payload)
        
    try:
        notice = None
        if msg_sender.lower() == erc20_portal_address.lower():
            notice = wallet.erc20_deposit_process(payload)
            response = requests.post(rollup_server + "/notice", json={"payload": notice.payload})
        if notice:
            logger.info(f"Received notice status {response.status_code} body {response.content}")
            return "accept"
    except Exception as error:
        error_msg = f"Failed to process command '{payload}'. {error}"
        response = requests.post(rollup_server + "/report", json={"payload": encode(error_msg)})
        logger.debug(error_msg, exc_info=True)
        return "reject"
        
    try:
        req_json = decode_json(payload)
        print(req_json)

        if req_json["method"] == "erc20_transfer" and msg_sender.lower() == req_json["from"].lower():
            converted_value = int(req_json["amount"]) if isinstance(req_json["amount"], str) and req_json["amount"].isdigit() else req_json["amount"]
            notice = wallet.erc20_transfer(req_json["from"].lower(), req_json["to"].lower(), req_json["erc20"].lower(), converted_value)
            response = requests.post(rollup_server + "/notice", json={"payload": notice.payload})

        if req_json["method"] == "erc20_withdraw" and msg_sender.lower() == req_json["from"].lower():
            converted_value = int(req_json["amount"]) if isinstance(req_json["amount"], str) and req_json["amount"].isdigit() else req_json["amount"]
            voucher = wallet.erc20_withdraw(req_json["from"].lower(), req_json["erc20"].lower(), converted_value)
            response = requests.post(rollup_server + "/voucher", json={"payload": voucher.payload, "destination": voucher.destination})

        if req_json["method"] == "create_challenge":
            converted_value = int(req_json["amount"]) if isinstance(req_json["amount"], str) and req_json["amount"].isdigit() else req_json["amount"]
            payload = battle_manager.create_challenge(msg_sender.lower(), req_json["fighter_hash"], req_json["token"].lower(), converted_value)
            response = requests.post(rollup_server + "/notice", json={"payload": str_to_hex(json.dumps(payload))})

        if req_json["method"] == "accept_challenge":
            payload = battle_manager.accept_challenge(req_json["challenge_id"], msg_sender.lower(), req_json["fighter"])
            response = requests.post(rollup_server + "/notice", json={"payload": str_to_hex(json.dumps(payload))})

        if req_json["method"] == "start_match":
            notice_payload, report_payload = battle_manager.start_match(req_json["challenge_id"], msg_sender.lower(), req_json["fighter"])
            response = requests.post(rollup_server + "/report", json={"payload": str_to_hex(json.dumps(report_payload))})
            response = requests.post(rollup_server + "/notice", json={"payload": str_to_hex(json.dumps(notice_payload))})

        return "accept" 
    except Exception as error:
        error_msg = f"Failed to process command '{payload}'. {error}"
        response = requests.post(rollup_server + "/report", json={"payload": encode(error_msg)})
        logger.debug(error_msg, exc_info=True)
        return "reject"
            

def handle_inspect(data):
    logger.info(f"Received inspect request data {data}")
    report = {}
    try:
        url = urlparse(hex_to_str(data["payload"]))
        if url.path.startswith("balance/"):
            info = url.path.replace("balance/", "").split("/")
            token_type, account = info[0].lower(), info[1].lower()
            token_address, token_id, amount = "", 0, 0
            if (token_type == "erc20"):
                token_address = info[2]
                amount = wallet.balance_get(account).erc20_get(token_address.lower())
            report = {"payload": encode({"token_id": token_id, "amount": str(amount), "token_type": token_type})}
            
        elif url.path.startswith("battles"):
            battle_list = battle_manager.list_matches()
            report = {"payload": encode(battle_list)}
            
        elif url.path.startswith("user_battles"):
            user = url.path.replace("user_battles/", "")
            battle_list = battle_manager.list_user_matches(user)
            report = {"payload": encode(battle_list)}
            
        response = requests.post(rollup_server + "/report", json=report)
        logger.info(f"Received report status {response.status_code} body {response.content}")

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