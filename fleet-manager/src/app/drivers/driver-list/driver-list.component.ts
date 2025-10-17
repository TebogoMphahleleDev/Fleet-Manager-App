import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DriverService, Driver } from '../../services/driver.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../popup/confirm-dialog.component';

/**
 * Driver List Component
 *
 * This component displays a list of all drivers in the fleet management system.
 * It provides functionality to view, add, edit, and delete drivers.
 *
 * Features:
 * - Display list of all drivers with their details
 * - Navigation links to add new drivers or edit existing ones
 * - Delete functionality with confirmation dialogs
 * - Error handling and loading states
 * - Automatic list refresh after operations
 */
@Component({
  selector: 'app-driver-list',
  templateUrl: './driver-list.component.html',
  styleUrls: ['./driver-list.component.scss'],
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  standalone: true,
})

export class DriverListComponent implements OnInit {
  // Component state properties
  drivers: Driver[] = [];
  errorMessage: string = '';

  /**
   * Constructor - Dependency Injection
   *
   * Initializes the component with required services.
   *
   * @param driverService - Service for managing driver data operations
   * @param cd - ChangeDetectorRef for manual change detection
   * @param dialog - MatDialog for opening confirmation dialogs
   */
  constructor(
    private driverService: DriverService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  /**
   * Lifecycle Hook - OnInit
   *
   * Called once the component is initialized.
   * Loads the initial list of drivers.
   */
  ngOnInit(): void {
    this.loadDrivers();
  }

  /**
   * Loads the List of Drivers
   *
   * Fetches all drivers from the service and updates the component state.
   * Handles loading states and error scenarios.
   */
  loadDrivers(): void {
    this.driverService.getDrivers().subscribe({
      next: (data) => {
        console.log(data);
        this.drivers = data;
        this.cd.detectChanges();
      },
      error: (error) => this.errorMessage = 'Failed to load drivers',
    });
  }

  /**
   * Deletes a Driver by ID
   *
   * Removes a driver from the system after confirmation.
   * Reloads the driver list upon successful deletion.
   *
   * @param id - The unique identifier of the driver to delete
   */
  deleteDriver(id: string): void
  {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this driver?' },
    });

    // Handle dialog result
    dialogRef.afterClosed().subscribe(result => 
    {
      
      if (result) {
        this.driverService.deleteDriver(id).subscribe({
          next: () => {
            console.log('Driver deleted');
            this.loadDrivers();
          },
          error: (error) => this.errorMessage = 'Failed to delete driver',
        });
      }
    });
  }
}
