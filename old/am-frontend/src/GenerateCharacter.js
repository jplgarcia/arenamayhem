import React, { useState } from 'react';
import { ethers } from 'ethers';
import { InputBox__factory } from "@cartesi/rollups";
import './GenerateCharacter.css';

function GenerateCharacter({ currentAccount, dappAddress, onCharacterGenerated }) {

  //const HARDHAT_DEFAULT_MNEMONIC = "test test test test test test test test test test test junk";
  //const HARDHAT_LOCALHOST_RPC_URL = "http://localhost:8545";
  const INPUTBOX_ADDRESS = "0x59b22D57D4f067708AB0c00552767405926dc768";
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: 'user',
    atk: 0,
    spd: 0,
    def: 0,
    hp: 0,
    weapon: 'none', 
  })
  const cpuCharacter = {
    name: 'CPU',
    atk: 25,
    spd: 25,
    def: 25,
    hp: 25,
    weapon: 'Lance',
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'name' || name === 'weapon') {
      setFormData({
        ...formData,
        [name]: value,
      });
    } else {
      const newValue = parseInt(value, 10);
      if (!isNaN(newValue) && newValue >= 0 && newValue <= 40) {
        setFormData({
          ...formData,
          [name]: newValue,
        });
      }
    }
  };

  const handleWeaponSelection = (e) => {
    const weapon = e;
    setFormData({
      ...formData,
      weapon,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total = formData.atk + formData.def + formData.spd + formData.hp;
    if (total !== 100) {
      console.log('Total points must equal 100. Please adjust your allocations.');
    } else {
      try {
        setLoading(true);
        const characters = [formData, cpuCharacter]
        const characterDataJSON = {
          characters: characters,
        };
        const jsonData = JSON.stringify(characterDataJSON, null, 2);
        console.log('Form submitted successfully.', jsonData);
        console.log('Selected weapon:', formData.weapon);
        //adding 
        await addInputOnchain(jsonData)
        onCharacterGenerated(formData); //fallback function to send data back to parent component - App

      }
      catch (error) {
        console.error('Error submitting the form:', error);
      } finally {
        setLoading(false); // Clear loading, whether successful or not
      }
    }
  };

  const addInputOnchain = async (str)  => {
      try{
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
        console.log("payload is : ", payload)
        // Send the transaction
        const tx = await inputBox.addInput(dappAddress, payload);
        console.log(`transaction: ${tx.hash}`)

        // Wait for confirmation
        console.log("waiting for confirmation...")
        const receipt = await tx.wait(1)
        console.log("receipt generated...", receipt)
      }
      catch (error) {
        console.error('Error adding input on chain:', error);
        throw error; 
      }
  };
  
; 
  return (
    <div className='main-div'>
      <h1>⚔️ Generate your player ⚔️</h1>
      <div>
        <p><i>Distribute a total of 100 points among the following attributes,<br></br> with a maximum of 40 points allowed for each attribute.</i></p>
        <form onSubmit={handleSubmit}>
        <div className='formContainer'>
          <div className='label-input'>
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} />
          </div>
          <div className='label-input'>
            <label htmlFor="atk">Attack</label>
            <input type="number" id="atk" name="atk" value={formData.atk} onChange={handleInputChange} min="0" max="40" />
          </div>
          <div className='label-input'>
            <label htmlFor="def">Defense</label>
            <input type="number" id="def" name="def" value={formData.def} onChange={handleInputChange} min="0" max="40" />
          </div>
          <div className='label-input'>
            <label htmlFor="spd">Speed</label>
            <input type="number" id="spd" name="spd" value={formData.spd} onChange={handleInputChange} min="0" max="40" />
          </div>
          <div className='label-input'>
            <label htmlFor="hp">Health Pool</label>
            <input type="number" id="hp" name="hp" value={formData.hp} onChange={handleInputChange} min="0" max="40" />
          </div>
        </div>
      <div className='weapons'>
        <h2>Select Weapon</h2>
        <img
              src={require("./images/axe/IDLE_000.png")} 
              alt="Axe" title="Axe"
              onClick={() => handleWeaponSelection('Axe')}
              className={`weapon-image ${formData.weapon === 'Axe' ? 'selected' : ''}`}
            />
            <img
              src={require("./images/lance/IDLE_000.png")}  
              alt="Lance" title="Lance"
              onClick={() => handleWeaponSelection('Lance')}
              className={`weapon-image ${formData.weapon === 'Lance' ? 'selected' : ''}`}
            />
            <img
              src={require("./images/sword/IDLE_000.png")}
              alt="Sword" title="Sword"
              onClick={() => handleWeaponSelection('Sword')}
              className={`weapon-image ${formData.weapon === 'Sword' ? 'selected' : ''}`}
            />
      </div>
      <button className='generateButton' type="submit">Generate</button>
      {loading ? (<p className='loading-text'>Loading...</p>) : ("")}
    </form>
  </div>

  </div>
  );
}

export default GenerateCharacter;
