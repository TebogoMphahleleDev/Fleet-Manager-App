import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { PopupService } from '../../services/popup.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../popup/confirm-dialog.component';

/**
 * Vehicle Form Component
 *
 * This component provides a form for adding or editing vehicle records.
 * It handles form validation, data submission, and navigation for vehicle management.
 *
 * Features:
 * - Form for vehicle details (name, model, make, color, registration, license expiry, year)
 * - Add new vehicle or edit existing vehicle functionality
 * - Form validation and error handling
 * - Confirmation dialogs for save operations
 * - Loading states during data operations
 * - Navigation back to vehicle list
 */
@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.scss'],
})

export class VehicleFormComponent implements OnInit {
  // Component state properties
  vehicleForm: FormGroup;
  vehicleId: string | null = null;
  loading = false;

  /**
   * Constructor - Dependency Injection
   *
   * Initializes the component with required services and sets up the vehicle form.
   *
   * @param fb - FormBuilder for creating reactive forms
   * @param vehicleService - Service for managing vehicle data operations
   * @param route - ActivatedRoute for accessing route parameters
   * @param router - Router for navigation between components
   * @param popupService - Service for displaying popup notifications
   * @param dialog - MatDialog for opening confirmation dialogs
   */
  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router,
    private popupService: PopupService,
    private dialog: MatDialog
  ) 
  // Initialize the vehicle form 
  {
    this.vehicleForm = this.fb.group({
      name: ['', Validators.required],
      model: [''],
      make: [''],
      color: [''],
      registrationNumber: [''],
      licenseExpiryDate: [''],
      yearOfCar: [null, [Validators.required, Validators.min(1900), Validators.max(2024)]],
    });
  }

  /**
   * Lifecycle Hook - OnInit
   *
   * Called once the component is initialized.
   * Checks for vehicle ID in route parameters to determine edit mode.
   */
  ngOnInit(): void 
  {
    this.vehicleId = this.route.snapshot.params['id'] || null;
    //load vehicle data 
    if (this.vehicleId) {
      this.loadVehicle(this.vehicleId);
    }
    else{
      // If no vehicle ID, ensure the form is reset for adding a new vehicle
      this.vehicleForm.reset(); 
    }
  }

  /**
   * Loads Vehicle Data for Editing
   *
   * Retrieves vehicle information by ID and populates the form for editing.
   * Displays error message if vehicle record is not found.
   *
   * @param id - The unique identifier of the vehicle record to load
   */
  loadVehicle(id: string): void 
  {
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        const vehicle = vehicles.find(v => v.id === id);
        // Patch form values if vehicle is found
        if (vehicle) {
          this.vehicleForm.patchValue(vehicle);
        } 
        // Show error if vehicle not found
        else {
          this.popupService.showError('Vehicle not found');
        }
      },
      error: () => this.popupService.showError('Failed to load vehicle'),
    });
  }

  /**
   * Handles Form Submission
   *
   * Processes the vehicle form submission for both adding new records and updating existing ones.
   * Opens a confirmation dialog before proceeding with the operation.
   * Handles loading states and navigation upon success or error.
   */
  onSubmit(): void {
    if (this.vehicleForm.invalid) {
      return;
    }

    // Open confirmation dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: this.vehicleId ? 'Are you sure you want to update this vehicle?' : 'Are you sure you want to add this vehicle?' },
    });

    // Handle dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        const vehicleData = this.vehicleForm.value;
        
        // Update existing vehicle
        if (this.vehicleId) {
          this.vehicleService.updateVehicle(this.vehicleId, vehicleData).subscribe({
            next: () => {
              this.popupService.showSuccess('Vehicle updated successfully');
              this.router.navigate(['/vehicles']);
            },
            error: () => {
              this.popupService.showError('Failed to update vehicle');
              this.loading = false;
            },
          });

        // Add new vehicle  
        } else {
          this.vehicleService.addVehicle(vehicleData).subscribe({
            next: () => {
              this.popupService.showSuccess('Vehicle added successfully');
              this.router.navigate(['/vehicles']);
            },
            error: () => {
              this.popupService.showError('Failed to add vehicle');
              this.loading = false;
            },
          });
        }
      }
    });
  }

  /**
   * Handles Cancel Action
   *
   * Navigates back to the vehicle list without saving changes.
   */
  onCancel(): void {
    this.router.navigate(['/vehicles']);
  }
}
