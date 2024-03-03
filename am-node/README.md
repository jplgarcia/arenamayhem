# Arena Mayhem Backend

This is the backend for Arena Mayhem
It's highly recommended to run it with the [angular-frontend]("https://github.com/jplgarcia/arenamayhem/am-front")

## Installing

Clone this repository and run by executing sunodo build and sunodo run

## Asset Handling Methods

For operations such as deposits, transfers, and withdrawals, this are the method inside the handle_advance function.

### Deposits

To process a deposit, ensure the sender is the designated portals smart contract (e.g., the default ERC20Portal smart contract from sunodo or nonodo when running locally). You might need to adjust the smart contract address based on your deployment or dynamically retrieve it from a resource file:

```python
msg_sender = data["metadata"]["msg_sender"]
payload = data["payload"]
if msg_sender.lower() == "0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB".lower():
    notice = wallet.erc20_deposit_process(payload)
    response = requests.post(rollup_server + "/notice", json={"payload": notice.payload})
return "accept"
```

### Transfers and Withdrawals

The payload format for transfers and withdrawals may vary with every application. Below is an example payload for the implementations that follow:

```python
# Example payload for "transfer" method
{
    "method": "erc20_transfer",
    "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "erc20": "0xae7f61eCf06C65405560166b259C54031428A9C4",
    "amount": 5000000000000000000
}

# Example payload for "withdraw" method
{
    "method": "erc20_withdraw",
    "from": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "erc20": "0xae7f61eCf06C65405560166b259C54031428A9C4",
    "amount": 3000000000000000000
}
```
## Inspecing balance
Routes for this Inspects are as follows:
```
erc20:
http://localhost:8080/inspect/balance/ether/{wallet}/{token_address}
http://localhost:8080/inspect/balance/erc20/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266/0xae7f61eCf06C65405560166b259C54031428A9C4
```

## Creating a challenge

When you create a challenge anyone can accept it and take on your fighter. You don't send the fighter strainght away, but a sha256 hashed version of its stats. the format is`
`name-weapon-hp-atk-def-spd`
Where weapon can be sword, lance or axe, the sum of the 4 stats should not go over 100 and no single stat should be over 40
The name is very important because it is the variable that will make every hash be different independently of the combination of stats.
Once a challenge is creatted the user stake twice the value of "amount". The original bet value and a guarantee that he will not cheat changin fighter stats later

Send a generic call with this body

```
{
    "method": "create_challenge",
    "fighter_hash": "hash",
    "token": "0x000",
    "amount": "10000"
}
```

## Listing challenges
you can find a list of challenges y using the http get call: 
`http://localhost:8080/inspect/battles`


## Accepting a challenge

accepting the challenge you send your fighter stats and the challenge ID which can be found though the graphql query above

```
{
    "method": "accept_challenge",
    "fighter": {
        "name": "john",
        "weapon": "sword",
        "hp": 25,
        "atk": 25,
        "def": 25,
        "spd": 25
    },
    "challenge_id": 1
}
```

## Starting battle
Once the challenge was accepted the creator can start the battle by sending the following command:

```
{
    "method": "staart_match",
    "fighter": {
        "name": "jack",
        "weapon": "axe",
        "hp": 25,
        "atk": 25,
        "def": 25,
        "spd": 25
    },
    "challenge_id": 1
}
```
Note that it has to be the exac same fighter that was used to create the challenge
A user can see which of their challenges were accepting with the get call to `http://localhost:8080/inspect/user_battle/0x000`
Replacing 0x000 with the wallet address

