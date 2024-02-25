import json
import cartesi_wallet.wallet as Wallet
from cartesi_wallet.outputs import Notice, Log
import arena
import hashlib

class BattleManager:
    def __init__(self, wallet: Wallet):
        # Initializes a new instance of the BattleManager class
        self.__challenge_counter = 0
        self.challenges = {}  # Stores challenges by their ID
        self.wallet = wallet

    def list_matches(self):
        return self.challenges.values()

    def create_challenge(self, owner_id, fighter_hash, token, amount):
        # Creates a new challenge
        challenge_id = self._generate_match_id()
        self.challenges[challenge_id] = {
            'id': challenge_id,
            'owner': owner_id,
            'fighter_hash': fighter_hash,
            'token': token,
            'amount': amount,
            'status': 'pending',  # possible statuses: pending, accepted
            'opponent': None
        }
        balance = self.wallet.balance_get(owner_id)
        token_balance = balance.erc20_get(token)
        if token_balance <= 2* amount:
            raise Exception("User does not have enough balance to propose such a duel")
        
        self.wallet.erc20_transfer(owner_id, "0x0", token, amount) ## How much the user is betting
        self.wallet.erc20_transfer(owner_id, "0x0", token, amount) ## The staking as colateral

        return self.challenges[challenge_id]

    def accept_challenge(self, challenge_id, opponent_id, fighter):
        # Accepts a challenge
        if challenge_id not in self.challenges:
            raise Exception("Challenge does not exist.")

        challenge = self.challenges[challenge_id]
        if challenge['status'] != 'pending':
            raise Exception("Challenge is not available for acceptance.")

        balance = self.wallet.balance_get(opponent_id)
        token_balance = balance.erc20_get(challenge['token'])
        if token_balance <= challenge['amount']:
            raise Exception("User does not have enough balance to propose such a duel")
        
        d = fighter
        char2 = arena.Character(1, d["name"], d["weapon"], d["hp"], d["atk"], d["def"], d["spd"])
        if char2.is_cheater():
            raise Exception("Invalid fighter data")
        
        self.wallet.erc20_transfer(opponent_id, "0x0", challenge['token'], challenge['amount']) ## How much the user is betting

        challenge['status'] = 'accepted'
        challenge['opponent'] = opponent_id
        challenge['opponent_fighter'] = fighter

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
        char1 = arena.Character(0, d["name"], d["weapon"], d["hp"], d["atk"], d["def"], d["spd"])
        d = challenge['opponent_fighter']
        char2 = arena.Character(1, d["name"], d["weapon"], d["hp"], d["atk"], d["def"], d["spd"])

        opponent_id = challenge['opponent']
        token = challenge['token']
        amount = challenge['amount']
        if (char1.is_cheater() or self._hash_matches_fighter(fighter, challenge['fighter_hash'])):
            ## ends duel and player 2 gets everything, even the stake
            self.challenges.pop(challenge_id)
            self.wallet.erc20_transfer("0x0", opponent_id, token, amount) # their money
            self.wallet.erc20_transfer("0x0", opponent_id, token, amount) # owner money
            self.wallet.erc20_transfer("0x0", opponent_id, token, amount) # owner stake
            return
        

        self.wallet.erc20_transfer("0x0", sender_id, token, amount) # game creator gets it's stake back

        result, log = arena.battle(char1, char2)
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

        report_payload = log
        report_payload['game_id'] = challenge_id

        return notice_payload, report_payload

    def _generate_match_id(self):
        # Generates a unique match ID
        self.__challenge_counter += 1
        return self.__challenge_counter
    
    def _hash_matches_fighter(self, fighter, hash):
        d = fighter
        input_string = "-".join([d["name"], d["weapon"], d["hp"], d["atk"], d["def"], d["spd"]])
        prove = hashlib.sha256(input_string.encode()).hexdigest()
        if hash != prove:
            return False
        return True
