import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminHeaderPage } from '../admin-header/admin-header.page';
import { AdminFooterPage } from '../admin-footer/admin-footer.page';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule,
    AdminHeaderPage,
    AdminFooterPage // 👈 Thêm dòng này
  ]
})
export class AdminPage {
  constructor() {}
}
