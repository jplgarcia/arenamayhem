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

    const [input, setInput] = useState([[{'attacker_id': 1, 'attacker_name': 'DPS', 'defender_name': 'TANK', 'damage': 20, 'defender_hp': 86.66666666666667}, {'attacker_id': 0, 'attacker_name': 'TANK', 'defender_name': 'DPS', 'damage': 20, 'defender_hp': 80.0}, {'attacker_id': 1, 'attacker_name': 'DPS', 'defender_name': 'TANK', 'damage': 20, 'defender_hp': 73.33333333333333}], [{'attacker_id': 0, 'attacker_name': 'TANK', 'defender_name': 'DPS', 'damage': 22, 'defender_hp': 58.0}, {'attacker_id': 1, 'attacker_name': 'DPS', 'defender_name': 'TANK', 'damage': 22, 'defender_hp': 58.666666666666664}, {'attacker_id': 1, 'attacker_name': 'DPS', 'defender_name': 'TANK', 'damage': 22, 'defender_hp': 44.0}], [{'attacker_id': 1, 'attacker_name': 'DPS', 'defender_name': 'TANK', 'damage': 25, 'defender_hp': 27.333333333333332}, {'attacker_id': 0, 'attacker_name': 'TANK', 'defender_name': 'DPS', 'damage': 24, 'defender_hp': 34.0}, {'attacker_id': 1, 'attacker_name': 'DPS', 'defender_name': 'TANK', 'damage': 25, 'defender_hp': 10.666666666666666}], [{'attacker_id': 0, 'attacker_name': 'TANK', 'defender_name': 'DPS', 'damage': 28, 'defender_hp': 6.0}, {'attacker_id': 1, 'attacker_name': 'DPS', 'defender_name': 'TANK', 'damage': 29, 'defender_hp': -8.666666666666666}]])

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
    
    let images = [];
    function preload() {
        let weapons = ["sword", "axe", "lance"]
        let animations = [
            "ATTACK",
            "RUN",
            "IDLE",
            "WALK",
            "HURT",
            "DIE",
            "JUMP"
        ]

        for (const animation of animations) {
            for (const weapon of weapons) {
                for (let index = 0; index < 10; index++) {
                    let image = new Image()
                    image.src = "images/" + weapon + "/" + animation +"_00" + index + ".png"
                    images.push(image)
                }
            }
        }
    }
    preload()
    

    const Fight = async (input, players) => {
        

        console.log("inside fight()", players)
        setPlayerHP(0, 100)
        setPlayerHP(1, 100)
        animate("retreat", 0, players[0].Weapon)
        animate("retreat", 1, players[1].Weapon)
        animate("idle", 0, players[0].Weapon)
        animate("idle", 1, players[1].Weapon)
        await new Promise(r => setTimeout(r, 1000))
        await new Promise(r => setTimeout(r, 1000))

    
        let iterations = input.length;
        console.log("Total iterations", iterations);
        
        for (let round of input) {
            const advancer = round[0].attacker_id
            
            animate("advance", advancer, players[advancer].Weapon)
            await new Promise(r => setTimeout(r, 1000))

            for (const turn of round) {
                const striker = turn.attacker_id
                const other = striker === 0 ? 1 : 0

                animate("attack", striker, players[striker].Weapon)
                animate("hurt", other, players[other].Weapon)
                setPlayerHP(other, turn.defender_hp)
                await new Promise(r => setTimeout(r, 1000))

                animate("idle", striker, players[striker].Weapon)
                animate("idle", other, players[other].Weapon)
            }

            if (!--iterations) {
                // last round
                //gotta check who was the last to strike to see the winner
                const lastTurn = round.length - 1
                const winner = round[lastTurn].attacker_id
                const loser = winner === 0 ? 1 : 0
                animate("jump", winner, players[winner].Weapon)
                animate("die", loser, players[loser].Weapon)
                await new Promise(r => setTimeout(r, 1000))

                animate("dead", loser, players[loser].Weapon)
                await new Promise(r => setTimeout(r, 1000))

                animate("idle", winner, players[winner].Weapon)
            } else {
                animate("retreat", advancer, players[advancer].Weapon)
                await new Promise(r => setTimeout(r, 1000))

                animate("idle", advancer, players[advancer].Weapon)
            }
        }  
            
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