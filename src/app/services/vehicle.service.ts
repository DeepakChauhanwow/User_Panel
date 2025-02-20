import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { apiColletions } from '../constants/api_collection';

@Injectable({
    providedIn: 'root'
})
export class VehicleService {

    constructor(private _api: ApiService) { }

    async get_vehicles_list(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.typelist_selectedcountrycity, parameters })
            if (response.success) {
                return response.data
            } else {
                return []
            }
        } catch {
            return []
        }
    }

    async get_promocode(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.apply_promo_code, parameters })
            if (response.success) {
                return response.data
            } else {
                return response
            }
        } catch {
            return []
        }
    }

    async remove_promo_code(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.remove_promo_code, parameters })
            if (response.success) {
                return response.data
            } else {
                return response
            }
        } catch {
            return []
        }
    }

    async get_fare_estimate(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.getfareestimate, parameters })
            if (response.success) {
                return response.data
            } else {
                return []
            }
        } catch {
            return []
        }
    }

    async get_server_time(): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.get_server_time, parameters: {} })
            return response.data
        } catch {
            return []
        }
    }

    async get_nearby_provider(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.get_nearby_provider, parameters })
            if (response.success) {
                return response.data
            } else {
                return []
            }
        } catch {
            return []
        }
    }

    async getnearbyprovider(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.getnearbyprovider, parameters })
            if (response.success) {
                return response.data
            } else {
                return []
            }
        } catch {
            return []
        }
    }

    async get_promo_code_list(parameters): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.get_promo_code_list, parameters })
            if (response.success) {
                return response.data
            } else {
                return []
            }
        } catch {
            return []
        }
    }

}
