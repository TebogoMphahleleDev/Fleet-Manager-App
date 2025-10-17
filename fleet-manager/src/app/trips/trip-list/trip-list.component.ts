import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TripService, Trip } from '../../services/trip.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../popup/confirm-dialog.component';

/**
 * Trip List Component
 *
 * This component displays a list of all trips in the fleet management system.
 * It provides functionality to view, add, edit, and delete trip records.
 *
 * Features:
 * - Display list of all trips with their details
 * - Navigation links to add new trips or edit existing ones
 * - Delete functionality with confirmation dialogs
 * - Error handling and loading states
 * - Automatic list refresh after operations
 */
@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  standalone: true,
})

export class TripListComponent implements OnInit {
  // Component state properties
  trips: Trip[] = [];
  errorMessage: string = '';

  /**
   * Constructor - Dependency Injection
   *
   * Initializes the component with required services.
   *
   * @param tripService - Service for managing trip data operations
   * @param cd - ChangeDetectorRef for manual change detection
   * @param dialog - MatDialog for opening confirmation dialogs
   */


  constructor(
    private tripService: TripService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  /**
   * Lifecycle Hook - OnInit
   *
   * Called once the component is initialized.
   * Loads the initial list of trips.
   */
  ngOnInit(): void {
    this.loadTrips();
  }

  /**
   * Loads the List of Trips
   *
   * Fetches all trips from the service and updates the component state.
   * Handles loading states and error scenarios.
   */

  // Load trips from the service
  loadTrips(): void {
    this.tripService.getTrips().subscribe({
      next: (data) => {
        console.log(data);
        this.trips = data;
        this.cd.detectChanges();
      },
      error: (error) => this.errorMessage = 'Failed to load trips',
    });
  }

  /**
   * Deletes a Trip by ID
   *
   * Removes a trip record from the system after confirmation.
   * Reloads the trip list upon successful deletion.
   *
   * @param id - The unique identifier of the trip record to delete
   */


  deleteTrip(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this trip?' },
    });
    
    // Handle dialog close
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tripService.deleteTrip(id).subscribe({
          next: () => this.loadTrips(),
          error: (err) => this.errorMessage = 'Failed to delete trip',
        });
      }
    });
  }
}
