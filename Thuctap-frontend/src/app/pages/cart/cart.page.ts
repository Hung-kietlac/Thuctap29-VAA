import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DichvuService } from '../../services/dichvu.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class CartPage implements OnInit {
  phim: any = {};
  soLuong: number = 1;
  donGia: number = 0;
  tongTien: number = 0;
  gioHang: any[] = [];
  foods: any[] = [];
  selectedFoods: any[] = [];
  hienDanhSachMonAn: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private dichvuService: DichvuService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.phim = params;
      this.donGia = params['total'] ? Number(params['total']) : 0;
      this.capNhatTongTien();
      console.log('Thông tin phim:', this.phim);
    });

    this.layDanhSachDoAn();
  }

  layDanhSachDoAn() {
    this.dichvuService.getFoodList().subscribe(data => {
      this.foods = data.foods;
    });
  }

  toggleDanhSachMonAn() {
    this.hienDanhSachMonAn = !this.hienDanhSachMonAn;
  }

  themMonAn(monAn: any) {
    let item = this.gioHang.find(m => m.id === monAn.id);
    if (item) {
      item.soLuong++;
    } else {
      this.gioHang.push({ ...monAn, soLuong: 1 });
    }
  }

  giamSoLuongMonAn(monAn: any) {
    let index = this.gioHang.findIndex(m => m.id === monAn.id);
    if (index !== -1) {
      if (this.gioHang[index].soLuong > 1) {
        this.gioHang[index].soLuong--;
      } else {
        this.gioHang.splice(index, 1);
      }
    }
  }

  tinhTongTien(): number {
    return this.gioHang.reduce((total, item) => total + item.gia * item.soLuong, 0);
  }

  tangSoLuong() {
    this.soLuong++;
    this.capNhatTongTien();
  }

  giamSoLuong() {
    if (this.soLuong > 1) {
      this.soLuong--;
      this.capNhatTongTien();
    }
  }

  capNhatTongTien() {
    this.tongTien = this.soLuong * this.donGia + this.tinhTongTien();
  }
}