import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.page.html',
  styleUrls: ['./admin-sidebar.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
})
export class AdminSidebarPage {
  isOpen = false;

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }
}