import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.page.html',
  styleUrls: ['./admin-sidebar.page.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class AdminSidebarPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
