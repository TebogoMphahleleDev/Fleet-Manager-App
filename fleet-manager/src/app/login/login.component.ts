import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Component for user login and registration.
 * Handles authentication forms and navigation.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isRegisterMode: boolean = false;

  /**
   * Constructor for LoginComponent.
   * @param authService Service for authentication operations.
   * @param router Router for navigation.
   */
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Handles user login by calling the auth service and navigating to dashboard on success.
   */
  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = 'Invalid username or password';
      }
    });
  }

  /**
   * Handles user registration by calling the auth service and showing success message.
   */
  register() {
    this.authService.register(this.username, this.password).subscribe({
      next: (res) => {
        this.errorMessage = 'User registered successfully. You can now login.';
        this.isRegisterMode = false;
      },
      error: (err) => {
        this.errorMessage = 'Registration failed. Username may already exist.';
      }
    });
  }

  /**
   * Toggles between login and register modes, clearing error messages.
   */
  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
  }
}
