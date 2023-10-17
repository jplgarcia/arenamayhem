async function sleep(ms) {
    return setTimeout(resolve, ms);
}

player1 = document.getElementById("player1")
player1.classList.add(players[0].Weapon)
player2 = document.getElementById("player2")
player2.classList.add(players[1].Weapon)

// param player = 1 or 2
// param weapon = weapon name
async function advance(player, weapon) {
    let img
    if (player == 0) {
        img = document.getElementById("player1")
    } else {
        img = document.getElementById("player2")
    }
    console.log(img)
    img.style.animationName = weapon.toLowerCase() + "-run"
    img.classList.add("advanced")
}

async function retreat(player, weapon) {
    let img
    if (player == 0) {
        img = document.getElementById("player1")
    } else {
        img = document.getElementById("player2")
    }
    img.style.animationName = weapon.toLowerCase() + "-walk"
    img.classList.remove("advanced")
}

async function idle(player, weapon) {
    let img
    if (player == 0) {
        img = document.getElementById("player1")
    } else {
        img = document.getElementById("player2")
    }
    img.style.animationName = weapon.toLowerCase() + "-idle"
}

async function attack(player, weapon) {
    let img
    if (player == 0) {
        img = document.getElementById("player1")
    } else {
        img = document.getElementById("player2")
    }
    img.style.animationName = weapon.toLowerCase() + "-attack"
}

async function hurt(player, weapon) {
    let img
    if (player == 0) {
        img = document.getElementById("player1")
    } else {
        img = document.getElementById("player2")
    }
    img.style.animationName = weapon.toLowerCase() + "-hurt"
}

async function die(player, weapon) {
    let img
    if (player == 0) {
        img = document.getElementById("player1")
    } else {
        img = document.getElementById("player2")
    }
    img.style.animationName = weapon.toLowerCase() + "-die"
}

async function dead(player, weapon) {
    let img
    if (player == 0) {
        img = document.getElementById("player1")
    } else {
        img = document.getElementById("player2")
    }
    img.style.animationName = weapon.toLowerCase() + "-dead"
}

async function jump(player, weapon) {
    let img
    if (player == 0) {
        img = document.getElementById("player1")
    } else {
        img = document.getElementById("player2")
    }
    img.style.animationName = weapon.toLowerCase() + "-jump"
}

async function fight(input, players) {

    await new Promise(r => setTimeout(r, 1000))
    await new Promise(r => setTimeout(r, 1000))
    await new Promise(r => setTimeout(r, 1000))

    let iterations = input.length;

    for (let round of input) {
        const advancer = round[0].striker_number -1
        
        advance(advancer, players[advancer].Weapon)
        await new Promise(r => setTimeout(r, 1000))

        for (turn of round) {
            const striker = turn.striker_number - 1
            const other = striker == 0 ? 1 : 0

            attack(striker, players[striker].Weapon)
            hurt(other, players[other].Weapon)
            await new Promise(r => setTimeout(r, 1000))

            idle(striker, players[striker].Weapon)
            idle(other, players[other].Weapon)
            
        }

        if (!--iterations) {
            // last round
            //gotta check who was the last to strike to see the winner
            const lastTurn = round.length - 1
            const winner = round[lastTurn].striker_number - 1
            const loser = winner == 0 ? 1 : 0
            jump(winner, players[winner].Weapon)
            die(loser, players[loser].Weapon)
            await new Promise(r => setTimeout(r, 1000))
            jump(winner, players[winner].Weapon)
            dead(loser, players[loser].Weapon)
            await new Promise(r => setTimeout(r, 1000))
            idle(winner, players[winner].Weapon)
        }
        else {
            retreat(advancer, players[advancer].Weapon)
            await new Promise(r => setTimeout(r, 1000))
            idle(advancer, players[advancer].Weapon)
        }

    }
}

fight(input, players)

