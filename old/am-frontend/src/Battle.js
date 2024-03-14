import React, {useState, useEffect} from 'react';
import './Battle.css';

function Battle({roundsLog, players}) {
    const [winner, setWinner] = useState(null)

    const setPlayerHP = (player, hp) => {
        let bar
        if (player === 0) {
            bar = document.getElementById("hp1-bar")
        } else {
            bar = document.getElementById("hp2-bar")
        }
        if (hp < 0)
        hp = 0
        bar.style.width = (200 * (hp/100)) + "px"
      };
    
    const playerImgObject = (player) => {
        let img
        if (player === 0) {
            img = document.getElementById("player1")
        } else {
            img = document.getElementById("player2")
        }
        return img
    }
    
    const animate = (animation, player, weapon) => {
        let animationName = animation
        if (animation === "advance"){
            animationName = "run"
        } else if (animation === "retreat"){
            animationName = "walk"
        }
        let img = playerImgObject(player)
        img.style.animationName = weapon.toLowerCase() + "-" + animationName
        if (animation === "advance") {
            img.classList.add("advanced")
        } else if (animation === "retreat") {
            img.classList.remove("advanced")
        }
      };
    


    function preload() {
        const rows2 = [];   
        for (const animation of animations) {
            for (const weapon of weapons) {
                for (let index = 0; index < 10; index++) {
                    
                    let url = "./images/" + weapon + "/" + animation +"_00" + index + ".png"
                    rows2.push(<link rel="preload" as="image" href={require(`${url}`)} />)
                }
            }
        }
        return rows2
    }

    const Fight = async (input, players) => {

        console.log("inside fight()", players)
        setPlayerHP(0, 100)
        setPlayerHP(1, 100)
        animate("retreat", 0, players[0].weapon)
        animate("retreat", 1, players[1].weapon)
        animate("idle", 0, players[0].weapon)
        animate("idle", 1, players[1].weapon)
        await new Promise(r => setTimeout(r, 1000))
        await new Promise(r => setTimeout(r, 1000))
        await new Promise(r => setTimeout(r, 1000))
        await new Promise(r => setTimeout(r, 1000))

    
        let iterations = input.length;
        console.log("Total iterations", iterations);
        
        for (let round of input) {
            const advancer = round[0].attacker_id
            
            animate("advance", advancer, players[advancer].weapon)
            await new Promise(r => setTimeout(r, 1000))

            for (const turn of round) {
                const striker = turn.attacker_id
                const other = striker === 0 ? 1 : 0

                animate("attack", striker, players[striker].weapon)
                animate("hurt", other, players[other].weapon)
                setPlayerHP(other, turn.defender_hp)
                await new Promise(r => setTimeout(r, 1000))

                animate("idle", striker, players[striker].weapon)
                animate("idle", other, players[other].weapon)
            }

            if (!--iterations) {
                // last round
                //gotta check who was the last to strike to see the winner
                const lastTurn = round.length - 1
                const winner = round[lastTurn].attacker_id
                setWinner(players[winner].name)
                const loser = winner === 0 ? 1 : 0
                animate("jump", winner, players[winner].weapon)
                animate("die", loser, players[loser].weapon)
                await new Promise(r => setTimeout(r, 1000))

                animate("dead", loser, players[loser].weapon)
                await new Promise(r => setTimeout(r, 1000))

                animate("idle", winner, players[winner].weapon)
            } else {
                animate("retreat", advancer, players[advancer].weapon)
                await new Promise(r => setTimeout(r, 1000))

                animate("idle", advancer, players[advancer].weapon)
            }
        }  
            
    }
            
    useEffect(() => {
        // Trigger the fight function when the component mounts
        Fight(roundsLog, players);
    }, []); // dependency array ensures it runs when input changes
    
    let arr = []
        
    let weapons = ["sword", "axe", "lance"]
    let animations = [
        "ATTACK", "RUN", "IDLE",
        "WALK", "HURT", "DIE", "JUMP"
    ]

    

    return(
        <div className='arena-main'>
            <h1>Battle Arena</h1>
            { 
                preload().map( (url) => url)
            }
            
            <div className='arena'>
                <div id="hp1-box" className="hp-box">
                    <div id="hp1-bar" className="hp-bar">
                    <p className='player-name'>{players[0].name}</p>
                    </div>
                </div>
                <div id="hp2-box" className="hp-box">
                    <div id="hp2-bar" className="hp-bar">
                    <p className='player-name'>{players[1].name}</p>
                    </div>
                </div>
                <div id="player1" className="fighter"></div>
                <div id="player2" className="fighter flipped right"></div>
            </div>
            {winner ? (<h3 className='winner'>⚔️ Winner ⚔️ <h3 className='winner-name'>{winner}</h3></h3>) : ("")}
        </div>
    )
};
export default Battle;