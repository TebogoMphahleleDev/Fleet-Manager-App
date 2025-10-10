import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { PopupService } from '../services/popup.service';

/**
 * Component for the dashboard page of the fleet manager application.
 * Displays an overview or links to various fleet management sections.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  constructor(private authService: AuthService, private popupService: PopupService) {}

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
