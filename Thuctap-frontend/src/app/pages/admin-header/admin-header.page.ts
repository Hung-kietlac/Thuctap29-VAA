import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.page.html',
  styleUrls: ['./admin-header.page.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class AdminHeaderPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
