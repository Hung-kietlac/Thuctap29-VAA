import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dangky',
  standalone: true,
  templateUrl: './dangky.page.html',
  styleUrls: ['./dangky.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class DangkyPage {
  userData = {
    hoten: '',
    ngaysinh: '',
    sodienthoai: '',
    username: '',
    password: '',
    // otp: ''
  };
  confirmPassword = '';
  // isOtpSent = false;

  constructor(private http: HttpClient, private router: Router) {}

  // Gửi yêu cầu nhận mã OTP
  // sendOTP() {
  //   if (!/^0\d{9}$/.test(this.userData.sodienthoai)) {
  //     alert('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 số và bắt đầu bằng 0!');
  //     return;
  //   }

  //   this.http.post('http://127.0.0.1:8000/api/users/send_otp/', { sodienthoai: this.userData.sodienthoai })
  //     .subscribe(
  //       response => {
  //         alert('Mã OTP đã được gửi!');
  //         this.isOtpSent = true; // Hiển thị ô nhập OTP
  //       },
  //       error => {
  //         alert('Gửi OTP thất bại!');
  //       }
  //     );
  // }

  // Xử lý đăng ký tài khoản
  async onSubmit() {
    if (this.userData.password !== this.confirmPassword) {
      alert('Mật khẩu nhập lại không khớp!');
      return;
    }

    this.http.post('http://127.0.0.1:8000/api/users/register_user/', this.userData)
      .subscribe(
        response => {
          alert('Bạn đã đăng ký thành công!');
          this.router.navigate(['/trangchu']);
        },
        error => {
          alert('Đăng ký thất bại!');
        }
      );
  }
}