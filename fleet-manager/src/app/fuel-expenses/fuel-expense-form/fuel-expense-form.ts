import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FuelExpenseService, FuelExpense } from '../../services/fuel-expense.service';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { DriverService, Driver } from '../../services/driver.service';
import { PopupService } from '../../services/popup.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../popup/confirm-dialog.component';

/**
 * Fuel Expense Form Component
 *
 * This component provides a form for adding or editing fuel expense records.
 * It handles form validation, data submission, and navigation for fuel expense management.
 *
 * Features:
 * - Form for fuel expense details (type, date, cost, fuel type, quantity, location, time)
 * - Add new fuel expense or edit existing fuel expense functionality
 * - Form validation and error handling
 * - Confirmation dialogs for save operations
 * - Loading states during data operations
 * - Navigation back to fuel expense list
 * - Time selection with hour and minute dropdowns
 */
@Component({
  selector: 'app-fuel-expense-form',
  templateUrl: './fuel-expense-form.html',
  styleUrls: ['./fuel-expense-form.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
  ],
  standalone: true,
})

export class FuelExpenseForm implements OnInit {
  // Component state properties
  fuelExpenseForm: FormGroup;
  isEditMode = false;
  fuelExpenseId: string | null = null;
  vehicles: Vehicle[] = [];
  drivers: Driver[] = [];
  loading = false;
  hours: string[] = [];
  minutes: string[] = [];

  /**
   * Constructor - Dependency Injection
   *
   * Initializes the component with required services and sets up the fuel expense form.
   *
   * @param fb - FormBuilder for creating reactive forms
   * @param fuelExpenseService - Service for managing fuel expense data operations
   * @param vehicleService - Service for managing vehicle data operations
   * @param driverService - Service for managing driver data operations
   * @param popupService - Service for displaying popup notifications
   * @param router - Router for navigation between components
   * @param route - ActivatedRoute for accessing route parameters
   * @param dialog - MatDialog for opening confirmation dialogs
   */
  constructor(
    private fb: FormBuilder,
    private fuelExpenseService: FuelExpenseService,
    private vehicleService: VehicleService,
    private driverService: DriverService,
    private popupService: PopupService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {
    this.fuelExpenseForm = this.fb.group({
      expense_type: ['', Validators.required],
      expense_date: ['', Validators.required],
      cost: ['', [Validators.required, Validators.min(0)]],
      fuel_type: [''],
      quantity: ['', Validators.min(0)],
      location: [''],
      hour: [''],
      minute: [''],
      is_recurring: [false],
      vehicle_id: [''],
      driver_id: [''],
    });
  }

  /**
   * Lifecycle Hook - OnInit
   *
   * Called once the component is initialized.
   * Determines edit mode, initializes time arrays, and loads required data.
   */
  ngOnInit(): void {
    this.fuelExpenseId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.fuelExpenseId;
    console.log(this.isEditMode, 'ID:', this.fuelExpenseId, 'Edited successfully');

    // Initialize hours and minutes arrays
    this.hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    this.minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    this.loadVehicles();
    this.loadDrivers();

    if (this.isEditMode && this.fuelExpenseId) {
      this.loadFuelExpense(this.fuelExpenseId);
    }
  }

  /**
   * Loads the List of Vehicles
   *
   * Fetches all available vehicles from the service for fuel expense assignment.
   * Updates the component state with the retrieved vehicle data.
   */
  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (data) => this.vehicles = data,
      error: (err) => this.popupService.showError('Failed to load vehicles'),
    });
  }

  /**
   * Loads the List of Drivers
   *
   * Fetches all available drivers from the service for fuel expense assignment.
   * Updates the component state with the retrieved driver data.
   */
  loadDrivers(): void {
    this.driverService.getDrivers().subscribe({
      next: (data) => this.drivers = data,
      error: (err) => this.popupService.showError('Failed to load drivers'),
    });
  }

  /**
   * Loads Fuel Expense Data for Editing
   *
   * Retrieves fuel expense information by ID and populates the form for editing.
   * Displays error message if fuel expense is not found.
   *
   * @param id - The unique identifier of the fuel expense to load
   */
  loadFuelExpense(id: string): void {
    this.fuelExpenseService.getFuelExpense(id).subscribe({
      next: (data) => {
        this.fuelExpenseForm.patchValue(data);
      },
      error: (err) => this.popupService.showError('Failed to load fuel expense'),
    });
  }

  /**
   * Handles Form Submission
   *
   * Processes the fuel expense form submission for both adding new fuel expenses and updating existing ones.
   * Opens a confirmation dialog before proceeding with the operation.
   * Handles loading states and navigation upon success or error.
   */
  onSubmit(): void {
    console.log('Form submitted');
    if (this.fuelExpenseForm.valid) {
      console.log('Form is valid');

      // Open confirmation dialog
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: { message: this.isEditMode ? 'Are you sure you want to update this fuel expense?' : 'Are you sure you want to add this fuel expense?' },
      });

      dialogRef.afterClosed().subscribe(result => 
      { 
        // Handle dialog result
        // If user confirmed, proceed with form submission
        if (result) {
          this.loading = true;
          const formValue = this.fuelExpenseForm.value;
          console.log('Form values:', formValue);

          const time = formValue.hour && formValue.minute ? `${formValue.hour}:${formValue.minute}` : undefined;

          const fuelExpenseData: Omit<FuelExpense, 'id'> = {
            expense_type: formValue.expense_type,
            expense_date: formValue.expense_date,
            cost: formValue.cost,
            fuel_type: formValue.fuel_type || null,
            quantity: formValue.quantity || null,
            location: formValue.location || null,
            time: time,
            is_recurring: formValue.is_recurring || false,
            vehicle_id: formValue.vehicle_id || null,
            driver_id: formValue.driver_id || null,
          };
          console.log('FuelExpenseForm: Prepared data:', fuelExpenseData);
          
          // Determine if adding or updating fuel expense
          if (this.isEditMode && this.fuelExpenseId) {
            this.fuelExpenseService.updateFuelExpense(this.fuelExpenseId, fuelExpenseData).subscribe({
              next: () => {
                console.log('Update successful');
                this.popupService.showSuccess('Fuel expense updated successfully');
                this.router.navigate(['/fuel-expenses']);
              },
              error: (err: any) => {
                this.popupService.showError('Failed to update fuel expense');
                this.loading = false;
              },
            });
            
          } 
          // Add new fuel expense
          else {
            this.fuelExpenseService.addFuelExpense(fuelExpenseData).subscribe({
              next: (result: FuelExpense) => {
                console.log('Create successful:', result);
                this.popupService.showSuccess('Fuel expense created successfully');
                this.router.navigate(['/fuel-expenses']);
              },
              error: (err: any) => {
                this.popupService.showError('Failed to create fuel expense');
                this.loading = false;
              },
            });
          }
        }
      });
    } else {
      this.popupService.showError('Please fill in all required fields correctly');
    }
  }

  /**
   * Handles Cancel Action
   *
   * Navigates back to the fuel expense list without saving changes.
   */
  onCancel(): void {
    this.router.navigate(['/fuel-expenses']);
  }
}
