import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MaintenanceService, Maintenance } from '../../services/maintenance.service';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { PopupService } from '../../services/popup.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/**
 * Component for adding or editing a maintenance record.
 * Provides a form to input maintenance details and handles submission.
 */
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
  vehicles: Vehicle[] = [];

  /**
   * Constructor for MaintenanceFormComponent.
   * Initializes the form with required validators.
   * @param fb FormBuilder for creating the form.
   * @param maintenanceService Service for managing maintenance data.
   * @param vehicleService Service for managing vehicle data.
   * @param route ActivatedRoute for accessing route parameters.
   * @param router Router for navigation.
   */
  constructor(
    private fb: FormBuilder,
    private maintenanceService: MaintenanceService,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router,
    private popupService: PopupService
  ) {
    this.maintenanceForm = this.fb.group({
      vehicle_id: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      cost: [0, [Validators.required, Validators.min(0)]]
    });
  }

  /**
   * Initializes the component, loads vehicles, and checks for edit mode.
   */
  ngOnInit(): void {
    this.loadVehicles();
    this.maintenanceId = this.route.snapshot.params['id'] || null;
    if (this.maintenanceId) {
      this.loadMaintenance(this.maintenanceId);
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
   * Loads the maintenance data for editing by ID.
   * @param id The ID of the maintenance to load.
   */
  loadMaintenance(id: string): void {
    this.maintenanceService.getMaintenances().subscribe({
      next: (maintenances) => {
        const maintenance = maintenances.find(m => m.id === id);
        if (maintenance) {
          this.maintenanceForm.patchValue(maintenance);
        } else {
          this.popupService.showError('Maintenance not found');
        }
      },
      error: () => this.popupService.showError('Failed to load maintenance')
    });
  }

  /**
   * Handles form submission for adding or updating a maintenance record.
   */
  onSubmit(): void {
    if (this.maintenanceForm.invalid) {
      return;
    }
    const maintenanceData = this.maintenanceForm.value;
    if (this.maintenanceId) {
      this.maintenanceService.updateMaintenance(this.maintenanceId, maintenanceData).subscribe({
        next: () => {
          this.popupService.showSuccess('Maintenance updated successfully');
          this.router.navigate(['/maintenance']);
        },
        error: () => this.popupService.showError('Failed to update maintenance')
      });
    } else {
      this.maintenanceService.addMaintenance(maintenanceData).subscribe({
        next: () => {
          this.popupService.showSuccess('Maintenance added successfully');
          this.router.navigate(['/maintenance']);
        },
        error: () => this.popupService.showError('Failed to add maintenance')
      });
    }
  }
}
