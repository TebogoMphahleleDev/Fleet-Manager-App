import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Observable, from, BehaviorSubject } from 'rxjs';

/**
 * Service for handling authentication operations using Firebase Auth.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private auth: Auth) {
    // Listen to auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });
  }

  /**
   * Logs in the user with the provided email and password.
   * @param email The email of the user.
   * @param password The password of the user.
   * @returns An Observable of the login response.
   */
  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  /**
   * Registers a new user with the provided email and password.
   * @param email The email for the new user.
   * @param password The password for the new user.
   * @returns An Observable of the registration response.
   */
  register(email: string, password: string): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  /**
   * Logs out the user.
   */
  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  /**
   * Checks if the user is logged in.
   * @returns True if logged in, false otherwise.
   */
  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }

  /**
   * Gets the current user.
   * @returns The current user or null.
   */
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }
}
