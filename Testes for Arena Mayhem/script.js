// Get a reference to the animation container
const container = document.getElementById("animation-container");

player1Sprites = []
player2Sprites = []

function listSprites(weapon, animation) {
    let sprites = []
    for (let i = 0; i < 10 ; i++) {
        sprites.push("img/" + weapon + "/" + animation + "_00" + i + ".png")
    }
    return sprites
}

player1Sprites = listSprites("sword", "IDLE")
player2Sprites = listSprites("axe", "IDLE")
console.log(player1Sprites)
console.log(player1Sprites)

let currentImageIndex = 0

async function animate() {
    const imagePlayer1 = new Image()
    imagePlayer1.style.width = "500px"
    imagePlayer1.src = player1Sprites[currentImageIndex]
    const x1 = (container.clientWidth - imagePlayer1.width)
    const y1 = (container.clientHeight - imagePlayer1.height)
    imagePlayer1.style.position = "absolute"
    imagePlayer1.style.left = x1 + 800 + "px"
    imagePlayer1.style.top = y1 + 200 + "px"

    const imagePlayer2 = new Image()
    imagePlayer2.style.width = "500px"
    imagePlayer2.src = player2Sprites[currentImageIndex]
    const x2 = (container.clientWidth - imagePlayer2.width)
    const y2 = (container.clientHeight - imagePlayer2.height)
    imagePlayer2.style.position = "absolute"
    imagePlayer2.style.left = x2 + 1100 + "px"
    imagePlayer2.style.top = y2 + 200 + "px"
    imagePlayer2.style.transform = "scaleX(-1)"

    // Add the image to the container
    container.appendChild(imagePlayer1)
    container.appendChild(imagePlayer2)

    // Move to the next image in the array
    currentImageIndex = (currentImageIndex + 1) % player1Sprites.length

    // Remove the image after a certain time
    setTimeout(() => {
        container.removeChild(imagePlayer1)
        container.removeChild(imagePlayer2)
    }, 100) // Adjust the time as needed

    // Repeat the animation
    setTimeout(() => {
        requestAnimationFrame(animate)
    }, 100) // Adjust the time as needed

    
}

// Start the animation
animate()
