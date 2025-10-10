import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PopupService } from '../services/popup.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

/**
 * Component for user login and registration.
 * Handles authentication forms and navigation.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isRegisterMode: boolean = false;

  /**
   * Constructor for LoginComponent.
   * @param authService Service for authentication operations.
   * @param router Router for navigation.
   * @param fb FormBuilder for creating the form.
   * @param popupService Service for showing popup notifications.
   */
  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder, private popupService: PopupService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  /**
   * Handles user login by calling the auth service.
   */
  login() {
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
      }
    });
  }

  /**
   * Handles user registration by calling the auth service and showing success message.
   */
  register() {
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
      }
    });
  }

  /**
   * Toggles between login and register modes.
   */
  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
  }
}
