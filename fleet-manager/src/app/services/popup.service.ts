import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface PopupMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

/**
 * Service for managing popup notifications.
 */
@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private popupSubject = new Subject<PopupMessage>();

  /**
   * Observable for popup messages.
   */
  popup$ = this.popupSubject.asObservable();

  /**
   * Shows a success popup.
   * @param message The success message.
   */
  showSuccess(message: string) {
    this.popupSubject.next({ type: 'success', message });
  }

  /**
   * Shows an error popup.
   * @param message The error message.
   */
  showError(message: string) {
    this.popupSubject.next({ type: 'error', message });
  }

  /**
   * Shows an info popup.
   * @param message The info message.
   */
  showInfo(message: string) {
    this.popupSubject.next({ type: 'info', message });
  }
}
