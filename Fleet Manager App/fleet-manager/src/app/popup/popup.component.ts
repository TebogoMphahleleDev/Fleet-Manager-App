import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PopupService, PopupMessage } from '../services/popup.service';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit, OnDestroy {
  messages: PopupMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private popupService: PopupService) {}

  ngOnInit() {
    this.subscription.add(
      this.popupService.popup$.subscribe(message => {
        this.messages.push(message);
        setTimeout(() => {
          this.messages = this.messages.filter(m => m !== message);
        }, 5000); // Auto dismiss after 5 seconds
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getClass(type: string): string {
    return `popup-${type}`;
  }

  removeMessage(msg: PopupMessage) {
    this.messages = this.messages.filter(m => m !== msg);
  }
}
