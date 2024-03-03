import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EthereumService } from '../../service/ethereum.service';
import { MatButton } from '@angular/material/button';
import { GraphqlService } from '../../service/graphql.service';

@Component({
  selector: 'app-voucher',
  standalone: true,
  imports: [
    CommonModule,
    MatButton
  ],
  templateUrl: './voucher.component.html',
  styleUrl: './voucher.component.less'
})
export class VoucherComponent {

  loaded = false
  executed = false

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private ethereumService: EthereumService,
  private graphqlService: GraphqlService) {
  }

  async ngAfterViewInit() {
    await this.ethereumService.initEthereum();
    this.executed = await this.ethereumService.wasVoucherExecuted(this.data.input.index, this.data.index)
    console.log(this.executed)
    this.loaded = true
  }

  async execute() {
    let voucher = await this.graphqlService.getVoucherWithProof(this.data.index, this.data.input.index)
    console.log("voucher")
    console.log(voucher)
    await this.ethereumService.initEthereum();
    await this.ethereumService.voucherExecuteCall(voucher.destination, voucher.payload, voucher.proof)
    console.log(this.data)
  }
}
