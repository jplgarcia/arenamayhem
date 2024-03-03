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

@Component({
  selector: 'app-challenges',
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
  templateUrl: './challenges.component.html',
  styleUrl: './challenges.component.less'
})
export class ChallengesComponent {
  inspectReply:any = []

  constructor(public onboardService: OnboardService,
    private ethereumService: EthereumService,
    private httpService: HttpService,
    private graphqlService: GraphqlService,
    public dialog: MatDialog) {
    
      this.inspectUserBattles()
  }

  async inspectUserBattles() {
    let inspectReply = await this.httpService.get("battles")
    this.inspectReply = JSON.parse(inspectReply)
    console.log(this.inspectReply)
  }

  async acceptBattle(report:any) {
    await this.ethereumService.initEthereum();
    const dialogRef = this.dialog.open(FighterComponent, {
      width: '650px',
      data: {message: "You are accepting a challenge" , value: report.amount} // You can pass data to the dialog here
    });
    dialogRef.afterClosed().subscribe(result => {
      let fighter : any = result
      if (!fighter){
        return
      }
      
      this.ethereumService.genericCall(JSON.stringify({
        method: "accept_challenge",
        fighter,
        challenge_id: report.id
      }))
      console.log("fit", fighter)
    });
  }
}
