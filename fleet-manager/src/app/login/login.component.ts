import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PopupService } from '../services/popup.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

/**
 * Login Component
 *
 * This component handles user authentication for the fleet management system.
 * It provides login and registration functionality with form validation.
 *
 * Features:
 * - User login with email and password
 * - User registration with email and password
 * - Form validation for email and password fields
 * - Toggle between login and registration modes
 * - Error handling and success notifications
 * - Automatic navigation after successful authentication
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})

export class LoginComponent {
  // Component state properties
  loginForm: FormGroup;
  isRegisterMode: boolean = false;

  /**
   * Constructor - Dependency Injection
   *
   * Initializes the component with required services and sets up the login form.
   *
   * @param authService - Service for handling authentication operations
   * @param router - Router for navigation between components
   * @param fb - FormBuilder for creating reactive forms
   * @param popupService - Service for displaying popup notifications
   */
  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private popupService: PopupService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  /**
   * Handles User Login
   *
   * Authenticates the user with provided email and password.
   * On success, navigation is handled by the app component.
   * On failure, displays an error message.
   */
  login(): void {
    if (this.loginForm.invalid) {
      return;
    }
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (userCredential) => {
        // Navigation handled by app component
      },
      error: (err) => {
        this.popupService.showError('Invalid email or password');
      },
    });
  }

  /**
   * Handles User Registration
   *
   * Registers a new user with provided email and password.
   * On success, shows a success message and switches to login mode.
   * On failure, displays an error message.
   */
  register(): void {
    if (this.loginForm.invalid) {
      return;
    }
    const { email, password } = this.loginForm.value;
    this.authService.register(email, password).subscribe({
      next: (res) => {
        this.popupService.showSuccess('User registered successfully. You can now login.');
        this.isRegisterMode = false;
      },
      error: (err) => {
        this.popupService.showError('Registration failed. Email may already exist.');
      },
    });
  }

  /**
   * Toggles Authentication Mode
   *
   * Switches between login and registration modes.
   */
  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
  }
}
