import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
})
export class CartPage implements OnInit {
  phim: any = {};
  soLuong: number = 0;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.phim = params;
      console.log("Thông tin phim:", this.phim);
    });
  }

  tangSoLuong() {
    this.soLuong++;
  }

  giamSoLuong() {
    if (this.soLuong > 1) {
      this.soLuong--;
    }
  }
}