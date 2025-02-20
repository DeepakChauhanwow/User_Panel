import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";

@Injectable({ providedIn: 'root' })
export class NotifiyService {

  constructor(private toaster: ToastrService) { }

  showNotification(type: string, message: string): any {

    if (type === 'success') {
      return this.toaster.success(message);
    } else {
      return this.toaster.error(message);
    }

  }

}
