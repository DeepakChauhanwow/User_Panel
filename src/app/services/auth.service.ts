import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { apiColletions } from "../constants/api_collection";
import { UserModel } from "../models/user.model";
import { Helper } from "../shared/helper";
import { ApiService } from "./api.service";
import { NotifiyService } from "./notifier.service";
import { EncryptionDecryptionService } from "./encrypt-decrypt.service";


@Injectable({ providedIn: 'root' })
export class AuthService {

    public logginUser: UserModel;
    public user_details:any;
    public loginSubject = new BehaviorSubject<UserModel>(null);
    loginObservable: Observable<UserModel> = this.loginSubject.asObservable();

    private loginStore = new BehaviorSubject<any>(null);
    loginSession = this.loginStore.asObservable();


    get isAuthenticated(): boolean {
        return !(!this.logginUser || this.logginUser === null);
    }

    get user_detail() {
        return this.logginUser ? this.logginUser : new UserModel();
    }

    constructor(private _api: ApiService, private helper: Helper, private _notificationservice: NotifiyService,private _encryptionDecryptionService:EncryptionDecryptionService) {
        if(localStorage.getItem('userData')){
            this._encryptionDecryptionService.decryptData(localStorage.getItem('userData')).then((response) => {
                this.user_details = response;
            })
        }
    }

    //generate recaotcha token
    async generateRecaptchaToken(): Promise<any> {
        try {
            let parameters = {};
            const response = await this._api.post({ url: apiColletions.get_user_setting_detail, parameters })
            if (response.success) {
                const is_use_captcha = response.data.setting_detail.is_use_captcha;
                if (is_use_captcha) {
                    return await new Promise((resolve, reject) => {
                        grecaptcha.ready(() => {
                            const recaptcha_site_key = response.data.setting_detail.recaptcha_site_key_for_web;
                            grecaptcha.execute(recaptcha_site_key, { action: 'submit' }).then((token) => {
                                resolve(token)
                            })
                        });
                    });
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    // Login
    async user_login(parameters): Promise<boolean> {
        try {
            const captcha_token = await this.generateRecaptchaToken();
            if (captcha_token) {
                parameters['captcha_token'] = captcha_token;
            }
            const response = await this._api.post({ url: apiColletions.login, parameters })
            if (response.success) {
                this.logginUser = response.data.user_detail;

                let localStorageData = {
                    _id: this.logginUser.user_id,
                    corporate_id: response.data.user_detail.corporate_detail ? response.data.user_detail.corporate_detail._id : null,
                    server_token: this.logginUser.token,
                    country: this.logginUser.country,
                    country_phone_code: this.logginUser.country_phone_code,
                    first_name: this.logginUser.first_name,
                    last_name: this.logginUser.last_name,
                    email: this.logginUser.email,
                    phone: this.logginUser.phone,
                    login_by: this.logginUser.login_by,
                    referral_code: this.logginUser.referral_code,
                    wallet_currency_code: this.logginUser.wallet_currency_code,
                    picture: this.logginUser.picture
                }
                this.helper.user_details = localStorageData;
                const encryptedDta = await this._encryptionDecryptionService.encryptData(localStorageData);
                localStorage.setItem('userData', encryptedDta);
                localStorage.setItem('newEncryptUserData', encryptedDta);

                this.loginSubject.next(this.logginUser);
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return true;
        }
    }

    async user_logout(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.logout, parameters })
            if (response.success) {
                if (parameters.is_admin_decline) {
                    this._notificationservice.showNotification('error', this.helper.trans.instant('error-code.4010'));
                }
                this.logginUser = null;
                this.loginSubject.next(this.logginUser);
                localStorage.removeItem('userData');
                localStorage.removeItem('newEncryptUserData');
                this.helper.isUpadtedlocalStorage();
                this.helper._route.navigate(['/']);
                return true
            } else {
                return null
            }
        } catch (err) {
            return null
        }
    }

    async user_social_login(parameters): Promise<boolean> {
        try {
            const captcha_token = await this.generateRecaptchaToken();
            if (captcha_token) {
                parameters['captcha_token'] = captcha_token;
            }
            const response = await this._api.post({ url: apiColletions.user_social_login_web, parameters })
            if (response.success) {
                this.logginUser = response.data.user_detail;
                this.logginUser.user_id = response.data.user_detail._id
                let localStorageData = {
                    _id: this.logginUser.user_id,
                    corporate_id: response.data.user_detail.corporate_detail ? response.data.user_detail.corporate_detail._id : null,
                    server_token: this.logginUser.token,
                    country: this.logginUser.country,
                    country_phone_code: this.logginUser.country_phone_code,
                    first_name: this.logginUser.first_name,
                    last_name: this.logginUser.last_name,
                    email: this.logginUser.email,
                    phone: this.logginUser.phone,
                    login_by: this.logginUser.login_by,
                    referral_code: this.logginUser.referral_code,
                    wallet_currency_code: this.logginUser.wallet_currency_code,
                    picture: this.logginUser.picture
                }
                this.helper.user_details = localStorageData;
                const encryptedDta = await this._encryptionDecryptionService.encryptData(localStorageData);
                localStorage.setItem('userData', encryptedDta);
                localStorage.setItem('newEncryptUserData', encryptedDta);

                this.loginSubject.next(this.logginUser);
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return true;
        }
    }

    async user_forgot_password_Email(parameters): Promise<boolean> {
        try {
            const captcha_token = await this.generateRecaptchaToken();
            if (captcha_token) {
                parameters['captcha_token'] = captcha_token;
            }
            const response = await this._api.post({ url: apiColletions.forgot_password, parameters })
            if (response.success) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    async forgotPasswordPhone(parameters): Promise<any> {
        try {
            const captcha_token = await this.generateRecaptchaToken();
            if (captcha_token) {
                parameters['captcha_token'] = captcha_token;
            }
            const response = await this._api.post({ url: apiColletions.get_otp, parameters })
            if (response.success) {
                return response.data;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    async forgotPasswordPhoneOtpCheck(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.check_sms_otp, parameters })
            if (response.success) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    async userupdatePassword(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.update_password, parameters })
            if (response.success) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    // Register
    async user_register(userForm): Promise<any> {
        try {
            const captcha_token = await this.generateRecaptchaToken();
            if (captcha_token) {
                userForm.append('captcha_token', captcha_token)
            }
            const response = await this._api.post({ url: apiColletions.register, parameters: userForm })
            if (response.success) {
                this.logginUser = response.data.user_detail;
                this.loginSubject.next(this.logginUser);
                let localStorageData = {
                    _id: this.logginUser.user_id,
                    server_token: this.logginUser.token,
                    first_name: this.logginUser.first_name,
                    country: this.logginUser.country,
                    wallet_currency_code: this.logginUser.wallet_currency_code,
                }
                const encryptedDta = await this._encryptionDecryptionService.encryptData(localStorageData);
                localStorage.setItem('userData', encryptedDta);
                localStorage.setItem('newEncryptUserData', encryptedDta);
                return response;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    // Refrral Code Apply
    async UserRefrral(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.apply_referral_code, parameters })
            if (response.success) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    // OTP Verification Apply
    async Verification(parameters): Promise<any> {
        try {
            const captcha_token = await this.generateRecaptchaToken();
            if (captcha_token) {
                parameters['captcha_token'] = captcha_token;
            }
            const response = await this._api.post({ url: apiColletions.verification, parameters })
            if (response.success) {
                return response.data;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }
}
