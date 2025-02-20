export const apiColletions = {

    //Common
    "get_countries": "/country_list",
    "get_user_setting_detail": "/get_user_setting_detail",
    "get_language_list":"/get_language_list",
    "guest_user" : "/admin/get_guest_token",

    // Auth
    "login": "/userslogin",
    "register": "/userregister",
    "logout":"/logout",
    "user_social_login_web":'/user_social_login_web',
    "verification":"/verification",
    "get_all_country_details":"/get_all_country_details",

    // vehicle
    "typelist_selectedcountrycity": "/typelist_selectedcountrycity",
    "getfareestimate": "/getfareestimate",
    "get_nearby_provider": "/get_nearby_provider",
    "getnearbyprovider":"/getnearbyprovider",
    "get_server_time" : "/get_server_time",
    "get_fare_estimate_all_type" : "/get_fare_estimate_all_type",

    // Profile
    "get_user_detail": "/getuserdetail",
    "user_update": "/userupdate",
    "forgot_password": "/forgotpassword",
    "get_otp":"/get_otp",
    "check_sms_otp":"/check_sms_otp",
    "update_password":"/update_password",
    "checkuser" : "/check_user" ,

    // Document Upload
    "get_user_document": "/getuserdocument",
    "upload_user_document": "/uploaduserdocument",

    // Payment
    "get_card_list": "/payments/cards",
    "select_card": "/payments/card_selection",
    "add_card": "/payments/addcard",
    "get_payment_gateway": "/get_payment_gateway",
    "get_stripe_add_card_intent": "/payments/get_stripe_add_card_intent",
    "get_stripe_payment_intent_wallet": "/payments/get_stripe_payment_intent",
    "send_paystack_required_detail": "/payments/send_paystack_required_detail",
    "add_wallet_amount": "/add_wallet_amount",
    "delete_card": "/payments/delete_card",
    "pay_stripe_intent_payment":"/pay_stripe_intent_payment",
    "paypal_supported_currency":"/payments/paypal_supported_currency",
    "change_payment_gateway_type":"/payments/change_payment_gateway_type",

    // Wallet History
    "get_wallet_history": "/earning/get_wallet_history",

    //userhistory
    "userhistory": "/history/userhistory",
    "openrideuserhistory": "/history/openrideuserhistory",
    "usertripdetail": "/usertripdetail",
    "usergettripstatus" : "/usergettripstatus",
    "get_provider_info" : "/get_provider_info",
    "user_submit_invoice" : "/user_submit_invoice",

    //apply_promo_code
    "apply_promo_code": "/apply_promo_code",
    "remove_promo_code" : "/remove_promo_code",
    "get_promo_code_list":"/get_promo_code_list",

    //Trip
    "create_trip": "/createtrip",
    "canceltrip" : "/canceltrip",
    "trip_cancel_by_guest" : "/trip_cancel_by_guest",
    "userchangepaymenttype": "/userchangepaymenttype",
    "usersetdestination" : "/usersetdestination",
    "track_trip_new": "/track-trip_new",
    "tripcancelbyadmin" : "/tripcancelbyadmin",
    "open_ride_list_for_user": "/open_ride_list_for_user",
    "user_book_ride": "/user_book_ride",
    "cancel_ride": "/cancel_ride",
    "setgooglemappath" : "/setgooglemappath",
    
    //walletstatus
    "change_user_wallet_status": "/change_user_wallet_status",

    //usegiverting
    "usergiverating":"/usergiverating",

    //getfuturetrip
    "getfuturetrip":"/history/getfuturetrip",

    //gettrippath
    "getgooglemappath":"/getgooglemappath",

    //userReviews
    "userReviews":"/userReviews",

    //referral_code
    "apply_referral_code":"/apply_referral_code",

    //delete_user
    "delete_user":"/delete_user",

    //privacy policy && terms and condition
    "terms_and_condition":"/terms_and_condition",

    //address
    "set_home_address":"/set_home_address",
    "get_home_address":"/get_home_address",

    //split payment
    "search_user_for_split_payment":"/search_user_for_split_payment",
    "send_split_payment_request":"/send_split_payment_request",
    "accept_or_reject_split_payment_request":"/accept_or_reject_split_payment_request",
    "remove_split_payment_request":"/remove_split_payment_request",
    "update_split_payment_payment_mode":"/update_split_payment_payment_mode",

    //corporate request
    "user_accept_reject_corporate_request":"/user_accept_reject_corporate_request",

    //exel shit
    "generate_user_history_export_excel":"/generate_user_history_export_excel",

    //tip
    "pay_tip_payment":"/pay_tip_payment",

    //Export History
    "get_export_history_list":"/history/get_export_history_list",
    "delete_export_file":"/history/delete_export_file",

    //Cancellation Reason
    "get_cancellation_reason" : "/get_cancellation_reason",
    
    //bidding
    "user_accept_bid":"/user_accept_bid",
    "user_reject_bid":"/user_reject_bid",

    // update web push config
    "update_webpush_config":"/update_webpush_config",

    //redeem points
    "withdraw_redeem_point_to_wallet":"/withdraw_redeem_point_to_wallet",
    "get_redeem_point_history":"/earning/get_redeem_point_history",

    "mass_notification": "/fetch_mass_notification_for_user",

    //Sent Money To Other User
    "search_user_to_send_money" : "/search_user_to_send_money",
    "send_money_to_friend" : "/send_money_to_friend",

    "get_banner_list" : "/get_banner_list"

}
