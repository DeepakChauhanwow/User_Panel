import { Injectable } from '@angular/core';
import { apiColletions } from "../constants/api_collection";
import { ApiService } from "./api.service";

@Injectable({
    providedIn: 'root'
})
export class DocumentService {

    constructor(private _api: ApiService) { }

    async fetch_document(parameters): Promise<any> {
        try {
            parameters.is_show_success_toast = false;
            parameters.is_show_error_toast = false;
            const response = await this._api.post({ url: apiColletions.get_user_document, parameters })
            if (response.success) {
                return response.data;
            } else {
                return false;
            }
        } catch (err) {
        }
        return null;
    }

    async update_document(documentsForm): Promise<any> {
        try {
            const response = await this._api.post({ url: apiColletions.upload_user_document, parameters: documentsForm })
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
