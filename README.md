# Arena Mayhem Frontend

Welcome to Arena Mayhem! 

This app was developed as a proof of concept for a hackathon and later developed to an MVP version, bringing you an exciting world of gladiator battles and blockchain technology.

## Overview

Arena Mayhem offers an exhilarating fighting game that allows users to create their own gladiators and challenge their friends to epic battles. To enter the arena, participants stake a chosen amount of tokens, which is an ERC-20 token. It can be changed in to source code to the ones like like ETH, APE, or any other following the protocol.

### How it Works

1. **Betting and Staking:** Users set their bets using tokens, creating an enticing wager for the battle.
2. **Battle Commencement:** The battle issuer and challenger can enter the arena, and the Cartesi machine springs into action to execute a complex algorithm.
3. **Battle Log Generation:** The Cartesi machine generates a detailed battle log in JSON format, reflecting each gladiator's actions and statistics.
4. **Winner Takes All:** if the player's gladiator wins they can claim the prize.

### Why Cartesi?

We chose Cartesi to run the battle logic because it allows for the implementation of intricate and complex algorithms, which might be challenging to accomplish using the Solidity language.

### Witness the Battle

After the algorithm finishes its calculations and log generation, players can watch their gladiators in action through a captivating animation created with the Angular frontend. Every step of the fighters' attacks and the gradual decay of their health is displayed throughout the battle.

### Claim Your Victory

When the battle concludes, tokens are distributed within the application and can be easily withdrawn by the winner. Arena Mayhem is your gateway to a world of exhilarating battles, strategic gameplay, and the taste of victory!

## Technology Stack

- **Frontend**: The entire frontend is developed with Angular. All assets, including fonts, images, and sprites for animations, are sourced from the internet.

- **Backend**: The backend is developed using Python and runs inside the Cartesi machine.

- **Frontend-Backend Interaction**: The frontend interacts with the backend within the "am-node" directory, built with Sunodo.

## Getting Started

Each project comes with a dedicated README file, providing detailed instructions on how to run and interact with the applications.

So, gear up, step into the arena, and experience the thrill of Arena Mayhem!🏆🥊

---

*Note: This project is intended for educational and proof-of-concept purposes. Please use ERC-20 tokens responsibly and adhere to any relevant blockchain regulations.*