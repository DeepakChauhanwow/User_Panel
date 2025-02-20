import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { Helper } from 'src/app/shared/helper';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  notifications = []
  date = {
    HH_MM_A:"d MMM yy - h:mm a",
  }

  constructor(private _commonService: CommonService,private helper:Helper) { }

  ngOnInit(): void {
    this.loadNotifications()
  }

  loadNotifications(): void {
    const user_id = this.helper.user_details._id
    this._commonService.get_mass_notification_history({user_type: 1, user_id: user_id, device_type: 'web'}).then((response) => {
     this.notifications = response.notifications
    })
  }
}
