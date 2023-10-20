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

import json
from datetime import datetime
from operator import attrgetter

import auction.wallet as Wallet
from auction.encoders import BattleEncoder, JoinBattleEncoder, FighterEncoder
from auction.log import logger
from auction.model import Battle, JoinBattle, Fighter
from auction.outputs import Error, Log, Notice, Output


class Auctioneer():

    def __init__(self, wallet: Wallet):
        self._auctions: dict[int, Battle] = {}
        self._wallet = wallet

    def auction_create(
            self, seller: str, owner_fighter_hash: str, opponent_address:str, erc20: str,
            min_bid_amount: int):

        try:
            battle = Battle(seller, owner_fighter_hash, opponent_address, erc20, min_bid_amount)
            self._auctions[battle._id] = battle

            auction_json = json.dumps(battle, cls=BattleEncoder)
            notice_payload = f'{{"type": "auction_create", "content": {auction_json}}}'
            logger.info(f"Battle {battle._id} created for item "
                        f"'fighter hash: {battle.owner_fighter_hash}'")
            return Notice(notice_payload)
        except Exception as error:
            error_msg = f"Failed to create auction. {error}"
            logger.debug(error_msg, exc_info=True)
            return Error(error_msg)

    def auction_list_bids(self, auction_id):
        try:
            auction = self._auctions.get(auction_id)
            if auction == None:
                raise ValueError(f"Auction id {auction_id} not found")
            return Log(json.dumps(auction.bids, cls=JoinBattleEncoder))
        except Exception as error:
            error_msg = f"Failed to list bids for auction id {auction_id}. {error}"
            logger.debug(error_msg, exc_info=True)
            return Error(error_msg)

    def auction_bid(self, bidder, battle_id, fighter_hash, amount):
        try:
            battle = self._auctions.get(battle_id)
            if not battle:
                raise ValueError(
                    f"There's no battle_id with id {battle_id}")
            if bidder == battle.creator:
                raise ValueError(
                    f"{bidder} cannot fight on their own create battle")
            if not self._has_enough_funds(battle.erc20, bidder, amount):
                raise ValueError(
                    f"Account {bidder} doesn't have enough funds")

            join = JoinBattle(battle_id, bidder, fighter_hash, amount)
            battle.joinBattle(join)
            join_json = json.dumps(join, cls=JoinBattleEncoder)
            logger.info(f"Joining with '{amount} {battle.erc20}' placed for "
                        f"{battle_id}")
            return Notice(f'{{"type": "auction_bid", "content": {join_json}}}')
        except Exception as error:
            error_msg = f"Failed to bid. {error}"
            logger.debug(error_msg, exc_info=True)
            return Error(error_msg)

    def send_fighter (
            self, author: str, battle_id: int, fighter_sheet: str):
        try:
            battle = self._auctions.get(battle_id)
            if not battle:
                raise ValueError(
                    f"There's no battle_id with id {battle_id}")
            if battle.state != battle.ACCEPTED:
                raise ValueError(
                    f"Not accepting fighters in {battle_id}")
            if author.lower() != battle.creator.lower() and author.lower() != battle.opponent_address.lower():
                raise ValueError(
                    f"not a participant cannot fight on their own create battle")

            new_fighter = Fighter(battle_id, author, fighter_sheet)
            battle.sendFighterStats(new_fighter)
            bid_json = json.dumps(new_fighter, cls=FighterEncoder)
            logger.info(f"Joining with fighter {new_fighter.fighter_sheet} placed for "
                        f"{battle_id}")
            
            if (battle.owner_fighter is None or battle.opponent_fighter is None):
                return Notice(f'{{"type": "auction_bid", "content": {bid_json}}}')
            else:
                logger.info(f"BATLLE BEGINS {battle.owner_fighter} and {battle.opponent_address} placed for "
                        f"{battle_id}")
                return Notice(f'{{"type": "auction_bid", "content": {bid_json}}}')

        except Exception as error:
            error_msg = f"Failed to bid. {error}"
            logger.debug(error_msg, exc_info=True)
            return Error(error_msg)


    def auction_end(
            self, auction_id, rollup_address,
            msg_date, msg_sender, withdraw=False):

        try:
            auction = self._auctions.get(auction_id)

            if not auction:
                raise ValueError(f"There's no auction with id {auction_id}")
            if msg_date < auction.end_date:
                raise ValueError(
                    f"It can only end after {auction.end_date.isoformat()}")
            notice_template = '{{"type": "auction_end", "content": {}}}'
            winning_bid = auction.winning_bid
            outputs: list[Output] = []

            if not winning_bid:
                notice_payload = notice_template.format(
                    f'{{"auction_id": {auction.id}}}')
                notice = Notice(notice_payload)
                outputs.append(notice)
            else:
                output = self._wallet.erc20_transfer(
                    account=winning_bid.author,
                    to=auction.creator,
                    erc20=auction.erc20,
                    amount=winning_bid.amount)

                if type(output) is Error:
                    return output

                outputs.append(output)
                output = self._wallet.erc721_transfer(
                    account=auction.creator,
                    to=winning_bid.author,
                    erc721=auction.item.erc721,
                    token_id=auction.item.token_id)

                if type(output) is Error:
                    return output

                outputs.append(output)
                if withdraw and msg_sender == auction.winning_bid.author:
                    output = self._wallet.erc721_withdraw(
                        rollup_address=rollup_address,
                        sender=msg_sender,
                        erc721=auction.item.erc721,
                        token_id=auction.item.token_id)

                    if type(output) is Error:
                        return output

                    outputs.append(output)

                bid_str = json.dumps(winning_bid, cls=JoinBattleEncoder)
                notice_payload = notice_template.format(bid_str)
                notice = Notice(notice_payload)
                outputs.append(notice)

            auction.finish()
            logger.info(f"Auction {auction.id} finished")
            return outputs
        except Exception as error:
            error_msg = f"Failed to end auction. {error}"
            logger.debug(error_msg, exc_info=True)
            return Error(error_msg)

    def auction_get(self, auction_id):
        try:
            auction_json = json.dumps(
                self._auctions[auction_id], cls=BattleEncoder)
            return Log(auction_json)
        except Exception as error:
            return Error(f"Auction id {auction_id} not found")

    def auction_list(self, **kwargs):
        try:
            auctions = sorted(self._auctions.values())
            query = kwargs.get("query")
            if query:
                sort = query.get("sort")
                offset = query.get("offset")
                limit = query.get("limit")
                if sort:
                    sort = sort[0]
                    auctions = sorted(auctions, key=attrgetter(sort))

                if offset:
                    offset = int(offset[0])
                    auctions = auctions[offset:]

                if limit:
                    limit = int(limit[0])
                    auctions = auctions[:limit]

            return Log(json.dumps(auctions, cls=BattleEncoder))
        except Exception as error:
            error_msg = f"Failed to list auctions. {error}"
            logger.debug(error_msg, exc_info=True)
            return Error(error_msg)

    def _seller_owns_item(self, seller, item):
        try:
            balance = self._wallet.balance_get(seller)
            erc721_balance = balance.erc721_get(item.erc721)
            if item.token_id in erc721_balance:
                return True
            return False
        except Exception:
            return False

    def _is_item_auctionable(self, item):
        for auction in self._auctions.values():
            if auction.state != Battle.FINISHED and auction.item == item:
                return False
        return True

    def _has_enough_funds(self, erc20, bidder, amount):
        balance = self._wallet.balance_get(bidder)
        erc20_balance = balance.erc20_get(erc20)

        return amount <= erc20_balance
