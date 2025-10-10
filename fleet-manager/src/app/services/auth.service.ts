import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

/**
 * Service for handling authentication operations such as login, register, logout, and token management.
 */
@Injectable({
  providedIn: 'root'

})

export class AuthService {

  private apiUrl = 'http://localhost:8000'; // Backend URL

  /**
   * Constructor for AuthService.
   * @param http HttpClient for making HTTP requests.
   * @param platformId Platform ID to check if running in browser.
   */
  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Logs in the user with the provided username and password.
   * Stores the access token in localStorage if successful.
   * @param username The username of the user.
   * @param password The password of the user.
   * @returns An Observable of the login response.
   */
  login(username: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set('username', username)
      .set('password', password);

    return this.http.post(`${this.apiUrl}/token`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap((res: any) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('access_token', res.access_token);
        }
      })

    );

  }

  /**
   * Registers a new user with the provided username and password.
   * @param username The username for the new user.
   * @param password The password for the new user.
   * @returns An Observable of the registration response.
   */
  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, password });
  }

  /**
   * Logs out the user by removing the access token from localStorage.
   */
  logout() {

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
    }

  }

  /**
   * Checks if the user is logged in by verifying the presence of the access token in localStorage.
   * @returns True if logged in, false otherwise.
   */
  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('access_token');
    }
    return false;
  }

  /**
   * Retrieves the access token from localStorage.
   * @returns The access token string or null if not present.
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;

  }

}
