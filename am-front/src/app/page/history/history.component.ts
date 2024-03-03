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
import { gql } from 'urql';
import { FightComponent } from '../../dialog/fight/fight.component';

@Component({
  selector: 'app-history',
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
  templateUrl: './history.component.html',
  styleUrl: './history.component.less'
})
export class HistoryComponent {
  public gqlreply:any[] = []


  constructor(private onboardService: OnboardService,
    private graphqlService: GraphqlService,
    public dialog: MatDialog) {
    this.getUserBattlesHistory()

  }

  async getUserBattlesHistory() {
    let gqlreply = await this.graphqlService.getUserBattles(this.onboardService.getConnectedWallet())
    this.gqlreply = gqlreply
    console.log(this.gqlreply)
  }

  async playFight(fightInfo: any) {
    
    const dialogRef = this.dialog.open(FightComponent, {
      width: '875px',
      height: '420px',
      data: fightInfo // You can pass data to the dialog here
    });


    console.log(this.gqlreply)
  }

}
