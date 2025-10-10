import { Component, OnInit } from '@angular/core';
import { TripService, Trip } from '../../services/trip.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Component for displaying a list of trips.
 * Allows viewing and deleting trips.
 */
@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss'],
  imports: [CommonModule, RouterModule],
  standalone: true
})
export class TripListComponent implements OnInit {
  trips: Trip[] = [];
  errorMessage: string = '';

  /**
   * Constructor for TripListComponent.
   * @param tripService Service for managing trip data.
   */
  constructor(private tripService: TripService) {}

  /**
   * Initializes the component by loading the list of trips.
   */
  ngOnInit(): void {
    this.loadTrips();
  }

  /**
   * Loads the list of trips from the service and updates the component state.
   */
  loadTrips(): void {
    this.tripService.getTrips().subscribe({
      next: (data) => this.trips = data,
      error: (err) => this.errorMessage = 'Failed to load trips'
    });
  }

  /**
   * Deletes a trip by ID and reloads the list on success.
   * @param id The ID of the trip to delete.
   */
  deleteTrip(id: string): void {
    this.tripService.deleteTrip(id).subscribe({
      next: () => this.loadTrips(),
      error: (err) => this.errorMessage = 'Failed to delete trip'
    });
  }
}
