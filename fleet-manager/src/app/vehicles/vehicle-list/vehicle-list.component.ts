import { Component, OnInit } from '@angular/core';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.scss'],
  imports: [CommonModule]
})
export class VehicleListComponent implements OnInit {
  vehicles: Vehicle[] = [];
  errorMessage: string = '';

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (data) => this.vehicles = data,
      error: (err) => this.errorMessage = 'Failed to load vehicles'
    });
  }

  deleteVehicle(id: number): void {
    this.vehicleService.deleteVehicle(id).subscribe({
      next: () => this.loadVehicles(),
      error: (err) => this.errorMessage = 'Failed to delete vehicle'
    });
  }
}
