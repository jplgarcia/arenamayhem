import { Routes } from '@angular/router';
import { HomeComponent } from './page/home/home.component';
import { AboutComponent } from './page/about/about.component';
import { ChallengesComponent } from './page/challenges/challenges.component';
import { HistoryComponent } from './page/history/history.component';
import { AssetsComponent } from './page/assets/assets.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'challenges', component: ChallengesComponent },
    { path: 'history', component: HistoryComponent },
    { path: 'assets', component: AssetsComponent },
    { path: 'about', component: AboutComponent },
    // Add more routes here
  ];
