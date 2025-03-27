import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http'; 
import { CommonModule } from '@angular/common';
import { AdminHeaderPage } from '../admin-header/admin-header.page';
import { AdminSidebarPage } from '../admin-sidebar/admin-sidebar.page';
import { AdminFooterPage } from '../admin-footer/admin-footer.page';

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
    CommonModule, 
  ],
})
export class DashboardPage implements OnInit {
  totalUsers: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchTotalUsers();
  }

  fetchTotalUsers() {
    this.http.get<{ total: number }>('http://127.0.0.1:8000/api/users/count/')
      .subscribe({
        next: (response) => {
          console.log('Tổng khách hàng:', response.total); // Debug
          this.totalUsers = response.total;
        },
        error: (error) => {
          console.error('Lỗi khi lấy tổng số người dùng:', error);
        }
      });
  }
}  
