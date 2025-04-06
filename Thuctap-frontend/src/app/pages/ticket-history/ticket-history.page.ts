import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { RouterModule } from '@angular/router';

interface Ticket {
  _id: string;
  giave: number;
  trangthai: string;
  thoigianTT?: string;
  rap?: string;
  ngayxem?: string;
  giochieu?: string;
  phuongthuctt?: string;
  ngaydat?: string;
}

@Component({
  selector: 'app-ticket-history',
  standalone: true,
  imports: [
    CommonModule, 
    IonicModule, 
    HttpClientModule,
    RouterModule
  ],
  templateUrl: './ticket-history.page.html',
  styleUrls: ['./ticket-history.page.scss'],
})
export class TicketHistoryPage implements OnInit {
  tickets: Ticket[] = [];
  isLoading = true;
  noTickets = false;
  selectedStatus = 'all';

  constructor(
    private http: HttpClient,
    private toastController: ToastController // Thêm ToastController vào constructor
  ) {}

  ngOnInit() {
    this.fetchTickets();
  }

  fetchTickets() {
    this.isLoading = true;
    
    const statusMap: { [key: string]: string } = {
      'all': 'all',
      'completed': 'Đã thanh toán',
      'pending': 'Đang chờ thanh toán',
      'cancelled': 'Đã hủy'
    };
  
    let params = new HttpParams();
    if (this.selectedStatus !== 'all') {
      this.tickets = this.tickets.filter(ticket => 
          ticket.trangthai === statusMap[this.selectedStatus]
      );
  }
  
    this.http.get<{ tickets: Ticket[] }>('http://127.0.0.1:8000/api/ticket-history/', { params })
      .subscribe({
        next: (response) => {
          console.log('Ticket response:', response);
          this.tickets = response.tickets || [];
          
          if (this.selectedStatus !== 'all') {
            this.tickets = this.tickets.filter(ticket => 
              ticket.trangthai === statusMap[this.selectedStatus]
            );
          }
  
          this.noTickets = this.tickets.length === 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Lỗi khi tải vé:', error);
          this.noTickets = true;
          this.isLoading = false;
        }
      });
  }

  changeStatus(event: any) {
    const status = event?.detail?.value ?? 'all';
    this.selectedStatus = status;
    this.fetchTickets();
  }

  cancelTicket(ticketId: string) {
    this.http.post(`http://127.0.0.1:8000/api/cancel_ticket/${ticketId}/`, {})
      .subscribe({
        next: (response: any) => {
          this.presentToast(response.message, 'success');
          this.fetchTickets();
        },
        error: (error) => {
          this.presentToast(error.error.error || 'Không thể hủy vé', 'danger');
        }
      });
  }
  
  // Thêm phương thức hiển thị toast
  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color
    });
    toast.present();
  }
}
