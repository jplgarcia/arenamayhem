import React, { useState } from 'react';
import { JsonRpcProvider } from "@ethersproject/providers";
import { ethers } from 'ethers';
import { InputBox__factory } from "@cartesi/rollups";

function GenerateCharacter({ currentAccount, dappAddress, onCharacterGenerated }) {

  const HARDHAT_DEFAULT_MNEMONIC = "test test test test test test test test test test test junk";
  const HARDHAT_LOCALHOST_RPC_URL = "http://localhost:8545";
  const INPUTBOX_ADDRESS = "0x59b22D57D4f067708AB0c00552767405926dc768";
  const [formData, setFormData] = useState({
    attack: 0,
    defense: 0,
    speed: 0,
    healthPool: 0,
    weapon: 'none', 
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = parseInt(value, 10);

    if (!isNaN(newValue) && newValue >= 0 && newValue <= 40) {
      setFormData({
        ...formData,
        [name]: newValue,
      });
    }
  };

  const handleWeaponChange = (e) => {
    const weapon = e.target.value;
    setFormData({
      ...formData,
      weapon,
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const total = formData.attack + formData.defense + formData.speed + formData.healthPool;
    if (total !== 100) {
      console.log('Total points must equal 100. Please adjust your allocations.');
    } else {
      onCharacterGenerated(); //fallback function to render staking component
      const jsonData = JSON.stringify(formData);
      console.log('Form submitted successfully.', jsonData);
      console.log('Selected weapon:', formData.weapon);
      addInputOnchain(jsonData)
    }
  };

  const addInputOnchain = async (str)  => {
    
        // Start a connection
        //const provider = new JsonRpcProvider(HARDHAT_LOCALHOST_RPC_URL);
        /* const signer = ethers.HDNodeWallet.fromMnemonic(
            HARDHAT_DEFAULT_MNEMONIC,
            `m/44'/60'/0'/0/0`
        ).connect(provider); */
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();  

        // Instantiate the InputBox contract
        const inputBox = InputBox__factory.connect(
            INPUTBOX_ADDRESS,
            signer
        );

        // Encode the input
        /* const payload = ethers.isBytesLike(str)
            ? str
            : ethers.toUtf8Bytes(str); */
        const payload = ethers.toUtf8Bytes(str);

        // Send the transaction
        const tx = await inputBox.addInput(dappAddress, payload);
        console.log(`transaction: ${tx.hash}`);

        // Wait for confirmation
        console.log("waiting for confirmation...")
        const receipt = await tx.wait(1)
        console.log("receipt generated...", receipt)
  };
  
; 


  return (
    <div>
      <h1>Generate your player</h1>
      <div>
    <p>Allocate a total of 100 points among the following attributes (maximum 40 points per attribute).</p>
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="attack">Attack:</label>
        <input type="number" id="attack" name="attack" value={formData.attack} onChange={handleInputChange} min="0" max="40" />
      </div>
      <div>
        <label htmlFor="defense">Defense:</label>
        <input type="number" id="defense" name="defense" value={formData.defense} onChange={handleInputChange} min="0" max="40" />
      </div>
      <div>
        <label htmlFor="speed">Speed:</label>
        <input type="number" id="speed" name="speed" value={formData.speed} onChange={handleInputChange} min="0" max="40" />
      </div>
      <div>
        <label htmlFor="healthPool">Health Pool:</label>
        <input type="number" id="healthPool" name="healthPool" value={formData.healthPool} onChange={handleInputChange} min="0" max="40" />
      </div>
      <div>
          <label htmlFor="weapon">Select Weapon:</label>
          <select id="weapon" name="weapon" onChange={handleWeaponChange}>
            <option value="sword">Sword</option>
            <option value="spear">Spear</option>
            <option value="axe">Axe</option>
          </select>
        </div>
      <button type="submit">Generate Character</button>
      <button type="reset">Reset</button>
    </form>
  </div>

  </div>
  );
}

export default GenerateCharacter;
