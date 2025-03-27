import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DichvuService {
  private API_URL = 'http://127.0.0.1:8000/api/dichvu/';

  constructor(private http: HttpClient) {}

  getFoodList() {
    return this.http.get<{ foods: any[] }>(this.API_URL);
  }
}