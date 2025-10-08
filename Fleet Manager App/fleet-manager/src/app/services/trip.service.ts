import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Trip {
  id: number;
  driver_id: number;
  vehicle_id: number;
  start_location: string;
  end_location: string;
  start_time: string;
  end_time: string;
}

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private apiUrl = 'http://localhost:8000/trips';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  addTrip(trip: Omit<Trip, 'id'>): Observable<Trip> {
    return this.http.post<Trip>(this.apiUrl, trip, { headers: this.getHeaders() });
  }

  updateTrip(id: number, trip: Omit<Trip, 'id'>): Observable<Trip> {
    return this.http.put<Trip>(`${this.apiUrl}/${id}`, trip, { headers: this.getHeaders() });
  }

  deleteTrip(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
