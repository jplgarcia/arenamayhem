Report issues later:

// Update dependencies of auction app to 0.12.2
// Add NETWORK="localhost" on hostmode to run auction

--------------------

START APP
// after interrupting with ctrl+c docker compose -f ../docker-compose.yml -f ./docker-compose.override.yml -f ../docker-compose-host.yml down -v

docker compose -f ../docker-compose.yml -f ./docker-compose.override.yml -f ../docker-compose-host.yml up

ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004" NETWORK=localhost python3 -m auction.dapp


SEND THIS

yarn start erc20 deposit --amount 20000000000000000000

CHECK WITH THIS

yarn start inspect --payload  balance/0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

TRANSFER WITH THIS

yarn start input send --payload '{
    "method": "erc20transfer",
    "args": {
        "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "erc20": "0x2797a6a6d9d94633ba700b52ad99337ddafa3f52",
        "amount": 10000000000000000000
    }
}'


CHECK IF ASSETS WERE TRANSFEREED
yarn start inspect --payload  balance/0x70997970C51812dc3A010C7d01b50e0d17dc79C8


----
Pass time: curl --data '{"id":1337,"jsonrpc":"2.0","method":"evm_increaseTime","params":[864010]}' http://localhost:8545

----

CREATE BATTLE WITH USER ONE

yarn start input send --payload '{                                                  
    "method": "create",
    "args": {
        "fighter_hash": "testee",
        "opponent_address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "erc20": "0x2797a6a6d9d94633ba700b52ad99337ddafa3f52",
        "min_bid_amount": 1
    }
}'

--------------------------------
JOIN BATTTLE WITH USER 2

yarn start input send --accountIndex 1 --payload '{
    "method": "bid",
    "args": {
        "fighter_hash": "batatatata",
        "battle_id": 0,
        "amount": 1
    }
}'

------------------------------------

yarn start input send --payload '{
    "method": "send_fighter",
    "args": {
        "fighter_sheet": "arroz",
        "battle_id": 0
    }
}'

yarn start input send --accountIndex 1 --payload '{
    "method": "send_fighter",
    "args": {
        "fighter_sheet": "feijao",
        "battle_id": 0
    }
}'