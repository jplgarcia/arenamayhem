// lib/config.ts – reads NEXT_PUBLIC_ env vars injected by next.config.ts

const raw = process.env.NEXT_PUBLIC_DAPP_ADDRESS ?? 'am-node';

export const config = {
  /** For inspect / RPC HTTP calls – accepts name (am-node) or 0x address */
  dappId: raw,
  /** For on-chain contract calls – only set when raw is a hex address */
  dappAddress: (raw.startsWith('0x') ? raw : '') as `0x${string}`,
  erc20TokenAddress: (process.env.NEXT_PUBLIC_ERC20_ADDRESS ?? '') as `0x${string}`,
  /** 31337 = Anvil (local), 11155111 = Sepolia */
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 31337),
  nodeUrl: process.env.NEXT_PUBLIC_NODE_URL ?? '',
  rpcUrl:  process.env.NEXT_PUBLIC_RPC_URL  ?? '/rpc',
};
