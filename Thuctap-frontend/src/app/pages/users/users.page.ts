import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { AlertController, ToastController } from '@ionic/angular';

interface User {
  _id: string;
  hoten: string;
  username: string;
  sodienthoai: string;
  ngaysinh?: string;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, HttpClientModule]
})
export class UsersPage implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  isLoading = true;
  searchTerm = '';
  debugMode = false; // Bật chế độ debug để xem lỗi
  apiBaseUrl = 'http://127.0.0.1:8000/api';

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.isLoading = true;
    
    // Thiết lập headers
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('Đang gọi API để lấy danh sách người dùng...');
    
    this.http.get(`${this.apiBaseUrl}/users/`, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Phản hồi API:', response);
          
          if (response && response.users) {
            this.users = response.users;
            this.filteredUsers = [...response.users];
            console.log(`Đã nhận ${this.users.length} người dùng`);
          } else {
            console.error('Định dạng phản hồi không đúng:', response);
            // Thử trích xuất dữ liệu nếu có định dạng khác
            if (Array.isArray(response)) {
              this.users = response;
              this.filteredUsers = [...response];
              console.log('Đã trích xuất dữ liệu từ mảng');
            }
          }
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Lỗi khi lấy danh sách người dùng:', error);
          this.isLoading = false;
          this.showToast('Không thể tải danh sách người dùng: ' + (error.message || error), 'danger');
        }
      });
  }

  async confirmDeleteUser(userId: string) {
    const alert = await this.alertController.create({
      header: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa người dùng này?',
      buttons: [
        { text: 'Hủy', role: 'cancel' },
        {
          text: 'Xóa',
          handler: () => this.deleteUser(userId)
        }
      ]
    });

    await alert.present();
  }

  deleteUser(userId: string) {
    console.log('Đang xóa người dùng với ID:', userId);
    
    this.http.delete(`${this.apiBaseUrl}/users/delete/${userId}/`)
      .subscribe({
        next: (response) => {
          console.log('Kết quả xóa người dùng:', response);
          
          // Cập nhật danh sách người dùng
          this.users = this.users.filter(user => user._id !== userId);
          this.filteredUsers = this.filteredUsers.filter(user => user._id !== userId);
          
          this.showToast('Xóa người dùng thành công', 'success');
        },
        error: (error) => {
          console.error('Lỗi khi xóa người dùng:', error);
          this.showToast('Không thể xóa người dùng: ' + (error.message || error), 'danger');
        }
      });
  }
  
  async openAddUserModal() {
    const alert = await this.alertController.create({
      header: 'Thêm Người Dùng',
      inputs: [
        { name: 'hoten', type: 'text', placeholder: 'Họ tên' },
        { name: 'username', type: 'text', placeholder: 'Tên đăng nhập' },
        { name: 'sodienthoai', type: 'tel', placeholder: 'Số điện thoại' },
        { name: 'password', type: 'password', placeholder: 'Mật khẩu' }
      ],
      buttons: [
        { text: 'Hủy', role: 'cancel' },
        { 
          text: 'Thêm', 
          handler: (data) => {
            if (!data.hoten || !data.username || !data.password) {
              this.showToast('Vui lòng điền đầy đủ thông tin', 'warning');
              return false;
            }
            this.addUser(data);
            return true;
          }
        }
      ]
    });
  
    await alert.present();
  }
  
  addUser(userData: any) {
    console.log('Đang thêm người dùng:', userData);
    
    this.http.post(`${this.apiBaseUrl}/users/register_user/`, userData)
      .subscribe({
        next: (response: any) => {
          console.log('Kết quả thêm người dùng:', response);
          this.fetchUsers(); // Tải lại danh sách
          this.showToast('Thêm người dùng thành công', 'success');
        },
        error: (error) => {
          console.error('Lỗi khi thêm người dùng:', error);
          this.showToast('Không thể thêm người dùng: ' + (error.message || error), 'danger');
        }
      });
  }
  
  async openEditUserModal(user: User) {
    const alert = await this.alertController.create({
      header: 'Chỉnh sửa Người dùng',
      inputs: [
        { name: 'hoten', type: 'text', placeholder: 'Họ tên', value: user.hoten },
        { name: 'username', type: 'text', placeholder: 'Tên đăng nhập', value: user.username },
        { name: 'sodienthoai', type: 'tel', placeholder: 'Số điện thoại', value: user.sodienthoai }
      ],
      buttons: [
        { text: 'Hủy', role: 'cancel' },
        {
          text: 'Lưu',
          handler: (data) => {
            if (!data.hoten || !data.username) {
              this.showToast('Vui lòng điền đầy đủ thông tin', 'warning');
              return false;
            }
            this.updateUser(user._id, data);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  updateUser(userId: string, userData: any) {
    console.log('Đang cập nhật người dùng:', userId, userData);
    
    this.http.put(`${this.apiBaseUrl}/users/update/${userId}/`, userData)
      .subscribe({
        next: (response: any) => {
          console.log('Kết quả cập nhật người dùng:', response);
          this.fetchUsers(); // Tải lại danh sách
          this.showToast('Cập nhật người dùng thành công', 'success');
        },
        error: (error) => {
          console.error('Lỗi khi cập nhật người dùng:', error);
          this.showToast('Không thể cập nhật người dùng: ' + (error.message || error), 'danger');
        }
      });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  filterUsers() {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users]; // Reset danh sách
    } else {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user => 
        user.hoten.toLowerCase().includes(searchTermLower) ||
        user.username.toLowerCase().includes(searchTermLower) ||
        (user.sodienthoai && user.sodienthoai.includes(this.searchTerm))
      );
    }
    console.log(`Đã lọc: ${this.filteredUsers.length} kết quả từ ${this.users.length} người dùng`);
  }
  
  // Thêm chức năng cho phát triển
  toggleDebugMode() {
    this.debugMode = !this.debugMode;
    this.showToast('Chế độ debug: ' + (this.debugMode ? 'Bật' : 'Tắt'), 'tertiary');
  }
}