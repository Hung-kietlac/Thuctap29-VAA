import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-doimatkhau',
  templateUrl: './doimatkhau.page.html',
  styleUrls: ['./doimatkhau.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class DoimatkhauPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
