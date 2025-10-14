import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { PopupService } from '../../services/popup.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/**
 * Component for creating or editing a vehicle.
 * Handles form submission for adding or updating vehicle data.
 */
@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.scss']
})
export class VehicleFormComponent implements OnInit {
  vehicleForm: FormGroup;
  vehicleId: string | null = null;
  loading = false;

  /**
   * Constructor for VehicleFormComponent.
   * Initializes the reactive form with validators.
   * @param fb FormBuilder for creating the form group.
   * @param vehicleService Service for managing vehicle data.
   * @param route ActivatedRoute for accessing route parameters.
   * @param router Router for navigation.
   * @param popupService Service for showing popup notifications.
   */
  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router,
    private popupService: PopupService
  ) {
    this.vehicleForm = this.fb.group({
      name: ['', Validators.required],
      model: [''],
      make: [''],
      color: [''],
      registrationNumber: [''],
      licenseExpiryDate: [''],
      yearOfCar: [null, [Validators.required, Validators.min(1900), Validators.max(2024)]]
    });
  }

  /**
   * Initializes the component by checking for an ID in the route to determine if editing an existing vehicle.
   */
  ngOnInit(): void {
    this.vehicleId = this.route.snapshot.params['id'] || null;
    if (this.vehicleId) {
      this.loadVehicle(this.vehicleId);
    }
  }

  /**
   * Loads an existing vehicle by ID and patches the form with its data.
   * @param id The ID of the vehicle to load.
   */
  loadVehicle(id: string): void {
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        const vehicle = vehicles.find(v => v.id === id);
        if (vehicle) {
          this.vehicleForm.patchValue(vehicle);
        } else {
          this.popupService.showError('Vehicle not found');
        }
      },
      error: () => this.popupService.showError('Failed to load vehicle')
    });
  }

  /**
   * Handles form submission to add or update a vehicle based on whether an ID is present.
   */
  onSubmit(): void {
    if (this.vehicleForm.invalid) {
      return;
    }
    this.loading = true;
    const vehicleData = this.vehicleForm.value;
    if (this.vehicleId) {
      this.vehicleService.updateVehicle(this.vehicleId, vehicleData).subscribe({
        next: () => {
          this.popupService.showSuccess('Vehicle updated successfully');
          this.router.navigate(['/vehicles']);
        },
        error: () => {
          this.popupService.showError('Failed to update vehicle');
          this.loading = false;
        }
      });
    } else {
      this.vehicleService.addVehicle(vehicleData).subscribe({
        next: () => {
          this.popupService.showSuccess('Vehicle added successfully');
          this.router.navigate(['/vehicles']);
        },
        error: () => {
          this.popupService.showError('Failed to add vehicle');
          this.loading = false;
        }
      });
    }
  }

  /**
   * Handles cancel action to navigate back to vehicle list.
   */
  onCancel(): void {
    this.router.navigate(['/vehicles']);
  }
}
