import React, { useEffect, useState } from "react";
import './App.css';
import GenerateCharacter from'./GenerateCharacter.js'
import StakeTokens from "./StakeTokens";
//import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
//import { Switch } from 'react-router';

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [characterGenerated, setCharacterGenerated] = useState(false);

  const checkIfWalletIsConnected = async () => {
    /** First make sure we have access to window.ethereum */
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      /** Check if we're authorized to access the user's wallet */
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }

    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

    } catch (error) {
      console.log(error)
    }
  }

  /** This runs our function when the page loads.*/
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

// Callback function to update characterGenerated
const handleCharacterGenerated = () => {
  setCharacterGenerated(true);
};

  return (
    <div>
    {currentAccount ? (
      characterGenerated ? (
        <StakeTokens />
      ) : (
        <GenerateCharacter onCharacterGenerated={handleCharacterGenerated} />
      )
    ) : (
      <div>
        <h1>Welcome to ArenaMayhem</h1>
        <button onClick={connectWallet}>Connect Wallet</button>
      </div>
    )}
  </div>
  );
}

export default App;
