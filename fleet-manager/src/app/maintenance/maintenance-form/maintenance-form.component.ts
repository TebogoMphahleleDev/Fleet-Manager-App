import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MaintenanceService, Maintenance } from '../../services/maintenance.service';
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
 * Maintenance Form Component
 *
 * This component provides a form for adding or editing maintenance records.
 * It handles form validation, data submission, and navigation for maintenance management.
 *
 * Features:
 * - Form for maintenance details (vehicle, description, date, cost, type, completion status)
 * - Add new maintenance record or edit existing record functionality
 * - Form validation and error handling
 * - Confirmation dialogs for save operations
 * - Loading states during data operations
 * - Navigation back to maintenance list
 */
@Component({
  selector: 'app-maintenance-form',
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
  templateUrl: './maintenance-form.component.html',
  styleUrls: ['./maintenance-form.component.scss'],
})

// MaintenanceFormComponent Class
export class MaintenanceFormComponent implements OnInit {
  // Component state properties
  maintenanceForm: FormGroup;
  maintenanceId: string | null = null;
  vehicles: Vehicle[] = [];
  loading: boolean = false;

  /**
   * Constructor - Dependency Injection
   *
   * Initializes the component with required services and sets up the maintenance form.
   *
   * @param fb - FormBuilder for creating reactive forms
   * @param maintenanceService - Service for managing maintenance data operations
   * @param vehicleService - Service for managing vehicle data operations
   * @param route - ActivatedRoute for accessing route parameters
   * @param router - Router for navigation between components
   * @param popupService - Service for displaying popup notifications
   * @param dialog - MatDialog for opening confirmation dialogs
   */


  constructor(
    private fb: FormBuilder,
    private maintenanceService: MaintenanceService,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router,
    private popupService: PopupService,
    private dialog: MatDialog
  ) {

    this.maintenanceForm = this.fb.group({
      vehicle_id: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      cost: [0, [Validators.required, Validators.min(0)]],
      type: [''],
      is_completed: [false],
    });
  }

  /**
   * Lifecycle Hook - OnInit
   *
   * Called once the component is initialized.
   * Loads vehicles and checks if editing an existing maintenance record.
   */
  ngOnInit(): void {
    this.loadVehicles();
    this.maintenanceId = this.route.snapshot.params['id'] || null;
    if (this.maintenanceId) {
      this.loadMaintenance(this.maintenanceId);
    }
  }

  /**
   * Loads the List of Vehicles
   *
   * Fetches all available vehicles from the service for maintenance assignment.
   * Updates the component state with the retrieved vehicle data.
   */


  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (data) => this.vehicles = data,
      error: () => this.popupService.showError('Failed to load vehicles'),
    });
  }

  /**
   * Loads Maintenance Data for Editing
   *
   * Retrieves maintenance information by ID and populates the form for editing.
   * Displays error message if maintenance record is not found.
   *
   * @param id - The unique identifier of the maintenance record to load
   */
  loadMaintenance(id: string): void {
    this.maintenanceService.getMaintenances().subscribe({

      next: (maintenances) => 
      {
        const maintenance = maintenances.find(m => m.id === id);
        // Patch form values if maintenance is found
        if (maintenance) 
        {
          this.maintenanceForm.patchValue(maintenance);
        } 
        else 
        {
          this.popupService.showError('Maintenance not found');
        }
      },
      error: () => this.popupService.showError('Failed to load maintenance'),
    });
  }

  /**
   * Handles Form Submission
   *
   * Processes the maintenance form submission for both adding new records and updating existing ones.
   * Opens a confirmation dialog before proceeding with the operation.
   * Handles loading states and navigation upon success or error.
   */
  onSubmit(): void {
    if (this.maintenanceForm.invalid) {
      return;
    }

    // Open confirmation dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: this.maintenanceId ? 'Are you sure you want to update this maintenance record?' : 'Are you sure you want to add this maintenance record?' },
    });


    // Handle dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (result)
        {
        this.loading = true;
          const maintenanceData = this.maintenanceForm.value;

          // Determine if adding or updating maintenance
          if (this.maintenanceId) {
          this.maintenanceService.updateMaintenance(this.maintenanceId, maintenanceData).subscribe({
            next: () => {
              this.loading = false;
              this.popupService.showSuccess('Maintenance updated successfully');
              this.router.navigate(['/maintenance']);
            },
            error: () => {
              this.loading = false;
              this.popupService.showError('Failed to update maintenance');
            },
          });

        }
        else
        {
          this.maintenanceService.addMaintenance(maintenanceData).subscribe({
            next: () => {
              this.loading = false;
              this.popupService.showSuccess('Maintenance added successfully');
              this.router.navigate(['/maintenance']);
            },
            error: () => {
              this.loading = false;
              this.popupService.showError('Failed to add maintenance');
            },
          });
        }
      }
    });
  }

  /**
   * Handles Cancel Action
   *
   * Navigates back to the maintenance list without saving changes.
   */
  onCancel(): void {
    this.router.navigate(['/maintenance']);
  }
}
