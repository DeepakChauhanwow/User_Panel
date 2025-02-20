import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from "rxjs";
import { AuthService } from '../services/auth.service';
import { catchError, tap } from 'rxjs/operators';
import { Helper } from '../shared/helper';
import { NotifiyService } from '../services/notifier.service';
import { environment } from 'src/environments/environment';
import { EncryptionDecryptionService } from '../services/encrypt-decrypt.service';

@Injectable()
export class ResInterceptInterceptor implements HttpInterceptor {

  constructor(private _auth: AuthService, private _helper: Helper, private _notifierService: NotifiyService,private _encryptionDecryptionService:EncryptionDecryptionService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(tap(async evt => {
      if (evt instanceof HttpResponse && evt.body) {
        let requestBody:any;
        let responseBody:any;
        if(environment.api_encryption_decryption){
          requestBody = await this._encryptionDecryptionService.APIdecryptData(req.body);
          responseBody = await this._encryptionDecryptionService.APIdecryptData(evt.body);
        }else{
          responseBody = evt.body;
          requestBody = req.body;
        }
        if (responseBody.success) {
          if (requestBody && requestBody.is_show_success_toast !== false && responseBody.success_message && responseBody.success_message !== "") {
            this._notifierService.showNotification('success', responseBody.success_message);
          }
        } else {
          if (responseBody.error_code == 999) {
            let json: any = { token: this._helper.user_details.server_token, user_id: this._helper.user_details._id };
            this._auth.user_logout(json);
          }
          if (responseBody.success != undefined && !responseBody.success && requestBody && requestBody.is_show_error_toast!==false) {
            if (responseBody.error_message && responseBody.error_code != "4002" && responseBody.error_message !== "") {
              this._notifierService.showNotification('error', responseBody.error_message);
            }
          }
        }
      }
    }),
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          this._notifierService.showNotification('error', err.message)
        }
        return of(err);
      }));

  }
}
