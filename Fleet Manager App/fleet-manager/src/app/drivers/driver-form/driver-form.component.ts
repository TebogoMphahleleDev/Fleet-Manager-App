import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService, Driver } from '../../services/driver.service';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { PopupService } from '../../services/popup.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/**
 * Component for adding or editing a driver.
 * Provides a form to input driver details and handles submission.
 */
@Component({
  selector: 'app-driver-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './driver-form.component.html',
  styleUrls: ['./driver-form.component.scss']
})
export class DriverFormComponent implements OnInit {
  driverForm: FormGroup;
  driverId: string | null = null;
  vehicles: Vehicle[] = [];

  /**
   * Constructor for DriverFormComponent.
   * Initializes the form with required validators.
   * @param fb FormBuilder for creating the form.
   * @param driverService Service for managing driver data.
   * @param vehicleService Service for managing vehicle data.
   * @param route ActivatedRoute for accessing route parameters.
   * @param router Router for navigation.
   */
  constructor(
    private fb: FormBuilder,
    private driverService: DriverService,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router,
    private popupService: PopupService
  ) {
    this.driverForm = this.fb.group({
      name: ['', Validators.required],
      vehicle_id: [''],
      numberOfExperience: [0, [Validators.min(0), Validators.pattern(/^\d+$/)]],
      licenseNumber: [''],
      contactInfo: ['']
    });
  }

  /**
   * Initializes the component, loads vehicles, and checks for edit mode.
   */
  ngOnInit(): void {
    this.driverId = this.route.snapshot.params['id'] || null;
    this.loadVehicles();
    if (this.driverId) {
      this.loadDriver(this.driverId);
    }
  }

  /**
   * Loads the list of vehicles from the service.
   */
  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (data) => this.vehicles = data,
      error: () => this.popupService.showError('Failed to load vehicles')
    });
  }

  /**
   * Loads the driver data for editing by ID.
   * @param id The ID of the driver to load.
   */
  loadDriver(id: string): void {
    this.driverService.getDrivers().subscribe({
      next: (drivers) => {
        const driver = drivers.find(d => d.id === id);
        if (driver) {
          this.driverForm.patchValue(driver);
        } else {
          this.popupService.showError('Driver not found');
        }
      },
      error: () => this.popupService.showError('Failed to load driver')
    });
  }

  /**
   * Handles form submission for adding or updating a driver.
   */
  onSubmit(): void {
    if (this.driverForm.invalid) {
      return;
    }
    const driverData = this.driverForm.value;
    if (this.driverId) {
      this.driverService.updateDriver(this.driverId, driverData).subscribe({
        next: () => {
          this.popupService.showSuccess('Driver updated successfully');
          this.router.navigate(['/drivers']);
        },
        error: () => this.popupService.showError('Failed to update driver')
      });
    } else {
      this.driverService.addDriver(driverData).subscribe({
        next: () => {
          this.popupService.showSuccess('Driver added successfully');
          this.router.navigate(['/drivers']);
        },
        error: () => this.popupService.showError('Failed to add driver')
      });
    }
  }
}
