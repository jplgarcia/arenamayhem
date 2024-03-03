import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

declare function preload(): void;
declare function fight(input: any[], players: any[]): void;


@Component({
  selector: 'app-fight',
  standalone: true,
  imports: [],
  templateUrl: './fight.component.html',
  styleUrl: './fight.component.less'
})
export class FightComponent {
  images : any[] = []
  input: any[] = []
  fighters: any[] = []


  constructor(public dialogRef: MatDialogRef<FightComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.input = data.rounds
    this.fighters = data.fighters
      
  }

  ngAfterViewInit(): void {
    // Your code here, will run after the view is initialized
    console.log(document);
    preload()
    console.log(this.input, this.fighters)
    fight(this.input,this.fighters)
  }
  
}
