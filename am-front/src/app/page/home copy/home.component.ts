import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
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
  etherDepositAmount: Number = 0
  sunodoDepositAmount: Number = 0
  nftAddress: string = ""
  nftId: Number = 0

  vouchers: any[] = []
  notices: any[] = []
  reports: any[] = []

  inspectRoute = ""
  inspectReply = ""
  genericInput = ""

  userAddress = ""

  constructor(public onboardService: OnboardService,
      private ethereumService: EthereumService,
      private httpService: HttpService,
      private graphqlService: GraphqlService,
      public dialog: MatDialog) {

    this.userAddress = onboardService.getConnectedWallet()
    this.graphqlService.getVouchers()
  }

  async inspect() {
    this.inspectReply = await this.httpService.get(this.inspectRoute)
    console.log(this.inspectReply)
  }

  async submitRelay() {
    await this.ethereumService.initEthereum();
    await this.ethereumService.updateRelay();
  }

  async submitGenericInput() {
    await this.ethereumService.initEthereum();
    await this.ethereumService.genericCall(this.genericInput);
  }

  async submitEtherDeposit(): Promise<void> {
    try {
      await this.ethereumService.initEthereum();
      await this.ethereumService.depositEtherAssets(this.etherDepositAmount);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  }


  async submitSunodoDeposit(): Promise<void> {
    try {
      await this.ethereumService.initEthereum();
      await this.ethereumService.depositERC20Assets(this.sunodoDepositAmount);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  }

  async submitNFTDeposit(): Promise<void> {
    try {
      await this.ethereumService.initEthereum();
      await this.ethereumService.depositERC721Assets(this.nftAddress, this.nftId);
    } catch (error) {
      console.error('Error updating data:', error);
    }
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

  async loadReports() {
    let reports = await this.graphqlService.getReports()
    this.reports = this.parsePayloads(reports)
  }

  async loadNotices() {
    let notices = await this.graphqlService.getNotices()
    this.notices = this.parsePayloads(notices)
  }

  async loadVouchers() {
    let vouchers = await this.graphqlService.getVouchers()
    this.vouchers = this.parsePayloads(vouchers, true)
  }

  openVoucher(voucher:any) {
    voucher.json = JSON.parse(voucher.plainText)
    const dialogRef = this.dialog.open(VoucherComponent, {
      width: '250px',
      data: voucher // You can pass data to the dialog here
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // Logic after closing the dialog
    });
  }
}
