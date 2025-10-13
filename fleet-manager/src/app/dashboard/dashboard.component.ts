import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { PopupService } from '../services/popup.service';
import { DashboardService, DashboardStats } from '../services/dashboard.service';

/**
 * Component for the dashboard page of the fleet manager application.
 * Displays an overview with statistics cards and links to various fleet management sections.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  constructor(
    private authService: AuthService,
    private popupService: PopupService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDashboardStats();
  }

  /**
   * Loads dashboard statistics from the backend.
   */
  loadDashboardStats() {
    this.loading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        console.log('Dashboard stats loaded:', data);
        this.stats = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
        this.popupService.showError('Failed to load dashboard statistics');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
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
