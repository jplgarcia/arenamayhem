import { Injectable } from '@angular/core';
import { Buffer } from 'buffer';
import { createClient, CartesiClient, Output } from '@cartesi/rpc';
import { environment } from '../../environments/environment';

(window as any).global = window;
(window as any).Buffer = Buffer;

@Injectable({
  providedIn: 'root'
})
export class GraphqlService {
  private client: CartesiClient;

  private dappAddress = environment.dappAddress;
  private rpcUrl = environment.rpcUrl;

  constructor() {
    this.client = createClient({ uri: this.rpcUrl });
  }

  getClient(): CartesiClient {
    return this.client;
  }

  /**
   * Fetch a single output by its global output_index.
   * In v2 outputs (vouchers/notices) are addressed by a global index.
   */
  async getOutputByIndex(outputIndex: number) {
    const result = await this.client.request('cartesi_getOutput', {
      application: this.dappAddress,
      output_index: `0x${outputIndex.toString(16)}` as `0x${string}`
    });
    return result.data;
  }

  /**
   * Compatibility shim: fetch output to execute as voucher.
   * The `outputIndex` here is the global output_index stored on the Output object.
   */
  async getVoucherWithProof(outputIndex: number, _inputIndex: number) {
    return this.getOutputByIndex(outputIndex);
  }

  /**
   * List all voucher-type outputs for this application.
   */
  async getVouchers() {
    const result = await this.client.request('cartesi_listOutputs', {
      application: this.dappAddress,
      limit: 200,
      offset: 0
    });
    if (!result || !result.data) return [];
    // Filter to Voucher type only
    return result.data.filter((o: Output) => o.decoded_data.type === 'Voucher');
  }

  /**
   * List all reports for this application.
   */
  async getReports() {
    const result = await this.client.request('cartesi_listReports', {
      application: this.dappAddress,
      limit: 200,
      offset: 0
    });
    if (!result || !result.data) return [];
    return result.data;
  }

  /**
   * List all notice-type outputs for this application.
   */
  async getNotices() {
    const result = await this.client.request('cartesi_listOutputs', {
      application: this.dappAddress,
      limit: 200,
      offset: 0
    });
    console.log(result);
    if (!result || !result.data) return [];
    // Filter to Notice type only
    return result.data.filter((o: Output) => o.decoded_data.type === 'Notice');
  }

  async getUserBattles(user: string) {
    let notices = await this.getNotices();
    let list: any = [];
    notices.map((output: Output) => {
      if (output.decoded_data.type !== 'Notice') return;
      const payload = output.decoded_data.payload;
      try {
        let str = Buffer.from(payload.substring(2), 'hex').toString('utf8');
        let json = JSON.parse(str);
        if (!json.rounds) return;
        if ((json.owner_id && json.owner_id.toLowerCase() === user.toLowerCase()) ||
            (json.opponent_id && json.opponent_id.toLowerCase() === user.toLowerCase())) {
          list.push(json);
        }
      } catch (e) {
        // skip unparseable payloads
      }
    });
    console.log(list);
    return list;
  }

  async getUserVouchers(user: string) {
    let vouchers = await this.getVouchers();
    if (!vouchers) return [];
    let list: any[] = [];
    let userHash = user.toLowerCase().substring(2);
    vouchers.map((output: Output) => {
      if (output.decoded_data.type !== 'Voucher') return;
      const voucher = output.decoded_data;
      if (voucher.payload.toLowerCase().includes(userHash) ||
          voucher.destination.toLowerCase().includes(userHash)) {
        list.push({
          // Expose fields expected by WithdrawVoucherComponent
          index: parseInt(output.index, 16),
          input_index: parseInt(output.input_index, 16),
          output_index: parseInt(output.index, 16), // global index for getOutputByIndex
          destination: voucher.destination,
          payload: voucher.payload,
          execution_transaction_hash: output.execution_transaction_hash,
          // Full output object needed for executeOutput()
          output: output
        });
      }
    });
    console.log(list);
    return list;
  }

  /**
   * Check if a voucher has already been executed on-chain.
   * In v2 this is reflected by execution_transaction_hash being non-null.
   */
  async wasVoucherExecuted(_inputIndex: number, outputIndex: number): Promise<boolean> {
    try {
      const output = await this.getOutputByIndex(outputIndex);
      return output.execution_transaction_hash !== null;
    } catch {
      return false;
    }
  }
}
