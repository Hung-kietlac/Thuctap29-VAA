import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dangnhap',
  standalone: true,
  templateUrl: './dangnhap.page.html',
  styleUrls: ['./dangnhap.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class DangnhapPage implements OnInit {
  private authService = inject(AuthService);
  
  loginData = {
    username: '',
    password: ''
  };

  rememberMe = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const savedUsername = localStorage.getItem('savedUsername');
    if (savedUsername) {
      this.loginData.username = savedUsername;
      this.rememberMe = true;
    }
  }

  async onLogin() {
    this.authService.login(this.loginData.username, this.loginData.password)
      .subscribe({
        next: (response: { message: string; role: string; username: string }) => {
          if (this.rememberMe) {
            localStorage.setItem('savedUsername', this.loginData.username);
          } else {
            localStorage.removeItem('savedUsername');
          }
          
          localStorage.setItem('userRole', response.role);

          if (response.role === "admin") {
            alert('Bạn đã đăng nhập admin thành công!');
            this.router.navigate(['/dashboard']);
          } else {
            alert('Bạn đã đăng nhập thành công!');
            this.router.navigate(['/trangchu']);
          }
        },
        error: (error: any) => {
          console.error('Lỗi:', error);
          alert('Tên đăng nhập hoặc mật khẩu không đúng!');
        }
      });
  }

  logout() {
    this.authService.logout();
    alert('Bạn đã đăng xuất thành công!');
    this.router.navigate(['/dangnhap']);
  }
}