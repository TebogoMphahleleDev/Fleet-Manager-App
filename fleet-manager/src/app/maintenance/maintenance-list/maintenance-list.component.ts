import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MaintenanceService, Maintenance } from '../../services/maintenance.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../popup/confirm-dialog.component';

/**
 * Maintenance List Component
 *
 * This component displays a list of all maintenance records in the fleet management system.
 * It provides functionality to view, add, edit, and delete maintenance records.
 *
 * Features:
 * - Display list of all maintenance records with their details
 * - Navigation links to add new maintenance records or edit existing ones
 * - Delete functionality with confirmation dialogs
 * - Loading states and error handling
 * - Automatic list refresh after operations
 */
@Component({
  selector: 'app-maintenance-list',
  templateUrl: './maintenance-list.component.html',
  styleUrls: ['./maintenance-list.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  standalone: true,
})
export class MaintenanceListComponent implements OnInit {
  // Component state properties
  maintenances: Maintenance[] = [];
  errorMessage: string = '';
  loading = false;

  /**
   * Constructor - Dependency Injection
   *
   * Initializes the component with required services.
   *
   * @param maintenanceService - Service for managing maintenance data operations
   * @param cd - ChangeDetectorRef for manual change detection
   * @param dialog - MatDialog for opening confirmation dialogs
   */
  constructor(
    private maintenanceService: MaintenanceService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  /**
   * Lifecycle Hook - OnInit
   *
   * Called once the component is initialized.
   * Loads the initial list of maintenance records.
   */
  ngOnInit(): void {
    this.loadMaintenances();
  }

  /**
   * Loads the List of Maintenance Records
   *
   * Fetches all maintenance records from the service and updates the component state.
   * Handles loading states and error scenarios.
   */
  loadMaintenances(): void 
  {
    this.loading = true;
    this.maintenanceService.getMaintenances().subscribe({
      next: (data) => 
      {
        console.log(data);
        this.maintenances = data;
        this.loading = false;
        this.cd.detectChanges();
      },
      
      error: (err) => {
        this.errorMessage = 'Failed to load maintenance logs';
        this.loading = false;
      },
    });
  }

  /**
   * Deletes a Maintenance Record by ID
   *
   * Removes a maintenance record from the system after confirmation.
   * Reloads the maintenance list upon successful deletion.
   *
   * @param id - The unique identifier of the maintenance record to delete
   */
  deleteMaintenance(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this maintenance record?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.maintenanceService.deleteMaintenance(id).subscribe({
          next: () => this.loadMaintenances(),
          error: (err) => (this.errorMessage = 'Failed to delete maintenance'),
        });
      }
    });
  }

  /**
   * Handles Edit Maintenance Action
   *
   * Opens a confirmation dialog before editing a maintenance record.
   * Currently navigates to the edit form with the record ID.
   *
   * @param id - The unique identifier of the maintenance record to edit
   */
  editMaintenance(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to edit this maintenance record?' },
    });

  }
}
