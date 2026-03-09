"""
Wallet module for Cartesi Rollups v2.

Implements balance tracking and asset deposit/withdrawal
without depending on the cartesi_wallet package (which is v1-only).

Portal payload formats (all use abi.encodePacked):
  ERC20Portal:  [bool(1B) success][address(20B) token][address(20B) sender][uint256(32B) amount][bytes execLayerData]
  EtherPortal:  [address(20B) sender][uint256(32B) amount][bytes execLayerData]
  ERC721Portal: [address(20B) token][address(20B) sender][uint256(32B) tokenId][bytes execLayerData]
"""

import json

# ERC20.transfer(address,uint256) selector = keccak256("transfer(address,uint256)")[:4]
_ERC20_TRANSFER_SELECTOR = bytes.fromhex("a9059cbb")


# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------

def hex_to_str(hex_str: str) -> str:
    """Decode a 0x-prefixed hex string to a UTF-8 string."""
    return bytes.fromhex(hex_str[2:]).decode("utf-8")


def str_to_hex(s: str) -> str:
    """Encode a UTF-8 string to a 0x-prefixed hex string."""
    return "0x" + s.encode("utf-8").hex()


def _to_hex(b: bytes) -> str:
    return "0x" + b.hex()


def _notice(data: dict) -> str:
    """Serialize a dict to a 0x-prefixed hex payload for a /notice call."""
    return str_to_hex(json.dumps(data))


# ---------------------------------------------------------------------------
# Balance
# ---------------------------------------------------------------------------

class Balance:
    """Tracks on-chain asset balances for a single account inside the dapp."""

    def __init__(self):
        self._erc20: dict[str, int] = {}     # token_address -> amount
        self._ether: int = 0
        self._erc721: dict[str, set[int]] = {}  # token_address -> set of token IDs

    # ERC-20
    def erc20_get(self, token_address: str) -> int:
        return self._erc20.get(token_address.lower(), 0)

    def erc20_add(self, token_address: str, amount: int):
        addr = token_address.lower()
        self._erc20[addr] = self._erc20.get(addr, 0) + amount

    def erc20_sub(self, token_address: str, amount: int):
        addr = token_address.lower()
        current = self._erc20.get(addr, 0)
        if current < amount:
            raise Exception(
                f"Insufficient ERC20 balance for {addr}: has {current}, needs {amount}"
            )
        self._erc20[addr] = current - amount

    # Ether
    def ether_get(self) -> int:
        return self._ether

    def ether_add(self, amount: int):
        self._ether += amount

    def ether_sub(self, amount: int):
        if self._ether < amount:
            raise Exception(
                f"Insufficient Ether balance: has {self._ether}, needs {amount}"
            )
        self._ether -= amount

    # ERC-721
    def erc721_get(self, token_address: str) -> set:
        return self._erc721.get(token_address.lower(), set())

    def erc721_add(self, token_address: str, token_id: int):
        addr = token_address.lower()
        if addr not in self._erc721:
            self._erc721[addr] = set()
        self._erc721[addr].add(token_id)

    def erc721_sub(self, token_address: str, token_id: int):
        addr = token_address.lower()
        if token_id not in self._erc721.get(addr, set()):
            raise Exception(f"ERC721 token {token_id} not owned by account")
        self._erc721[addr].discard(token_id)


# ---------------------------------------------------------------------------
# Wallet
# ---------------------------------------------------------------------------

class Wallet:
    """
    In-dapp wallet that tracks per-address balances and produces
    the correct /notice and /voucher payloads for Cartesi Rollups v2.
    """

    def __init__(self):
        self._balances: dict[str, Balance] = {}

    def balance_get(self, address: str) -> Balance:
        addr = address.lower()
        if addr not in self._balances:
            self._balances[addr] = Balance()
        return self._balances[addr]

    # ------------------------------------------------------------------
    # Deposit processors – call these when msg_sender == portal address
    # ------------------------------------------------------------------

    def erc20_deposit_process(self, payload: str) -> str:
        """
        Decode an ERC20Portal v2 deposit payload and credit the sender.
        Returns a hex-encoded JSON notice payload string.

        Payload layout (abi.encodePacked):
          [0:20]  address token    (20 bytes)
          [20:40] address sender   (20 bytes)
          [40:72] uint256 amount   (32 bytes)
          [72:]   bytes   execLayerData
        """
        raw = bytes.fromhex(payload[2:])
        token  = "0x" + raw[0:20].hex()
        sender = "0x" + raw[20:40].hex()
        amount = int.from_bytes(raw[40:72], "big")

        self.balance_get(sender).erc20_add(token, amount)

        return _notice({
            "type":   "erc20deposit",
            "from":   sender.lower(),
            "token":  token.lower(),
            "amount": str(amount),
        })

    def ether_deposit_process(self, payload: str) -> str:
        """
        Decode an EtherPortal v2 deposit payload and credit the sender.
        Returns a hex-encoded JSON notice payload string.

        Payload layout (abi.encodePacked):
          [0:20]  address sender  (20 bytes)
          [20:52] uint256 amount  (32 bytes)
          [52:]   bytes   execLayerData
        """
        raw = bytes.fromhex(payload[2:])
        sender = "0x" + raw[0:20].hex()
        amount = int.from_bytes(raw[20:52], "big")

        self.balance_get(sender).ether_add(amount)

        return _notice({
            "type":   "etherdeposit",
            "from":   sender.lower(),
            "amount": str(amount),
        })

    def erc721_deposit_process(self, payload: str) -> str:
        """
        Decode an ERC721Portal v2 deposit payload and credit the sender.
        Returns a hex-encoded JSON notice payload string.

        Payload layout (abi.encodePacked):
          [0:20]  address token    (20 bytes)
          [20:40] address sender   (20 bytes)
          [40:72] uint256 tokenId  (32 bytes)
          [72:]   bytes   execLayerData
        """
        raw = bytes.fromhex(payload[2:])
        token    = "0x" + raw[0:20].hex()
        sender   = "0x" + raw[20:40].hex()
        token_id = int.from_bytes(raw[40:72], "big")

        self.balance_get(sender).erc721_add(token, token_id)

        return _notice({
            "type":     "erc721deposit",
            "from":     sender.lower(),
            "token":    token.lower(),
            "token_id": token_id,
        })

    # ------------------------------------------------------------------
    # Internal transfers
    # ------------------------------------------------------------------

    def erc20_transfer(self, from_addr: str, to_addr: str, token: str, amount: int) -> str:
        """
        Transfer ERC20 tokens between internal accounts.
        Returns a hex-encoded JSON notice payload string.
        (Use "0x0" as a neutral escrow/pot address.)
        """
        self.balance_get(from_addr).erc20_sub(token, amount)
        self.balance_get(to_addr).erc20_add(token, amount)

        return _notice({
            "type":   "erc20transfer",
            "from":   from_addr.lower(),
            "to":     to_addr.lower(),
            "token":  token.lower(),
            "amount": str(amount),
        })

    def ether_transfer(self, from_addr: str, to_addr: str, amount: int) -> str:
        self.balance_get(from_addr).ether_sub(amount)
        self.balance_get(to_addr).ether_add(amount)

        return _notice({
            "type":   "ethertransfer",
            "from":   from_addr.lower(),
            "to":     to_addr.lower(),
            "amount": str(amount),
        })

    # ------------------------------------------------------------------
    # Withdrawal vouchers
    # ------------------------------------------------------------------

    def erc20_withdraw(self, from_addr: str, token: str, amount: int) -> tuple[str, str]:
        """
        Withdraw ERC20 tokens to L1 by creating a voucher that calls
        token.transfer(recipient, amount) on the L1 token contract.

        Deducts from the internal balance.
        Returns (destination: str, payload: str) - pass directly to /voucher.
        """
        self.balance_get(from_addr).erc20_sub(token, amount)

        # ABI-encode: transfer(address receiver, uint256 amount)
        # address → 12 zero bytes + 20 address bytes (32 bytes total, left-padded)
        addr_bytes = bytes.fromhex(from_addr[2:].lower().zfill(40))
        addr_padded = b'\x00' * 12 + addr_bytes
        # uint256 → 32 bytes big-endian
        amount_padded = amount.to_bytes(32, "big")
        voucher_payload = _to_hex(_ERC20_TRANSFER_SELECTOR + addr_padded + amount_padded)

        return token.lower(), voucher_payload

    def ether_withdraw(self, from_addr: str, amount: int) -> tuple[str, str]:
        """
        Withdraw Ether to L1 by creating a native-ETH voucher.
        In v2, a voucher with an empty payload and a 'value' field transfers ETH.

        Returns (destination: str, payload: str).
        Caller is responsible for adding 'value' to the voucher POST body.
        """
        self.balance_get(from_addr).ether_sub(amount)
        return from_addr.lower(), "0x"
