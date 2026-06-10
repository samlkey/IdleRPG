import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent {
  readonly notificationService = inject(NotificationService);
}
