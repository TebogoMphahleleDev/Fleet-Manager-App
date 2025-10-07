import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'

})

export class AuthService {

  private apiUrl = 'http://localhost:8000'; // Backend URL

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  login(username: string, password: string): Observable<any> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    return this.http.post(`${this.apiUrl}/token`, formData).pipe(
      tap((res: any) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('access_token', res.access_token);
        }
      })

    );

  }
  logout() {

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
    }

  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('access_token');
    }
    return false;
  }
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;

  }

}
