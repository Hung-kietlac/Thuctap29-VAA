import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-admin-footer',
  templateUrl: './admin-footer.page.html',
  styleUrls: ['./admin-footer.page.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class AdminFooterPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
