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
  totalTickets: number = 0;
  totalRevenue: number = 0;
  totalTheaters: number = 0;
  

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchTotalUsers();
    this.fetchTicketsStatistics();
    this.fetchTotalTheaters(); // You'll need to implement this function as well
  }

  fetchTotalUsers() {
    this.http.get<{ total: number }>('http://127.0.0.1:8000/api/users/count/')
      .subscribe({
        next: (response) => {
          console.log('Tổng khách hàng:', response.total);
          this.totalUsers = response.total;
        },
        error: (error) => {
          console.error('Lỗi khi lấy tổng số người dùng:', error);
        }
      });
  }

  fetchTicketsStatistics() {
    this.http.get<{ total_tickets: number, total_revenue: number }>('http://127.0.0.1:8000/api/tickets/statistics/')
      .subscribe({
        next: (response) => {
          console.log('Thống kê vé:', response);
          this.totalTickets = response.total_tickets;
          this.totalRevenue = response.total_revenue;
        },
        error: (error) => {
          console.error('Lỗi khi lấy thống kê vé:', error);
        }
      });
  }
  
  // You'll need to implement this for total theaters data
  fetchTotalTheaters() {
    // Example implementation
    this.http.get<{ total: number }>('http://127.0.0.1:8000/api/theaters/count/')
      .subscribe({
        next: (response) => {
          console.log('Tổng phòng chiếu:', response.total);
          this.totalTheaters = response.total;
        },
        error: (error) => {
          console.error('Lỗi khi lấy tổng số phòng chiếu:', error);
        }
      });
  }
}