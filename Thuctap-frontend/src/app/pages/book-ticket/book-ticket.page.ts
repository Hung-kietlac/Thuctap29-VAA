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
  selectedDate: string = '';
  weekDates: { date: string; label: string }[] = [];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.phim = params;
      console.log("Thông tin phim:", this.phim);
    });
    this.generateWeekDays();
  }

  //Mở tralier
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

  generateWeekDays(startDate?: Date) {
    this.weekDates = [];
    let today = startDate || new Date(); // Nếu không có ngày, lấy ngày hôm nay

    for (let i = 0; i < 7; i++) {
      let nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);

      let dateStr = nextDay.toISOString().split('T')[0]; // YYYY-MM-DD
      let label = `${nextDay.getDate()}/${nextDay.getMonth() + 1}<br>${this.getDayLabel(nextDay.getDay())}`;

      this.weekDates.push({ date: dateStr, label });
    }

    this.selectedDate = this.weekDates[0].date; // Mặc định chọn ngày đầu tiên
  }

  getDayLabel(dayIndex: number): string {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[dayIndex];
  }

  // Hàm chuyển sang tuần tiếp theo
  nextWeek() {
    let nextWeekStart = new Date(this.weekDates[6].date);
    nextWeekStart.setDate(nextWeekStart.getDate() + 1);
    this.generateWeekDays(nextWeekStart);
  }

  // Hàm chuyển về tuần trước
  prevWeek() {
    let prevWeekStart = new Date(this.weekDates[0].date);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    this.generateWeekDays(prevWeekStart);
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
    if (!this.selectedCinema) {
      alert("Vui lòng chọn rạp chiếu!");
      return;
    }
    if (!this.selectedShowtime.time) {
      alert("Vui lòng chọn suất chiếu!");
      return;
    }
    if (this.selectedSeats.length === 0) {
      alert("Vui lòng chọn ghế!");
      return;
    }

    localStorage.setItem('selectedMovie', JSON.stringify({
      tenphim: phim.tenphim,
      poster: phim.poster,
      ngaychieu: phim.ngaychieu,
      rap: this.selectedCinema,
      seats: this.selectedSeats,
      total: this.calculateTotalPrice(),
    }));
    this.router.navigate(['/cart']);
  }
}
