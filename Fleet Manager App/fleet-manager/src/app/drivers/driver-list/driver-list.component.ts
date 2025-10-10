import { Component, OnInit } from '@angular/core';
import { DriverService, Driver } from '../../services/driver.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-driver-list',
  templateUrl: './driver-list.component.html',
  styleUrls: ['./driver-list.component.scss'],
   imports: [CommonModule, RouterLink],
})
export class DriverListComponent implements OnInit {
  drivers: Driver[] = [];
  errorMessage: string = '';

  constructor(private driverService: DriverService) {}

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.driverService.getDrivers().subscribe({
      next: (data) => this.drivers = data,
      error: (err) => this.errorMessage = 'Failed to load drivers'
    });
  }

  deleteDriver(id: string): void {
    this.driverService.deleteDriver(id).subscribe({
      next: () => this.loadDrivers(),
      error: (err) => this.errorMessage = 'Failed to delete driver'
    });
  }
}
