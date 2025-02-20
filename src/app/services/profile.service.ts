import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { apiColletions } from "../constants/api_collection";
import { UserModel } from "../models/user.model";
import { ApiService } from "./api.service";
import { WalletHistory } from "../models/wallet-history.model";
import { Helper } from "../shared/helper";
import { EncryptionDecryptionService } from "./encrypt-decrypt.service";

@Injectable({ providedIn: 'root' })
export class ProfileService {

    public logginUser: UserModel;
    private loginSubject = new BehaviorSubject<UserModel>(this._helper.user_details);
    loginObservable: Observable<UserModel> = this.loginSubject.asObservable();

    constructor(private _api: ApiService, private _helper: Helper,private _encryptionDecryptionService:EncryptionDecryptionService) { }

    async fetch_profile(parameters): Promise<UserModel> {
        try {
            parameters.is_show_success_toast = false;
            parameters.is_show_error_toast = false;
            const response = await this._api.post({ url: apiColletions.get_user_detail, parameters })
            if (response.success) {
                return response.data;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    async update_profile(profileForm): Promise<boolean> {
        try {
            const response = await this._api.post({ url: apiColletions.user_update, parameters: profileForm })
            if (response.success) {
                this.logginUser = response.data.user_detail;
                let localStorageData = {
                    _id: this.logginUser.user_id,
                    server_token: this.logginUser.token,
                    first_name: this.logginUser.first_name,
                    last_name: this.logginUser.last_name,
                    email: this.logginUser.email,
                    phone: this.logginUser.phone,
                    picture: this.logginUser.picture,
                    country: this.logginUser.country,
                    wallet_currency_code: this.logginUser.wallet_currency_code,
                    corporate_id: null
                }
                if (this._helper.user_details?.corporate_id) {
                    localStorageData['corporate_id'] = this._helper.user_details.corporate_id;
                }
                const encryptedDta = await this._encryptionDecryptionService.encryptData(localStorageData);
                localStorage.setItem('userData', encryptedDta);
                localStorage.setItem('newEncryptUserData', encryptedDta);

                this.loginSubject.next(this.logginUser);
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    async get_wallet_history(parameters): Promise<Array<WalletHistory>> {
        try {
            const response = await this._api.post({ url: apiColletions.get_wallet_history, parameters })
            if (response.success) {
                return response.data.wallet_history;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async get_redeem_point_history(parameters): Promise<Array<WalletHistory>> {
        try {
            const response = await this._api.post({ url: apiColletions.get_redeem_point_history, parameters })
            if (response.success) {
                return response.data.wallet_history;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async check_user(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.checkuser, parameters })
            if (response.success) {
                return response.data;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

}