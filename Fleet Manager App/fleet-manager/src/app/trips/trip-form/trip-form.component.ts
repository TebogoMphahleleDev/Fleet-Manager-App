import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TripService, Trip } from '../../services/trip.service';
import { DriverService, Driver } from '../../services/driver.service';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trip-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.scss']
})
export class TripFormComponent implements OnInit {
  tripForm: FormGroup;
  tripId: string | null = null;
  errorMessage: string = '';
  drivers: Driver[] = [];
  vehicles: Vehicle[] = [];

  constructor(
    private fb: FormBuilder,
    private tripService: TripService,
    private driverService: DriverService,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.tripForm = this.fb.group({
      driver_id: ['', Validators.required],
      vehicle_id: ['', Validators.required],
      start_location: ['', Validators.required],
      end_location: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDrivers();
    this.loadVehicles();
    this.tripId = this.route.snapshot.params['id'] || null;
    if (this.tripId) {
      this.loadTrip(this.tripId);
    }
  }

  loadDrivers(): void {
    this.driverService.getDrivers().subscribe({
      next: (data) => this.drivers = data,
      error: () => this.errorMessage = 'Failed to load drivers'
    });
  }

  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (data) => this.vehicles = data,
      error: () => this.errorMessage = 'Failed to load vehicles'
    });
  }

  loadTrip(id: string): void {
    this.tripService.getTrips().subscribe({
      next: (trips) => {
        const trip = trips.find(t => t.id === id);
        if (trip) {
          this.tripForm.patchValue(trip);
        } else {
          this.errorMessage = 'Trip not found';
        }
      },
      error: () => this.errorMessage = 'Failed to load trip'
    });
  }

  onSubmit(): void {
    console.log('Form valid:', this.tripForm.valid);
    if (this.tripForm.invalid) {
      return;
    }
    const tripData = this.tripForm.value;
    console.log('Submitting trip data:', tripData);
    if (this.tripId) {
      this.tripService.updateTrip(this.tripId, tripData).subscribe({
        next: () => {
          console.log('Trip updated successfully');
          this.router.navigate(['/trips']);
        },
        error: (err) => {
          console.error('Error updating trip', err);
          this.errorMessage = err.message || 'Failed to update trip';
        }
      });
    } else {
      this.tripService.addTrip(tripData).subscribe({
        next: () => {
          console.log('Trip added successfully');
          this.router.navigate(['/trips']);
        },
        error: (err) => {
          console.error('Error adding trip', err);
          this.errorMessage = err.message || 'Failed to add trip';
        }
      });
    }
  }
}
