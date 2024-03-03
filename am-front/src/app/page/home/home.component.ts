import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OnboardService } from '../../service/onboard.service';
import { EthereumService } from '../../service/ethereum.service';
import { HttpService } from '../../service/http.service';
import { GraphqlService } from '../../service/graphql.service';
import { VoucherComponent } from '../../dialog/voucher/voucher.component';
import { SHA256, enc } from 'crypto-js';
import { FighterComponent } from '../../dialog/fighter/fighter.component';
import { ethers } from 'ethers';
import { FightComponent } from '../../dialog/fight/fight.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatIcon,
    MatDialogModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.less'
})
export class HomeComponent {
  ctsiToBet: Number = 0
  etherDepositAmount: Number = 0
  sunodoDepositAmount: Number = 0
  nftAddress: string = ""
  nftId: Number = 0

  vouchers: any[] = []
  notices: any[] = []
  reports: any[] = []

  inspectRoute = ""
  inspectReply: any[] = []
  genericInput = ""

  userAddress = ""

  constructor(public onboardService: OnboardService,
      private ethereumService: EthereumService,
      private httpService: HttpService,
      private graphqlService: GraphqlService,
      public dialog: MatDialog) {

    this.userAddress = onboardService.getConnectedWallet()
  }

  createChallenge() {

    const dialogRef = this.dialog.open(FighterComponent, {
      width: '650px',
      data: {message: "You are creating a challenge" , value: this.ctsiToBet} // You can pass data to the dialog here
    });
    dialogRef.afterClosed().subscribe(result => {
      let fighter : any = result
      if (!fighter){
        return
      }
      
      let inputString = [fighter.name, fighter.weapon, fighter.hp, fighter.atk, fighter.def, fighter.spd].join("-")
      const fighter_hash = SHA256(inputString).toString(enc.Hex);
      this.submitGenericInput(JSON.stringify({
        method: "create_challenge",
        fighter_hash,
        token: this.ethereumService.getTokenAddres(),
        amount: ethers.utils.parseEther(`${this.ctsiToBet}`).toString()
      }))
      localStorage.setItem(fighter_hash, JSON.stringify(fighter))
    });
  }

  confirmFighter(report:any) {
    let fighterStr = localStorage.getItem(report.fighter_hash)
    let fighterBuild = null
    if (fighterStr) {
      fighterBuild = JSON.parse(fighterStr)
    }

    const dialogRef = this.dialog.open(FighterComponent, {
      width: '875px',
      height: '420px',
      data: {message: "You are starting the fight" , value: this.ctsiToBet, fighter: fighterBuild } // You can pass data to the dialog here
    });
    dialogRef.afterClosed().subscribe(async result => {
      let fighter : any = result
      if (!fighter){
        return
      }
      
      this.submitGenericInput(JSON.stringify({
        method: "start_match",
        fighter,
        challenge_id: report.id
      }))
      while(true) {
        let gqlreply = await this.graphqlService.getUserBattles(this.onboardService.getConnectedWallet())
        let notice
        for (let item of gqlreply) {
          if (item.challenge_id != report.challenge_id) {
            continue
          }
          notice = item    
        }
        if (notice) {
          console.log("FOUNDDD")
          console.log(notice)
          const dialogRef = this.dialog.open(FightComponent, {
            width: '650px',
            data: notice // You can pass data to the dialog here
          });
          break
        }
        await this.sleep()
      }

    });
  }

  sleep () {
    return new Promise(resolve=> setTimeout(resolve, 5000))
  }
  async inspectUserBattles() {
    let inspectReply = await this.httpService.get("user_battles/"+this.userAddress)
    this.inspectReply = JSON.parse(inspectReply)
    console.log(this.inspectReply)
  }

  async submitGenericInput(inputObj: any) {
    await this.ethereumService.initEthereum();
    await this.ethereumService.genericCall(inputObj);
  }

  parsePayloads(list: any[], isVoucher: boolean = false) {
    console.log(list)
    let newList = list.map((item: any) => {
      let newItem = item.node
      let payload
      if (isVoucher) {
        payload = Buffer.from(newItem.input.payload.substr(2), "hex").toString("utf8")
      } else {
        payload = Buffer.from(newItem.payload.substr(2), "hex").toString("utf8")
      }
      
      newItem.plainText = payload
      return newItem
    })
    console.log(newList)
    return newList
  }

}
