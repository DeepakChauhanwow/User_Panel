import { Injectable } from "@angular/core";
import { apiColletions } from "../constants/api_collection";
import { Helper } from "../shared/helper";
import { ApiService } from "./api.service";

@Injectable({ providedIn: 'root' })
export class PaymentService {


    constructor(private _api: ApiService, private _helper: Helper) { }

    async get_card_list(parameters): Promise<any> {
        try {
            parameters.is_show_error_toast = false;
            parameters.is_show_success_toast = false;
            const response = await this._api.post({ url: apiColletions.get_card_list, parameters })
            if (response.success) {
                return response.data;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async delete_card(parameters): Promise<boolean> {
        try {
            const response = await this._api.post({ url: apiColletions.delete_card, parameters })
            if (response.success) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    async get_stripe_add_card_intent(parameters): Promise<string> {
        try {
            const response = await this._api.post({ url: apiColletions.get_stripe_add_card_intent, parameters })
            if (response.success) {
                return response.data.client_secret;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    async _get_stripe_add_card_intent(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.get_stripe_add_card_intent, parameters })
            if (response.success) {
                return response.data;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }


    async get_stripe_payment_intent_wallet(parameters): Promise<{ client_secret: string, last_four: string, payment_method: string, error: string }> {
        try {
            const response = await this._api.post({ url: apiColletions.get_stripe_payment_intent_wallet, parameters })
            if (response.success) {
                return { ...response.data, error: '' };
            } else {
                return {
                    client_secret: null,
                    last_four: null,
                    payment_method: null,
                    error: response.data.error
                };
            }
        } catch (err) {
            return {
                client_secret: null,
                last_four: null,
                payment_method: null,
                error: err.message
            };
        }
    }

    async add_card(parameters): Promise<boolean> {
        try {
            const response = await this._api.post({ url: apiColletions.add_card, parameters })
            if (response.success) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    async select_card(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.select_card, parameters })
            if (response.success) {
                return response;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    async get_payment_intent_wallet(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.get_stripe_payment_intent_wallet, parameters })
            return response;
        } catch (err) {
            return [];
        }
    }

    async send_paystack_required_detail(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.send_paystack_required_detail, parameters })
            if (response) {
                return response;
            }
        } catch (err) {
            return null;
        }
    }

    async add_wallet_amount(parameters): Promise<boolean> {
        try {
            const response = await this._api.post({ url: apiColletions.add_wallet_amount, parameters })
            if (response.success) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    async wallet_status(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.change_user_wallet_status, parameters })
            if (response.success) {
                return response;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }


    async pay_stripe_intent_payment(parameters): Promise<boolean> {
        try {
            const response = await this._api.post({ url: apiColletions.pay_stripe_intent_payment, parameters })
            if (response.success) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    async paypal_supported_currency(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.paypal_supported_currency, parameters })
            if (response.success) {
                return response.data;
            } else {
                return false;
            }
        } catch (err) {
            return false
        }
    }

    async withdraw_redeem_point_to_wallet(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.withdraw_redeem_point_to_wallet, parameters })
            if (response.success) {
                return response.data;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    async change_payment_gateway_type(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.change_payment_gateway_type, parameters })
            if (response.success) {
                return response.data;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

}
