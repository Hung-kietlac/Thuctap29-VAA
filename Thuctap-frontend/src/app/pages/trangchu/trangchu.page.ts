import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import 'swiper/css';

@Component({
  selector: 'app-trangchu',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './trangchu.page.html',
  styleUrls: ['./trangchu.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TrangchuPage implements OnInit {
  selectedCategory: string = 'dang-chieu';
  selectedGenre: string = 'all';
  nowPlayingMovies: any[] = [];
  upcomingMovies: any[] = [];
  featuredBanners: any[] = [];
  phim: any = {};
  rap: any = {};
  genres: any[] = [];
  nearbyTheaters: any[] = [];
  promotions: any[] = [];
  userCoordinates: { lat: number, lng: number } = { lat: 0, lng: 0 };
  today: string = '';
  isLoggedIn = false;
  selectedDate: string = '';
  showUpcoming: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.getUserLocation();
    this.today = this.getTodayDate();
    this.fetchMovies();
    this.loadFeaturedBanners();
    this.loadGenresByMovie(this.phim.tenphim);
    this.loadNearbyTheaters();
    this.loadPromotions();
    this.isLoggedIn = !!localStorage.getItem('userRole');
    this.selectedDate = this.getTodayDate();
  }

  handleAction() {
    if (!this.isLoggedIn) {
      alert("Bạn cần đăng nhập để thực hiện hành động này!");
      this.router.navigate(['/dangnhap']);
      return;
    }
  }

  checkLoginStatus() {
    this.isLoggedIn = !!localStorage.getItem('userToken');
  }

  loginSuccess(token: string) {
    localStorage.setItem('userToken', token);
    this.router.navigate(['/trangchu']).then(() => {
      window.location.reload();
    });
  }

  //Lấy vị trí người dùng
  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log('Vị trí người dùng:', this.userCoordinates);
          this.loadNearbyTheaters();
        },
        (error) => {
          console.error('Lỗi khi lấy vị trí:', error);
        }
      );
    } else {
      console.error('Trình duyệt không hỗ trợ Geolocation');
    }
  }

  // Lấy ngày hiện tại (định dạng YYYY-MM-DD)
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  filterMoviesByDate() {
    if (!this.selectedDate) return;
    this.displayedMovies = this.nowPlayingMovies.filter(phim => phim.ngaychieu === this.selectedDate);
  }

  // Lấy danh sách phim
  fetchMovies() {
    this.http.get<{ phim: any[] }>('http://127.0.0.1:8000/api/phim/')
      .subscribe({
        next: (response) => {
          if (response && response.phim && Array.isArray(response.phim)) {
            const today = new Date();  // Lấy ngày hiện tại
            this.nowPlayingMovies = response.phim.filter(phim => new Date(phim.ngaychieu) <= today);
            this.upcomingMovies = response.phim.filter(phim => new Date(phim.ngaychieu) > today);

            console.log("Phim đang chiếu:", this.nowPlayingMovies);
            console.log("Phim sắp chiếu:", this.upcomingMovies);
          } else {
            console.error('Dữ liệu phim không hợp lệ:', response);
          }
        },
        error: (error) => {
          console.error('Lỗi lấy dữ liệu phim:', error);
        }
      });
  }

  getCoordinatesFromAddress(address: string): Promise<{ lat: number, lng: number }> {
    return new Promise((resolve, reject) => {
      const cached = localStorage.getItem(`coords_${address}`);
      if (cached) {
        console.log(`Dùng tọa độ cache cho: ${address}`);
        resolve(JSON.parse(cached));
        return;
      }
  
      const encodedAddress = encodeURIComponent(address);
      const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&countrycodes=VN`;
  
      this.http.get(url).subscribe(
        (response: any) => {
          if (response.length > 0) {
            const location = { lat: parseFloat(response[0].lat), lng: parseFloat(response[0].lon) };
            localStorage.setItem(`coords_${address}`, JSON.stringify(location));
            console.log(`Lưu tọa độ cache cho: ${address}`);
            resolve(location);
          } else {
            console.warn(`Không tìm thấy tọa độ cho: ${address}`);
            resolve({ lat: 10.7769, lng: 106.7009 }); // Mặc định TP.HCM
          }
        },
        (error) => {
          console.error(`Lỗi khi lấy tọa độ của ${address}:`, error);
          reject(error);
        }
      );
    });
  }

  // Lấy danh sách rạp + tính khoảng cách
  loadNearbyTheaters() {
    this.http.get<{ rap: any[] }>('http://127.0.0.1:8000/api/rap/').subscribe({
      next: (response) => {
        console.log('Dữ liệu rạp phim:', response.rap);

        this.nearbyTheaters = response.rap.map(rap => ({
          ...rap,
          distance: null
        }));
  
        // Cập nhật khoảng cách song song
        this.nearbyTheaters.forEach(async (theater, index) => {
          try {
            const coords = await this.getCoordinatesFromAddress(theater.diachi);
            this.nearbyTheaters[index].lat = coords.lat;
            this.nearbyTheaters[index].lng = coords.lng;
            this.nearbyTheaters[index].distance = this.calculateDistance(
              this.userCoordinates.lat, 
              this.userCoordinates.lng, 
              coords.lat, 
              coords.lng
            );
          } catch (error) {
            console.error(`Lỗi khi xử lý tọa độ cho rạp ${theater.tenrap}:`, error);
            this.nearbyTheaters[index].distance = Infinity;
          }
        });
      },
      error: (error) => {
        console.error('Lỗi lấy dữ liệu rạp phim:', error);
      }
    });
  }

  // Tính khoảng cách giữa người dùng & rạp phim
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    if (!lat2 || !lng2) return Infinity; 
  
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = (lat2 - lat1) * 0.0174533; // Chuyển đổi sang radian
    const dLng = (lng2 - lng1) * 0.0174533;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
              Math.cos(lat1 * 0.0174533) * Math.cos(lat2 * 0.0174533) * 
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(0);
  }

  datve(phim: any) {
    if (!this.isLoggedIn) {
      alert("Bạn cần đăng nhập để đặt vé!");
      this.router.navigate(['/dangnhap']);
      return;
    }
    this.router.navigate(['/book-ticket'], { queryParams: {tenphim: phim.tenphim, theloai: phim.theloai, trailer: phim.trailer_teaser, mota: phim.mota, 
      tendaodien: phim.tendaodien, dienvien: phim.dienvien, poster: phim.poster, ngaychieu: phim.ngaychieu, danhgiaphim: phim.danhgiaphim, thoiluong: phim.thoiluong}});
  }

  logout() {
    localStorage.removeItem('userToken');
    this.isLoggedIn = false;
    this.router.navigate(['/dangnhap']);
  }

  heroBannerOpts = {
    slidesPerView: 1,
    spaceBetween: 10,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    loop: true,
  };

  displayedMovies = this.nowPlayingMovies.slice(0, 7);
  showAll = false;

  toggleMovies() {
    this.showAll = !this.showAll;
    this.displayedMovies = this.showAll ? this.nowPlayingMovies : this.nowPlayingMovies.slice(0, 7);
  }

  displayedUpcomingMovies = this.upcomingMovies.slice(0, 7);
  toggleUpcoming() {
    this.showUpcoming = !this.showUpcoming;
    this.displayedUpcomingMovies = this.showUpcoming ? this.upcomingMovies : this.upcomingMovies.slice(0, 7);
  }

  // Hàm lọc phim theo danh mục
  selectCategory(category: string) {
    this.selectedCategory = category;
  
    const today = this.getTodayDate();
  
    if (category === 'dang-chieu') {
      this.displayedMovies = this.nowPlayingMovies.filter(phim => phim.ngaychieu <= today);
    } else {
      this.displayedMovies = this.nowPlayingMovies;
    }
  }

  goToDetail(phimId: string) {
    console.log("ID phim:", phimId); // Kiểm tra ID có đúng không
    this.router.navigate(['/details', phimId]);
  }

  loadFeaturedBanners() {
    this.featuredBanners = [
      { id: 1, img: 'assets/banner1.jpg' },
      { id: 2, img: 'assets/banner2.jpg' }
    ];
  }

  loadGenresByMovie(title: string) {
    const movie = this.nowPlayingMovies.find(m => m.tenphim === title);
    this.genres = movie ? movie.theloai : [];
  }

  loadPromotions() {
    this.promotions = [
      { id: 1, title: 'Giảm 50% vé xem phim', image: 'https://png.pngtree.com/png-clipart/20201028/ourlarge/pngtree-super-hot-50-discount-promotion-yellow-sticker-png-image_2376814.jpg' },
      { id: 2, title: 'Tặng bắp rang miễn phí', image: 'https://th.bing.com/th/id/OIP.ctOKZWCmnRImZFwiaJZq5AHaFq?w=230&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7' }
    ];
  }

  selectGenre(genreId: string) {
    this.selectedGenre = genreId;
  }

  upcomingSlideOpts = {
    slidesPerView: 2,
    spaceBetween: 10,
    freeMode: true
  };
}