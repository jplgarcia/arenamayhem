# Copyright 2022 Cartesi Pte. Ltd.
#
# SPDX-License-Identifier: Apache-2.0
# Licensed under the Apache License, Version 2.0 (the "License"); you may not use
# this file except in compliance with the License. You may obtain a copy of the
# License at http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software distributed
# under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
# CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.

import itertools
from datetime import datetime

class Fighter:
    """
    It fighter object from request
    """

    def __init__(self, battle_id: int, author: str, fighter_sheet: str):

        self._battle_id = battle_id
        self._fighter_sheet = fighter_sheet
        self._author = author


    @property
    def battle_id(self):
        return self._battle_id

    @property
    def fighter_sheet(self):
        return self._fighter_sheet

    @property
    def author(self):
        return self._author

    def __eq__(self, other):
        return (self.author == other.author
                and self.battle_id == other.battle_id
                and self.fighter_sheet == other.fighter_sheet)

    def __ne__(self, other):
        return not (self == other)


class JoinBattle:
    """
    Auction bid

    Identifies a bid of an `amount` placed by a user (`author`) on an
    auction (`auction_id`).
    """

    def __init__(self, battle_id: int, author: str, fighter_hash: str,
                 amount: int):
        if amount <= 0:
            raise ValueError(f"Amount ({amount}) must be greater than zero")

        self._battle_id = battle_id
        self._fighter_hash = fighter_hash
        self._author = author
        self._amount = amount

    @property
    def battle_id(self):
        return self._battle_id

    @property
    def fighter_hash(self):
        return self._fighter_hash

    @property
    def author(self):
        return self._author

    @property
    def amount(self):
        return self._amount


    def __eq__(self, other):
        return (self.author == other.author
                and self.battle_id == other.battle_id
                and self.amount == other.amount
                and self.fighter_hash == other.fighter_hash)

    def __ne__(self, other):
        return not (self == other)

    def __gt__(self, other):
        return (self.amount > other.amount
                or (self.amount == other.amount))

    def __lt__(self, other):
        return (self.amount < other.amount
                or (self.amount == other.amount))

    def __ge__(self, other):
        return NotImplemented

    def __le__(self, other):
        return NotImplemented


class Battle:
    """
    Auction

    Identifies an auction of an `Item` belnging to certain user (`creator`)
    with associated `start_date` and `end_date`.

    It can receive bids as long as the `end_date` has not been reached.

    It has a minimum bid amount set, as well as a `title` and `description`,
    and may be in three different states: `CREATED`,` STARTED` or `FINISHED`.
    """

    CREATED = 0
    ACCEPTED = 1
    FINISHED = 2
    MIN_BID_AMOUNT = 1

    _id = itertools.count()

    def __init__(self, creator: str, owner_fighter_hash: str, opponent_address: str, erc20: str,
                 min_bid_amount: int = MIN_BID_AMOUNT):
        
        if min_bid_amount <= 0:
            raise ValueError(
                f"Minimum bid amount ({min_bid_amount}) must be greater than zero")

        self._id = next(self._id)
        self._state = Battle.CREATED
        self._creator = creator
        self._erc20 = erc20
        self._min_bid_amount = min_bid_amount
        self._owner_fighter_hash = owner_fighter_hash 
        self._opponent_fighter_hash = None 
        self._opponent_address = opponent_address
        self._owner_fighter = None
        self._opponent_fighter = None
        

    @property
    def id(self):
        return self._id

    @property
    def state(self):
        return self._state

    @property
    def creator(self):
        return self._creator

    @property
    def erc20(self):
        return self._erc20

    @property
    def min_bid_amount(self):
        return self._min_bid_amount

    @property
    def winning_bid(self):
        return None

    @property
    def owner_fighter_hash(self):
        return self._owner_fighter_hash
    
    @property
    def opponent_fighter_hash(self):
        return self._opponent_fighter_hash
    
    @property
    def owner_fighter(self):
        return self._owner_fighter
    
    @property
    def opponent_fighter(self):
        return self._opponent_fighter
    
    @property
    def opponent_address(self):
        return self._opponent_address

    def __lt__(self, other):
        return (self.id < other.id)
    
    def setOwnerFighter(self, fighter):
        self._owner_fighter = fighter
    
    def setOpponentFighter(self, fighter):
        self._opponent_fighter = fighter

    def joinBattle(self, join_battle: JoinBattle):
        if self.state == Battle.FINISHED:
            raise ValueError("The battle has already been finished")

        if self.state == Battle.ACCEPTED:
            raise ValueError("The battle has already been accepted")

        if join_battle.battle_id != self.id:
            raise ValueError(f"battle id ({join_battle.battle_id}) does not match")

        if join_battle.amount != self.min_bid_amount:
            raise ValueError(
                f"Bet amount ({join_battle.amount}) did not meet bet amount required" +
                f"({self.min_bid_amount})")
        if self.opponent_address.lower() != join_battle.author.lower():
            raise ValueError(
                f"You are not the opponent this battle was created for" +
                f"({self.opponent_address})")    
        else:
            self._opponent_fighter_hash = JoinBattle.fighter_hash

        if self.state == Battle.CREATED:
            self._state = Battle.ACCEPTED

    def sendFighterStats(self, fighter: Fighter):
        if self.state == Battle.FINISHED:
            raise ValueError("The battle has already been finished")

        if self.state != Battle.ACCEPTED:
            raise ValueError("The battle is not on accepted state")

        if fighter.battle_id != self.id:
            raise ValueError(f"battle id ({fighter.battle_id}) does not match")

        if self.opponent_address.lower() != fighter.author.lower() and self.creator.lower() != fighter.author.lower():
            raise ValueError(
                f"You are not the creator nor the opponent specified" +
                f"({self.opponent_address})")    
        
        if self.opponent_address.lower() == fighter.author.lower():
            self.setOpponentFighter(fighter)

        if self.creator.lower() == fighter.author.lower():
            self.setOwnerFighter(fighter)

        if (self.owner_fighter is not None and self.opponent_fighter is not None):
            print("BATTLEE SIMULATEEEEED")
            self._state = Battle.FINISHED
            return


    def finish(self):
        self._state = Battle.FINISHED
