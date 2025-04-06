import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

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
  selector: 'app-add-phongchieu-modal',
  templateUrl: './add-phongchieu-modal.component.html',
  styleUrls: ['./add-phongchieu-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddPhongChieuModalComponent {
  @Input() phongchieu?: PhongChieu;
  @Input() rapList: Rap[] = [];

  tenphongchieu: string = '';
  soluongghe: number = 0;
  rap_id: number = 0;

  constructor(private modalController: ModalController) {
    if (this.phongchieu) {
      this.tenphongchieu = this.phongchieu.tenphongchieu;
      this.soluongghe = this.phongchieu.soluongghe;
      this.rap_id = this.phongchieu.rap.id;
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  save() {
    const data = {
      tenphongchieu: this.tenphongchieu,
      soluongghe: this.soluongghe,
      rap_id: this.rap_id
    };
    this.modalController.dismiss(data);
  }
} 