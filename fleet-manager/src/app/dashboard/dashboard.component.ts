import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth.service';
import { PopupService } from '../services/popup.service';
import {DashboardService,DashboardStats,DashboardSummary,MonthlyTripData,MaintenanceCostData} from '../services/dashboard.service';
import { ChartConfiguration, ChartOptions, Chart as ChartJS } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {LineController,LineElement,PointElement,LinearScale,Title,CategoryScale,} from 'chart.js';

// Register Chart.js components globally
ChartJS.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

/**
 * Dashboard Component
 *
 * This component serves as the main dashboard for the Fleet Manager application.
 * It displays key statistics, charts, and navigation links to various fleet management sections.
 *
 * Features:
 * - Overview statistics cards (total vehicles, drivers, trips, maintenance costs)
 * - Monthly trips chart visualization
 * - Monthly maintenance and fuel costs chart
 * - Navigation links to different sections
 * - User logout functionality
 * - Loading states and error handling
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BaseChartDirective,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent implements OnInit {
  // Component state properties
  stats: DashboardStats | null = null;
  monthlyTrips: MonthlyTripData[] = [];
  maintenanceCosts: MaintenanceCostData[] = [];
  loading = true;

  // Chart configuration for monthly trips
  public tripsChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Trips',
        fill: true,
        tension: 0.5,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  public tripsChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Monthly Trips',
      },
    },
  };

  // Chart configuration for maintenance costs
  public maintenanceChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Maintenance Costs (R)',
        fill: true,
        tension: 0.5,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  };

  public maintenanceChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Monthly Maintenance & Fuel Costs',
      },
    },
  };


  /**
   * Constructor - Dependency Injection
   *
   * @param authService - Service for authentication operations
   * @param popupService - Service for displaying popup notifications
   * @param dashboardService - Service for fetching dashboard data
   * @param cdr - ChangeDetectorRef for manual change detection
   */
  constructor(
    private authService: AuthService,
    private popupService: PopupService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}


  /**
   * Lifecycle Hook - OnInit
   *
   * Called once the component is initialized.
   * Loads the dashboard data.
   */
  ngOnInit(): void {
    this.loadDashboardData();
  }


  /**
   * Loads Complete Dashboard Data
   *
   * Fetches dashboard summary data including statistics and chart data.
   * Handles loading states and error scenarios.
   */
  loadDashboardData(): void {
    this.loading = true;

    this.dashboardService.getDashboardSummary().subscribe({
      next: (data: DashboardSummary) => {
        console.log('Dashboard data loaded:', data);

        // Update component state with received data
        this.stats = data.stats;
        this.monthlyTrips = data.monthly_trips;
        this.maintenanceCosts = data.maintenance_costs;

        // Update charts after a brief delay to ensure view stability
        setTimeout(() => {
          this.updateCharts();
          this.loading = false;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err: any) => {
        console.error('Error loading dashboard data:', err);
        this.popupService.showError('Failed to load dashboard data');
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Updates Chart Data
   *
   * Refreshes chart configurations with the latest monthly data.
   * Creates new object references to trigger Angular change detection.
   *
   * @private
   */
  private updateCharts(): void {
    // Update trips chart with fresh data
    this.tripsChartData = {
      ...this.tripsChartData,
      labels: this.monthlyTrips.map((item: MonthlyTripData) => item.month),
      datasets: [
        {
          ...this.tripsChartData.datasets[0],
          data: this.monthlyTrips.map((item: MonthlyTripData) => item.trip_count),
        },
      ],
    };

    // Update maintenance costs chart with fresh data
    this.maintenanceChartData = {
      ...this.maintenanceChartData,
      labels: this.maintenanceCosts.map((item: MaintenanceCostData) => item.month),
      datasets: [
        {
          ...this.maintenanceChartData.datasets[0],
          data: this.maintenanceCosts.map((item: MaintenanceCostData) => item.cost),
        },
      ],
    };

    // Trigger change detection for chart updates
    this.cdr.detectChanges();
  }

  /**
   * Logs Out the Current User
   *
   * Calls the authentication service to log out the user.
   * Displays success or error messages based on the operation result.
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.popupService.showSuccess('Logged out successfully');
      },
      error: (err: any) => {
        this.popupService.showError('Logout failed');
      },
    });
  }
}
