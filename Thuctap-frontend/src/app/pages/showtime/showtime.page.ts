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
      (error) => this.showErrorAlert('Không thể tìm kiếm lịch chiếu')
    );
  }

  // Hiển thị thông báo lỗi
  async showErrorAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Lỗi',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Thêm lịch chiếu mới
  async addShowtime() {
    const alert = await this.alertCtrl.create({
      header: 'Thêm lịch chiếu mới',
      inputs: [
        {
          name: 'phim',
          type: 'text',
          placeholder: 'Tên phim'
        },
        {
          name: 'rap',
          type: 'text',
          placeholder: 'Tên rạp'
        },
        {
          name: 'phong',
          type: 'text',
          placeholder: 'Phòng chiếu'
        },
        {
          name: 'ngaychieu',
          type: 'date',
          placeholder: 'Ngày chiếu'
        },
        {
          name: 'giochieu',
          type: 'time',
          placeholder: 'Giờ chiếu'
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
            this.http.post('http://localhost:8000/add_showtime/', data).subscribe(
              () => {
                this.loadShowtimes();
              },
              (error) => this.showErrorAlert('Không thể thêm lịch chiếu')
            );
          }
        }
      ]
    });
    await alert.present();
  }

  // Cập nhật lịch chiếu
  async updateShowtime(id: string) {
    const showtime = this.showtimes.find(s => s._id === id);
    if (!showtime) return;

    const alert = await this.alertCtrl.create({
      header: 'Cập nhật lịch chiếu',
      inputs: [
        {
          name: 'phim',
          type: 'text',
          value: showtime.tenphim,
          placeholder: 'Tên phim'
        },
        {
          name: 'rap',
          type: 'text',
          value: showtime.rap,
          placeholder: 'Tên rạp'
        },
        {
          name: 'phong',
          type: 'text',
          value: showtime.phong,
          placeholder: 'Phòng chiếu'
        },
        {
          name: 'ngaychieu',
          type: 'date',
          value: showtime.ngaychieu,
          placeholder: 'Ngày chiếu'
        },
        {
          name: 'giochieu',
          type: 'time',
          value: showtime.giochieu,
          placeholder: 'Giờ chiếu'
        }
      ],
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel'
        },
        {
          text: 'Cập nhật',
          handler: (data) => {
            this.http.put(`http://localhost:8000/update_showtime/${id}/`, data).subscribe(
              () => {
                this.loadShowtimes();
              },
              (error) => this.showErrorAlert('Không thể cập nhật lịch chiếu')
            );
          }
        }
      ]
    });
    await alert.present();
  }

  // Xóa lịch chiếu
  async deleteShowtime(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Xác nhận',
      message: 'Bạn có chắc chắn muốn xóa lịch chiếu này?',
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel'
        },
        {
          text: 'Xóa',
          handler: () => {
            this.http.delete(`http://localhost:8000/delete_showtime/${id}/`).subscribe(
              () => {
                this.loadShowtimes();
              },
              (error) => this.showErrorAlert('Không thể xóa lịch chiếu')
            );
          }
        }
      ]
    });
    await alert.present();
  }

  // Thêm rạp phim mới
  async addTheater() {
    const alert = await this.alertCtrl.create({
      header: 'Thêm rạp phim mới',
      inputs: [
        {
          name: 'tenrap',
          type: 'text',
          placeholder: 'Tên rạp phim'
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
            this.http.post('http://localhost:8000/rap/', data).subscribe(
              () => {
                this.loadTheaters();
              },
              (error) => this.showErrorAlert('Không thể thêm rạp phim')
            );
          }
        }
      ]
    });
    await alert.present();
  }

  // Cập nhật rạp phim
  async updateTheater(id: string) {
    const rap = this.rapList.find(r => r._id === id);
    if (!rap) return;

    const alert = await this.alertCtrl.create({
      header: 'Cập nhật rạp phim',
      inputs: [
        {
          name: 'tenrap',
          type: 'text',
          value: rap.tenrap,
          placeholder: 'Tên rạp phim'
        }
      ],
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel'
        },
        {
          text: 'Cập nhật',
          handler: (data) => {
            this.http.put(`http://localhost:8000/rap/${id}/`, data).subscribe(
              () => {
                this.loadTheaters();
              },
              (error) => this.showErrorAlert('Không thể cập nhật rạp phim')
            );
          }
        }
      ]
    });
    await alert.present();
  }

  // Xóa rạp phim
  async deleteTheater(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Xác nhận',
      message: 'Bạn có chắc chắn muốn xóa rạp phim này?',
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel'
        },
        {
          text: 'Xóa',
          handler: () => {
            this.http.delete(`http://localhost:8000/rap/${id}/`).subscribe(
              () => {
                this.loadTheaters();
              },
              (error) => this.showErrorAlert('Không thể xóa rạp phim')
            );
          }
        }
      ]
    });
    await alert.present();
  }

  // Thêm phim mới
  async addMovie() {
    const alert = await this.alertCtrl.create({
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
            this.http.post('http://localhost:8000/phim/', data).subscribe(
              () => {
                this.loadMovies();
              },
              (error) => this.showErrorAlert('Không thể thêm phim')
            );
          }
        }
      ]
    });
    await alert.present();
  }

  // Cập nhật phim
  async updateMovie(id: string) {
    const phim = this.phimList.find(p => p._id === id);
    if (!phim) return;

    const alert = await this.alertCtrl.create({
      header: 'Cập nhật phim',
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
        }
      ],
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel'
        },
        {
          text: 'Cập nhật',
          handler: (data) => {
            this.http.put(`http://localhost:8000/phim/${id}/`, data).subscribe(
              () => {
                this.loadMovies();
              },
              (error) => this.showErrorAlert('Không thể cập nhật phim')
            );
          }
        }
      ]
    });
    await alert.present();
  }

  // Xóa phim
  async deleteMovie(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Xác nhận',
      message: 'Bạn có chắc chắn muốn xóa phim này?',
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel'
        },
        {
          text: 'Xóa',
          handler: () => {
            this.http.delete(`http://localhost:8000/phim/${id}/`).subscribe(
              () => {
                this.loadMovies();
              },
              (error) => this.showErrorAlert('Không thể xóa phim')
            );
          }
        }
      ]
    });
    await alert.present();
  }
}