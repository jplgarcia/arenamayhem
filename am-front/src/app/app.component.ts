import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { RouterModule, Routes } from '@angular/router';


import { SidenavComponent } from './page/sidenav/sidenav.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list'; // Import MatListModule

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    SidenavComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {
  title = 'angular-cartesi';

}
