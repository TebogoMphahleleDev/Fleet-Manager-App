import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService, Driver } from '../../services/driver.service';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-driver-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './driver-form.component.html',
  styleUrls: ['./driver-form.component.scss']
})
export class DriverFormComponent implements OnInit {
  driverForm: FormGroup;
  driverId: number | null = null;
  vehicles: Vehicle[] = [];
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private driverService: DriverService,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.driverForm = this.fb.group({
      name: ['', Validators.required],
      vehicle_id: ['']
    });
  }

  ngOnInit(): void {
    this.driverId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
    this.loadVehicles();
    if (this.driverId) {
      this.loadDriver(this.driverId);
    }
  }

  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (data) => this.vehicles = data,
      error: () => this.errorMessage = 'Failed to load vehicles'
    });
  }

  loadDriver(id: number): void {
    this.driverService.getDrivers().subscribe({
      next: (drivers) => {
        const driver = drivers.find(d => d.id === id);
        if (driver) {
          this.driverForm.patchValue(driver);
        } else {
          this.errorMessage = 'Driver not found';
        }
      },
      error: () => this.errorMessage = 'Failed to load driver'
    });
  }

  onSubmit(): void {
    if (this.driverForm.invalid) {
      return;
    }
    const driverData = this.driverForm.value;
    if (this.driverId) {
      this.driverService.updateDriver(this.driverId, driverData).subscribe({
        next: () => this.router.navigate(['/drivers']),
        error: () => this.errorMessage = 'Failed to update driver'
      });
    } else {
      this.driverService.addDriver(driverData).subscribe({
        next: () => this.router.navigate(['/drivers']),
        error: () => this.errorMessage = 'Failed to add driver'
      });
    }
  }
}
