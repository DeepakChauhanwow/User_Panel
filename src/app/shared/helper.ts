import { Injectable, NgZone, Inject } from "@angular/core";
import { Router } from "@angular/router";
import { DATE_FORMAT, DEFAULT_IMAGE, HISTORY_TYPE, NAME_TYPE, OPEN_MODAL_TYPE, PROVIDER_STATUS, REQUEST_TYPE, TRIP_STATUS_TIMELIME, TRIP_STATUS_TIMELIME_STRING, TRIP_STATUS_TYPE_VALUE, TRIP_STATUS_TYPE_VALUE_STRING } from "../constants/constants";
import { TranslateService } from "@ngx-translate/core";
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { EncryptionDecryptionService } from "../services/encrypt-decrypt.service";

@Injectable({
    providedIn: 'root'
})

export class Helper {
    public DATE_FORMAT = DATE_FORMAT;
    public DEFAULT_IMAGE = DEFAULT_IMAGE;
    public OPEN_MODAL_TYPE = OPEN_MODAL_TYPE;
    public TRIP_STATUS_TYPE_VALUE = TRIP_STATUS_TYPE_VALUE;
    public TRIP_STATUS_TIMELIME = TRIP_STATUS_TIMELIME;
    public TRIP_STATUS_TIMELIME_STRING = TRIP_STATUS_TIMELIME_STRING;
    public TRIP_STATUS_TYPE_VALUE_STRING = TRIP_STATUS_TYPE_VALUE_STRING;
    public HISTORY_TYPE = HISTORY_TYPE;
    public REQUEST_TYPE = REQUEST_TYPE;
    public PROVIDER_STATUS = PROVIDER_STATUS;
    public NAME_TYPE = NAME_TYPE;

    islogin: boolean = false;
    public user_details:any;
    uploadFile = ["image/jpeg" , "image/jpg" , "image/png"] ;
    uploadDocFile = ["image/jpeg" , "image/jpg" , "image/png" , "application/pdf"] ;
    token: any;
    to_fixed_number: number = 2;
    public created_at = new BehaviorSubject<any>(null);
    created_date = this.created_at.asObservable();
    helper_is_loading: boolean = false;
    selectedLang = localStorage.getItem('theme_lang');
    public decimal = new BehaviorSubject<any>(null);
    decimal_number = this.decimal.asObservable();
    randomQueryParam: any = `random=${Math.random()}`;
    public google_key = new BehaviorSubject<any>(null);
    googleKey = this.google_key.asObservable();
    GOOGLE_KEY: any;
    language_is_loading: boolean = true;
    maximum_first_name_character_limit: number = 30;
    maximum_last_name_character_limit: number = 50;

    constructor(public http: HttpClient,public _route: Router,public trans: TranslateService,public ngZone: NgZone,@Inject(DOCUMENT) private _documentRef: any,private _encryptionDecryptionService:EncryptionDecryptionService) {
        if(localStorage.getItem('userData')){
            this._encryptionDecryptionService.decryptData(localStorage.getItem('userData')).then((response) => {
                this.user_details = response;
            })
        }
        this.decimal_number.subscribe(number => {
            if (number || number == 0) {
                this.to_fixed_number = number;
            }
        })
        this.googleKey.subscribe((key) => {
            if (key) {
                this.GOOGLE_KEY = key;
            }
        })
    }

    async isUpadtedlocalStorage() {
        if(localStorage.getItem('userData')){
            this.user_details = await this._encryptionDecryptionService.decryptData(localStorage.getItem('userData'));
        }else{
            this.user_details = null;
        }
    }

    phone_number_validation(evt) {
        let charCode = (evt.which) ? evt.which : evt.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57) || charCode === 101) {
            return false;
        }
        return true;
    }

    decimalNum_validation(evt, value = 0) {
        if (evt.key === '.' && value != null && (value.toString().indexOf('.') === value.toString().lastIndexOf('.'))) {
            return true;
        }
        let charCode = (evt.which) ? evt.which : evt.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            if (charCode == 46) {
                return true;
            }
            else {
                return false;
            }
        }
        return true;
    }

    keyUpDown(evt) {
        let charCode = (evt.which) ? evt.which : evt.keyCode
        if (charCode == 38 || charCode == 40 || evt.key == 'ArrowUp' || evt.key == 'ArrowDown') {
            return false;
        }
    }

    number_validation(evt, value = 0) {
        if (evt.key === '.' && value != null && (value.toString().indexOf('.') === value.toString().lastIndexOf('.'))) {
            return false;
        }
        let charCode = (evt.which) ? evt.which : evt.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            if (charCode == 46) {
                return true;
            }
            else {
                return false;
            }
        }
        return true;
    }


    space_validation(evt) {
        if (evt.code == "Space" && evt.target.value.length < 1) {
            return false;
        }
        return true
    }

    nospace_validation(evt) {
        if (evt.code == "Space") {
            return false;
        }
        return true
    }

    check_email(email) {
        let email_validation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email_validation.test(email)) {
            return false;
        }
        return true;
    }

    get uuid(): string {
        return 'xxxxxxxx-xxxx-xxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    loadGoogleScript(url) {
        return new Promise((resolve, reject) => {
            if (!document.querySelector('script[src="' + url + '"]')) {
                const script = this._documentRef.createElement('script');
                script.type = 'text/javascript';
                script.src = url;
                script.text = ``;
                script.async = true;
                script.defer = true;
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            } else {
                resolve(true);
            }
        })
    }

    downloadImage(url: string, fileName: string) {
        const a: any = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.style = 'display: none';
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    downloadUrl(url: string): Observable<string> {
        return this.http.get(url, { responseType: 'blob' }).pipe(switchMap(response => this.readFile(response)));
    }
    
    private readFile(blob: Blob): Observable<string> {
        return new Observable(observer => {
            const reader = new FileReader();

            reader.onerror = err => observer.error(err);
            reader.onabort = err => observer.error(err);
            reader.onload = () => observer.next(reader.result as string);
            reader.onloadend = () => observer.complete();

            reader.readAsDataURL(blob);

            // Cleanup function, invoked if the observer unsubscribes
            return () => {
                reader.abort();
            };
        });
    }

    downloadFile(res: any) {
        this.http.get(res, { responseType: 'blob' as const }).subscribe(fileData => {
            const blob: any = new Blob([fileData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            let filename = res.split('xlsheet/')
            let link = document.createElement("a");

            if (link.download !== undefined) {
                let url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename[1]);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
        );
    }

    // Notification 
    webNotification(provider_trip_status: any) {
        let message = ""
        let tripStatus = provider_trip_status
        if (tripStatus == 1) {
            message = this.trans.instant('label-title.trip') + " " + this.trans.instant('label-title.accepted')
        } else if (tripStatus == 2) {
            message = this.trans.instant('label-title.driver-on-way')
        } else if (tripStatus == 4) {
            message = this.trans.instant('label-title.trip') + " " + this.trans.instant('label-title.arrived')
        } else if (tripStatus == 6) {
            message = this.trans.instant('label-title.trip') + " " + this.trans.instant('label-title.started')
        } else if (tripStatus == 9) {
            message = this.trans.instant('label-title.trip') + " " + this.trans.instant('label-title.completed')
        } else if (tripStatus == 11) {
            message = this.trans.instant('label-title.trip-cancelled')
        }
        if ('Notification' in window) {
            Notification.requestPermission()
            .then(permission => {
                if (permission === 'granted' && message != "") {
                    // Permission granted, create and display the notification
                    let notifications =  new Notification('Eber Notification', {
                        body: message,
                        icon: 'https://eberdeveloper.elluminatiinc.net/web_images/mail_title_image.png',
                    });
                    console.log(notifications);
                }
            })
            .catch(err => {
                console.error('Error occurred while requesting notification permission:', err);
            });
        }
    }

    maxCharacterValidation(value, max_character_limit): boolean | null {
        if (!value || value == null || value == '') {
            return null;
        }
        if (value?.toString()?.length > max_character_limit) {
            return true;
        }
        return null
    }

    validateAndUpdateError(value: string, max_character_limit): boolean | null {
        return this.maxCharacterValidation(value, max_character_limit);
    }

}


