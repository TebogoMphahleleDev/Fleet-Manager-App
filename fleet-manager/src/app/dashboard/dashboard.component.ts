import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth.service';
import { PopupService } from '../services/popup.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService, DashboardStats, DashboardSummary, MonthlyTripData, MaintenanceCostData } from '../services/dashboard.service';
import { ChartConfiguration, ChartOptions, ChartType, Chart as ChartJS } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js';

// Register Chart.js components
ChartJS.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

/**
 * Component for the dashboard page of the fleet manager application.
 * Displays an overview with statistics cards and links to various fleet management sections.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective, MatCardModule, MatIconModule, MatButtonModule,MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  monthlyTrips: MonthlyTripData[] = [];
  maintenanceCosts: MaintenanceCostData[] = [];
  loading = true;

  // Chart configurations
  public tripsChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Trips',
      fill: true,
      tension: 0.5,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)'
    }]
  };

  public tripsChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Monthly Trips'
      }
    }
  };

  public maintenanceChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Maintenance Costs (R)',
      fill: true,
      tension: 0.5,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)'
    }]
  };

  public maintenanceChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Monthly Maintenance & Fuel Costs'
      }
    }
  };

  constructor(
    private authService: AuthService,
    private popupService: PopupService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  /**
   * Loads complete dashboard data including stats and chart data.
   */
  loadDashboardData() {
    this.loading = true;
    this.dashboardService.getDashboardSummary().subscribe({
      next: (data) => {
        console.log('Dashboard data loaded:', data);
        this.stats = data.stats;
        this.monthlyTrips = data.monthly_trips;
        this.maintenanceCosts = data.maintenance_costs;

        // Update chart data after a small delay to ensure view is stable
        setTimeout(() => {
          this.updateCharts();
          this.loading = false;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.popupService.showError('Failed to load dashboard data');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Updates chart data with loaded monthly data.
   */
  private updateCharts() {
    // Update trips chart with new object references to trigger change detection
    this.tripsChartData = {
      ...this.tripsChartData,
      labels: this.monthlyTrips.map(item => item.month),
      datasets: [{
        ...this.tripsChartData.datasets[0],
        data: this.monthlyTrips.map(item => item.trip_count)
      }]
    };

    // Update maintenance chart with new object references to trigger change detection
    this.maintenanceChartData = {
      ...this.maintenanceChartData,
      labels: this.maintenanceCosts.map(item => item.month),
      datasets: [{
        ...this.maintenanceChartData.datasets[0],
        data: this.maintenanceCosts.map(item => item.cost)
      }]
    };

    // Trigger change detection for the charts
    this.cdr.detectChanges();
  }

  /**
   * Logs out the user.
   */
  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.popupService.showSuccess('Logged out successfully');
      },
      error: (err) => {
        this.popupService.showError('Logout failed');
      }
    });
  }
}
