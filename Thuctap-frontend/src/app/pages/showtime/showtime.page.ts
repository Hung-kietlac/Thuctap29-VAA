import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

interface Phim {
  _id: string;
  tenphim: string;
  theloai?: string;
}

interface Rap {
  _id: string;
  tenrap: string;
}

interface Showtime {
  _id: string;
  tenphim: string;
  rap: string;
  phong: string;
  ngaychieu: string;
  giochieu: string;
}

@Component({
  selector: 'app-showtime',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './showtime.page.html',
  styleUrls: ['./showtime.page.scss'],
})
export class ShowtimePage implements OnInit {
  phimList: Phim[] = [];
  rapList: Rap[] = [];
  showtimes: Showtime[] = [];
  
  selectedSegment: string = 'showtimes';
  selectedMovie: string = '';
  selectedTheater: string = '';
  selectedDate: string = '';

  constructor(
    private http: HttpClient, 
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadMovies();
    this.loadTheaters();
    this.loadShowtimes();
  }

  // Lấy danh sách phim từ API
  loadMovies() {
    this.http.get<Phim[]>('http://localhost:8000/phim/').subscribe(
      (movies) => {
        this.phimList = movies.map(phim => ({
          _id: phim._id,
          tenphim: phim.tenphim,
          theloai: phim.theloai || 'Chưa có thể loại'
        }));
      },
      (error) => this.showErrorAlert('Không thể tải danh sách phim')
    );
  }

  // Lấy danh sách rạp từ API
  loadTheaters() {
    this.http.get<Rap[]>('http://localhost:8000/rap/').subscribe(
      (theaters) => {
        this.rapList = theaters.map(rap => ({
          _id: rap._id,
          tenrap: rap.tenrap
        }));
      },
      (error) => this.showErrorAlert('Không thể tải danh sách rạp')
    );
  }

  // Lấy danh sách lịch chiếu từ API
  loadShowtimes() {
    this.http.get<Showtime[]>('http://localhost:8000/get_showtimes/').subscribe(
      (showtimes) => {
        this.showtimes = showtimes.map(show => ({
          _id: show._id,
          tenphim: show.tenphim,
          rap: show.rap,
          phong: show.phong,
          ngaychieu: new Date(show.ngaychieu).toLocaleDateString(),
          giochieu: show.giochieu
        }));
      },
      (error) => this.showErrorAlert('Không thể tải lịch chiếu')
    );
  }

  // Tìm kiếm lịch chiếu theo tiêu chí
  searchShowtimes() {
    let filters: any = {};
    if (this.selectedMovie) filters.tenphim = this.selectedMovie;
    if (this.selectedTheater) filters.rap = this.selectedTheater;
    if (this.selectedDate) filters.ngaychieu = this.selectedDate;

    this.http.post<Showtime[]>('http://localhost:8000/get_showtimes/', filters).subscribe(
      (showtimes) => this.showtimes = showtimes,
      (error) => this.showErrorAlert('Không thể tìm kiếm lịch chiếu')
    );
  }

  // Hiển thị thông báo lỗi
  async showErrorAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Thông báo',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}