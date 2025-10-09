import { Component, OnInit } from '@angular/core';
import { MaintenanceService, Maintenance } from '../../services/maintenance.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-maintenance-list',
  templateUrl: './maintenance-list.component.html',
  styleUrls: ['./maintenance-list.component.scss'],
  imports: [CommonModule, RouterModule]
})
export class MaintenanceListComponent implements OnInit {
  maintenances: Maintenance[] = [];
  errorMessage: string = '';

  constructor(private maintenanceService: MaintenanceService) {}

  ngOnInit(): void {
    this.loadMaintenances();
  }

  loadMaintenances(): void {
    this.maintenanceService.getMaintenances().subscribe({
      next: (data) => this.maintenances = data,
      error: (err) => this.errorMessage = 'Failed to load maintenances'
    });
  }

  deleteMaintenance(id: string): void {
    this.maintenanceService.deleteMaintenance(id).subscribe({
      next: () => this.loadMaintenances(),
      error: (err) => this.errorMessage = 'Failed to delete maintenance'
    });
  }
}
