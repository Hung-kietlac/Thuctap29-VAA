import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AdminHeaderPage } from '../admin-header/admin-header.page';
import { AdminSidebarPage } from '../admin-sidebar/admin-sidebar.page';
import { AdminFooterPage} from '../admin-footer/admin-footer.page';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    AdminHeaderPage, 
    AdminSidebarPage, 
    AdminFooterPage,
    IonicModule,
  ],
})
export class DashboardPage {
  
}