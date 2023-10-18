import React, { useState } from 'react';

function GenerateCharacter({ onCharacterGenerated }) {
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
      // TODO - submit jsondata on-chain
      console.log('Form submitted successfully.', jsonData);
      console.log('Selected weapon:', formData.weapon);
    }
  };
/*
  const addInputOnchain = async  => {
    
        try {
            let payload = ethers.utils.toUtf8Bytes(str);
            if (hexInput) {
                payload = ethers.utils.arrayify(str);
            }
            rollups.inputContract.addInput(rollups.dappContract.address, payload);
        } catch (e) {
            console.log(`${e}`);
        } 
}; */
  
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
            <option value="spear">Dagger</option>
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
