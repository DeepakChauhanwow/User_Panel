export class UserModel{
    user_id:string = '';
    first_name:string = '';
    last_name:string = '';
    picture:string = '';
    email:string = '';
    phone:string = '';
    password:string='';
    is_approved:boolean = false;
    is_document_uploaded:boolean = false;
    is_email_verified:boolean = false;
    is_use_wallet:boolean = false;
    is_phone_number_verified:boolean = false;
    cart_id:string = '';
    login_by:string = '';
    token: string = '';
    social_id: string = '';
    social_ids:Array<string> = []
    country_code: string = '';
    country_id: string = '';
    country_phone_code: string = '';
    wallet_currency_code: string = '';
    user_type: number = 1;
    is_referral:number= 0;
    referral_code:string='';
    country:string='';
    refferal_credit:number=1;
    social_unique_id:any;
    total_redeem_point:number = 0;
    user_redeem_point_value:number;
    user_minimum_point_require_for_withdrawal:number;
}
