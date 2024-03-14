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
import { OnboardService } from '../../service/onboard.service';
import { EthereumService } from '../../service/ethereum.service';
import { HttpService } from '../../service/http.service';
import { GraphqlService } from '../../service/graphql.service';
import { VoucherComponent } from '../../dialog/voucher/voucher.component';

@Component({
  selector: 'app-fighter',
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
  templateUrl: './fighter.component.html',
  styleUrl: './fighter.component.less'
})
export class FighterComponent {
  message: String = ""
  value: Number = 0
  name: String = ""
  weapon: String = "sword"
  hp: number = 0
  atk: number = 0
  def: number = 0
  spd: number = 0


  constructor(public dialogRef: MatDialogRef<FighterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      
    this.message = data.message
    this.value = data.value

    if (data.fighter) {
      this.name = data.fighter.name
      this.weapon = data.fighter.weapon
      this.hp = data.fighter.hp
      this.atk = data.fighter.atk
      this.def = data.fighter.def
      this.spd = data.fighter.spd
    }
  }

  async execute() {
    let fighter = {
      name: this.name,
      weapon: this.weapon,
      hp: this.hp,
      atk: this.atk,
      def: this.def,
      spd: this.spd
    }
    if (!this.name) {
      alert("Name must be set")
      return
    }
    if (this.atk > 40 || this.spd > 40 || 
      this.def > 40 || this.hp > 40) {
      alert("Stat is over 40")
      return
    }

    if (this.atk < 1 || this.spd < 1 || 
      this.def < 1 || this.hp < 1) {
      alert("Some stat is lower than 1")
      return
    }

    if (this.atk + this.spd + this.def + this.hp > 100) {
      alert("Sum of stats invalid")
      return
    }
  
    this.dialogRef.close(fighter); // Replace 'some data' with the actual data you want to send back

  }
}
