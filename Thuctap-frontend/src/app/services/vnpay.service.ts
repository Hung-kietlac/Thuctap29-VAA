import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VnpayService {
  private apiUrl = 'http://localhost:8000/generate_qr/';

  constructor(private http: HttpClient) {}

  getVnpayQR(amount: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?amount=${amount}`);
  }
}