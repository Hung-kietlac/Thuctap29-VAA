import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderPage } from '../../shared/header/header.page';
import { FooterPage } from '../../shared/footer/footer.page';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderPage, FooterPage]
})
export class DetailsPage implements OnInit {
  phim: any;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log("Nhận ID phim:", id);

    if (id) {
      this.http.get(`http://127.0.0.1:8000/api/phim/${id}/`).subscribe(
        (data) => {
          this.phim = data;
          console.log("Dữ liệu phim chi tiết:", this.phim);
        },
        (error) => console.error("Lỗi khi lấy phim:", error)
      );
    }
  }

  bookTicket() {
    console.log('Đặt vé cho phim:', this.phim.tenphim);
    this.router.navigate(['/cart'], {queryParams: {tenphim: this.phim.tenphim, ngaychieu: this.phim.ngaychieu, poster: this.phim.poster}});
  }
  
  // Xử lý mở trailer
  openTrailer(url: string) {
    if (url && url.includes('youtube.com') || url.includes('youtu.be')) {
      window.open(url, '_blank');
    } else {
      console.error('URL không hợp lệ');
    }
  }
}