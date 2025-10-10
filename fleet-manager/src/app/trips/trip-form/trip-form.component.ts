import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TripService, Trip } from '../../services/trip.service';
import { DriverService, Driver } from '../../services/driver.service';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/**
 * Component for adding or editing a trip.
 * Provides a form to input trip details and handles submission.
 */
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

  /**
   * Constructor for TripFormComponent.
   * Initializes the form with required validators.
   * @param fb FormBuilder for creating the form.
   * @param tripService Service for managing trip data.
   * @param driverService Service for managing driver data.
   * @param vehicleService Service for managing vehicle data.
   * @param route ActivatedRoute for accessing route parameters.
   * @param router Router for navigation.
   */
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

  /**
   * Initializes the component, loads drivers and vehicles, and checks for edit mode.
   */
  ngOnInit(): void {
    this.loadDrivers();
    this.loadVehicles();
    this.tripId = this.route.snapshot.params['id'] || null;
    if (this.tripId) {
      this.loadTrip(this.tripId);
    }
  }

  /**
   * Loads the list of drivers from the service.
   */
  loadDrivers(): void {
    this.driverService.getDrivers().subscribe({
      next: (data) => this.drivers = data,
      error: () => this.errorMessage = 'Failed to load drivers'
    });
  }

  /**
   * Loads the list of vehicles from the service.
   */
  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (data) => this.vehicles = data,
      error: () => this.errorMessage = 'Failed to load vehicles'
    });
  }

  /**
   * Loads the trip data for editing by ID.
   * @param id The ID of the trip to load.
   */
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

  /**
   * Handles form submission for adding or updating a trip.
   */
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
