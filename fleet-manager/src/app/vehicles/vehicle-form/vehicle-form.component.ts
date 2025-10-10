import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
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
  errorMessage: string = '';

  /**
   * Constructor for VehicleFormComponent.
   * Initializes the reactive form with validators.
   * @param fb FormBuilder for creating the form group.
   * @param vehicleService Service for managing vehicle data.
   * @param route ActivatedRoute for accessing route parameters.
   * @param router Router for navigation.
   */
  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.vehicleForm = this.fb.group({
      name: ['', Validators.required],
      model: [''],
      make: [''],
      color: [''],
      registrationNumber: [''],
      licenseExpiryDate: [''],
      yearOfCar: ['']
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
          this.errorMessage = 'Vehicle not found';
        }
      },
      error: () => this.errorMessage = 'Failed to load vehicle'
    });
  }

  /**
   * Handles form submission to add or update a vehicle based on whether an ID is present.
   */
  onSubmit(): void {
    if (this.vehicleForm.invalid) {
      return;
    }
    const vehicleData = this.vehicleForm.value;
    if (this.vehicleId) {
      this.vehicleService.updateVehicle(this.vehicleId, vehicleData).subscribe({
        next: () => this.router.navigate(['/vehicles']),
        error: () => this.errorMessage = 'Failed to update vehicle'
      });
    } else {
      this.vehicleService.addVehicle(vehicleData).subscribe({
        next: () => this.router.navigate(['/vehicles']),
        error: () => this.errorMessage = 'Failed to add vehicle'
      });
    }
  }
}
