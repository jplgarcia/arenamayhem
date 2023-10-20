import React, {useState, useEffect} from 'react';
import './Battle.css';

function Battle() {
    const [players, setPlayers] = useState([
        {
          Name: 'TANK',
          ATK: 20,
          SPD: 10,
          DEF: 40,
          HP: 30,
          Weapon: 'lance',
        },
        {
          Name: 'DPS',
          ATK: 40,
          SPD: 30,
          DEF: 10,
          HP: 20,
          Weapon: 'axe',
        },
      ]);

    const [input, setInput] = useState([[{'striker_number': 1, 'striker': 'DPS', 'target': 'TANK', 'damage': 20, 'targetHP': 86.66666666666667}, {'striker_number': 0, 'striker': 'TANK', 'target': 'DPS', 'damage': 20, 'targetHP': 80.0}, {'striker_number': 1, 'striker': 'DPS', 'target': 'TANK', 'damage': 20, 'targetHP': 73.33333333333333}], [{'striker_number': 0, 'striker': 'TANK', 'target': 'DPS', 'damage': 22, 'targetHP': 58.0}, {'striker_number': 1, 'striker': 'DPS', 'target': 'TANK', 'damage': 23, 'targetHP': 58.0}, {'striker_number': 1, 'striker': 'DPS', 'target': 'TANK', 'damage': 23, 'targetHP': 42.666666666666664}], [{'striker_number': 1, 'striker': 'DPS', 'target': 'TANK', 'damage': 27, 'targetHP': 24.666666666666668}, {'striker_number': 0, 'striker': 'TANK', 'target': 'DPS', 'damage': 26, 'targetHP': 32.0}, {'striker_number': 1, 'striker': 'DPS', 'target': 'TANK', 'damage': 27, 'targetHP': 6.666666666666667}], [{'striker_number': 0, 'striker': 'TANK', 'target': 'DPS', 'damage': 30, 'targetHP': 2.0}, {'striker_number': 1, 'striker': 'DPS', 'target': 'TANK', 'damage': 32, 'targetHP': -14.666666666666666}]])

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
    
    const Fight = (input, players) => {
        console.log("inside fight()", players)
        setPlayerHP(0, 100)
        setPlayerHP(1, 100)
        animate("retreat", 0, players[0].Weapon)
        animate("retreat", 1, players[1].Weapon)
        animate("idle", 0, players[0].Weapon)
        animate("idle", 1, players[1].Weapon)

        setTimeout(() => {
            setTimeout(() => {
              setTimeout(() => {
                let iterations = input.length;
                console.log("Total iterations", iterations);
                
                for (let round of input) {
                    const advancer = round[0].striker_number
                    
                    animate("advance", advancer, players[advancer].Weapon)
                    setTimeout(() => {
        
                    for (const turn of round) {
                        const striker = turn.striker_number
                        const other = striker === 0 ? 1 : 0
        
                        animate("attack", striker, players[striker].Weapon)
                        animate("hurt", other, players[other].Weapon)
                        setPlayerHP(other, turn.targetHP)
                        
                        setTimeout(() => {
                        animate("idle", striker, players[striker].Weapon)
                        animate("idle", other, players[other].Weapon)
                        }, 1000);
                    }
        
                    if (!--iterations) {
                        // last round
                        //gotta check who was the last to strike to see the winner
                        const lastTurn = round.length - 1
                        const winner = round[lastTurn].striker_number
                        const loser = winner === 0 ? 1 : 0
                        animate("jump", winner, players[winner].Weapon)
                        animate("die", loser, players[loser].Weapon)
                        setTimeout(() => {
                            animate("dead", loser, players[loser].Weapon)
                        setTimeout(() => {
                            animate("idle", winner, players[winner].Weapon)
                        }, 1000);
                        }, 3000);
                    }
                    else {
                        animate("retreat", advancer, players[advancer].Weapon)
                        setTimeout(() => {
                        animate("idle", advancer, players[advancer].Weapon)
                        }, 1000);
                    }
                    }, 1000);
                }  
                    
                }, 1000);
            }, 1000);
        }, 1000);
    }
    useEffect(() => {
    // Trigger the fight function when the component mounts
    Fight(input, players);
    }, []); // Empty dependency array ensures it runs only once on mount
    
return(
    <div>
    <h3>Battle Arena</h3>
    <div className='arena'>
        <p>checking</p>
        <div id="hp1-box" className="hp-box">
            <div id="hp1-bar" className="hp-bar"></div>
        </div>
        <div id="hp2-box" className="hp-box">
            <div id="hp2-bar" className="hp-bar"></div>
        </div>
        <div id="player1" className="fighter"></div>
        <div id="player2" className="fighter flipped right"></div>
    </div>
    </div>
)
};
export default Battle;