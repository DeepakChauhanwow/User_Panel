export class Card{
    _id: string = null;
    user_id:string = null;
    user_type:number = 10;
    updated_at:Date = null;
    created_at:Date = null;
    payment_gateway_type:number=0;
    is_default:number = 1;
    customer_id:string = null;
    last_four:string = null;
    unique_id:number = 0;
    card_type:string = null;
    payment_method:string = null;
    card_expiry_date:string = null;
    card_holder_name:string = null;
    payment_id:string = null;
}