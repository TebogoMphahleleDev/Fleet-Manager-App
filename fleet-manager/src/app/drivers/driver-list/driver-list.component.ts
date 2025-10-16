import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DriverService, Driver } from '../../services/driver.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Component for displaying a list of drivers.
 * Allows viewing and deleting drivers.
 */
@Component({
  selector: 'app-driver-list',
  templateUrl: './driver-list.component.html',
  styleUrls: ['./driver-list.component.scss'],
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  standalone: true
})
export class DriverListComponent implements OnInit {
  drivers: Driver[] = [];
  errorMessage: string = '';

  /**
   * Constructor for DriverListComponent.
   * @param driverService Service for managing driver data.
   */
  constructor(private driverService: DriverService,private cd: ChangeDetectorRef) {}

  /**
   * Initializes the component by loading the list of drivers.
   */
  ngOnInit(): void {
    this.loadDrivers();
  }

  /**
   * Loads the list of drivers from the service and updates the component state.
   */
  loadDrivers(): void {
    this.driverService.getDrivers().subscribe({
      next: (data) => {
        console.log(data)
        this.drivers = data
        this.cd.detectChanges();},
        error:(error) => this.errorMessage='Failed to load drivers'

    });
  }

  /**
   * Deletes a driver by ID and reloads the list on success.
   * @param id The ID of the driver to delete.
   */
  deleteDriver(id: string): void {
    this.driverService.deleteDriver(id).subscribe({
      next: () => 
        { 
          console.log('Driver deleted'); 
          this.loadDrivers(); 
        },
      error:(error) => this.errorMessage='Failed to delete driver'
    });
  }
}
