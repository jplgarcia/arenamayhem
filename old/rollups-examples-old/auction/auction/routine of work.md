Report issues later:

// Update dependencies of auction app to 0.12.2
// Add NETWORK="localhost" on hostmode to run auction

--------------------

START APP
// after interrupting with ctrl+c docker compose -f ../docker-compose.yml -f ./docker-compose.override.yml -f ../docker-compose-host.yml down -v

docker compose -f ../docker-compose.yml -f ./docker-compose.override.yml -f ../docker-compose-host.yml up

ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004" NETWORK=localhost python3 -m auction.dapp

---------------------

SINGLE PLAYER MODE

// DEPOIST AMOUNT OF ERC20 TO BE DISTRIBUTED (APE COINS HERE)

yarn start erc20 deposit --amount 20000000000000000000


// ISSUE A BATTLE, min_bid_amount is how much will be payed for each battle

yarn start input send --payload '{                                                  
    "method": "create",
    "args": {
        "erc20": "0x2797a6a6d9d94633ba700b52ad99337ddafa3f52",
        "min_bid_amount": 100000000000000000
    }
}'

// optional view balances
yarn start inspect --payload  balance/0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
yarn start inspect --payload  balance/0x70997970C51812dc3A010C7d01b50e0d17dc79C8


// Other individual starts this battle if wins gets money

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

// optional view balances
yarn start inspect --payload  balance/0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
yarn start inspect --payload  balance/0x70997970C51812dc3A010C7d01b50e0d17dc79C8

// Withdraw money - this will create a voucher to be executed
yarn start input send --accountIndex 1 --payload '{
    "method": "erc20withdrawal",
    "args": {
        "erc20": "0x2797a6a6d9d94633ba700b52ad99337ddafa3f52",
        "amount": 100000000000000000
    }
}'

// pass time
curl --data '{"id":1337,"jsonrpc":"2.0","method":"evm_increaseTime","params":[864010]}' http://localhost:8545

// execute voucher - note: change the value after --input to the input of the voucher
yarn start voucher execute --index 0 --input 3
