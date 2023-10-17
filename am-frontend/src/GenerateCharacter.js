import React, { useState } from 'react';

function GenerateCharacter() {
  /* const [formData, setFormData] = useState({
    attack: 0,
    defense: 0,
    speed: 0,
    healthPool: 0, 
  }); */

  // Implement your character generation form and logic here

  return (
    <div>
      <h1>Generate your player</h1>
      <div>
    <p>Allocate a total of 100 points among the following attributes (maximum 40 points per attribute).</p>
    <form>
      <div>
        <label htmlFor="attack">Attack:</label>
        <input type="number" id="attack" name="attack" min="0" max="40" />
      </div>
      <div>
        <label htmlFor="defense">Defense:</label>
        <input type="number" id="defense" name="defense" min="0" max="40" />
      </div>
      <div>
        <label htmlFor="speed">Speed:</label>
        <input type="number" id="speed" name="speed" min="0" max="40" />
      </div>
      <div>
        <label htmlFor="healthPool">Health Pool:</label>
        <input type="number" id="healthPool" name="healthPool" min="0" max="40" />
      </div>
      <div>
          <label htmlFor="weapon">Select Weapon:</label>
          <select id="weapon" name="weapon">
            <option value="sword">Sword</option>
            <option value="dagger">Dagger</option>
            <option value="axe">Axe</option>
          </select>
        </div>
      <button type="submit">Generate Character</button>
      <button type="reset">Reset</button>
    </form>
    {/* Character summary can be displayed here as the user enters data. */}
  </div>

  </div>
  );
}

export default GenerateCharacter;
