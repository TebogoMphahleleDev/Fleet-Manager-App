import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard to protect routes that require authentication.
 */
@Injectable({
  providedIn: 'root'

})

export class AuthGuard implements CanActivate {
  /**
   * Constructor for AuthGuard.
   * @param authService Service for authentication operations.
   * @param router Router for navigation.
   */
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Determines if the route can be activated based on login status.
   * @returns True if the user is logged in, otherwise redirects to login and returns false.
   */
  canActivate(): boolean {

    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }

  }

}
