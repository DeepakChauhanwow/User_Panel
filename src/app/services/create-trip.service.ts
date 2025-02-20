import { Injectable } from "@angular/core";
import { apiColletions } from "../constants/api_collection";
import { ApiService } from "./api.service";
import { HttpParams } from "@angular/common/http";

@Injectable({
    providedIn: "root",
})
export class CreateTripService {

    constructor(private _api: ApiService) { }

    async create_Trip(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.create_trip, parameters })
            if (response.success) {
                return response.data;
            } else {
                return response;
            }
        } catch (err) {
            return [];
        }
    }

    async cancle_Trip(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.canceltrip, parameters })
            if (response.success) {
                return response;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async userchangepaymenttype(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.userchangepaymenttype, parameters })
            if (response.success) {
                return response;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async usersetdestination(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.usersetdestination, parameters })
            if (response.success) {
                return response;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async polyline(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.getgooglemappath, parameters })
            return response;
        } catch (err) {
            return [];
        }
    }

    async search_user_for_split_payment(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.search_user_for_split_payment, parameters })
            if (response.success) {
                return response;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async send_split_payment_request(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.send_split_payment_request, parameters })
            if (response.success) {
                return response;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async accept_or_reject_split_payment_request(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.accept_or_reject_split_payment_request, parameters })
            if (response.success) {
                return response;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async remove_split_payment_request(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.remove_split_payment_request, parameters })
            if (response.success) {
                return response;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async update_split_payment_payment_mode(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.update_split_payment_payment_mode, parameters, })
            if (response.success) {
                return response;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async get_cancellation_reason(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.get_cancellation_reason, parameters })
            if (response.success) {
                return response.data;
            } else {
                return response;
            }
        } catch (err) {
            return [];
        }
    }

    async user_accept_bid(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.user_accept_bid, parameters })
            if (response.success) {
                return response;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async user_reject_bid(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.user_reject_bid, parameters })
            if (response.success) {
                return response;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async getfareEstimateAllType(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.get_fare_estimate_all_type, parameters })
            if (response.success) {
                return response;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async getTrackTripData(parameters): Promise<any> {
        try {
            let params = new HttpParams();
            params = params.append('token', parameters.token);
            params = params.append('trip_id', parameters.trip_id);
            params = params.append('trip_unique_id', parameters.trip_unique_id);
            const response = await this._api.getwithparams({ url: apiColletions.track_trip_new, params })
            if (response.success) {
                return response.data;
            } else {
                return response;
            }
        } catch (err) {
            return [];
        }
    }

    async trip_cancel_by_admin(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.tripcancelbyadmin, parameters })
            if (response.success) {
                return response.data;
            } else {
                return Response;
            }
        } catch (err) {
            return [];
        }
    }

    async trip_cancel_by_guest(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.trip_cancel_by_guest, parameters })
            if (response.success) {
                return response;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async open_ride_list_for_user(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.open_ride_list_for_user, parameters })
            if (response.success) {
                return response.data;
            } else {
                return Response;
            }
        } catch (err) {
            return [];
        }
    }

    async user_book_ride(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.user_book_ride, parameters })
            if (response.success) {
                return response.data;
            } else {
                return Response;
            }
        } catch (err) {
            return [];
        }
    }

    async openRideCancleTrip(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.cancel_ride, parameters })
            if (response.success) {
                return response;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

    async setGooglePath(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.setgooglemappath, parameters })
            if (response.success) {
                return response;
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }

}
