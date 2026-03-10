import json
from wallet import Wallet
import arena
import hashlib

class BattleManager:
    def __init__(self, wallet: Wallet):
        # Initializes a new instance of the BattleManager class
        self.__challenge_counter = 0
        self.challenges = {}  # Stores challenges by their ID
        self.wallet = wallet

    def list_matches(self):
        return list(self.challenges.values())
    
    def list_user_matches(self, user):
        challenge_list = self.challenges.values()
        user_list = []
        for chall in challenge_list:
            if chall['owner'].lower() == user.lower():
                user_list.append(chall)
        return user_list

    def create_challenge(self, owner_id, fighter_hash, token, amount):
        """Commit phase: only the fighter_hash is stored. Seed stays secret until start_match."""
        balance = self.wallet.balance_get(owner_id)
        token_balance = balance.erc20_get(token)
        if int(token_balance) < 2* amount:
            raise Exception("User does not have enough balance to propose such a duel")
        
        self.wallet.erc20_transfer(owner_id, "0x0", token, amount) ## How much the user is betting
        self.wallet.erc20_transfer(owner_id, "0x0", token, amount) ## The staking as colateral

        # Creates a new challenge
        challenge_id = self._generate_match_id()
        self.challenges[challenge_id] = {
            'id': challenge_id,
            'owner': owner_id,
            'fighter_hash': fighter_hash,   # commit: SHA256(name-element-boons-seed)
            'token': token,
            'amount': str(amount),
            'status': 'pending',
            'opponent': None
        }

        return self.challenges[challenge_id]

    def accept_challenge(self, challenge_id, opponent_id, fighter, seed):
        # Accepts a challenge
        if challenge_id not in self.challenges:
            raise Exception("Challenge does not exist.")

        challenge = self.challenges[challenge_id]
        if challenge['status'] != 'pending':
            raise Exception("Challenge is not available for acceptance.")

        balance = self.wallet.balance_get(opponent_id)
        token_balance = balance.erc20_get(challenge['token'])
        if token_balance < int(challenge['amount']):
            raise Exception("User does not have enough balance to propose such a duel")
        
        d = fighter
        char2 = arena.Character(1, d["name"], d["element"], d["boons"])
        if char2.is_cheater(d["boons"]):
            raise Exception("Invalid fighter data")
        
        self.wallet.erc20_transfer(opponent_id, "0x0", challenge['token'], int(challenge['amount']))

        challenge['status'] = 'accepted'
        challenge['opponent'] = opponent_id
        challenge['opponent_fighter'] = fighter
        challenge['opponent_seed'] = seed

        return challenge

    def start_match(self, challenge_id, sender_id, fighter):

        if challenge_id not in self.challenges:
            raise Exception("Challenge does not exist.")
        challenge = self.challenges[challenge_id]
        if challenge['status'] != 'accepted':
            raise Exception("Challenge is not yet accepted by anyone.")
        
        if sender_id != challenge['owner']:
            raise Exception("You are not the owner, can't start match.")
        
        d = fighter
        char1 = arena.Character(0, d["name"], d["element"], d["boons"])
        d = challenge['opponent_fighter']
        char2 = arena.Character(1, d["name"], d["element"], d["boons"])

        opponent_id = challenge['opponent']
        token = challenge['token']
        amount = int(challenge['amount'])
        # Hash check first: verifies the revealed fighter (including seed) matches the commit.
        # Boon budget check second: guards against valid-hash fighters that somehow exceed limits.
        if (not self._hash_matches_fighter(fighter, challenge['fighter_hash']) or char1.is_cheater(fighter["boons"])):
            ## ends duel and player 2 gets everything, even the stake
            self.challenges.pop(challenge_id)
            self.wallet.erc20_transfer("0x0", opponent_id, token, amount) # their money
            self.wallet.erc20_transfer("0x0", opponent_id, token, amount) # owner money
            self.wallet.erc20_transfer("0x0", opponent_id, token, amount) # owner stake
            return
        

        self.wallet.erc20_transfer("0x0", sender_id, token, amount) # game creator gets it's stake back

        # Reveal phase: owner's seed is contained in the fighter dict they just sent.
        # Combined with the opponent's seed (stored at accept time) this seeds the RNG.
        owner_seed    = fighter.get('seed', '')
        opponent_seed = challenge.get('opponent_seed', '')
        result, log = arena.battle(
            char1, char2,
            fighter["boons"], challenge['opponent_fighter']["boons"],
            owner_seed, opponent_seed,
        )
        self.challenges.pop(challenge_id) # delete fight

        if result["winner"]["id"] == -1: # and everyone gets their money back
            self.wallet.erc20_transfer("0x0", opponent_id, token, amount)
            self.wallet.erc20_transfer("0x0", sender_id, token, amount)
            return
        elif result["winner"]["id"] == 0: # game creator wins
            self.wallet.erc20_transfer("0x0", sender_id, token, amount)
            self.wallet.erc20_transfer("0x0", sender_id, token, amount)
        else: # opponent wins
            self.wallet.erc20_transfer("0x0", opponent_id, token, amount)
            self.wallet.erc20_transfer("0x0", opponent_id, token, amount)

        notice_payload = result
        notice_payload['owner_id'] = sender_id
        notice_payload['opponent_id'] = opponent_id
        notice_payload['game_id'] = challenge_id
        notice_payload['fighters'] = [
            fighter,
            challenge['opponent_fighter']
        ]

        report_payload = { 
            "rounds": result['rounds'],
            "log": log,
            'game_id': challenge_id
        }

        return notice_payload, report_payload

    def _generate_match_id(self):
        # Generates a unique match ID
        self.__challenge_counter += 1
        return self.__challenge_counter
    
    def _hash_matches_fighter(self, fighter, fighter_hash):
        d = fighter
        b = d["boons"]
        parts = [
            d["name"], d["element"],
            str(b.get("hp",0)), str(b.get("pow",0)), str(b.get("skl",0)),
            str(b.get("spd",0)), str(b.get("lck",0)), str(b.get("def",0)), str(b.get("res",0)),
            d.get("seed", ""),
        ]
        prove = hashlib.sha256("-".join(parts).encode()).hexdigest()
        return fighter_hash == prove
