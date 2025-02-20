import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { Helper } from "../shared/helper";
import { EncryptionDecryptionService } from "./encrypt-decrypt.service";

export interface ResponseModel {
    success: boolean;
    code: string
    data: any;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    get_api_is_loading = false;
    post_api_is_loading = false;

    constructor(private _http: HttpClient, public helper: Helper, private _encryptionDecryptionService: EncryptionDecryptionService) { }

    post({ url, parameters }): Promise<ResponseModel> {
        this.post_api_is_loading = true;
        return new Promise(async (resolve, rejects) => {
            try {
                let call_url = this.getBaseUrl(url) + url;
                let headers:any;
                headers = new HttpHeaders().set('lang_code', localStorage.getItem('theme_lang') || 'en');
                let data:any;
                let api_responseType:any;
                //if encryption decryption enabled from environment then encrypt data
                if(environment.api_encryption_decryption){
                    //headers set for encryption
                    headers = headers.set('encryption','1')
                    //encrypt the request data
                    const encryptData = await this._encryptionDecryptionService.APIEncryptData(parameters);
                    data = { encryptedData: encryptData };
                    //api response type text because of in response getting encrypted data
                    api_responseType = 'text';
                }else{
                    data = parameters;
                    //api response type text because of in response getting json data
                    api_responseType = 'json';
                }
                this._http.post(call_url, data, { headers: headers, responseType: api_responseType }).toPromise().then(async responseData => {
                    let decryptedresponseData:any;
                    //if encryption decryption enabled then decryt encrypted data other wise send data as it is
                    if(environment.api_encryption_decryption){
                        decryptedresponseData = await this._encryptionDecryptionService.APIdecryptData(responseData);
                    }else{
                        decryptedresponseData = responseData;
                    }
                    setTimeout(() => {
                        if (this.post_api_is_loading) {
                            this.post_api_is_loading = false;
                        }
                    }, 500);
                    if (!decryptedresponseData) {
                        resolve({ success: null, code: '', data: null })
                    }
                    if (decryptedresponseData['success']) {
                        resolve({ success: decryptedresponseData['success'], code: decryptedresponseData['success_code'], data: decryptedresponseData })
                    } else if (decryptedresponseData['error_code'] == 451 || decryptedresponseData['error_code'] == 474) {
                        localStorage.removeItem('userData');
                        localStorage.removeItem('newEncryptUserData');
                        this.helper.isUpadtedlocalStorage();
                        this.helper._route.navigate(['/']).then(() => {
                            window.location.reload();
                        })
                        resolve({ success: decryptedresponseData['success'], code: decryptedresponseData['error_code'], data: decryptedresponseData })
                    } else {
                        resolve({ success: decryptedresponseData['success'], code: decryptedresponseData['error_code'], data: decryptedresponseData })
                    }
                })
            } catch (err) {
                resolve({ success: false, code: "2003", data: null });
            }
        });
    }

    getBaseUrl(url) {
        if (url.split("/")[1] == "payments") {
            return environment.PAYMENTS_API_URL
        }
        if (url.split("/")[1] == "earning" || url.split("/")[1] == "history") {
            return environment.HISTORY_API_URL
        }
        return environment.API_URL
    }
    get({ url, parameters }): Promise<ResponseModel> {
        this.get_api_is_loading = true;
        return new Promise((resolve, rejects) => {
            try {
                let call_url = this.getBaseUrl(url) + url;
                let headers:any;
                headers = new HttpHeaders().set('lang_code', localStorage.getItem('theme_lang') || 'en');
                let api_responseType:any;
                if(environment.api_encryption_decryption){
                    //headers set for encryption
                    headers = headers.set('encryption','1')
                    //api response type text because of in response getting encrypted data
                    api_responseType = 'text';
                }else{
                    //api response type text because of in response getting json data
                    api_responseType = 'json';
                }
                this._http.get(call_url, { params: parameters,headers: headers, responseType: api_responseType }).toPromise().then(async responseData => {
                    let decryptedresponseData:any;
                    //if encryption decryption enabled then decryt encrypted data other wise send data as it is
                    if(environment.api_encryption_decryption){
                        decryptedresponseData = await this._encryptionDecryptionService.APIdecryptData(responseData);
                    }else{
                        decryptedresponseData = responseData;
                    }
                    setTimeout(() => {
                        if (this.get_api_is_loading) {
                            this.get_api_is_loading = false;
                        }
                    }, 500);
                    if (!decryptedresponseData) {
                        resolve({ success: true, code: '', data: null })
                    } else if (decryptedresponseData['success']) {
                        resolve({ success: decryptedresponseData['success'], code: decryptedresponseData['success_code'], data: decryptedresponseData })
                    } else {
                        resolve({ success: decryptedresponseData['success'], code: decryptedresponseData['error_code'], data: null })
                    }
                })
            } catch (err) {
                resolve({ success: false, code: "2003", data: null });
            }
        });
    }

    getwithparams({ url, params }): Promise<ResponseModel> {
        this.get_api_is_loading = true;
        return new Promise(async (resolve, rejects) => {
            try {
                let call_url = this.getBaseUrl(url) + url;
                let headers:any;
                headers = new HttpHeaders().set('lang_code', localStorage.getItem('theme_lang') || 'en');
                let api_responseType:any;
                if(environment.api_encryption_decryption){
                    //headers set for encryption
                    headers = headers.set('encryption','1')
                    //api response type text because of in response getting encrypted data
                    api_responseType = 'text';
                }else{
                    //api response type text because of in response getting json data
                    api_responseType = 'json';
                }
                this._http.get(call_url, { headers: headers, params: params, responseType: api_responseType }).toPromise().then(async responseData => {
                    let decryptedresponseData:any;
                    //if encryption decryption enabled then decryt encrypted data other wise send data as it is
                    if(environment.api_encryption_decryption){
                        decryptedresponseData = await this._encryptionDecryptionService.APIdecryptData(responseData);
                    }else{
                        decryptedresponseData = responseData;
                    }
                    setTimeout(() => {
                        if (this.get_api_is_loading) {
                            this.get_api_is_loading = false;
                        }
                    }, 500);
                    if (!decryptedresponseData) {
                        resolve({ success: true, code: '', data: null })
                    } else if (decryptedresponseData['success']) {
                        resolve({ success: decryptedresponseData['success'], code: decryptedresponseData['success_code'], data: decryptedresponseData })
                    } else {
                        resolve({ success: decryptedresponseData['success'], code: decryptedresponseData['error_code'], data: null })
                    }
                })
            } catch (err) {
                resolve({ success: false, code: "2003", data: null });
            }
        });
    }


}
