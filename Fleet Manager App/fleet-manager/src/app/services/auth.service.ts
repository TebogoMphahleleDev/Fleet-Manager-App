import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'

})

export class AuthService {

  private apiUrl = 'http://localhost:8000'; // Backend URL

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    return this.http.post(`${this.apiUrl}/token`, formData).pipe(
      tap((res: any) => {
        localStorage.setItem('access_token', res.access_token);
      })

    );

  }
  logout() {

    localStorage.removeItem('access_token');

  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
  getToken(): string | null {
    return localStorage.getItem('access_token');

  }

}
