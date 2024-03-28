# Creating your first web3 game with Cartesi

So, you want to start developing web3 games, maybe you actually want to start developing zero player games, maybe you are into Cartesi and need a good tutorial to understand how to build dApps from scratch. Well, in any case you came to a good place. In this tutorial I'm gonna guie you through the process of building Arena Mayhem from scratch.

## Defining the solution
Before we start building we actually have to understand what we are building and how we are levaraging cartesi for that. If you want to skip that you can just skip to the [Start Building] section of this tutorial.

### What is Cartesi?
Cartesi is an execution layer, one of the four modular layers of blockchains: Data Availability, Consensus, Execution and Settlement. The idea is that you can take Cartesi's execution environment: The Cartesi Virtual Machine (Cartesi Machine, CVM or CM for short) and plug it to another blockchain and execute your processes by spinning a Cartesi Validator Node. 

In summary this means that you can run any code you want deterministically off-chain and verify it on-chain by creating organically an app-chain. And the good part is that Cartesi already took care of making this whole system easy to you through it's framework Cartesi Rollups. An Optimistic rollups solution that that you can easily bootstrap and deploy with few commands to create your dApp.

Best part, you can deploy it to any EVM compatible chain without any stress. All you have to do is pick your favorite language and develop your dApp as if you were developing a solution that will run on Linux. That is possible because the Cartesi Machine actually runs Linux (deterministically by the way)

### What is Arena Mayhem
Arena Mayhem is a project a group of friends created for a short hackathon from Cartesi. 

The idea is a game that will allow people to have fun by waging on galdiators that they create. For that we developed a battle algorithm that took some inspiration from strategy games like heroes of might of media and fire emblem.

You can think of it as a very fancy rock-papers-scissors where weapons have advantage against each other causing more damage and taking less for certain types, but you also define character stats, so depending on your stat allocation you can overcome this advantages.

### Ok, but how do you build it?
First things first, let's decide the stack. This is a Cartesi tutorial, so of course we are creating the back end on cartesi and adding most of what we can there. That means challenge creation, accepting a challenge, performing the battle algorithm where the gladiators fight each other, restrictions such as weapon choices, maximum and minimum stat verifications and even dealing with cheaters should be dealt with the cartesi machine. Oh and assets! of course we will deal with assets there as well.

As I said before, Cartesi machine supports and have templates for many programming languages, I opted to use python because I have a good familiarity with it and it's good enough to perfom the logic we need here. 

For the front-end angular was the framework of choice because I also wanted to create a Cartesi Angular Front end template and it seemed like a good oportunity to do both at once. Also I like it. But this first part is focused on the backend. The next one will focus on the front.

## Requirements
For this tutorial the requirements for the back end are:

[Docker desktop](https://www.docker.com/products/docker-desktop/) Because the following depends on it: 
[Sunodo / Cartesi CLI](https://docs.sunodo.io/) The most convenient way of building Cartesi applications, from bootstrapping to deploying to a live network
[Python](https://www.python.org/) Language of choice

Recommended:

[Nonodo](https://github.com/gligneul/nonodo) This is recommended to help you on your debugging journey as it allows you to create the whole cartesi environment on you machine and the you can just run your dapp on debug mode.

Basically you can instead of writing `sunodo build` and `sunodo start` just run `nonodo` and from another terminal run `python3 dapp.py`

Be careful: If you are using nonodo you won't be running your dapp on the deterministic environment of the Cartesi machine, so this might lead to different behavoirs when building the final solution. For this tutorial I won't talk about nonodo anymore than this, but know that for your development experience you can switch sunodo commands for it. (Except for voucher execution which will translate to token withdrawal here)

## Ok, enough intro: Let's start!
Start by creating your project

```
sunodo create am-node --template python
```
You can build and run your solution with:
```
sunodo build
```
```
sunodo run
```

This will create the basic cartesi template, now let's add some quality of life changes to it!

Replace the line 
```python
rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
```
with
```python
rollup_server = "http://localhost:8080/rollup"
if "ROLLUP_HTTP_SERVER_URL" in environ:
    rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
```

So it is easier if you are running on debug mode.

Now, our inputs and outputs are always on hex, so to read and write them let's use this two auxiliar functions, add them to you dapp.py:

```python
def encode(d):
    return "0x" + json.dumps(d).encode("utf-8").hex()

def decode_json(b):
    s = bytes.fromhex(b[2:]).decode("utf-8")
    d = json.loads(s)
    return d
```

That's it! Those are the quality of life changes we need. 

### Handling assets
To handle assets inside your dapp one would have to create a wallet class where the balance of all deposited assets are tracked. 

The deposit happens through the portals contracts that are predeployed on networks when you deploy your dApp there. That means you don't even have to think about it. Well, except for the wallet implementantion on you python code, right? Nope! We have solved this for you, you can use this [cartesi-wallet](https://pypi.org/project/cartesi-wallet/) python package that basically deals with that!

Install it with pip:
```
pip3 install cartesi-wallet
```

And you are good to go. Just add the imports to your dapp.py
```python
import cartesi_wallet.wallet as Wallet
from cartesi_wallet.util import hex_to_str, str_to_hex
import json
``` 
And initialize it:
```python
wallet = Wallet
```

To get the balances of a tokens for a users wallet address you can use the following function
```python
balance = wallet.balance_get(account)
```

But still, this is from inside your dApp. How someone can use this to check this info by comunicating with your dApp?

The best way to do this is through inspect calls. There is this method called `handle_inspect` that already exists in your project template, right? Think of this as the entrypoint for GET operations to your dApp. Now change it to add this logic:

```python
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
            report = {"payload": encode({"token_id": token_id, "amount": amount, "token_type": token_type})}
            
        response = requests.post(rollup_server + "/report", json=report)
        logger.info(f"Received report status {response.status_code} body {response.content}")

        return "accept"
    except Exception as error:
        error_msg = f"Failed to process inspect request. {error}"
        logger.debug(error_msg, exc_info=True)
        return "reject"
```

This is a big code snippet so let's see what is happening there bit by bit so we can actually understand what is happening: 
- First, we are parsing the url sent that arrives in the request as a hex, transforming it to a string.
- Then we check if that string starts with the world `balance/` to know that this string is supposed to trigger the balance call, think of it as a very simple routing of an API that uses `ifs and elses` to know where to go.
- Now we split the string to get there parameters: first parameters is the `token_type`, in this case `erc20` is the only option we are caring about. Second paramter is `account` the public wallet address of the account we want to check the balance. And Third is the is the `token_id`, basically the id of the that smartcontract on the chain.
- Once we have all the info we need to extract from the parameters we call wallet `wallet.balance_get(account).erc20_get(token_address.lower())` to retrieve the balance
- Finally we parse that information and add it to an object that will be enconded and made the payload of the report that will be the response of this inspect call.

To test it one can just type the follwing in the browser after a new `build` and `run` with the cli

```
http://localhost:8080/inspect/balance/erc20/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266/0xae7f61eCf06C65405560166b259C54031428A9C4
```

This will probably return a hex string, that when converted using your favorite hex2str tool will have a balance of 0 because we haven't deposited anything there yet... So let's give the user a way to deposit assets.

The approach is similar to reading, we just use the wallet package, but deposit changes the state of the application, so it's more akin to a POST operation than to a GET one. In this case we use the `handle_advance` function.

First add this to your dapp.py:
```python
erc20_portal_address = "0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB"
```
This is the address of your `ERC20 Portal` contract on your local network. We have to use it inside the handle advance to know which contract triggered the handle_advance so we know how to deal with the function call.

Adapt your function to add this:

```python
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
```
Understanding the code:
- First we get the message sender and the payload.
- We check if this was triggered by the ERC20 Portals contract, if it was it must be a deposit happening.
- The wallet package already knows how to deal with the payload to increase the user's token balance inside the application. By doing that we just get the return, and generate a notice.
- The notice will be created and the operation can be verified! Awesome, now we can perform deposits.

To perform a deposit one have to send a deposit command. This can be done for example through the CLI with send subcommand

```
sunodo send
```
Or if you want a GUI to do that and actually perform transactions from your metamask wallet you can do that by adding your localhost network to metamask. On you metamask extension add network:

```
Network name: localhost
New RPC URL: http://localhost:8545
Chain ID: 31337
Currency symbol: GO
```

After that you can clone one of the following projects, both usable to test your transactions:[Angular frontend](https://github.com/jplgarcia/cartesi-angular-frontend) or [React frontend](https://github.com/prototyp3-dev/frontend-web-cartesi).

Now we know how to deposit assets and how to check balances. Let's also learn how to transfer between users and withdrawl them.

Once the asset was deposited think of it like money in the bank vault. Everyone's money is there mixed and the computer knows how much belongs to each person. So what counts once the assets are inside the dApp is the balance values for the users that owns them. If user A wants to transfer to user B and their assets is in the same vault there is no need mess with what is inside the vault, we can just change their balances.

Let's create an endpoint to that also inside the `handle_advance`

```python
try:
    req_json = decode_json(payload)
    print(req_json)

    if req_json["method"] == "erc20_transfer" and msg_sender.lower() == req_json["from"].lower():
        converted_value = int(req_json["amount"]) if isinstance(req_json["amount"], str) and req_json["amount"].isdigit() else req_json["amount"]
        notice = wallet.erc20_transfer(req_json["from"].lower(), req_json["to"].lower(), req_json["erc20"].lower(), converted_value)
        response = requests.post(rollup_server + "/notice", json={"payload": notice.payload})

    return "accept" 
except Exception as error:
    error_msg = f"Failed to process command '{payload}'. {error}"
    response = requests.post(rollup_server + "/report", json={"payload": encode(error_msg)})
    logger.debug(error_msg, exc_info=True)
    return "reject"
```

- Through this `if` we check if the payload contains a "method" key and if it is equal to `"erc20_transfer"` we call the transfer functions
- Some treatment in case the amount is an instance of string and not int
- If everything works as expected we generate a notice confirming the transaction
- The `wallet.erc20_transfer` method basically subtracts balance from a user and add to the other
