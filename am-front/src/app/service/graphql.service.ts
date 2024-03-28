import { Injectable } from '@angular/core';
import { Buffer } from 'buffer';
import { createClient, Client, cacheExchange, fetchExchange } from 'urql';


(window as any).global = window;
(window as any).Buffer = Buffer;

@Injectable({
  providedIn: 'root'
})
export class GraphqlService {
  private client: Client;

  constructor() {
    this.client = createClient({
      url: 'https://am-sepolia.fly.dev/graphql',
      exchanges: [ fetchExchange]
    });
  }

  getClient(): Client {
    return this.client;
  }

  async getVoucherWithProof(voucherIndex: Number, inputIndex: Number) {
    const query = `
    query GetVoucher($voucherIndex: Int!,  $inputIndex: Int!) {   
      voucher( voucherIndex: $voucherIndex,  inputIndex: $inputIndex) {
        index
        input{
          index
          payload
        }
        destination
        payload
        proof{
          validity{
            inputIndexWithinEpoch
            outputIndexWithinInput
            outputHashesRootHash
            vouchersEpochRootHash
            noticesEpochRootHash
            machineStateHash
            outputHashInOutputHashesSiblings
            outputHashesInEpochSiblings
          }
          context
        }
      }
    }
    `;

    let result = await (this.client.query(query, {
      "voucherIndex": voucherIndex,
      "inputIndex": inputIndex
    })).toPromise()
    
    return result.data.voucher
  }

  async getVouchers() {
    const query = `
    {   
      vouchers {
        edges {
          node {
            index
            input{
              index
              payload
            }
            payload
            proof{
              context
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
    `;

    let result = await (this.client.query(query, {})).toPromise()
    if (!result || !result.data.vouchers.edges){
      return []
    }
    return result.data.vouchers.edges
  }

  async getReports() {
    const query = `
    {
      reports {
        edges {
          node {
            input {
              index
            }
            index
            payload
          }
        }
      }
    }
    `;

    let result = await (this.client.query(query, {})).toPromise()
    if (!result || !result.data.reports.edges){
      return []
    }
    let reports = result.data.reports.edges
   
    return reports
  }

  async getNotices() {
    const query = `
    {
      notices {
        edges {
          node {
            index
            payload
          }
        }
      }
    }
    `;

    let result = await (this.client.query(query, {})).toPromise()
    console.log(result)
    if (!result || !result.data.notices.edges){
      return []
    }
    let reports = result.data.notices.edges
   
    return reports
  }

  async getUserBattles(user: string) {
    let notices = await this.getNotices()
    let list: any = []
    notices.map((item: any) => { 
      let newItem = item.node
      let str = Buffer.from(newItem.payload.substr(2), "hex").toString("utf8")
      let json = JSON.parse(str)
      if (!json.rounds) {
        return 
      }
      if ((json.owner_id && json.owner_id == user) || 
      (json.opponent_id && json.opponent_id == user)){
        list.push(json)
      }
    })
    console.log(list)
    return list
  }

  async getUserVouchers(user: string) {
    let vouchers = await this.getVouchers()
    if (!vouchers){
      return []
    }
    let list: any[] = []
    let userHash = user.toLowerCase().substring(2)
    vouchers.map((item: any) => {
      if (item.node.payload.toLowerCase().includes(userHash)){
        let newItem = item.node
        let str = Buffer.from(newItem.input.payload.substr(2), "hex").toString("utf8")
        let json = JSON.parse(str)
        let amount = json.amount.toString()
        newItem.amount = amount
        newItem.method = json.method
        list.push(newItem)
      }
    })
    console.log(list)
    return list
  }
}
