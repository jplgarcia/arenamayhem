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

    def __init__(self, erc20: int, author: str, fighters: str):
        self._erc20 = erc20
        self._fighters = fighters
        self._author = author

    @property
    def erc20(self):
        return self._erc20

    @property
    def fighters(self):
        return self._fighters

    @property
    def author(self):
        return self._author


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

    def __init__(self, creator: str, erc20: str,
                 min_bid_amount: int = MIN_BID_AMOUNT):
        
        if min_bid_amount <= 0:
            raise ValueError(
                f"Minimum bid amount ({min_bid_amount}) must be greater than zero")

        self._id = erc20
        self._state = Battle.CREATED
        self._creator = creator
        self._erc20 = erc20
        self._min_bid_amount = min_bid_amount
        

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
    def opponent_fighter_hash(self):
        return self._opponent_fighter_hash
    
    @property
    def owner_fighter(self):
        return self._owner_fighter
    
    @property
    def opponent_fighter(self):
        return self._opponent_fighter

    def __lt__(self, other):
        return (self.id < other.id)
    
    def joinBattle(self, join_battle: JoinBattle):
        print("Execute battle")

    def sendFighterStats(self, fighter: Fighter):

        if (self.owner_fighter is not None and self.opponent_fighter is not None):
            print("BATTLEE READY")
            return


    def finish(self):
        self._state = Battle.FINISHED
