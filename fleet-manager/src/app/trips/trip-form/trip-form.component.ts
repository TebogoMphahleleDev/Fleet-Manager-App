import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TripService, Trip } from '../../services/trip.service';
import { DriverService, Driver } from '../../services/driver.service';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { PopupService } from '../../services/popup.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConfirmDialogComponent } from '../../popup/confirm-dialog.component';

/**
 * Trip Form Component
 *
 * This component provides a form for adding or editing trip records.
 * It handles form validation, data submission, and navigation for trip management.
 *
 * Features:
 * - Form for trip details (driver, vehicle, locations, dates, times, status)
 * - Add new trip or edit existing trip functionality
 * - Form validation and error handling
 * - Confirmation dialogs for save operations
 * - Loading states during data operations
 * - Navigation back to trip list
 */
@Component({
  selector: 'app-trip-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.scss'],
})

export class TripFormComponent implements OnInit {
  // Component state properties
  tripForm: FormGroup;
  tripId: string | null = null;
  drivers: Driver[] = [];
  vehicles: Vehicle[] = [];
  hours: string[] = [];
  minutes: string[] = [];
  loading: boolean = false;

  /**
   * Constructor - Dependency Injection
   *
   * Initializes the component with required services and sets up the trip form.
   *
   * @param fb - FormBuilder for creating reactive forms
   * @param tripService - Service for managing trip data operations
   * @param driverService - Service for managing driver data operations
   * @param vehicleService - Service for managing vehicle data operations
   * @param route - ActivatedRoute for accessing route parameters
   * @param router - Router for navigation between components
   * @param popupService - Service for displaying popup notifications
   * @param dialog - MatDialog for opening confirmation dialogs
   */
  constructor(
    private fb: FormBuilder,
    private tripService: TripService,
    private driverService: DriverService,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router,
    private popupService: PopupService,
    private dialog: MatDialog
  ) {
    this.tripForm = this.fb.group({
      driver_id: ['', Validators.required],
      vehicle_id: ['', Validators.required],
      start_location: ['', Validators.required],
      end_location: ['', Validators.required],
      start_date: ['', Validators.required],
      start_hour: [''],
      start_minute: [''],
      end_date: ['', Validators.required],
      end_hour: [''],
      end_minute: [''],
      status: ['planned'],
      is_round_trip: [false],
    });
  }

  /**
   * Lifecycle Hook - OnInit
   *
   * Called once the component is initialized.
   * Initializes time arrays, loads drivers and vehicles, and checks for edit mode.
   */
  ngOnInit(): void {
    // Initialize hours and minutes arrays
    this.hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'));
    this.minutes = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'));

    this.loadDrivers(); // Load available drivers
    this.loadVehicles(); // Load available vehicles

    // Check if editing an existing trip
    this.tripId = this.route.snapshot.params['id'] || null;
    if (this.tripId) 
    {
      this.loadTrip(this.tripId);
    }
  }

  /**
   * Loads the List of Drivers
   *
   * Fetches all available drivers from the service for trip assignment.
   * Updates the component state with the retrieved driver data.
   */

  // Fetches all available drivers from the service
  loadDrivers(): void
  {
    // Subscribe to the driver service to get drivers
    this.driverService.getDrivers().subscribe({
      next: (data) => this.drivers = data,
      error: () => this.popupService.showError('Failed to load drivers'),
    });
  }

  /**
   * Loads the List of Vehicles
   *
   * Fetches all available vehicles from the service for trip assignment.
   * Updates the component state with the retrieved vehicle data.
   */
  loadVehicles(): void 
  {
    this.vehicleService.getVehicles().subscribe({
      next: (data) => this.vehicles = data,
      error: () => this.popupService.showError('Failed to load vehicles'),
    });
    
  }

  /**
   * Loads Trip Data for Editing
   *
   * Retrieves trip information by ID and populates the form for editing.
   * Displays error message if trip record is not found.
   *
   * @param id - The unique identifier of the trip record to load
   */

  // Loads trip data for editing
  loadTrip(id: string): void {
    this.tripService.getTrips().subscribe({
      next: (trips) => {
        const trip = trips.find(t => t.id === id);

        // If trip is found, populate the form
        if (trip) {
          this.tripForm.patchValue(trip);
        }

        // If start_time exists, split into hour and minute
        else {
          this.popupService.showError('Trip not found');
        }
      },

      error: () => this.popupService.showError('Failed to load trip'),
    });
  }

  /**
   * Handles Form Submission
   *
   * Processes the trip form submission for both adding new records and updating existing ones.
   * Combines hour and minute fields into time strings and opens confirmation dialog.
   * Handles loading states and navigation upon success or error.
   */
  onSubmit(): void {
    console.log('Form valid:', this.tripForm.valid);
    
    // Validate form before submission
    if (this.tripForm.invalid) {
      return;
    }

    // Open confirmation dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: this.tripId ? 'Are you sure you want to update this trip?' : 'Are you sure you want to add this trip?' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        const formValue = this.tripForm.value;

        // Combine hour and minute into time strings
        const startTime = formValue.start_hour && formValue.start_minute ? `${formValue.start_hour}:${formValue.start_minute}` : undefined;
        const endTime = formValue.end_hour && formValue.end_minute ? `${formValue.end_hour}:${formValue.end_minute}` : undefined;

        const tripData = {
          ...formValue,
          start_time: startTime,
          end_time: endTime,
        };

        // Log the trip data being submitted
        console.log('Submitting trip data:', tripData);

        // Determine if adding or updating a trip
        if (this.tripId) {
          this.tripService.updateTrip(this.tripId, tripData).subscribe({
            next: () => {
              this.loading = false;
              this.popupService.showSuccess('Trip updated successfully');
              this.router.navigate(['/trips']);
            },
            error: () => {
              this.loading = false;
              this.popupService.showError('Failed to update trip');
            },
          });

          // If tripId exists, update the trip
        } else {
          this.tripService.addTrip(tripData).subscribe({
            next: () => {
              this.loading = false;
              this.popupService.showSuccess('Trip added successfully');
              this.router.navigate(['/trips']);
            },
            error: () => {
              this.loading = false;
              this.popupService.showError('Failed to add trip');
            },
          });
        }
      }
    });
  }

  /**
   * Handles Cancel Action
   *
   * Navigates back to the trip list without saving changes.
   */
  onCancel(): void {
    this.router.navigate(['/trips']);
  }
}
