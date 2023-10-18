import React, { useState } from 'react';
import {ethers} from "ethers";
import { EtherPortal__factory } from '@cartesi/rollups';

function StakeTokens({dappAddress, onSubmit}) {
    const ETHERPORTAL_ADDRESS = '0xFfdbe43d4c855BF7e0f105c400A50857f53AB044'
    const [betAmount, setBetAmount] = useState('');

    const handleInputChange = (event) => {
        const { value } = event.target;
        setBetAmount(value);
    };
    const handleSubmit = () => {
        console.log(betAmount);
        addDepositOnchain(betAmount)
        onSubmit(true)
    };
    
    
    const addDepositOnchain = async (amount)  => {
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