import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Phim
  getAllPhim(): Observable<any> {
    return this.http.get(`${this.apiUrl}/phim/`);
  }

  addPhim(data: any): Observable<any> {
    // Thêm trường trangthai mặc định
    const phimData = {
      ...data,
      trangthai: 'Sắp chiếu'
    };
    return this.http.post(`${this.apiUrl}/phim/`, phimData);
  }

  updatePhim(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/phim/${id}/`, data).pipe(
      catchError(error => {
        console.error('Error updating phim:', error);
        throw error;
      })
    );
  }

  deletePhim(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/phim/${id}/`);
  }

  // Phòng chiếu
  getAllPhongChieu(): Observable<any> {
    return this.http.get(`${this.apiUrl}/phongchieu/`);
  }

  addPhongChieu(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/phongchieu/`, data);
  }

  updatePhongChieu(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/phongchieu/${id}/`, data);
  }

  deletePhongChieu(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/phongchieu/${id}/`);
  }

  // Suất chiếu
  getAllSuatChieu(): Observable<any> {
    return this.http.get(`${this.apiUrl}/suatchieu/`);
  }

  addSuatChieu(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/suatchieu/`, data);
  }

  updateSuatChieu(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/suatchieu/${id}/`, data);
  }

  deleteSuatChieu(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/suatchieu/${id}/`);
  }

  // Vé
  getAllVe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ve/`);
  }

  getVeChuaThanhToan(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ve/chua_thanh_toan/`);
  }

  getVeDaThanhToan(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ve/da_thanh_toan/`);
  }

  getVeDaHuy(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ve/da_huy/`);
  }

  updateVe(id: number, veData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/ve/${id}/`, veData);
  }

  // Dịch vụ
  getAllDichVu(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dichvu/`);
  }

  addDichVu(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/dichvu/`, data);
  }

  updateDichVu(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/dichvu/${id}/`, data);
  }

  deleteDichVu(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/dichvu/${id}/`);
  }

  // Rap
  getAllRap(): Observable<any> {
    return this.http.get(`${this.apiUrl}/rap/`);
  }
} 