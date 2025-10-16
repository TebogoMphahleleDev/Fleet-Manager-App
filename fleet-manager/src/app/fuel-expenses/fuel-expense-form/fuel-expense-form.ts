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

/**
 * Component for creating and editing fuel expenses.
 * Handles form validation and submission for fuel expense records.
 */
@Component({
  selector: 'app-fuel-expense-form',
  templateUrl: './fuel-expense-form.html',
  styleUrls: ['./fuel-expense-form.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  standalone: true
})
export class FuelExpenseForm implements OnInit {
  fuelExpenseForm: FormGroup;
  isEditMode = false;
  fuelExpenseId: string | null = null;
  vehicles: Vehicle[] = [];
  drivers: Driver[] = [];
  loading = false;

  /**
   * Constructor for FuelExpenseFormComponent.
   * @param fb FormBuilder for creating reactive forms.
   * @param fuelExpenseService Service for managing fuel expense data.
   * @param vehicleService Service for managing vehicle data.
   * @param driverService Service for managing driver data.
   * @param popupService Service for showing popup messages.
   * @param router Router for navigation.
   * @param route ActivatedRoute for accessing route parameters.
   */
  constructor(
    private fb: FormBuilder,
    private fuelExpenseService: FuelExpenseService,
    private vehicleService: VehicleService,
    private driverService: DriverService,
    private popupService: PopupService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.fuelExpenseForm = this.fb.group({
      expense_type: ['', Validators.required],
      expense_date: ['', Validators.required],
      cost: ['', [Validators.required, Validators.min(0)]],
      fuel_type: [''],
      quantity: ['', Validators.min(0)],
      location: [''],
      vehicle_id: [''],
      driver_id: ['']
    });
  }

  /**
   * Initializes the component by checking if it's edit mode and loading necessary data.
   */
  ngOnInit(): void {
    this.fuelExpenseId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.fuelExpenseId;
    console.log( this.isEditMode, 'ID:', this.fuelExpenseId ,' Edited succesfully');

    this.loadVehicles();
    this.loadDrivers();

    if (this.isEditMode && this.fuelExpenseId) {
      this.loadFuelExpense(this.fuelExpenseId);
    }
  }

  /**
   * Loads the list of vehicles for the dropdown.
   */
  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (data) => this.vehicles = data,
      error: (err) => this.popupService.showError('Failed to load vehicles')
    });
  }

  /**
   * Loads the list of drivers for the dropdown.
   */
  loadDrivers(): void {
    this.driverService.getDrivers().subscribe({
      next: (data) => this.drivers = data,
      error: (err) => this.popupService.showError('Failed to load drivers')
    });
  }

  /**
   * Loads a specific fuel expense for editing.
   * @param id The id of the fuel expense to load.
   */
  loadFuelExpense(id: string): void {
    this.fuelExpenseService.getFuelExpense(id).subscribe({
      next: (data) => {
        this.fuelExpenseForm.patchValue(data);
      },
      error: (err) => this.popupService.showError('Failed to load fuel expense')
    });
  }

  /**
   * Handles form submission for creating or updating a fuel expense.
   */
  onSubmit(): void {
    console.log(' Form submitted');
    if (this.fuelExpenseForm.valid) {
      console.log( 'Form is valid');
      this.loading = true;
      const formValue = this.fuelExpenseForm.value;
      console.log('Form values:', formValue);

      const fuelExpenseData: Omit<FuelExpense, 'id'> = {
        expense_type: formValue.expense_type,
        expense_date: formValue.expense_date,
        cost: formValue.cost,
        fuel_type: formValue.fuel_type || null,
        quantity: formValue.quantity || null,
        location: formValue.location || null,
        vehicle_id: formValue.vehicle_id || null,
        driver_id: formValue.driver_id || null
      };
      console.log('FuelExpenseForm: Prepared data:', fuelExpenseData);

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
          }
        });
      } else {
        this.fuelExpenseService.addFuelExpense(fuelExpenseData).subscribe({
          next: (result: FuelExpense) => {
            console.log('Create successful:', result);
            this.popupService.showSuccess('Fuel expense created successfully');
            this.router.navigate(['/fuel-expenses']);
          },
          error: (err: any) => {
            this.popupService.showError('Failed to create fuel expense');
            this.loading = false;
          }
        });
      }
    } else {
      
      this.popupService.showError('Please fill in all required fields correctly');
    }
  }

  /**
   * Cancels the form and navigates back to the fuel expenses list.
   */
  onCancel(): void {
    this.router.navigate(['/fuel-expenses']);
  }
}
