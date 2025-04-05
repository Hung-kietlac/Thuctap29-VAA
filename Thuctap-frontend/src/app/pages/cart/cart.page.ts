import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class CartPage implements OnInit {
  phim: any = {};
  soLuong: number = 0;
  donGia: number = 0;
  tongTien: number = 0;
  gioHang: any[] = [];
  dichVuList: any[] = [];
  selectedFoods: any[] = [];
  hienDanhSachMonAn: boolean = false;
  selectedPayment: string = '';
  tongTienHienTai: number = 0;
  qrCodeData: SafeUrl | null = null;
  paymentUrl: string | null = null;
  isServiceSelected: boolean = false;
  isPromoUsed: boolean = false;
  totalAmount: number = this.tongTien;
  discountMessage: string = '';
  savedMovie: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    const savedMovie = localStorage.getItem('selectedMovie');
    if (savedMovie) {
      this.phim = JSON.parse(savedMovie);
      console.log('Thông tin phim từ localStorage:', this.phim);
      console.log('Tên phim:', this.phim.tenphim);
      console.log('Tên rạp:', this.phim.rap);
    } else {
      console.log('Không có thông tin phim trong localStorage');
    }
    this.loadDichVu();

    // Lắng nghe thông điệp từ iframe hoặc các cửa sổ pop-up
    window.addEventListener('message', (event) => {
      console.log('Đã nhận message:', event.data);
    
      // Điều hướng tùy theo kết quả thanh toán
      if (event.data === 'payment_success') {
        this.router.navigate(['/trangchu']);
      } else if (event.data === 'payment_cancelled') {
        this.router.navigate(['/trangchu']);
      } else if (event.data === 'payment_failed') {
        this.router.navigate(['/trangchu']);
      }
    });
  }

  loadDichVu() {
    this.http.get<{ dichvu: any[] }>('http://127.0.0.1:8000/api/dichvu/')
      .subscribe(
        response => {
          console.log("Dữ liệu từ API:", response.dichvu);
          this.dichVuList = response.dichvu.map(dichvu => ({
            ...dichvu,
            soLuong: 0,
            tongGia: 0,
          }));
        },
        error => console.error("Lỗi khi gọi API:", error)
      );
  }

  toggleDanhSachMonAn() {
    this.hienDanhSachMonAn = !this.hienDanhSachMonAn;
  }

  tangSoLuong(food: any) {
    food.soLuong++;
    food.tongGia = food.soLuong * food.giadichvu;
    this.isServiceSelected = true;
  }
  
  giamSoLuong(food: any) {
    if (food.soLuong > 0) {
      food.soLuong--;
    }
    food.tongGia = food.soLuong * food.giadichvu;
    if (this.dichVuList.every(f => f.soLuong === 0)) {
      this.isServiceSelected = false;
    }
  }

  applyPromo() {
    if (!this.isPromoUsed) {
      const giaVePhim = this.phim.total || 0;
      this.isPromoUsed = true;
      this.discountMessage = 'Giảm 10%';
    }
  }

  tinhTongTien(): number {
    if (!this.dichVuList || this.dichVuList.length === 0) {
      return 0;
    }
  
    return this.dichVuList
      .filter(food => food.soLuong > 0)
      .reduce((sum, food) => sum + (food.soLuong * (food.giadichvu || 0)), 0);
  }

  get thanhTienSauGiam(): number {
    let tienVePhim = this.phim.total || 0;
  
    const giaDichVu = this.tinhTongTien();
    let tongTien = tienVePhim + giaDichVu;
  
    if (this.isPromoUsed) {
      tongTien = tongTien * 0.9;
    }
  
    return Math.floor(tongTien);
  }

  async processPayment() {
    if (!this.selectedPayment) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (this.selectedPayment === 'momo') {
      console.log('Thanh toán bằng MoMo');
    } else if (this.selectedPayment === 'vnpay') {
      console.log('Thanh toán bằng VNPay');
    }
  }

  pay() {
    const amount = this.thanhTienSauGiam;
    const phim = encodeURIComponent(this.phim.tenphim || "Không rõ");
    const rap = encodeURIComponent(this.phim.rap || "Không rõ");
  
    console.log("Tên phim:", this.phim.tenphim);
    console.log("Tên rạp:", this.phim.rap);
  
    if (amount <= 0) {
      console.error("Số tiền thanh toán không hợp lệ:", amount);
      return;
    }
  
    if (!this.selectedPayment) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }
  
    if (this.selectedPayment === 'vnpay') {
      const apiUrl = `http://127.0.0.1:8000/api/generate_vnpay_qr/?amount=${amount}&phim=${phim}&rap=${rap}`;
      console.log("API URL:", apiUrl);
  
      this.http.get<{ payment_url: string }>(apiUrl).subscribe(response => {
        if (response.payment_url) {
          window.location.href = response.payment_url;
        } else {
          console.error("Không nhận được payment_url từ API");
        }
      }, error => {
        console.error("Lỗi khi gọi API VNPay:", error);
      });
    }
  }
}