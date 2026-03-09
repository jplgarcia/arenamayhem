// src/app/ethereum.service.ts
// Updated for Cartesi Rollups v2 using viem + @cartesi/viem

import { Injectable } from '@angular/core';
import {
  createWalletClient,
  createPublicClient,
  custom,
  parseEther,
  toHex,
  type Address,
  type PublicClient
} from 'viem';
import { sepolia, anvil, type Chain } from 'viem/chains';
import { walletActionsL1 } from '@cartesi/viem';
import {
  erc20PortalAddress,
  erc721PortalAddress,
  ierc20Abi,
  ierc721Abi
} from '@cartesi/viem/abi';
import { OnboardService } from './onboard.service';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    ethereum: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class EthereumService {
  private walletClient: any = null;
  private publicClient: PublicClient | null = null;

  private dappAddress: Address = environment.dappAddress as Address;
  private erc20TokenAddress: Address = environment.erc20TokenAddress as Address;

  constructor(private onboardService: OnboardService) {}

  getTokenAddres() {
    return this.erc20TokenAddress;
  }

  async initEthereum(): Promise<void> {
    if (!this.onboardService.isWalletConnected()) {
      await this.onboardService.connectWallet();
    }

    const chain: Chain = environment.chainId === 31337 ? anvil : sepolia;

    this.walletClient = createWalletClient({
      chain,
      transport: custom(window.ethereum)
    }).extend(walletActionsL1());

    this.publicClient = createPublicClient({
      chain,
      transport: custom(window.ethereum)
    });
  }

  private async getAccount(): Promise<Address> {
    const addresses = await this.walletClient.getAddresses();
    return addresses[0];
  }

  // -------------------------------------------------------------------
  // Asset deposits (L1 -> Cartesi application)
  // -------------------------------------------------------------------

  async depositEtherAssets(amount: Number): Promise<void> {
    if (!this.walletClient) throw new Error('Wallet not initialized');
    const account = await this.getAccount();
    const tx = await this.walletClient.depositEther({
      account,
      application: this.dappAddress,
      value: parseEther(`${amount}`),
      execLayerData: '0x'
    });
    console.log('depositEther tx:', tx);
  }

  async depositERC20Assets(amount: Number): Promise<void> {
    if (!this.walletClient || !this.publicClient) throw new Error('Wallet not initialized');
    const account = await this.getAccount();
    const parsedAmount = parseEther(`${amount}`);

    const allowance = await this.publicClient.readContract({
      address: this.erc20TokenAddress,
      abi: ierc20Abi,
      functionName: 'allowance',
      args: [account, erc20PortalAddress]
    }) as bigint;

    if (allowance < parsedAmount) {
      await this.walletClient.writeContract({
        account,
        address: this.erc20TokenAddress,
        abi: ierc20Abi,
        functionName: 'approve',
        args: [erc20PortalAddress, parsedAmount]
      });
    }

    const tx = await this.walletClient.depositERC20Tokens({
      account,
      application: this.dappAddress,
      token: this.erc20TokenAddress,
      amount: parsedAmount,
      execLayerData: '0x'
    });
    console.log('depositERC20Tokens tx:', tx);
  }

  async depositERC721Assets(tokenAddress: string, tokenId: Number): Promise<void> {
    if (!this.walletClient || !this.publicClient) throw new Error('Wallet not initialized');
    const account = await this.getAccount();
    const tokenAddr = tokenAddress as Address;
    const tokenIdBI = BigInt(tokenId as number);

    const currentApproval = await this.publicClient.readContract({
      address: tokenAddr,
      abi: ierc721Abi,
      functionName: 'getApproved',
      args: [tokenIdBI]
    });

    if (currentApproval !== erc721PortalAddress) {
      await this.walletClient.writeContract({
        account,
        address: tokenAddr,
        abi: ierc721Abi,
        functionName: 'approve',
        args: [erc721PortalAddress, tokenIdBI]
      });
    }

    const tx = await this.walletClient.depositERC721Token({
      account,
      application: this.dappAddress,
      token: tokenAddr,
      tokenId: tokenIdBI,
      baseLayerData: '0x',
      execLayerData: '0x'
    });
    console.log('depositERC721Token tx:', tx);
  }

  // -------------------------------------------------------------------
  // Generic application input
  // -------------------------------------------------------------------

  async genericCall(str: string) {
    if (!this.walletClient) throw new Error('Wallet not initialized');
    const account = await this.getAccount();
    try {
      const tx = await this.walletClient.addInput({
        account,
        application: this.dappAddress,
        payload: toHex(str)
      });
      console.log('addInput tx:', tx);
    } catch (e) {
      console.log(`${e}`);
    }
  }

  // -------------------------------------------------------------------
  // In-app transfers / withdrawals (sent as inputs to the application)
  // -------------------------------------------------------------------

  async transferEther(from: String, to: String, amount: Number) {
    await this.genericCall(JSON.stringify({
      method: 'ether_transfer',
      from, to,
      amount: parseEther(`${amount}`).toString()
    }));
  }

  async transferERC20(from: String, to: String, amount: Number) {
    await this.genericCall(JSON.stringify({
      method: 'erc20_transfer',
      from, to,
      erc20: this.erc20TokenAddress,
      amount: parseEther(`${amount}`).toString()
    }));
  }

  async transferERC721(from: String, to: String, tokenAddress: string, tokenId: Number) {
    await this.genericCall(JSON.stringify({
      method: 'erc721_transfer',
      from, to,
      erc721: tokenAddress,
      token_id: tokenId
    }));
  }

  async withdrawEther(from: String, amount: Number) {
    await this.genericCall(JSON.stringify({
      method: 'ether_withdraw',
      from,
      amount: parseEther(`${amount}`).toString()
    }));
  }

  async withdrawERC20(from: String, amount: Number) {
    await this.genericCall(JSON.stringify({
      method: 'erc20_withdraw',
      from,
      erc20: this.erc20TokenAddress,
      amount: parseEther(`${amount}`).toString()
    }));
  }

  async withdrawERC721(from: String, tokenAddress: String, tokenId: Number) {
    await this.genericCall(JSON.stringify({
      method: 'erc721_withdraw',
      from,
      erc721: tokenAddress,
      amount: tokenId
    }));
  }

  // -------------------------------------------------------------------
  // Voucher execution (L1 on-chain settlement)
  // In v2 pass the full Output object from @cartesi/rpc - proof is embedded.
  // wasVoucherExecuted is handled by GraphqlService (checks execution_transaction_hash).
  // -------------------------------------------------------------------

  async voucherExecuteCall(output: any) {
    if (!this.walletClient) throw new Error('Wallet not initialized');
    const account = await this.getAccount();
    try {
      await this.walletClient.executeOutput({
        account,
        application: this.dappAddress,
        output
      });
    } catch (e) {
      console.log(`${e}`);
    }
  }
}
