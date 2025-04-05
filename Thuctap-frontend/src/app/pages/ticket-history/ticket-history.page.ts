import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ticket-history',
  templateUrl: './ticket-history.page.html',
  styleUrls: ['./ticket-history.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TicketHistoryPage implements OnInit {
  dulieu: any[] = [];
  filteredTickets: any[] = [];
  loading: boolean = true;
  selectedStatus: string = 'all';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.http.get<{dulieu: any[]}>('http://127.0.0.1:8000/api/du_lieu_thanh_toan/')
      .subscribe(
        response => {
          console.log('Dữ liệu từ API:', response); // Kiểm tra dữ liệu nhận được
          this.dulieu = response.dulieu;  // Gán dữ liệu trả về vào dulieu
          this.filteredTickets = this.dulieu;  // Hiển thị tất cả vé mặc định
          this.loading = false;  // Tắt trạng thái loading
        },
        error => {
          console.error('Lỗi khi lấy dữ liệu thanh toán:', error);
          this.loading = false;  // Tắt trạng thái loading nếu có lỗi
        }
      );
  }

  filterTickets() {
    if (this.selectedStatus === 'all') {
      this.filteredTickets = this.dulieu;
    } else {
      this.filteredTickets = this.dulieu.filter(ticket => ticket.trangThai === this.selectedStatus);
    }
  }

  cancelTicket(ticket: any) {
    console.log('Hủy vé:', ticket);
    // Thực hiện hủy vé ở đây
  }

  downloadTicket(ticket: any) {
    console.log('Tải vé:', ticket);
  }
}