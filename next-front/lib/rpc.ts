// lib/rpc.ts – @cartesi/rpc JSON-RPC helpers
import { createClient, type Output } from '@cartesi/rpc';
import { config } from './config';

function hexToUtf8(hex: string): string {
  const h = hex.startsWith('0x') ? hex.slice(2) : hex;
  return Buffer.from(h, 'hex').toString('utf8');
}

function makeClient() {
  return createClient({ uri: config.rpcUrl });
}

// ── Raw output listing ──────────────────────────────────────────────────────

export async function listAllOutputs(): Promise<Output[]> {
  const client = makeClient();
  const res = await client.request('cartesi_listOutputs', {
    application: config.dappId,
    limit: 200,
    offset: 0,
  });
  return res?.data ?? [];
}

export async function listAllReports(): Promise<any[]> {
  const client = makeClient();
  const res = await client.request('cartesi_listReports', {
    application: config.dappId,
    limit: 200,
    offset: 0,
  });
  return res?.data ?? [];
}

export async function getOutputByIndex(outputIndex: number): Promise<Output> {
  const client = makeClient();
  const res = await client.request('cartesi_getOutput', {
    application: config.dappId,
    output_index: `0x${outputIndex.toString(16)}` as `0x${string}`,
  });
  return res.data;
}

// ── Typed helpers ───────────────────────────────────────────────────────────

export async function getVouchers(): Promise<Output[]> {
  const all = await listAllOutputs();
  return all.filter((o) => o.decoded_data?.type === 'Voucher');
}

export async function getNotices(): Promise<Output[]> {
  const all = await listAllOutputs();
  return all.filter((o) => o.decoded_data?.type === 'Notice');
}

// ── App-level helpers ────────────────────────────────────────────────────────

export interface BattleRecord {
  game_id: string;
  owner_id: string;
  opponent_id: string;
  fighters: any[];
  rounds: any[];
  winner?: string | { id: string | number; name: string };
  [key: string]: any;
}

export async function getUserBattles(user: string): Promise<BattleRecord[]> {
  const notices = await getNotices();
  const list: BattleRecord[] = [];
  for (const output of notices) {
    if (output.decoded_data?.type !== 'Notice') continue;
    try {
      const str = hexToUtf8(output.decoded_data.payload);
      const json = JSON.parse(str);
      if (!json.rounds) continue;
      const low = user.toLowerCase();
      if (json.owner_id?.toLowerCase() === low || json.opponent_id?.toLowerCase() === low) {
        list.push(json);
      }
    } catch {
      // skip
    }
  }
  return list;
}

export interface VoucherItem {
  index: number;
  input_index: number;
  output_index: number;
  destination: string;
  payload: string;
  execution_transaction_hash: string | null;
  output: Output; // full object for executeOutput
  method?: string;
  amount?: string;
}

export async function getUserVouchers(user: string): Promise<VoucherItem[]> {
  const vouchers = await getVouchers();
  const userHash = user.toLowerCase().replace('0x', '');
  const list: VoucherItem[] = [];
  for (const output of vouchers) {
    if (output.decoded_data?.type !== 'Voucher') continue;
    const v = output.decoded_data;
    if (
      v.payload?.toLowerCase().includes(userHash) ||
      v.destination?.toLowerCase().includes(userHash)
    ) {
      // try to decode method/amount if the payload looks like a JSON input
      let method: string | undefined;
      let amount: string | undefined;
      try {
        const parsed = JSON.parse(hexToUtf8(v.payload));
        method = parsed.method;
        amount = parsed.amount;
      } catch {}

      list.push({
        index: parseInt(output.index, 16),
        input_index: parseInt(output.input_index, 16),
        output_index: parseInt(output.index, 16),
        destination: v.destination,
        payload: v.payload,
        execution_transaction_hash: output.execution_transaction_hash ?? null,
        output,
        method,
        amount,
      });
    }
  }
  return list;
}
