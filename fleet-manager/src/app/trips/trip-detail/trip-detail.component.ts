import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TripService, Trip } from '../../services/trip.service';
import { CommonModule } from '@angular/common';

/**
 * Component for displaying details of a specific trip.
 * Allows viewing and deleting the trip.
 */
@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.scss']
})
export class TripDetailComponent implements OnInit {
  trip: Trip | null = null;
  errorMessage: string = '';

  /**
   * Constructor for TripDetailComponent.
   * @param tripService Service for managing trip data.
   * @param route ActivatedRoute for accessing route parameters.
   * @param router Router for navigation.
   */
  constructor(
    private tripService: TripService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * Initializes the component and loads the trip based on the route ID.
   */
  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadTrip(id);
  }

  /**
   * Loads the trip details by ID from the service.
   * @param id The ID of the trip to load.
   */
  loadTrip(id: string): void {
    this.tripService.getTrips().subscribe({
      next: (trips) => {
        this.trip = trips.find(t => t.id === id) || null;
        if (!this.trip) {
          this.errorMessage = 'Trip not found';
        }
      },
      error: () => this.errorMessage = 'Failed to load trip'
    });
  }

  /**
   * Deletes the current trip and navigates back to the trips list.
   */
  deleteTrip(): void {
    if (this.trip) {
      this.tripService.deleteTrip(this.trip.id).subscribe({
        next: () => this.router.navigate(['/trips']),
        error: () => this.errorMessage = 'Failed to delete trip'
      });
    }
  }
}
