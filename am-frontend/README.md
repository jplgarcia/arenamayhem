# Getting Started with Arena Mayhem - A Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Install all dependencies and start  the application
Inside the root directory of the project, hit the following commands.

```npm install```<br>
```npm start```

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### Sending inputs

**@ethersproject/providers**: We use `ethers` library to communicate with Cartesi rollups on-chain smart contracts.

**@cartesi/rollups**: To save you the hassle of creating some generic smart contracts in solidity, we have a package to get the all the contracts and respective ABIs. In this project we’ll use `ERC20Portal` and `InputBox` contracts.

### Reading outputs

Cartesi rollups framework uses GraphQL server in the node to help developers query outputs of a dapp. This project uses Apollo graphql client.

### Components

Arena Mayhem front-end is divided into 4 main components that interact with each other. You can find respective .js files in `.src/<component-name>.js` directory.
1. App - Parent component that loads when you start the application
2. GenerateCharacter - Input form that sends character data to the blockchain and read by the backend node.
3. RenderNotices - To fetch the output from backend node
4. Battle - This is where we simulate the automated battle as per payload recieved from the backend.

This project is a work in progress. Any contributions are highly appreciated. 🙏