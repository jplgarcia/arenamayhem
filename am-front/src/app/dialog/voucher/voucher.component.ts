import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EthereumService } from '../../service/ethereum.service';
import { MatButton } from '@angular/material/button';

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
  private ethereumService: EthereumService) {
  }

  async ngAfterViewInit() {
    // In v2, execution status is derived from the output object returned by the RPC node
    this.executed = this.data.execution_transaction_hash !== null &&
                    this.data.execution_transaction_hash !== undefined;
    console.log(this.executed)
    this.loaded = true
  }

  async execute() {
    // In v2, the full Output object (with embedded proof) is passed directly
    await this.ethereumService.initEthereum();
    await this.ethereumService.voucherExecuteCall(this.data.output)
    console.log(this.data)
  }
}
