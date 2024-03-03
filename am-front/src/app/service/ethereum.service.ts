// src/app/ethereum.service.ts

import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { OnboardService } from './onboard.service';
import * as  abi from '../ABI/abi'

declare global {
  interface Window {
    ethereum: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class EthereumService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  private dappContract: ethers.Contract | null = null;
  private dappRelayContract: ethers.Contract | null = null;
  private inputContract: ethers.Contract | null = null;
  private etherPortalContract: ethers.Contract | null = null;
  private ERC20PortalContract: ethers.Contract | null = null;
  private ERC721PortalContract: ethers.Contract | null = null;
  private erc20TokenContract: ethers.Contract | null = null;

  private dappAddress = '0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C'
  private dappRelayAddress = "0xF5DE34d6BbC0446E2a45719E718efEbaaE179daE"
  private inputAddress = '0x59b22D57D4f067708AB0c00552767405926dc768'
  private etherPortalAddress = '0xFfdbe43d4c855BF7e0f105c400A50857f53AB044'
  private erc20PortalAddress = '0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB'
  private erc721PortalAddress = '0x237F8DD094C0e47f4236f12b4Fa01d6Dae89fb87'

  private erc20TokenAddress = '0xae7f61eCf06C65405560166b259C54031428A9C4'

  constructor(private onboardService: OnboardService) {}

  getTokenAddres() {
    return this.erc20TokenAddress
  }

  async initEthereum(): Promise<void> {
    if (!this.onboardService.isWalletConnected()) {
      await this.onboardService.connectWallet();
    }
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.signer = this.provider.getSigner();

    this.dappContract = new ethers.Contract(this.dappAddress, abi.dappContractABI, this.signer);
    this.dappRelayContract = new ethers.Contract(this.dappRelayAddress, abi.dappAddressRelayContractABI, this.signer);
    this.inputContract = new ethers.Contract(this.inputAddress, abi.inputContractABI, this.signer);
    this.erc20TokenContract = new ethers.Contract(this.erc20TokenAddress, abi.genericERC20ContractABI, this.signer);
    this.etherPortalContract = new ethers.Contract(this.etherPortalAddress, abi.etherPortalContractABI, this.signer);
    this.ERC20PortalContract = new ethers.Contract(this.erc20PortalAddress, abi.erc20PortalsContractABI, this.signer);
    this.ERC721PortalContract = new ethers.Contract(this.erc721PortalAddress, abi.erc721PortalContractABI, this.signer);

  }

  async updateRelay () {
    if (!this.dappRelayContract) {
      throw new Error('Portal Contract not initialized');
    }
    await this.dappRelayContract['relayDAppAddress'](this.dappAddress);
  }

  async depositEtherAssets(amount: Number): Promise<void> {
    if (!this.etherPortalContract) {
      throw new Error('Portal Contract not initialized');
    }

    const parsedAmount = ethers.utils.parseEther(`${amount}`)
    const data = ethers.utils.toUtf8Bytes(`Deposited (${amount}) ether.`);
    const txOverrides = {value: parsedAmount}

    const transaction = await this.etherPortalContract['depositEther'](this.dappAddress, data, txOverrides);
    await transaction.wait(1);
  }

  async depositERC20Assets(amount: Number): Promise<void> {
    if (!this.ERC20PortalContract) {
      throw new Error('Portal Contract not initialized');
    }

    if (!this.erc20TokenContract) {
      throw new Error('Token Contract not initialized');
    }

    const allowance = await this.erc20TokenContract['allowance'](this.signer?.getAddress(), this.erc20PortalAddress);
    const parsedAmount = ethers.utils.parseEther(`${amount}`)
    
    if (parsedAmount > allowance){
      const increaseAllowanceTx = await this.erc20TokenContract['approve'](this.erc20PortalAddress, parsedAmount);
      let receipt = await increaseAllowanceTx.wait(1);

      const event = (await this.erc20TokenContract.queryFilter(this.erc20TokenContract.filters['Approval'](), receipt.blockHash)).pop();
      if (!event) {
          throw Error(`could not approve ${amount} tokens for DAppERC20Portal(${this.erc20PortalAddress})  (signer: ${this.signer?.getAddress()}, tx: ${increaseAllowanceTx.hash})`);
      }
    }

    const data = ethers.utils.toUtf8Bytes(`Deposited (${amount}) of ERC20 (${this.erc20TokenAddress}).`);
    const transaction = await this.ERC20PortalContract['depositERC20Tokens'](this.erc20TokenAddress, this.dappAddress, parsedAmount, data);
    await transaction.wait(1);
  }

  async depositERC721Assets(tokenAddress: string, tokenId:Number): Promise<void> {
    if (!this.ERC721PortalContract) {
      throw new Error('Portal Contract not initialized');
    }

    if (!this.signer) {
      throw new Error('Signer not initialized');
    }
    const data = ethers.utils.toUtf8Bytes(`Deposited (${tokenId}) of ERC721 (${tokenAddress}).`);
    let ERC721TokenContract = new ethers.Contract(tokenAddress, abi.genericERC721ContractABI, this.signer);

    // query current approval
    const currentApproval = await ERC721TokenContract['getApproved'](tokenId);
    if (currentApproval !== this.erc721PortalAddress) {
        const tx = await ERC721TokenContract['approve'](this.erc721PortalAddress, tokenId);
        const receipt = await tx.wait(1);
        const event = (await ERC721TokenContract.queryFilter(ERC721TokenContract.filters['Approval'](), receipt.blockHash)).pop();
        if (!event) {
            throw Error(`could not approve ${tokenId} for DAppERC721Portal(${this.erc721PortalAddress})  (signer: ${this.signer.getAddress()}, tx: ${tx.hash})`);
        }
    }

    // Transfer
    const transaction =     this.ERC721PortalContract['depositERC721Token'](tokenAddress, this.dappAddress, tokenId, "0x", data);
    await transaction.wait(1);
  }

  async transferEther(from: String, to: String, amount: Number) {
    let obj = {
      "method": "ether_transfer",
      "from" : from,
      "to": to,
      "amount": ethers.utils.parseEther(`${amount}`).toString()
    }

    await this.genericCall(JSON.stringify(obj))
  }

  async transferERC20(from: String, to: String, amount: Number) {
    let obj = {
      "method": "erc20_transfer",
      "from" : from,
      "to": to,
      "erc20": this.erc20TokenAddress,
      "amount": ethers.utils.parseEther(`${amount}`).toString()
    }

    await this.genericCall(JSON.stringify(obj))
  }

  async transferERC721(from: String, to: String, tokenAddress: string, tokenId: Number) {
    let obj = {
      "method": "erc721_transfer",
      "from" : from,
      "to": to,
      "erc721": tokenAddress,
      "token_id": tokenId
    }

    await this.genericCall(JSON.stringify(obj))
  }

  async withdrawEther(from: String, amount: Number) {
    let obj = {
      "method": "ether_withdraw",
      "from" : from,
      "amount": ethers.utils.parseEther(`${amount}`).toString()
    }

    await this.genericCall(JSON.stringify(obj))
  }

  async withdrawERC20(from: String, amount: Number) {
    let obj = {
      "method": "erc20_withdraw",
      "from" : from,
      "erc20": this.erc20TokenAddress,
      "amount": ethers.utils.parseEther(`${amount}`).toString()
    }

    await this.genericCall(JSON.stringify(obj))
  }

  async withdrawERC721(from: String, tokenAddress: String, tokenId: Number) {
    let obj = {
      "method": "erc721_withdraw",
      "from" : from,
      "erc721": tokenAddress,
      "amount": tokenId
    }

    await this.genericCall(JSON.stringify(obj))
  }

  async genericCall(str: string) {
    if (!this.inputContract) {
      throw new Error('Token Contract not initialized');
    }

    try {
        let payload = ethers.utils.toUtf8Bytes(str);
        console.log(payload)
        await this.inputContract['addInput'](this.dappAddress, payload);
    } catch (e) {
        console.log(`${e}`);
    }
  
  }

  async wasVoucherExecuted(inputIndex: Number, index: Number) {
    if (!this.dappContract) {
      throw new Error('Token Contract not initialized');
    }
    let executed = true
    try {
        executed = await this.dappContract['wasVoucherExecuted'](inputIndex, index);
    } catch (e) {
        console.log(`${e}`);
    }
    return executed
  }

  async voucherExecuteCall(destination:string, payload:string, proof:any) {
    if (!this.dappContract) {
      throw new Error('Token Contract not initialized');
    }
    let executed = true
    try {
        await this.dappContract['executeVoucher'](destination, payload, proof);
    } catch (e) {
        console.log(`${e}`);
    }
    return executed
  }
  // Add more Ethereum interaction methods as needed
}
