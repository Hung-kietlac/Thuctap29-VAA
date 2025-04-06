import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  selector: 'app-add-suatchieu-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ isEdit ? 'Sửa suất chiếu' : 'Thêm suất chiếu mới' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Đóng</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item>
          <ion-label position="stacked">Phim</ion-label>
          <ion-select [(ngModel)]="suatChieuData.phim_id">
            <ion-select-option *ngFor="let phim of phimList" [value]="phim.id">
              {{ phim.tenphim }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Phòng chiếu</ion-label>
          <ion-select [(ngModel)]="suatChieuData.phongchieu_id">
            <ion-select-option *ngFor="let phong of phongchieuList" [value]="phong.id">
              {{ phong.tenphongchieu }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Ngày chiếu</ion-label>
          <ion-input type="date" [(ngModel)]="suatChieuData.ngaychieu"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Giờ bắt đầu</ion-label>
          <ion-input type="time" [(ngModel)]="suatChieuData.giobatdau"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Giờ kết thúc</ion-label>
          <ion-input type="time" [(ngModel)]="suatChieuData.gioketthuc"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Giá vé</ion-label>
          <ion-input type="number" [(ngModel)]="suatChieuData.giave"></ion-input>
        </ion-item>
      </ion-list>

      <ion-button expand="block" (click)="save()">
        {{ isEdit ? 'Lưu' : 'Thêm' }}
      </ion-button>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddSuatChieuModalComponent implements OnInit {
  @Input() phimList: Phim[] = [];
  @Input() phongchieuList: PhongChieu[] = [];
  @Input() suatchieu?: SuatChieu;

  suatChieuData: any = {
    phim_id: '',
    phongchieu_id: '',
    ngaychieu: '',
    giobatdau: '',
    gioketthuc: '',
    giave: ''
  };

  isEdit = false;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.suatchieu) {
      this.isEdit = true;
      this.suatChieuData = {
        phim_id: this.suatchieu.phim.id,
        phongchieu_id: this.suatchieu.phongchieu.id,
        ngaychieu: this.suatchieu.ngaychieu,
        giobatdau: this.suatchieu.giobatdau,
        gioketthuc: this.suatchieu.gioketthuc,
        giave: this.suatchieu.giave
      };
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    this.modalCtrl.dismiss(this.suatChieuData);
  }
} 