import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../popup/confirm-dialog.component';

/**
 * Vehicle List Component
 *
 * This component displays a list of all vehicles in the fleet management system.
 * It provides functionality to view, add, edit, and delete vehicle records.
 *
 * Features:
 * - Display list of all vehicles with their details
 * - Navigation links to add new vehicles or edit existing ones
 * - Delete functionality with confirmation dialogs
 * - Error handling and loading states
 * - Automatic list refresh after operations
 */
@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  standalone: true,
})

export class VehicleListComponent implements OnInit {
  // Component state properties
  vehicles: Vehicle[] = [];
  errorMessage: string = '';

  /**
   * Constructor - Dependency Injection
   *
   * Initializes the component with required services.
   *
   * @param vehicleService - Service for managing vehicle data operations
   * @param cd - ChangeDetectorRef for manual change detection
   * @param dialog - MatDialog for opening confirmation dialogs
   */
  constructor(
    private vehicleService: VehicleService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  /**
   * Lifecycle Hook - OnInit
   *
   * Called once the component is initialized.
   * Loads the initial list of vehicles.
   */
  ngOnInit(): void {
    this.loadVehicles();
  }

  /**
   * Loads the List of Vehicles
   *
   * Fetches all vehicles from the service and updates the component state.
   * Handles loading states and error scenarios.
   */

  // Load vehicles from the service
  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (data) => {
        console.log(data);
        this.vehicles = data;
        this.cd.detectChanges();
      },
      error: (error) => this.errorMessage = 'Failed to load vehicles',
    });
  }

  /**
   * Deletes a Vehicle by ID
   *
   * Removes a vehicle record from the system after confirmation.
   * Reloads the vehicle list upon successful deletion.
   *
   * @param id - The unique identifier of the vehicle record to delete
   */


  // Delete vehicle with confirmation
  deleteVehicle(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      
      data: { message: 'Are you sure you want to delete this vehicle?' },
    });

    // Handle dialog result
    dialogRef.afterClosed().subscribe(result => {
      // Proceed with deletion if confirmed 
      if (result) {
        this.vehicleService.deleteVehicle(id).subscribe({
          next: () => this.loadVehicles(),

          // Handle deletion error

          error: (err) => this.errorMessage = 'Failed to delete vehicle',
        });
      }
    });
  }
}
