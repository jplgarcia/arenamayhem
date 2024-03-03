import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { OnboardService } from '../../service/onboard.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.less'
})
export class SidenavComponent {
  walletConnected: boolean = false;

  constructor(public router: Router,
    public onboardService: OnboardService) {
    this.walletConnected = this.onboardService.isWalletConnected();
  }

  async changeConnection() {
    if (this.walletConnected) {
      await this.onboardService.disconnectWallet();
    } else {
      await this.onboardService.connectWallet();
      this.router.navigate(['home'],);
    }
    this.walletConnected = this.onboardService.isWalletConnected();

    this.onboardService.getConnectedWallet()
  }

}
