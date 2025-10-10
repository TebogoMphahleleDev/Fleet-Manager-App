import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { PopupComponent } from './popup/popup.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PopupComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('fleet-manager');

  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
