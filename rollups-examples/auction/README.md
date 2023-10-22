Arena Mayhem is an exciting fighting game that let users craft their own gladiators and join many epic battles by inviting their friends. To enter the arena, participants stake a chosen amount of tokens, those should be ERC 20 tokens like ETH, APE, or any other that follows the protocol.

Once the bets are set in place, battle issuer and challenger can enter the battle, and the  Cartesi machine starts executing a complex algorithm to generate a battle log in a json format based on each fighter's statistics. This battle log represents the actions taken by each gladiator in each round. The winning player can claim the prize.

The choice of Cartesi to run the battle logic is happen beacause the algorithm can be as complicated as the devs want it to be, which could overwhelm the Solidity language.

After the algorithm finishes the calculations and log generation, players can watch their gladiators in action through an animation made with the react frontend, displaying each step of the fighters attacks and the decay of their health throughout the battle.

Once the battle ends, tokens are distributed within the application and can be withdrawn by the winner. Arena Mayhem is your ticket to a world of exciting battles, strategy, and the thrill of victory!


# ERC20 Coins Battle System

## Single Player Mode


### Requirements

https://docs.cartesi.io/cartesi-rollups/build-dapps/requirements/

### Deposit ERC20 to be Distributed 

To deposit a specific amount of ERC20 (ETH/Ape Coins), use the following command:

```bash
yarn start erc20 deposit --amount 20000000000000000000
```

### Issue a Battle

Create a new battle with the specified minimum bid amount:

```bash
yarn start input send --payload '{
  "method": "create",
  "args": {
    "erc20": "0x2797a6a6d9d94633ba700b52ad99337ddafa3f52",
    "min_bid_amount": 100000000000000000
  }
}'
```

### Optional: View Balances

Check the balances of two accounts:

```bash
yarn start inspect --payload balance/0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
yarn start inspect --payload balance/0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

### Other Player Joins the Battle

Another player can join the battle and potentially win money by bidding. Provide character details for the battle:

```bash
yarn start input send --accountIndex 1 --payload '{
  "method": "bid",
  "args": {
    "erc20": "0x2797a6a6d9d94633ba700b52ad99337ddafa3f52",
    "characters": [{
      "name": "Tank",
      "weapon": "sword",
      "hp": 30,
      "atk": 20,
      "def": 40,
      "spd": 10
    }, {
      "name": "DPS",
      "weapon": "axe",
      "hp": 20,
      "atk": 40,
      "def": 10,
      "spd": 30
    }]
  }
}'
```

### Optional: View Balances

Check the updated balances of the accounts after the battle:

```bash
yarn start inspect --payload balance/0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
yarn start inspect --payload balance/0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

### Withdraw Money

Initiate a withdrawal to receive your earnings. This will create a voucher to be executed later:

```bash
yarn start input send --accountIndex 1 --payload '{
  "method": "erc20withdrawal",
  "args": {
    "erc20": "0x2797a6a6d9d94633ba700b52ad99337ddafa3f52",
    "amount": 100,000,000,000,000,000
  }
}'
```

### Pass Time

Advance the Cartesi Virtual Machine time by a specified duration using `curl`. This can be useful for testing time-dependent functionalities:

```bash
curl --data '{"id":1337,"jsonrpc":"2.0","method":"evm_increaseTime","params":[864010]}' http://localhost:8545
```

### Execute Voucher

After creating a voucher, execute it by providing the voucher index and its input value:

```bash
yarn start voucher execute --index 0 --input 3
```
