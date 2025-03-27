import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/users/login_user/';
  
  // BehaviorSubject để theo dõi trạng thái đăng nhập
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.checkAuth());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<{ message: string; role: string; username: string }> {
    return this.http.post<{ message: string; role: string; username: string }>(this.apiUrl, { username, password }).pipe(
      tap(response => {
        localStorage.setItem('userRole', response.role);
        localStorage.setItem('username', response.username);
        
        // Cập nhật trạng thái đăng nhập
        this.isLoggedInSubject.next(true);
      })
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('userRole');
  }

  logout(): void {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');

    // Cập nhật trạng thái đăng xuất
    this.isLoggedInSubject.next(false);
  }

  private checkAuth(): boolean {
    return !!localStorage.getItem('userRole');
  }
}