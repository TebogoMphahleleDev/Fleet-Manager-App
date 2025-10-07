import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TripService, Trip } from '../../services/trip.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.scss']
})
export class TripDetailComponent implements OnInit {
  trip: Trip | null = null;
  errorMessage: string = '';

  constructor(
    private tripService: TripService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.loadTrip(id);
  }

  loadTrip(id: number): void {
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

  deleteTrip(): void {
    if (this.trip) {
      this.tripService.deleteTrip(this.trip.id).subscribe({
        next: () => this.router.navigate(['/trips']),
        error: () => this.errorMessage = 'Failed to delete trip'
      });
    }
  }
}
