import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { AlertController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-phim-management',
  templateUrl: './phim-management.component.html',
  styleUrls: ['./phim-management.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class PhimManagementComponent implements OnInit {
  phimList: any[] = [];

  constructor(
    private adminService: AdminService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loadPhim();
  }

  loadPhim() {
    this.adminService.getAllPhim().subscribe(
      (data) => {
        this.phimList = data;
      },
      (error) => {
        console.error('Lỗi khi tải danh sách phim:', error);
        this.showError('Không thể tải danh sách phim');
      }
    );
  }

  async openAddPhimModal() {
    const alert = await this.alertController.create({
      header: 'Thêm phim mới',
      inputs: [
        {
          name: 'tenphim',
          type: 'text',
          placeholder: 'Tên phim'
        },
        {
          name: 'theloai',
          type: 'text',
          placeholder: 'Thể loại'
        },
        {
          name: 'thoiluong',
          type: 'number',
          placeholder: 'Thời lượng (phút)'
        },
        {
          name: 'ngaykhoichieu',
          type: 'date',
          placeholder: 'Ngày khởi chiếu'
        },
        {
          name: 'ngayketthuc',
          type: 'date',
          placeholder: 'Ngày kết thúc'
        },
        {
          name: 'poster',
          type: 'url',
          placeholder: 'URL poster phim'
        },
        {
          name: 'trailer_teaser',
          type: 'url',
          placeholder: 'URL trailer'
        },
        {
          name: 'mota',
          type: 'textarea',
          placeholder: 'Mô tả phim'
        },
        {
          name: 'tendaodien',
          type: 'text',
          placeholder: 'Tên đạo diễn'
        },
        {
          name: 'dienvien',
          type: 'text',
          placeholder: 'Diễn viên'
        },
        {
          name: 'danhgiaphim',
          type: 'number',
          placeholder: 'Đánh giá phim (0-10)',
          min: 0,
          max: 10
        }
      ],
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel'
        },
        {
          text: 'Thêm',
          handler: (data) => {
            this.addPhim(data);
          }
        }
      ]
    });

    await alert.present();
  }

  addPhim(data: any) {
    this.adminService.addPhim(data).subscribe(
      (response) => {
        this.loadPhim();
        this.showSuccess('Thêm phim thành công');
      },
      (error) => {
        console.error('Lỗi khi thêm phim:', error);
        this.showError('Không thể thêm phim');
      }
    );
  }

  async editPhim(phim: any) {
    const alert = await this.alertController.create({
      header: 'Sửa thông tin phim',
      inputs: [
        {
          name: 'tenphim',
          type: 'text',
          value: phim.tenphim,
          placeholder: 'Tên phim'
        },
        {
          name: 'theloai',
          type: 'text',
          value: phim.theloai,
          placeholder: 'Thể loại'
        },
        {
          name: 'thoiluong',
          type: 'number',
          value: phim.thoiluong,
          placeholder: 'Thời lượng (phút)'
        },
        {
          name: 'ngaykhoichieu',
          type: 'date',
          value: phim.ngaykhoichieu,
          placeholder: 'Ngày khởi chiếu'
        },
        {
          name: 'ngayketthuc',
          type: 'date',
          value: phim.ngayketthuc,
          placeholder: 'Ngày kết thúc'
        },
        {
          name: 'poster',
          type: 'url',
          value: phim.poster,
          placeholder: 'URL poster phim'
        },
        {
          name: 'trailer_teaser',
          type: 'url',
          value: phim.trailer_teaser,
          placeholder: 'URL trailer'
        },
        {
          name: 'mota',
          type: 'textarea',
          value: phim.mota,
          placeholder: 'Mô tả phim'
        },
        {
          name: 'tendaodien',
          type: 'text',
          value: phim.tendaodien,
          placeholder: 'Tên đạo diễn'
        },
        {
          name: 'dienvien',
          type: 'text',
          value: phim.dienvien,
          placeholder: 'Diễn viên'
        },
        {
          name: 'danhgiaphim',
          type: 'number',
          value: phim.danhgiaphim,
          placeholder: 'Đánh giá phim (0-10)',
          min: 0,
          max: 10
        }
      ],
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel'
        },
        {
          text: 'Lưu',
          handler: (data) => {
            if (data.thoiluong) {
              data.thoiluong = parseInt(data.thoiluong);
            }
            if (data.danhgiaphim) {
              data.danhgiaphim = parseFloat(data.danhgiaphim);
            }
            
            Object.keys(data).forEach(key => {
              if (data[key] === '' || data[key] === null || data[key] === undefined) {
                delete data[key];
              }
            });
            
            console.log('Data to update:', data);
            this.updatePhim(phim.id, data);
          }
        }
      ]
    });

    await alert.present();
  }

  updatePhim(id: number, data: any) {
    this.adminService.updatePhim(id, data).subscribe(
      (response) => {
        this.loadPhim();
        this.showSuccess('Cập nhật phim thành công');
      },
      (error) => {
        console.error('Lỗi khi cập nhật phim:', error);
        this.showError('Không thể cập nhật phim');
      }
    );
  }

  async deletePhim(id: number) {
    const alert = await this.alertController.create({
      header: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa phim này?',
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel'
        },
        {
          text: 'Xóa',
          handler: () => {
            this.adminService.deletePhim(id).subscribe(
              (response) => {
                this.loadPhim();
                this.showSuccess('Xóa phim thành công');
              },
              (error) => {
                console.error('Lỗi khi xóa phim:', error);
                this.showError('Không thể xóa phim');
              }
            );
          }
        }
      ]
    });

    await alert.present();
  }

  async showSuccess(message: string) {
    const alert = await this.alertController.create({
      header: 'Thành công',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async showError(message: string) {
    const alert = await this.alertController.create({
      header: 'Lỗi',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
