import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MaintenanceService, Maintenance } from '../../services/maintenance.service';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-maintenance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './maintenance-form.component.html',
  styleUrls: ['./maintenance-form.component.scss']
})
export class MaintenanceFormComponent implements OnInit {
  maintenanceForm: FormGroup;
  maintenanceId: string | null = null;
  errorMessage: string = '';
  vehicles: Vehicle[] = [];

  constructor(
    private fb: FormBuilder,
    private maintenanceService: MaintenanceService,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.maintenanceForm = this.fb.group({
      vehicle_id: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      cost: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadVehicles();
    this.maintenanceId = this.route.snapshot.params['id'] || null;
    if (this.maintenanceId) {
      this.loadMaintenance(this.maintenanceId);
    }
  }

  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (data) => this.vehicles = data,
      error: () => this.errorMessage = 'Failed to load vehicles'
    });
  }

  loadMaintenance(id: string): void {
    this.maintenanceService.getMaintenances().subscribe({
      next: (maintenances) => {
        const maintenance = maintenances.find(m => m.id === id);
        if (maintenance) {
          this.maintenanceForm.patchValue(maintenance);
        } else {
          this.errorMessage = 'Maintenance not found';
        }
      },
      error: () => this.errorMessage = 'Failed to load maintenance'
    });
  }

  onSubmit(): void {
    if (this.maintenanceForm.invalid) {
      return;
    }
    const maintenanceData = this.maintenanceForm.value;
    if (this.maintenanceId) {
      this.maintenanceService.updateMaintenance(this.maintenanceId, maintenanceData).subscribe({
        next: () => this.router.navigate(['/maintenance']),
        error: (err) => this.errorMessage = err.message || 'Failed to update maintenance'
      });
    } else {
      this.maintenanceService.addMaintenance(maintenanceData).subscribe({
        next: () => this.router.navigate(['/maintenance']),
        error: (err) => this.errorMessage = err.message || 'Failed to add maintenance'
      });
    }
  }
}
