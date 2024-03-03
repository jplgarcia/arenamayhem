import { Injectable } from '@angular/core';
import { Buffer } from 'buffer';
import axios from 'axios';

(window as any).global = window;
(window as any).Buffer = Buffer;

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private dappURL = "http://localhost:8080"
  public balance = 0
  
  constructor() { }

  async get(route:string) {
    let balanceObject = await axios.get(this.dappURL + "/inspect/" + route)
    
    if (!balanceObject || !balanceObject.data || !balanceObject.data.reports) {
      return ""
    }
  
    let payload = balanceObject.data.reports[0].payload
    let str = Buffer.from(payload.substr(2), "hex").toString("utf8")
    return str
    
  }

  async getERC20Balance(user:string, token: string) {
    let balanceObject = await axios.get(this.dappURL + 
      "/inspect/balance/erc20/" + user + 
      "/" + token)
    
    if (!balanceObject || !balanceObject.data || !balanceObject.data.reports) {
      return 0
    }
  
    let payload = balanceObject.data.reports[0].payload
    let str = Buffer.from(payload.substr(2), "hex").toString("utf8")
    let json = JSON.parse(str)
    this.balance = json.amount.toString()
    return json.amount.toString()
    
  }

  async getEtherBalance(user:string) {
    let balanceObject = await axios.get(this.dappURL + 
      "/inspect/balance/ether/" + user)
    
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
