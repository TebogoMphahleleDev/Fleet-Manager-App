import { Component, OnInit } from '@angular/core';
import { MaintenanceService, Maintenance } from '../../services/maintenance.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Component for displaying a list of maintenances.
 * Allows viewing and deleting maintenances.
 */
@Component({
  selector: 'app-maintenance-list',
  templateUrl: './maintenance-list.component.html',
  styleUrls: ['./maintenance-list.component.scss'],
  imports: [CommonModule, RouterModule],
  standalone: true
})
export class MaintenanceListComponent implements OnInit {
  maintenances: Maintenance[] = [];
  errorMessage: string = '';

  /**
   * Constructor for MaintenanceListComponent.
   * @param maintenanceService Service for managing maintenance data.
   */
  constructor(private maintenanceService: MaintenanceService) {}

  /**
   * Initializes the component by loading the list of maintenances.
   */
  ngOnInit(): void {
    this.loadMaintenances();
  }

  /**
   * Loads the list of maintenances from the service and updates the component state.
   */
  loadMaintenances(): void {
    this.maintenanceService.getMaintenances().subscribe({
      next: (data) => this.maintenances = data,
      error: (err) => this.errorMessage = 'Failed to load maintenances'
    });
  }

  /**
   * Deletes a maintenance by ID and reloads the list on success.
   * @param id The ID of the maintenance to delete.
   */
  deleteMaintenance(id: string): void {
    this.maintenanceService.deleteMaintenance(id).subscribe({
      next: () => this.loadMaintenances(),
      error: (err) => this.errorMessage = 'Failed to delete maintenance'
    });
  }
}
