import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { apiColletions } from '../constants/api_collection';

@Injectable({
	providedIn: 'root'
})
export class HistoryService {

	constructor(private _api: ApiService) { }

	async get_history(parameters): Promise<any> {
		try {
			const response = await this._api.post({ url: apiColletions.userhistory, parameters })
			if (response.success) {
				return response.data
			} else {
				return []
			}
		} catch {
			return []
		}
	}

	async rate_Us(parameters): Promise<any> {
		try {
			const response = await this._api.post({ url: apiColletions.usergiverating, parameters })
			if (response.success) {
				return response.data
			} else {
				return []
			}
		} catch {
			return []
		}
	}

	async get_usertripdetail(parameters): Promise<any> {
		try {
			const response = await this._api.post({ url: apiColletions.usertripdetail, parameters })
			if (response.success) {
				return response.data
			} else {
				return []
			}
		} catch {
			return []
		}
	}

	async get_getfuture_history(parameters): Promise<any> {
		try {
			parameters.is_show_error_toast = false;
			const response = await this._api.post({ url: apiColletions.getfuturetrip, parameters })
			if (response.success) {
				return response.data
			} else {
				return []
			}
		} catch {
			return []
		}
	}


	async get_usergettripstatus(parameters): Promise<any> {
		try {
			parameters.is_show_error_toast = false;
			parameters.is_show_success_toast = false;
			const response = await this._api.post({ url: apiColletions.usergettripstatus, parameters })
			return response.data
		} catch {
			return []
		}
	}

	async get_provider_info(parameters): Promise<any> {
		try {
			parameters.is_show_error_toast = false;
			parameters.is_show_success_toast = false;
			const response = await this._api.post({ url: apiColletions.get_provider_info, parameters })
			if (response.success) {
				return response.data
			} else {
				return []
			}
		} catch {
			return []
		}
	}


	async user_submit_invoice(parameters): Promise<any> {
		try {
			const response = await this._api.post({ url: apiColletions.user_submit_invoice, parameters })
			if (response.success) {
				return response.data
			} else {
				return []
			}
		} catch {
			return []
		}
	}

	async openrideuserhistory(parameters): Promise<any> {
		try {
			const response = await this._api.post({ url: apiColletions.openrideuserhistory, parameters })
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
