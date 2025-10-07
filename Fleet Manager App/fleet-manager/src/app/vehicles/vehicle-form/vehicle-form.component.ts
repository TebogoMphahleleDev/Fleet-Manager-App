import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.scss']
})
export class VehicleFormComponent implements OnInit {
  vehicleForm: FormGroup;
  vehicleId: number | null = null;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.vehicleForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.vehicleId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
    if (this.vehicleId) {
      this.loadVehicle(this.vehicleId);
    }
  }

  loadVehicle(id: number): void {
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
