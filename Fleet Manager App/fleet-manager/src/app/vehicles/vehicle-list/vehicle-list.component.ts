import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import {CommonModule} from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * Component for displaying a list of vehicles.
 * Allows viewing and deleting vehicles.
 */
@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.scss'],
  imports: [CommonModule, RouterLink],
  standalone: true
})
export class VehicleListComponent implements OnInit {
  vehicles: Vehicle[] = [];
  errorMessage: string = '';

  /**
   * Constructor for VehicleListComponent.
   * @param vehicleService Service for managing vehicle data.
   * @param cdr ChangeDetectorRef for manual change detection.
   */
  constructor(private vehicleService: VehicleService,private cd:ChangeDetectorRef
   
  ) {}

  /**
   * Initializes the component by loading the list of vehicle.
   */
  ngOnInit(): void {
    this.loadVehicles();
  }

  
  
  /**
   * Loads the list of vehicles from the service using the v2 method.
   */
  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (data) => {
        console.log(data)
        this.vehicles = data
        this.cd.detectChanges();},
        error:(error) => this.errorMessage='Failed to load vehicles'
      
    });
  }

  /**
   * Deletes a vehicle by ID and reloads the list on success.
   * @param id The ID of the vehicle to delete.
   */
  deleteVehicle(id: string): void {
    this.vehicleService.deleteVehicle(id).subscribe({
      next: () => this.loadVehicles(),
      error: (err) => this.errorMessage = 'Failed to delete vehicle'
    });
  }
}
