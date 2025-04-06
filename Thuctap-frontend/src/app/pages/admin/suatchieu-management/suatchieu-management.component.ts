import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { AlertController, ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AddSuatChieuModalComponent } from './add-suatchieu-modal/add-suatchieu-modal.component';

interface Phim {
  id: number;
  tenphim: string;
}

interface PhongChieu {
  id: number;
  tenphongchieu: string;
}

interface SuatChieu {
  id: number;
  phim: Phim;
  phongchieu: PhongChieu;
  ngaychieu: string;
  giobatdau: string;
  gioketthuc: string;
  giave: number;
  trangthai: string;
}

@Component({
  selector: 'app-suatchieu-management',
  templateUrl: './suatchieu-management.component.html',
  styleUrls: ['./suatchieu-management.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class SuatChieuManagementComponent implements OnInit {
  suatchieuList: SuatChieu[] = [];
  phimList: Phim[] = [];
  phongchieuList: PhongChieu[] = [];

  constructor(
    private adminService: AdminService,
    private alertController: AlertController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.loadSuatChieu();
    this.loadPhim();
    this.loadPhongChieu();
  }

  loadSuatChieu() {
    this.adminService.getAllSuatChieu().subscribe(
      (data: SuatChieu[]) => {
        this.suatchieuList = data;
      },
      (error) => {
        console.error('Lỗi khi tải danh sách suất chiếu:', error);
        this.showError('Không thể tải danh sách suất chiếu');
      }
    );
  }

  loadPhim() {
    this.adminService.getAllPhim().subscribe(
      (data: Phim[]) => {
        this.phimList = data;
      },
      (error) => {
        console.error('Lỗi khi tải danh sách phim:', error);
        this.showError('Không thể tải danh sách phim');
      }
    );
  }

  loadPhongChieu() {
    this.adminService.getAllPhongChieu().subscribe(
      (data: PhongChieu[]) => {
        this.phongchieuList = data;
      },
      (error) => {
        console.error('Lỗi khi tải danh sách phòng chiếu:', error);
        this.showError('Không thể tải danh sách phòng chiếu');
      }
    );
  }

  async openAddSuatChieuModal() {
    const modal = await this.modalController.create({
      component: AddSuatChieuModalComponent,
      componentProps: {
        phimList: this.phimList,
        phongchieuList: this.phongchieuList
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.addSuatChieu(data);
    }
  }

  addSuatChieu(data: any) {
    this.adminService.addSuatChieu(data).subscribe(
      (response) => {
        this.loadSuatChieu();
        this.showSuccess('Thêm suất chiếu thành công');
      },
      (error) => {
        console.error('Lỗi khi thêm suất chiếu:', error);
        this.showError('Không thể thêm suất chiếu');
      }
    );
  }

  async editSuatChieu(suatchieu: SuatChieu) {
    const modal = await this.modalController.create({
      component: AddSuatChieuModalComponent,
      componentProps: {
        phimList: this.phimList,
        phongchieuList: this.phongchieuList,
        suatchieu: suatchieu
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.updateSuatChieu(suatchieu.id, data);
    }
  }

  updateSuatChieu(id: number, data: any) {
    this.adminService.updateSuatChieu(id, data).subscribe(
      (response) => {
        this.loadSuatChieu();
        this.showSuccess('Cập nhật suất chiếu thành công');
      },
      (error) => {
        console.error('Lỗi khi cập nhật suất chiếu:', error);
        this.showError('Không thể cập nhật suất chiếu');
      }
    );
  }

  async deleteSuatChieu(id: number) {
    const alert = await this.alertController.create({
      header: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa suất chiếu này?',
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel'
        },
        {
          text: 'Xóa',
          handler: () => {
            this.adminService.deleteSuatChieu(id).subscribe(
              (response) => {
                this.loadSuatChieu();
                this.showSuccess('Xóa suất chiếu thành công');
              },
              (error) => {
                console.error('Lỗi khi xóa suất chiếu:', error);
                this.showError('Không thể xóa suất chiếu');
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
