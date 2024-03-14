Here's an improved version of your README.md file with better formatting and explanations:

# Ape Coins Battle System

## Single Player Mode

### Deposit ERC20 to be Distributed (Ape Coins)

To deposit a specific amount of ERC20 (Ape Coins), use the following command:

```bash
yarn start erc20 deposit --amount 20,000,000,000,000,000,000
```

### Issue a Battle

Create a new battle with the specified minimum bid amount:

```bash
yarn start input send --payload '{
  "method": "create",
  "args": {
    "erc20": "0x2797a6a6d9d94633ba700b52ad99337ddafa3f52",
    "min_bid_amount": 100,000,000,000,000,000
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

Advance the Ethereum Virtual Machine (EVM) time by a specified duration using `curl`. This can be useful for testing time-dependent functionalities:

```bash
curl --data '{"id":1337,"jsonrpc":"2.0","method":"evm_increaseTime","params":[864010]}' http://localhost:8545
```

### Execute Voucher

After creating a voucher, execute it by providing the voucher index and its input value:

```bash
yarn start voucher execute --index 0 --input 20
```

Feel free to add any additional context or explanations that your users might find helpful.