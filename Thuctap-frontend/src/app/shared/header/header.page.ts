import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.page.html',
  styleUrls: ['./header.page.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class HeaderPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
