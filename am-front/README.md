# Arena Mayhem DApp Front-end Template

This project contains the frontend for arena mayhem it is based on the project template: https://github.com/jplgarcia/cartesi-angular-frontend. 
It is designed to integrate the functions seamlessly with Cartesi's off-chain computations while providing a user-friendly interface for interacting with the blockchain.

## Features

- **Onboard Integration**: Utilizes [Onboard.js](https://www.blocknative.com/onboard) for streamlined wallet connection and management, making it easy for users to log in with MetaMask and other popular wallets.
- **Ethers.js Integration**: Leverages [Ethers.js](https://docs.ethers.io/v5/) for interacting with Ethereum contracts, enabling a wide range of blockchain operations directly from the frontend.
- **Generic DApp Interaction**: The homepage is built to work with any Cartesi DApp, offering integration with ERC20 tokens for staking on fights.
- **Voucher Execution**: Supports the execution of vouchers, allowing to withdraw assets.
- **Asset Management**: An assets page equipped with features for transferring and withdrawing assets, compatible with examples from npm `cartesi-wallet` and the Python package `cartesi-wallet`. These can be explored in the repositories also it is completely compatible with the back end provided in this same repostory:
  - Node.js: [cartesi-asset-examples](https://github.com/jplgarcia/cartesi-asset-examples)
  - Python: [python-wallet](https://github.com/jplgarcia/python-wallet)
  - Backend: [arena-mayhem](https://github.com/jplgarcia/arenamayhem/am-node)
- **Sunodo Integration**: Default addresses are set for Sunodo, simplifying the setup for developers:
  - DApp Address: `0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C`
  - DApp Relay Address: `0xF5DE34d6BbC0446E2a45719E718efEbaaE179daE`
  - Input Address: `0x59b22D57D4f067708AB0c00552767405926dc768`
  - Ether Portal Address: `0xFfdbe43d4c855BF7e0f105c400A50857f53AB044`
  - ERC20 Portal Address: `0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB`
  - ERC721 Portal Address: `0x237F8DD094C0e47f4236f12b4Fa01d6Dae89fb87`
  - Sunodo Token Address: `0xae7f61eCf06C65405560166b259C54031428A9C4`

## Configuration

To customize blockchain interactions, modify the configuration in `src/app/service/ethereum.service.ts`. This includes changing wallet addresses and adjusting contract interactions as needed for your DApp.

## Inspect and GraphQL Calls

- **Inspect Calls**: For blockchain inspect calls, check `src/app/service/http.service.ts`, which uses Axios for HTTP GET requests. The default URL is set for Sunodo: `http://localhost:8080/inspect/`.
- **GraphQL Calls**: Located in `src/app/service/graphql.service.ts`, this service provides predefined GraphQL queries using URQL, such as fetching reports, notices, vouchers, and executing specific vouchers. Voucher execution logic is handled in `ethereum.service`.

## Getting Started

To run the application:

1. Install dependencies with `npm install`.
2. Start the Angular development server with `ng serve`.
3. Open `http://localhost:4200/` in your browser to view the DApp.

IMPORTANT: It needs the [arena-mayhem-backend](https://github.com/jplgarcia/arenamayhem/am-node) running with sunodo to work

## Contribution

Feel free to contribute to the repository by submitting pull requests or creating issues for bugs and feature requests.

---

## Angular info

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.2.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
