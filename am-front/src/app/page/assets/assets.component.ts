import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { WithdrawVoucherComponent } from '../../dialog/withdraw-voucher/withdraw.voucher.component';


@Component({
  selector: 'app-assets',
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

  templateUrl: './assets.component.html',
  styleUrl: './assets.component.less'
})
export class AssetsComponent {
  etherbalance: String = "0"
  erc20balance: String = "0";

  etherDepositAmount: Number = 0;
  etherWithdrawAmount: Number = 0;
  etherTransferAmount: Number = 0;
  etherTransferAddress: String = "";

  sunodoDepositAmount: Number = 0;
  sunodoWithdrawAmount: Number = 0;
  sunodoTransferAmount: Number = 0;
  sunodoTransferAddress: String = "";
  vouchers: any[] = []

  userAddress = ""

  constructor(public onboardService: OnboardService,
      private ethereumService: EthereumService,
      private httpService: HttpService,
      private graphqlService: GraphqlService,
      public dialog: MatDialog) {

    this.userAddress = onboardService.getConnectedWallet()
    this.updateBalance()
    this.graphqlService.getVouchers()
  }

  async updateBalance() {
    this.erc20balance = await this.httpService.getERC20Balance(this.onboardService.getConnectedWallet(), this.ethereumService.getTokenAddres())
    this.etherbalance = await this.httpService.getEtherBalance(this.onboardService.getConnectedWallet())
  }

  async submitRelay() {
    await this.ethereumService.initEthereum();
    await this.ethereumService.updateRelay();
  }

  async submitEtherDeposit(): Promise<void> {
    try {
      await this.ethereumService.initEthereum();
      await this.ethereumService.depositEtherAssets(this.etherDepositAmount);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  }

  async submitEtherWithdraw(): Promise<void> {
    try {
      await this.ethereumService.initEthereum();
      await this.ethereumService.withdrawEther(this.onboardService.getConnectedWallet(), this.etherWithdrawAmount);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  }
  
  async submitEtherTransfer(): Promise<void> {
    try {
      await this.ethereumService.initEthereum();
      await this.ethereumService.transferEther(this.onboardService.getConnectedWallet(), this.etherTransferAddress, this.etherTransferAmount);
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

  async submitSunodoWithdraw(): Promise<void> {
    try {
      await this.ethereumService.initEthereum();
      await this.ethereumService.withdrawERC20(this.onboardService.getConnectedWallet(), this.sunodoWithdrawAmount);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  }
  
  async submitSunodoTransfer(): Promise<void> {
    try {
      await this.ethereumService.initEthereum();
      await this.ethereumService.transferERC20(this.onboardService.getConnectedWallet(), this.sunodoTransferAddress, this.sunodoTransferAmount);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  }

  

  async loadRequests() {
    this.vouchers = await this.graphqlService.getUserVouchers(this.onboardService.getConnectedWallet())
    console.log(this.vouchers)
  }

  openRequest(voucher:any) {
    const dialogRef = this.dialog.open(WithdrawVoucherComponent, {
      width: '250px',
      data: voucher // You can pass data to the dialog here
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // Logic after closing the dialog
    });
  }
}
