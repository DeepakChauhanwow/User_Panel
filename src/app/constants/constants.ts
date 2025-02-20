export const PDFSIZE = 100000;

export const DEFAULT_IMAGE = {
	DEFAULT_PDF_IMG: 'assets/default_images/pdf_img.png',
	USER_SQUARE: 'assets/default_images/user_square.png',
	USER_PROFILE: 'assets/default_images/profile.png',
	DOCUMENT_PROFILE:'assets/default_images/uploading.png',
	PICKUP_ICON: 'assets/default_images/map_pin/pickup.png',
	DESTINATION_ICON: 'assets/default_images/map_pin/destination.png',
	DRIVER_ICON: 'assets/default_images/map_pin/driver.png',
	STOP_ICON: 'assets/default_images/map_pin/stop_icon.svg',
	TAXI_ICON: 'assets/default_images/Taxi.jpg',
}
export const DATE_FORMAT = {
	DD_MM_YYYY_HH_MM_A: 'dd MMM yyyy hh:mm a',
	DD_MM_YY_HH_MM_A: 'dd MMM yy - hh:mm a',
	DD_MMM_YYYY_HH_MM_A: 'dd-MM-yyyy, HH:mm',
	DD_MM_YYYY: 'dd MMM yyyy',
	D_MMM_YY_H_MM_A:"d MMM yy - h:mm a",
	H_MM_A:"h:mm a",
}

export const TRIP_TYPE = {
	TRIP_TYPE_NORMAL: 0,
	TRIP_TYPE_VISITOR: 1,
	TRIP_TYPE_HOTEL: 2,
	TRIP_TYPE_DISPATCHER: 3,
	TRIP_TYPE_SCHEDULE: 5,
	TRIP_TYPE_PROVIDER: 6,
	TRIP_TYPE_CORPORATE: 7,
	TRIP_TYPE_AIRPORT: 11,
	TRIP_TYPE_ZONE: 12,
	TRIP_TYPE_CITY: 13,
	TRIP_TYPE_CAR_RENTAL: 14,
	TRIP_TYPE_GUEST_TOKEN: 15,
}

export const SPLIT_PAYMENT = {
    WAITING: 0,
    ACCEPTED: 1,
    REJECTED: 2
}

export const EXPORT_HISTORY_TYPE = {
	HISTORY : 9,
}

export const PAYMENT_GATEWAY = {
	stripe: 10,
	paystack: 11,
	payu: 12,
	paytabs: 13,
	paypal: 14,
	razorpay : 15
};

export const OPEN_MODAL_TYPE = {
	WALLET: 1,
	REDEEM: 2
}

export const TABS = {
	TAB1 : 'Book Tab',
	TAB2 : 'Track Tab'
}

export const OTP_TYPE = {
	FORGOT_PASSWORD: 1,
	OTP_LOGIN: 2
}

export const TRIP_STATUS_TYPE_VALUE = {
	USER: 1,
	PROVIDER: 2,
	PARTNER: 3,
	CORPORATE: 4,
	HOTEL: 5,
	DISPATCHER: 6,
	VEHICLE: 7,
	ADMIN: 8,
}

export const TRIP_STATUS_TYPE_VALUE_STRING = {
	[TRIP_STATUS_TYPE_VALUE.USER]: 'label-title.user',
	[TRIP_STATUS_TYPE_VALUE.PROVIDER]: 'label-title.driver',
	[TRIP_STATUS_TYPE_VALUE.PARTNER]: 'label-title.partner',
	[TRIP_STATUS_TYPE_VALUE.CORPORATE]: 'label-title.corporate',
	[TRIP_STATUS_TYPE_VALUE.HOTEL]: 'menu.hotel',
	[TRIP_STATUS_TYPE_VALUE.DISPATCHER]: 'menu.dispatcher',
	[TRIP_STATUS_TYPE_VALUE.VEHICLE]: 'label-title.vehicle',
	[TRIP_STATUS_TYPE_VALUE.ADMIN]: 'label-title.admin',
}

export const TRIP_STATUS_TIMELIME = {
	CREATED: 0,
	ACCEPTED: 1,
	COMING: 2,
	ARRIVED: 3,
	TRIP_STARTED: 4,
	TRIP_COMPLETED: 5,
	TRIP_CANCELLED: 6,
};

export const TRIP_STATUS_TIMELIME_STRING = {
	[TRIP_STATUS_TIMELIME.CREATED]: 'label-title.created',
	[TRIP_STATUS_TIMELIME.ACCEPTED]: 'label-title.accepted',
	[TRIP_STATUS_TIMELIME.COMING]: 'label-title.coming',
	[TRIP_STATUS_TIMELIME.ARRIVED]: 'label-title.arrived',
	[TRIP_STATUS_TIMELIME.TRIP_STARTED]: 'label-title.started',
	[TRIP_STATUS_TIMELIME.TRIP_COMPLETED]: 'label-title.complete',
	[TRIP_STATUS_TIMELIME.TRIP_CANCELLED]: 'label-title.cancelled',
};

export const REQUEST_TYPE = {
    RIDE_NOW: 1,
    SCHEDULED: 2,
    CITY_TO_CITY: 3,
    RENTAL: 4,
    AIRPORT: 5,
    ZONE: 6,
    GUEST: 7,
    BIDDING: 8,
    FIXED: 9,
    RIDE_SHARE: 10,
    OPEN_RIDE:11
}

export const HISTORY_TYPE = {
	NORMAL: 1,
	OPEN_RIDE: 2,
}

export const PROVIDER_STATUS = {
	WAITING: 0,
	ACCEPTED: 0,
	ACCEPT: 1,
	COMING: 2,
	AFTER_TIME_WAITING: 3,
	ARRIVED: 4,
	STARTED: 6,
	COMPLETED: 9
}

export const NAME_TYPE = {
	FIRST_NAME: 1,
	LAST_NAME: 2,
}