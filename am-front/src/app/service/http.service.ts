import { Injectable } from '@angular/core';
import { Buffer } from 'buffer';
import axios from 'axios';
import { environment } from '../../environments/environment';

(window as any).global = window;
(window as any).Buffer = Buffer;

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private dappAddress = environment.dappAddress;
  public balance = 0

  constructor() { }

  /** v2 inspect: POST /inspect/<app> with route as binary body */
  private async inspect(route: string): Promise<any> {
    return axios.post(
      `/inspect/${this.dappAddress}`,
      route,
      { headers: { 'Content-Type': 'text/plain' } }
    );
  }

  async get(route: string) {
    let balanceObject = await this.inspect(route);

    if (!balanceObject || !balanceObject.data || !balanceObject.data.reports) {
      return ""
    }

    let payload = balanceObject.data.reports[0].payload
    let str = Buffer.from(payload.substr(2), "hex").toString("utf8")
    return str
  }

  async getERC20Balance(user: string, token: string) {
    let balanceObject = await this.inspect(`balance/erc20/${user}/${token}`);

    if (!balanceObject || !balanceObject.data || !balanceObject.data.reports) {
      return 0
    }

    let payload = balanceObject.data.reports[0].payload
    let str = Buffer.from(payload.substr(2), "hex").toString("utf8")
    let json = JSON.parse(str)
    this.balance = json.amount.toString()
    return json.amount.toString()
  }

  async getEtherBalance(user: string) {
    let balanceObject = await this.inspect(`balance/ether/${user}`);

    if (!balanceObject || !balanceObject.data || !balanceObject.data.reports) {
      return 0
    }

    let payload = balanceObject.data.reports[0].payload
    let str = Buffer.from(payload.substr(2), "hex").toString("utf8")
    let json = JSON.parse(str)
    this.balance = json.amount.toString()
    return json.amount.toString()
  }
}
