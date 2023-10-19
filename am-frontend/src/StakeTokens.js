import React, { useState } from 'react';
import {ethers} from "ethers";
import { EtherPortal__factory, ERC20Portal__factory, IERC20__factory } from '@cartesi/rollups';

function StakeTokens({dappAddress, onSubmit}) {
    const ETHERPORTAL_ADDRESS = '0xFfdbe43d4c855BF7e0f105c400A50857f53AB044'
    const ERC20PORTAL_ADDRESS = '0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB'

    const [betAmount, setBetAmount] = useState('');

    const handleInputChange = (event) => {
        const { value } = event.target;
        setBetAmount(value);
    };
    const handleSubmit = () => {
        console.log(betAmount);
        //stakeEther(betAmount)
        stakeERC20(betAmount)
        onSubmit(true)
    };
    
    
    const stakeEther = async (amount)  => {
        // Start a connection
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();  
        // Instantiate the depositether contract
        const etherPortalContract = EtherPortal__factory.connect(
            ETHERPORTAL_ADDRESS,
            signer
        );
        const data = ethers.toUtf8Bytes(`Deposited (${amount}) ether.`);
        const txOverrides = {value: ethers.parseEther(`${amount}`)}

        const tx = await etherPortalContract.depositEther(dappAddress,data,txOverrides);
        // Wait for confirmation
        console.log("waiting for confirmation...")
        const receipt = await tx.wait(1)
        console.log("receipt generated...", receipt)
    };

    const stakeERC20 = async (token, amount)  => {
        // Start a connection
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();  
        // Instantiate the depositERC20 contract
        const erc20PortalContract = ERC20Portal__factory.connect(
            ERC20PORTAL_ADDRESS,
            signer
        );
        const data = ethers.toUtf8Bytes(`Deposited (${amount}) ether.`);
        //const txOverrides = {value: ethers.parseEther(`${amount}`)}

        const tokenContract = signer ? IERC20__factory.connect(token, signer) : IERC20__factory.connect(token, provider);
        const signerAddress = await signer.getAddress()
        
        // query current allowance
        const currentAllowance = await tokenContract.allowance(signerAddress, ERC20PORTAL_ADDRESS);
        if (ethers.parseEther(`${amount}`) > currentAllowance) {
            // Allow portal to withdraw `amount` tokens from signer
            const tx = await tokenContract.approve(ERC20PORTAL_ADDRESS, ethers.parseEther(`${amount}`));
            const receipt = await tx.wait(1);
            const event = (await tokenContract.queryFilter(tokenContract.filters.Approval(), receipt.blockHash)).pop();
            if (!event) {
                throw Error(`could not approve ${amount} tokens for DAppERC20Portal(${ERC20PORTAL_ADDRESS})  (signer: ${signerAddress}, tx: ${tx.hash})`);
            }
        }

        const tx = await erc20PortalContract.depositERC20Tokens(token, dappAddress, ethers.parseEther(`${amount}`), data);
        // Wait for confirmation
        console.log("waiting for confirmation...")
        const receipt = await tx.wait(1)
        console.log("receipt generated...", receipt)
    };



return(
    <div>
    <h3>Your character is ready!</h3>
    <h1>Place your bet and enter arena!</h1>
    <input
        type="number"
        value={betAmount}
        onChange={handleInputChange}
        placeholder="Enter your bet amount"
      />
      <button onClick={handleSubmit}>Submit Bet</button>
    </div>
)
};
export default StakeTokens;