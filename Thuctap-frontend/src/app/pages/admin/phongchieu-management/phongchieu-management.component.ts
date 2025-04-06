import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { AlertController, ModalController } from '@ionic/angular';
import { AddPhongChieuModalComponent } from './add-phongchieu-modal/add-phongchieu-modal.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

interface Rap {
  id: number;
  tenrap: string;
  diachi: string;
  sodienthoai: string;
}

interface PhongChieu {
  id: number;
  tenphongchieu: string;
  soluongghe: number;
  rap: Rap;
}

@Component({
  selector: 'app-phongchieu-management',
  templateUrl: './phongchieu-management.component.html',
  styleUrls: ['./phongchieu-management.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PhongChieuManagementComponent implements OnInit {
  phongchieuList: PhongChieu[] = [];
  rapList: Rap[] = [];

  constructor(
    private adminService: AdminService,
    private modalCtrl: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadPhongChieu();
    this.loadRap();
  }

  loadPhongChieu() {
    this.adminService.getAllPhongChieu().subscribe({
      next: (data) => {
        this.phongchieuList = data;
      },
      error: (error) => {
        console.error('Error loading phong chieu:', error);
      }
    });
  }

  loadRap() {
    this.adminService.getAllRap().subscribe({
      next: (data) => {
        this.rapList = data;
      },
      error: (error) => {
        console.error('Error loading rap:', error);
      }
    });
  }

  async openAddPhongChieuModal(phongchieu?: PhongChieu) {
    const modal = await this.modalCtrl.create({
      component: AddPhongChieuModalComponent,
      componentProps: {
        phongchieu: phongchieu,
        rapList: this.rapList
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        if (phongchieu) {
          this.adminService.updatePhongChieu(phongchieu.id, result.data).subscribe({
            next: () => {
              this.loadPhongChieu();
            },
            error: (error) => {
              console.error('Error updating phong chieu:', error);
            }
          });
        } else {
          this.adminService.addPhongChieu(result.data).subscribe({
            next: () => {
              this.loadPhongChieu();
            },
            error: (error) => {
              console.error('Error adding phong chieu:', error);
            }
          });
        }
      }
    });

    await modal.present();
  }

  async editPhongChieu(phongchieu: PhongChieu) {
    await this.openAddPhongChieuModal(phongchieu);
  }

  async deletePhongChieu(phongchieu: PhongChieu) {
    const alert = await this.alertController.create({
      header: 'Xác nhận',
      message: 'Bạn có chắc chắn muốn xóa phòng chiếu này?',
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel'
        },
        {
          text: 'Xóa',
          handler: () => {
            this.adminService.deletePhongChieu(phongchieu.id).subscribe({
              next: () => {
                this.loadPhongChieu();
              },
              error: (error) => {
                console.error('Error deleting phong chieu:', error);
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }
} 