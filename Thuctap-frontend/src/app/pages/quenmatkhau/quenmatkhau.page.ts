import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-quenmatkhau',
  templateUrl: './quenmatkhau.page.html',
  styleUrls: ['./quenmatkhau.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class QuenmatkhauPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
