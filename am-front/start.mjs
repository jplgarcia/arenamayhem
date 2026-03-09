import { execSync } from "child_process";
import { writeFileSync } from "fs";

const dappAddress =
  process.env.DAPP_ADDRESS || "0x98a080974a8d29aeabb958f56b71debb3cae502e";
const nodeUrl = process.env.NODE_URL || "http://127.0.0.1:6751";
const chainId = parseInt(process.env.CHAIN_ID || "31337");
const erc20TokenAddress =
  process.env.ERC20_ADDRESS || "0x5138f529B77B4e0a7c84B77E79c4335D31938fed";

const content = `export const environment = {
  production: false,
  nodeUrl: '',
  rpcUrl: '/rpc',
  dappAddress: '${dappAddress}',
  erc20TokenAddress: '${erc20TokenAddress}',
  chainId: ${chainId},
};
`;

writeFileSync("src/environments/environment.ts", content);
console.log(`Starting with dappAddress=${dappAddress}`);

execSync("npx ng serve", { stdio: "inherit" });
