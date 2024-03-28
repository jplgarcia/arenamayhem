import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import Onboard, { WalletState } from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';

@Injectable({
  providedIn: 'root'
})
export class OnboardService {
  private onboard;
  private walletConnected = false;
  public wallets: WalletState[] = [];

  
  constructor() {
    const injected = injectedModule();
    
    this.onboard = Onboard({
      wallets: [injected],
      chains: [
        {
          id: '0xaa36a7', // Ethereum mainnet
          token: 'ETH',
          label: 'Sepolia',
          rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/hr7r2ANATPNHZti1Ip82GDfrrwPiR6Pl'
        }
        // Add other chains here if needed
      ],
      appMetadata: {
        name: 'Arena Mayhem',
        // icon: '<URL_TO_YOUR_APP_ICON>', // optional
        // logo: '<URL_TO_YOUR_APP_LOGO>', // optional
        description: 'Battle fiercely',
        recommendedInjectedWallets: [
          { name: 'MetaMask', url: 'https://metamask.io' }
          // List other recommended wallets
        ]
      }
    });
  }

  async connectWallet() {
    try {
      const wallets = await this.onboard.connectWallet();
      if (wallets.length > 0) { // Checks if any wallet is connected
        this.wallets = wallets
        this.walletConnected = true;
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  }

  // Implement a method to disconnect the wallet
  async disconnectWallet() {
    await this.onboard.disconnectWallet({ label: 'Your Wallet Label' });
    this.walletConnected = false;
    this.wallets = []
  }

  // Implement a method to check the wallet's connection status
  isWalletConnected(): boolean {
    return this.walletConnected;
  }

  getConnectedWallet() {
    return this.wallets[0].accounts[0].address
  }

}
