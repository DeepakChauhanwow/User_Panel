import { Injectable } from "@angular/core";
import { apiColletions } from "../constants/api_collection";
import { CountryModel } from "../models/country.model";
import { ApiService } from "./api.service";
import { BehaviorSubject } from "rxjs";
import { Helper } from "../shared/helper";
import { EncryptionDecryptionService } from "./encrypt-decrypt.service";

export interface Lang {
    code: string;
    name: string;
    string_file_path: string;
}

@Injectable({ providedIn: "root" })
export class CommonService {
    public _exportChanges = new BehaviorSubject<any>(null);
    __exportChangesObservable = this._exportChanges.asObservable();

    constructor(private _api: ApiService, private helper: Helper, private _encryptionDecryptionService:EncryptionDecryptionService) { }

    async _initApp() {
        try {
            let response = await this.get_setting_detail({})
            this.helper.google_key.next(response.setting_detail.user_panel_google_key);
            if (response.success && response.setting_detail.is_use_captcha && response.setting_detail.recaptcha_site_key_for_web) {
                this.helper.loadGoogleScript("https://www.google.com/recaptcha/api.js?render=" + response.setting_detail.recaptcha_site_key_for_web);
            }
            return true;
        } catch (err) {
            return err;
        }
    }

    async get_country_list(): Promise<Array<CountryModel>> {
        try {
            const response = await this._api.get({ url: apiColletions.get_countries, parameters: {} })
            if (response.success) {
                return response.data.country;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async get_setting_detail(parameters): Promise<any> {
        try {
            parameters.is_show_error_toast = false;
            parameters.is_show_success_toast = false;
            const response = await this._api.post({ url: apiColletions.get_user_setting_detail, parameters })
            if (response.success) {
                return response.data;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    async user_reviews(parameters): Promise<any> {
        try {
            const response = await this._api.get({ url: apiColletions.userReviews, parameters: {} })
            if (response.success) {
                return response.data;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    async UserAccountDelete(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.delete_user, parameters })
            if (response.success) {
                return response.data;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    async UserHomeAndWorkaddress(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.set_home_address, parameters })
            if (response.success) {
                return response.data;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    async get_address(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.get_home_address, parameters })
            if (response.success) {
                return response.data;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    async privacyPolicy(parameters): Promise<any> {
        try {
            const response = await this._api.get({ url: apiColletions.terms_and_condition, parameters: {} })
            if (response.success) {
                return response.data;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    async generate_user_history_export_excel(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.generate_user_history_export_excel, parameters, })
            if (response) {
                return response.data;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    async user_accept_reject_corporate_request(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.user_accept_reject_corporate_request, parameters })
            if (response) {
                if(parameters.is_accepted && !this.helper.user_details.corporate_id && parameters.corporate_id){
                    this.helper.user_details['corporate_id'] = parameters.corporate_id;
                    const encryptedDta = await this._encryptionDecryptionService.encryptData(this.helper.user_details);
                    localStorage.setItem('userData', encryptedDta);
                    localStorage.setItem('newEncryptUserData', encryptedDta);
                    this.helper.isUpadtedlocalStorage();
                }
                return response.data;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    async pay_tip_payment(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.pay_tip_payment, parameters })
            if (response) {
                return response.data;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    async getLanguageList(): Promise<any> {
        try {
            const response = await this._api.get({ url: apiColletions.get_language_list, parameters: [] })
            if (response.success) {
                return response.data;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    }

    async getExportHistoryList(parameters) {
        try {
            const response = await this._api.post({ url: apiColletions.get_export_history_list, parameters })
            if (response.success) {
                return response.data;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    async deleteExportFile(parameters) {
        try {
            const response = await this._api.post({ url: apiColletions.delete_export_file, parameters })
            if (response.success) {
                this._exportChanges.next({});
                return response.data;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    async update_webpush_config(parameters) {
        try {
            const response = await this._api.post({ url: apiColletions.update_webpush_config, parameters })
            if (response.success) {
                return response.data;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    async getCountryList(): Promise<any> {
        try {
            const response = await this._api.get({ url: apiColletions.get_all_country_details, parameters: {} })
            if (response.success) {
                return response.data;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    async get_mass_notification_history(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.mass_notification, parameters })
            return response.data;
        } catch {
            return [];
        }
    }

    async getGuestUser(parameters): Promise<any> {
        try {
            const response = await this._api.get({ url: apiColletions.guest_user + "?token=" + parameters.token, parameters, })
            if (response.success) {
                return response.data;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    async search_user_by_phone(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.search_user_to_send_money, parameters })
            if (response.success) {
                return response.data;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async send_money_to_friend(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.send_money_to_friend, parameters })
            if (response.success) {
                return response.data;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async get_banner(): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.get_banner_list,  parameters : {} })
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
