import { Component, OnInit } from '@angular/core';
import { TripService, Trip } from '../../services/trip.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss'],
  imports: [CommonModule, RouterModule]
})
export class TripListComponent implements OnInit {
  trips: Trip[] = [];
  errorMessage: string = '';

  constructor(private tripService: TripService) {}

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.tripService.getTrips().subscribe({
      next: (data) => this.trips = data,
      error: (err) => this.errorMessage = 'Failed to load trips'
    });
  }

  deleteTrip(id: string): void {
    this.tripService.deleteTrip(id).subscribe({
      next: () => this.loadTrips(),
      error: (err) => this.errorMessage = 'Failed to delete trip'
    });
  }
}
