// lib/ethereum.ts – viem + @cartesi/viem wallet actions (client-side only)
import {
  createWalletClient,
  createPublicClient,
  custom,
  parseEther,
  toHex,
  type Address,
  type WalletClient,
  type PublicClient,
} from 'viem';
import { sepolia, anvil, type Chain } from 'viem/chains';
import { walletActionsL1 } from '@cartesi/viem';
import {
  erc20PortalAddress,
  erc721PortalAddress,
  ierc20Abi,
  ierc721Abi,
} from '@cartesi/viem/abi';
import { config } from './config';

declare global {
  interface Window {
    ethereum: any;
  }
}

type ExtendedWalletClient = ReturnType<typeof createWalletClient> & ReturnType<typeof walletActionsL1>;

let walletClient: ExtendedWalletClient | null = null;
let publicClient: PublicClient | null = null;

// ── Wallet initialisation ────────────────────────────────────────────────────

export async function getAccount(): Promise<Address> {
  if (!walletClient) throw new Error('Wallet not initialized');
  const addresses = await (walletClient as any).getAddresses();
  return addresses[0];
}

export async function initWallet(): Promise<Address> {
  const chain: Chain = config.chainId === 31337 ? anvil : sepolia;

  if (!window.ethereum) {
    throw new Error('MetaMask (or compatible wallet) not found. Please install it.');
  }

  walletClient = createWalletClient({
    chain,
    transport: custom(window.ethereum),
  }).extend(walletActionsL1()) as unknown as ExtendedWalletClient;

  publicClient = createPublicClient({
    chain,
    transport: custom(window.ethereum),
  });

  const accounts: Address[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
  return accounts[0];
}

export function getWalletClient() {
  return walletClient;
}

// ── Deposits ─────────────────────────────────────────────────────────────────

function requireDappAddress(): `0x${string}` {
  if (!config.dappAddress) throw new Error(
    'On-chain calls require a hex DAPP_ADDRESS.\nRun: DAPP_ADDRESS=0x... npm run dev'
  );
  return config.dappAddress;
}

export async function depositEther(amount: number): Promise<void> {
  if (!walletClient) throw new Error('Wallet not initialized');
  const account = await getAccount();
  const tx = await (walletClient as any).depositEther({
    account,
    application: requireDappAddress(),
    value: parseEther(`${amount}`),
    execLayerData: '0x',
  });
  console.log('depositEther tx:', tx);
}

export async function depositERC20(amount: number): Promise<void> {
  if (!walletClient || !publicClient) throw new Error('Wallet not initialized');
  const account = await getAccount();
  const parsedAmount = parseEther(`${amount}`);

  const allowance = (await publicClient.readContract({
    address: config.erc20TokenAddress,
    abi: ierc20Abi,
    functionName: 'allowance',
    args: [account, erc20PortalAddress],
  })) as bigint;

  if (allowance < parsedAmount) {
    await (walletClient as any).writeContract({
      account,
      address: config.erc20TokenAddress,
      abi: ierc20Abi,
      functionName: 'approve',
      args: [erc20PortalAddress, parsedAmount],
    });
  }

  const tx = await (walletClient as any).depositERC20Tokens({
    account,
    application: requireDappAddress(),
    token: config.erc20TokenAddress,
    amount: parsedAmount,
    execLayerData: '0x',
  });
  console.log('depositERC20Tokens tx:', tx);
}

export async function depositERC721(tokenAddress: string, tokenId: number): Promise<void> {
  if (!walletClient || !publicClient) throw new Error('Wallet not initialized');
  const account = await getAccount();
  const tokenAddr = tokenAddress as Address;
  const tokenIdBI = BigInt(tokenId);

  const currentApproval = await publicClient.readContract({
    address: tokenAddr,
    abi: ierc721Abi,
    functionName: 'getApproved',
    args: [tokenIdBI],
  });

  if (currentApproval !== erc721PortalAddress) {
    await (walletClient as any).writeContract({
      account,
      address: tokenAddr,
      abi: ierc721Abi,
      functionName: 'approve',
      args: [erc721PortalAddress, tokenIdBI],
    });
  }

  const tx = await (walletClient as any).depositERC721Token({
    account,
    application: requireDappAddress(),
    token: tokenAddr,
    tokenId: tokenIdBI,
    baseLayerData: '0x',
    execLayerData: '0x',
  });
  console.log('depositERC721Token tx:', tx);
}

// ── Input submissions ────────────────────────────────────────────────────────

export async function addInput(str: string): Promise<void> {
  if (!walletClient) throw new Error('Wallet not initialized');
  const account = await getAccount();
  const tx = await (walletClient as any).addInput({
    account,
    application: requireDappAddress(),
    payload: toHex(str),
  });
  console.log('addInput tx:', tx);
}

// ── In-app transfers / withdrawals ───────────────────────────────────────────

export async function transferEther(from: string, to: string, amount: number) {
  return addInput(JSON.stringify({ method: 'ether_transfer', from, to, amount: parseEther(`${amount}`).toString() }));
}

export async function transferERC20(from: string, to: string, amount: number) {
  return addInput(JSON.stringify({ method: 'erc20_transfer', from, to, erc20: config.erc20TokenAddress, amount: parseEther(`${amount}`).toString() }));
}

export async function withdrawEther(from: string, amount: number) {
  return addInput(JSON.stringify({ method: 'ether_withdraw', from, amount: parseEther(`${amount}`).toString() }));
}

export async function withdrawERC20(from: string, amount: number) {
  return addInput(JSON.stringify({ method: 'erc20_withdraw', from, erc20: config.erc20TokenAddress, amount: parseEther(`${amount}`).toString() }));
}

// ── Voucher execution ────────────────────────────────────────────────────────

export async function executeVoucher(output: any): Promise<void> {
  if (!walletClient) throw new Error('Wallet not initialized');
  const account = await getAccount();
  await (walletClient as any).executeOutput({
    account,
    application: requireDappAddress(),
    output,
  });
}
