// lib/inspect.ts – Cartesi v2 inspect (POST /inspect/<app>)
import axios from 'axios';
import { config } from './config';

function hexToUtf8(hex: string): string {
  const h = hex.startsWith('0x') ? hex.slice(2) : hex;
  return Buffer.from(h, 'hex').toString('utf8');
}

async function inspect(route: string): Promise<any> {
  return axios.post(
    `/inspect/${config.dappId}`,
    route,
    { headers: { 'Content-Type': 'text/plain' } },
  );
}

/** Generic inspect GET – returns the first report payload as a UTF-8 string. */
export async function inspectGet(route: string): Promise<string> {
  const res = await inspect(route);
  if (!res?.data?.reports?.length) return '';
  return hexToUtf8(res.data.reports[0].payload);
}

/** Returns the in-app ERC-20 balance (as a string, in wei). */
export async function getERC20Balance(user: string, token: string): Promise<string> {
  const res = await inspect(`balance/erc20/${user}/${token}`);
  if (!res?.data?.reports?.length) return '0';
  const json = JSON.parse(hexToUtf8(res.data.reports[0].payload));
  return json.amount?.toString() ?? '0';
}

/** Returns the in-app Ether balance (as a string, in wei). */
export async function getEtherBalance(user: string): Promise<string> {
  const res = await inspect(`balance/ether/${user}`);
  if (!res?.data?.reports?.length) return '0';
  const json = JSON.parse(hexToUtf8(res.data.reports[0].payload));
  return json.amount?.toString() ?? '0';
}
