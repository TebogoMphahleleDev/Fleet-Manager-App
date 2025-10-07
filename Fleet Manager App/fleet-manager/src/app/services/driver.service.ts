import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Driver {
  id: number;
  name: string;
  vehicle_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private apiUrl = 'http://localhost:8000/drivers';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  addDriver(driver: Omit<Driver, 'id'>): Observable<Driver> {
    return this.http.post<Driver>(this.apiUrl, driver, { headers: this.getHeaders() });
  }

  updateDriver(id: number, driver: Omit<Driver, 'id'>): Observable<Driver> {
    return this.http.put<Driver>(`${this.apiUrl}/${id}`, driver, { headers: this.getHeaders() });
  }

  deleteDriver(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
