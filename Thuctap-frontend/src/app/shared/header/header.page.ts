import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.page.html',
  styleUrls: ['./header.page.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class HeaderPage {
  isLoggedIn = false;

  constructor(private router: Router) { }

  logout() {
    localStorage.removeItem('userToken');
    this.isLoggedIn = false;
    this.router.navigate(['/dangnhap']);
  }
}