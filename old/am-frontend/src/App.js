import React, { useEffect, useState } from "react";
import './App.css';
import GenerateCharacter from'./GenerateCharacter.js'
import StakeTokens from "./StakeTokens.js";
import Battle from './Battle.js';
import RenderNotices from "./RenderNotices.js";

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [characterGenerated, setCharacterGenerated] = useState(false);
  const [noticeGenerated, setNoticeGenerated] = useState(false)
  const [amountStaked, setAmountStaked] = useState(false);
  const [roundsLog, setRoundsLog] = useState("")
  const [userCharacter, setUserCharacter] = useState("")
  const [noticePayload, setNoticePayload] = useState("")
  const dappAddress = "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C"; //edit as per deployment
  const [players, setPlayers] = useState([
    {
      name: 'CPU', // Initialize CPU player
      atk: 25,
      spd: 25,
      def: 25,
      hp: 25,
      weapon: 'Axe',
    },
  ])

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
  const handleCharacterGenerated = (userData) => {
    console.log("user data from GC component: ", userData)
    setPlayers([userData, ...players])
    console.log("players set: ", players)
    setCharacterGenerated(true);
    setUserCharacter(userData)
  };

  // Callback function to update noticeGenerated
  const handleNoticeGenerated = (noticePayload) => {
    console.log("Notice Payload at App: ", noticePayload)
    const jsonString = `{${noticePayload}`;
    const payloadObject = JSON.parse(jsonString);
    console.log("Rounds log from obj: ", payloadObject.rounds)
    setRoundsLog(payloadObject.rounds);
    setNoticeGenerated(true)
  };

  const handleBettingSubmit = () => {
    setAmountStaked(true);
  };

  return (
    <div className="app-main">
    {currentAccount ? (
      characterGenerated ? (
        noticeGenerated ? (
          <Battle roundsLog={roundsLog} players={players} notice={noticePayload} />
        ) : (
          <div>
            <RenderNotices onNoticeGenerated={handleNoticeGenerated} /> 
          </div>
        ) 
      ) : (
        <div>
          <GenerateCharacter currentAccount={currentAccount} dappAddress={dappAddress} onCharacterGenerated={handleCharacterGenerated} /> 
        </div>
      )
    ) : (
      <div className="app-items">
        <h1>Arena Mayhem</h1>
        <p className="app-desc"><i>A decentralized automated fighter game where you can bet on players. <br></br> Connect your wallet, generate a character to play with and watch the battle simulation.</i></p>
        <button className='connectButton' onClick={connectWallet}>Connect Wallet</button>
      </div>
    )}
  </div>
  ); 
}

export default App;