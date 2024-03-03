//Preload images to avoid flashing
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
                image.src = "/assets/img/" +weapon + "/" + weapon + "_" + animation +"_00" + index + ".png"
                images.push(image)
            }
        }
    }
}
//preload()

//
// player1 = document.getElementById("player1")
// player1.classList.add(players[0].weapon)
// player2 = document.getElementById("player2")
// player2.classList.add(players[1].weapon)


// param player = 1 or 2
// param weapon = weapon name

/*******************
*
*   SESSION: animations
*
********************/


/**
 * animate the bar changing with the % of new current HP
 * @param {*} player int player 0 = 1, 1 = 2
 * @param {*} hp int new HP in %. 0 - 100
 */
function setPlayerHP(player, hp) {
    console.log(player, hp)
    let bar
    if (player == 0) {
        bar = document.getElementById("hp1-bar")
    } else {
        bar = document.getElementById("hp2-bar")
    }
    if (hp < 0)
    hp = 0
    console.log(bar)
    bar.style.width = (200 * (hp/100)) + "px"
}

/**
 * auxiliar to get player element
 * @param {*} player  int player 0 = 1, 1 = 2
 * @returns element in the page corresponding to that player character
 */
function getPlayerImgObject(player) {
    let img
    if (player == 0) {
        img = document.getElementById("player1")
    } else {
        img = document.getElementById("player2")
    }
    return img
}


/**
 * triggers animation
 * @param {*} animation string type of animation: advance, retreat, attack, hurt, jump, die, dead, idle
 * @param {*} player int player 0 = 1, 1 = 2
 * @param {*} weapon string sword, lance, axe
 */
async function animate(animation, player, weapon) {
    let animationName = animation
    if (animation == "advance"){
        animationName = "run"
    } else if (animation == "retreat"){
        animationName = "walk"
    }
    let img = getPlayerImgObject(player)
    img.style.animationName = weapon.toLowerCase() + "-" + animationName
    if (animation == "advance") {
        img.classList.add("advanced")
    } else if (animation == "retreat") {
        img.classList.remove("advanced")
    }
}


/*******************
*
*   SESSION: fight funciton
*
********************/

async function fight(input, players) {
    setPlayerHP(0, 100)
    setPlayerHP(1, 100)
    animate("retreat", 0, players[0].weapon)
    animate("retreat", 1, players[1].weapon)
    animate("idle", 0, players[0].weapon)
    animate("idle", 1, players[1].weapon)

    await new Promise(r => setTimeout(r, 1000))
    await new Promise(r => setTimeout(r, 1000))
    await new Promise(r => setTimeout(r, 1000))

    let iterations = input.length;

    for (let round of input) {
        const advancer = round[0].attacker_id
        
        animate("advance", advancer, players[advancer].weapon)
        await new Promise(r => setTimeout(r, 1000))

        for (turn of round) {
            const striker = turn.attacker_id
            const other = striker == 0 ? 1 : 0

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
            const loser = winner == 0 ? 1 : 0
            animate("jump", winner, players[winner].weapon)
            animate("die", loser, players[loser].weapon)
            await new Promise(r => setTimeout(r, 1000))
            animate("dead", loser, players[loser].weapon)
            await new Promise(r => setTimeout(r, 3000))
            animate("idle", winner, players[winner].weapon)
        }
        else {
            animate("retreat", advancer, players[advancer].weapon)
            await new Promise(r => setTimeout(r, 1000))
            animate("idle", advancer, players[advancer].weapon)
        }

    }
}

//fight(input, players)

