import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderPage } from '../../shared/header/header.page';
import { FooterPage } from '../../shared/footer/footer.page';

@Component({
  selector: 'app-bookticket',
  standalone: true,
  imports: [IonicModule, CommonModule, HeaderPage, FooterPage, FormsModule],
  templateUrl: './book-ticket.page.html',
  styleUrls: ['./book-ticket.page.scss']
})
export class BookTicketPage implements OnInit {
  phim: any = {};
  selectedCinema: string = "";
  selectedShowtime: any = { time: "", venue: "" };
  selectedSeats: string[] = [];
  totalAmount: number = 0;
  vipSeats: string[] = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'];
  seatPrices = { normal: 90000, vip: 120000 };
  bookedSeats: string[] = [];
  previousCinema: string = '';
  previousRoom: string = '';
  previousTime: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.phim = params;
      console.log("Thông tin phim:", this.phim);
    });
  }

  openTrailer() {
    if (this.phim.trailer) {
      window.open(this.phim.trailer, '_blank');
    } else {
      console.log('Không có trailer để mở.');
    }
  }

  onCinemaChange(event: any) {
    this.selectedCinema = event.detail.value;
    this.selectedSeats = [];
  }

  selectShowtime(time: string, venue: string) {
    this.selectedShowtime = { time, venue };
    this.generateBookedSeats(this.selectedCinema, venue, time);
  }

  generateBookedSeats(cinema: string, room: string, time: string): void {
    // Kiểm tra nếu rạp, phòng, hoặc thời gian chưa được chọn
    if (!cinema || !room || !time) {
      console.warn("Vui lòng chọn rạp, phòng và thời gian trước khi chọn ghế.");
      return;
    }

    let key = `bookedSeats_${cinema}_${room}_${time}`;

    // Xóa dấu ghế đã chọn nếu người dùng thay đổi rạp hoặc phòng
    if (this.previousCinema !== cinema || this.previousRoom !== room || this.previousTime !== time) {
      localStorage.removeItem(`selectedSeats_${this.previousCinema}_${this.previousRoom}`);
      this.selectedSeats = [];  // Reset ghế đã chọn khi đổi phòng hoặc rạp
    }

    // Lưu các thông tin phòng và rạp mới
    this.previousCinema = cinema;
    this.previousRoom = room;
    this.previousTime = time;

    // Kiểm tra và lấy ghế đã đặt từ localStorage
    let savedSeats = localStorage.getItem(key);
    if (savedSeats) {
      this.bookedSeats = JSON.parse(savedSeats);
      console.log(`Lấy ghế từ bộ nhớ (${cinema} - ${room} - ${time}):`, this.bookedSeats);
      return;
    }

    // Nếu không có ghế đã đặt, tạo ghế mới
    let allSeats: string[] = [];
    ['A', 'B', 'C', 'D', 'E'].forEach(row => {
      for (let i = 1; i <= 8; i++) {
        allSeats.push(row + i);
      }
    });

    let numBookedSeats = Math.floor(Math.random() * 8) + 3;
    this.bookedSeats = allSeats.sort(() => Math.random() - 0.5).slice(0, numBookedSeats);

    // Lưu lại ghế đã đặt vào localStorage
    localStorage.setItem(key, JSON.stringify(this.bookedSeats));
    console.log(`Lưu ghế đã đặt (${cinema} - ${room} - ${time}):`, this.bookedSeats);
  }

  isBooked(seat: string): boolean {
    return this.bookedSeats.includes(seat);
  }

  toggleSeat(seat: string) {
    // Kiểm tra nếu chưa chọn rạp, phòng, hoặc thời gian
    if (!this.previousCinema || !this.previousRoom || !this.previousTime) {
      alert("Vui lòng chọn rạp, phòng và thời gian trước khi chọn ghế!");
      return;
    }

    // Kiểm tra nếu ghế đã được đặt trước
    if (this.isBooked(seat)) {
      alert("Ghế này đã được đặt, vui lòng chọn ghế khác!");
      return;
    }

    // Thêm hoặc bỏ chọn ghế
    if (this.selectedSeats.includes(seat)) {
      this.selectedSeats = this.selectedSeats.filter(s => s !== seat);
    } else {
      this.selectedSeats.push(seat);
    }
  }

  isSeatSelected(seat: string): boolean {
    return this.selectedSeats.includes(seat);
  }

  isVipSeat(seat: string): boolean {
    return this.vipSeats.includes(seat);
  }

  calculateTotalPrice(): number {
    return this.selectedSeats.reduce((total, seat) => {
      return total + (this.isVipSeat(seat) ? this.seatPrices.vip : this.seatPrices.normal);
    }, 0);
  }

  getFormattedSeats(): string {
    return this.selectedSeats
      .map(seat => this.isVipSeat(seat) ? `${seat} (VIP)` : seat)
      .join(', ');
  }

  selectSeat(seat: string): void {
    let selectedSeatsKey = `selectedSeats_${this.previousCinema}_${this.previousRoom}`;
    
    let selectedSeats = JSON.parse(localStorage.getItem(selectedSeatsKey) || '[]');
    if (!selectedSeats.includes(seat)) {
      selectedSeats.push(seat);  // Thêm ghế đã chọn vào mảng
      localStorage.setItem(selectedSeatsKey, JSON.stringify(selectedSeats));
    }
    console.log(`Ghế đã chọn:`, selectedSeats);
  }

  datve(phim: any) {
    this.router.navigate(['/cart'], { 
      queryParams: { 
        tenphim: phim.tenphim, 
        poster: phim.poster, 
        ngaychieu: phim.ngaychieu, 
        rap: this.selectedCinema,
        seats: this.selectedSeats.join(','),
        total: this.calculateTotalPrice()
      }
    });
  }
}