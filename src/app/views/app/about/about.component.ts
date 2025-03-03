
import { ChangeDetectorRef, Component, TemplateRef, OnInit, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { DocumentEditModalComponent } from 'src/app/containers/pages/document-edit-modal/document-edit-modal.component';
import { ProfileEditModalComponent } from 'src/app/containers/pages/profile-edit-modal/profile-edit-modal.component';
import { WalletHistoryModalComponent } from 'src/app/containers/pages/wallet-history-modal/wallet-history-modal.component';
import { UserModel } from 'src/app/models/user.model';
import { DocumentModel } from 'src/app/models/document.model';
import { Helper } from 'src/app/shared/helper';
import { TranslateModule } from '@ngx-translate/core'; 
import { DocumentService } from 'src/app/services/document.service';
import { DEFAULT_IMAGE, PAYMENT_GATEWAY } from 'src/app/constants/constants';
import { environment } from 'src/environments/environment';
import { PaymentService } from 'src/app/services/payment.service'
import { LangService, Language } from "src/app/shared/lang.service";
import { Card } from 'src/app/models/card.model';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { PaymentGateway } from 'src/app/models/payment_gateway.model';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { WalletHistory } from 'src/app/models/wallet-history.model';
import { NotifiyService } from 'src/app/services/notifier.service';
import { CommonService } from 'src/app/services/common.service';
import { AddcardModalComponent } from 'src/app/containers/pages/addcard-modal/addcard-modal.component';
import { RegisterAddressModelComponent } from 'src/app/containers/pages/register-address-model/register-address-model.component';
import * as $ from "jquery";
import { SocketService } from 'src/app/services/socket.service';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import { ActivatedRoute } from '@angular/router';

declare let stripe: any;
declare let google: any;
declare let Razorpay:any;
export class SettingDetail {
  admin_phone: number;
  contactUsEmail: string;
  paypal_client_id: string;
}
export class CardData {
  is_use_wallet: number = 0;
  payment_gateway_type: number;
  wallet: number = 0;
  wallet_currency_code: string = null;
  payment_gateway: Array<PaymentGateway> = [];
  card: Array<Card> = [];
}
@Component({
  selector: 'app-about',
  standalone: true,  
  imports: [TranslateModule], 
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']

})


export class AboutComponent implements OnInit, OnDestroy {
  is_field_mandatory_arr: any[] = [];
  editButton:boolean=true;
  IMAGE_URL = environment.IMAGE_URL;
  DEFAULT_USER_PROFILE = DEFAULT_IMAGE.DOCUMENT_PROFILE;
  WEBSITE_URL = environment.WEBSITE_URL;
  wAmount = false;
  walletFormGroup: UntypedFormGroup;
  pinForm: UntypedFormGroup;
  user: UserModel = new UserModel();
  UserDocument: DocumentModel;
  walletHistory: Array<WalletHistory> = [];
  amount_error: string;
  stripe_amount_error: string;
  payment_name: string;
  payment_id;
  card;
  cardHandler = this.onChange.bind(this);
  card_error: string;
  card_delete_modal: BsModalRef;
  deleteAccount_modal: boolean = false;
  userPasswordmodal: boolean = false;
  userPassword: string;
  cardData: CardData = new CardData();
  delete_card: any;
  addCardmodal: boolean = false;
  paystackPinmodal: boolean = false;
  setting_detail: SettingDetail = new SettingDetail();
  trip_id: any;
  payment_getway_type: number;
  is_add_card: boolean;
  isLoading = false;
  pin_data: any;
  paystack_status: any;
  sendMoneyModal:BsModalRef;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-dialog-centered',
    // keyboard: false
  };
  home_Address: string;
  work_Address: string;
  home_location: any[] = [];
  work_location: any[] = [];
  buttonDisabled:boolean = false;
  res_data: any;
  PAYMENT_GATEWAY = PAYMENT_GATEWAY;
  show_paypal:boolean = false;
  public payPalConfig ? : IPayPalConfig;
  is_paypal_supported:boolean = true;
  paymentWaitingModal:boolean = false;
  home_autocomplete_address:any = '';
  work_autocomplete_address:any = '';
  darkTheme = localStorage.getItem('vien-themecolor');
  logoClr:boolean=false;
  home_address_validation:boolean = false;
  work_address_validation:boolean = false;
  search_user_profile : any = '' ;
  languages: Language[];
  isSingleLang;
  submitted: boolean;
  isAmount: boolean;
  userType : any = 1;
  is_searched_user : boolean = false ;
  searched_user_details : any ;
  send_amount: any;
  DEFAULT_IMAGE = DEFAULT_IMAGE ;
  redeem_point:number;
  redeem_error:string = '';

  @ViewChild('cardInfo', { static: false }) cardInfo: ElementRef;
  @ViewChild('addCardModal', { static: true }) addCardModal: AddcardModalComponent;
  @ViewChild('profileModal', { static: true }) profileModal: ProfileEditModalComponent;
  @ViewChild('registerAddress', { static: true }) registerAddress: RegisterAddressModelComponent;
  @ViewChild('documentEditModal', { static: true }) documentEditModal: DocumentEditModalComponent;
  @ViewChild('walletHistoryModal', { static: true }) walletHistoryModal: WalletHistoryModalComponent;

  constructor(private _commonService: CommonService, private modalService: BsModalService, public _helper: Helper, private _documentService: DocumentService, private _paymentService: PaymentService, private cd: ChangeDetectorRef, private _notifierService: NotifiyService, private _socket: SocketService,  private langService: LangService, private route: ActivatedRoute) {{
    this.languages = this.langService.supportedLanguages;
    this.isSingleLang = this.langService.isSingleLang;
  } }

  loadStripe(stripe_publishable_key): Promise<boolean> {
    return new Promise((resolve, rejects) => {
      let script = document.createElement('script');
      script.id = 'stripeload';
      script.type = 'text/javascript';
      script.innerHTML = "var stripe = Stripe('" + stripe_publishable_key + "'); var elements = stripe.elements();";
      document.getElementsByTagName('head')[0].appendChild(script);
      resolve(true);
    })
  }

  ngOnDestroy(): void {
    this._notifierService = null;
    this.home_address_validation = false;
    this.work_address_validation = false;
  }

  ngOnInit(): void {
    if(this.darkTheme.startsWith('dark') ){
      this.logoClr=true;
    }
    this.pinForm = new UntypedFormGroup({
      pin: new UntypedFormControl(null, [Validators.required]),
      otp: new UntypedFormControl(null, [Validators.required]),
      phone_number: new UntypedFormControl(null, [Validators.required])
    })
    this.walletFormGroup = new UntypedFormGroup({
      amount: new UntypedFormControl(0, [Validators.required]) // added max
    });
    this.fetchUserSettingDetail();
    this.fetchDocument();
    this.fetchCardList();
    this.fetchAddress();
    this.paytabsSocket("'paytabs_" + this._helper.user_details._id + "'" );
    this.payuSocket("'payu_fail_payment_" + this._helper.user_details._id + "'" );
    this._helper.loadGoogleScript("https://maps.googleapis.com/maps/api/js?key=" + this._helper.GOOGLE_KEY + "&libraries=places").then(() => {
      this._inithomeAutoComplete();
      this._initworkAutoComplete();
    })
  }

  paytabsSocket(id: any) {
    this.route.queryParams.subscribe(params => {
      if(params.open_modal == "true"){
        this.paymentWaitingModal = true;
        setTimeout(() => {
          if(this.paymentWaitingModal === true){
            this.paymentWaitingModal = false;
            this._helper._route.navigateByUrl('/app/profile');
          }
        }, 13000);
      }
      let listner = id;
      this._socket.listener(listner).subscribe((res: any) => {
        if(res){
          this.paymentWaitingModal = false;
          if(res.payment_status === true && res.action == 2 && !res.msg){
            this._notifierService.showNotification('success', this._helper.trans.instant('success-code.924'))
            this._helper._route.navigateByUrl('/app/profile');
          }else if(res.payment_status === true && res.action == 1 && !res.msg){
            this._notifierService.showNotification('success', this._helper.trans.instant('success-code.91'))
            this._helper._route.navigateByUrl('/app/profile');
          }else{
            this._notifierService.showNotification('error', this._helper.trans.instant(res.msg))
            this._helper._route.navigateByUrl('/app/profile');
          }
        }
      })
    })
  }

  payuSocket(id: any) {
    let listner = id;
    this._socket.listener(listner).subscribe((res: any) => {
      if(res){
        if(res.payment_status === false){
          this._notifierService.showNotification('error',this._helper.trans.instant('error-code.transaction-failed'))
        }
      }
    })
  }
  
  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.code === 'Escape') {
      if(this.paystackPinmodal){
        this.PaystackPincloseModal();
      }
      if(this.deleteAccount_modal === true){
        this.deleteAccount_modal = false;
      }
      if(this.userPasswordmodal === true){
        this.userPasswordmodal = false;
        this.userPassword = '';
      }
    }
  }

  openaddCardModal(): void {
    const scriptElement = document.getElementById('stripeload');
    if (scriptElement) {
      scriptElement.parentNode.removeChild(scriptElement);
    }
    if(this.cardData.payment_gateway_type == PAYMENT_GATEWAY.paytabs){
      let host = `${window.location}`
      let json: any = { user_id: this._helper.user_details._id, token: this._helper.user_details.server_token, payment_gateway_type: this.cardData.payment_gateway_type, type: 10, is_new:host }
      this._paymentService._get_stripe_add_card_intent(json).then((response:any)=>{
        if(response){
          window.open(response.authorization_url, '_self');
        }else{
          // this._notifierService.showNotification('error', response.message)
        }
      })
      return
    }
    this.addCardModal.show();
  }

  onChange({ error }) {
    if (error) {
      this.card_error = error.message;
    } else {
      this.card_error = null;
    }
    this.cd.detectChanges();
  }

  openProfileModal(): void {
    this.profileModal.show();
  }

  openWalletHistoryModal(type): void {
    this.walletHistoryModal.show(type);
  }

  openDocumentEditModal(): void {
    this.documentEditModal.show();
  }

  openDeleteModal(deleteCard: TemplateRef<any>): void {
    this.buttonDisabled = true;
    setTimeout(() => {
      this.card_delete_modal = this.modalService.show(deleteCard, this.config);
      this.buttonDisabled = false;
    }, 800);
  }

  deleteAccountModal() {
    setTimeout(() => {
      this.deleteAccount_modal = true;
    }, 500);
  }

  openUserPasswordmodal(){
    if(this.user.social_unique_id && this.user.social_unique_id != ''){
      this.deleteAccount()
    }else{
      this.userPasswordmodal=true;
    }
  }

  deleteAccount() {
    let json: any = { token: this._helper.user_details.server_token, user_id: this._helper.user_details._id }
    if(this.user.social_unique_id && this.user.social_unique_id != ''){
      json.social_id = this.user.social_unique_id
    }else{
      json.password = this.userPassword;
    }
    this._commonService.UserAccountDelete(json).then((user_deleted) => {
      if (user_deleted) {
        localStorage.removeItem('userData');
        localStorage.removeItem('newEncryptUserData');
        this.deleteAccount_modal = false;
        this.userPasswordmodal = false;
        this._helper.isUpadtedlocalStorage();
        this._helper._route.navigate(['/']);
      } else {
        this.userPassword = null
        this.userPasswordmodal = false;
        this.deleteAccount_modal = false;
      }
    })
  }

  fetchUserSettingDetail() {
    let json: any = { token: this._helper.user_details.server_token, user_id: this._helper.user_details._id }
    this._commonService.get_setting_detail(json).then((user_setting_detail) => {
      this.setting_detail = user_setting_detail.setting_detail;
      this.loadStripe(user_setting_detail.setting_detail.stripe_publishable_key)
      this.user = user_setting_detail.user_detail;
      if(!user_setting_detail.user_detail.total_redeem_point){
        this.user.total_redeem_point = 0;
      }
    })
  }

  fetchDocument() {
    let json: any = { server_token: this._helper.user_details.server_token, user_id: this._helper.user_details._id }
    this._documentService.fetch_document(json).then((user_document) => {
      this.UserDocument = user_document.userdocument;
      if(user_document===false){
        this.editButton=user_document;
      }
    })
  }

  async fetchCardList() {
    let json: any = { server_token: this._helper.user_details.server_token, user_id: this._helper.user_details._id, type: 10 };
    this.cardData = await this._paymentService.get_card_list(json);
    this.is_add_card = this.cardData.payment_gateway[0].is_add_card;
    if (this.cardData.card.length > 0) {
      this.amount_error = '';
    }
    if(this.cardData.payment_gateway_type != PAYMENT_GATEWAY.paypal){
      this.is_paypal_supported = true;
    }else{
      this.is_paypal_supported = false;
    }
  }

  addCardcloseModal() {
    this.addCardmodal = false;
  }

  openPaystackPinModal() {
    this.paystackPinmodal = true;
  }

  PaystackPincloseModal() {
    this.paystackPinmodal = false;
  }

  submit(): void {
    this.amount_error = '';
    this.stripe_amount_error = '';
    const amount = Number(this.walletFormGroup.value.amount);
    if (!this.walletFormGroup.valid) {
      this.walletFormGroup.markAllAsTouched();
      return;
    }
    if (amount <= 0) {
      this.amount_error = this._helper.trans.instant('validation-title.invalid-amount');
      return;
    }
    if (this.cardData.payment_gateway_type == PAYMENT_GATEWAY.payu) {
      let host = `${window.location}`
      let json: any = {
        user_id: this._helper.user_details._id,
        token: this._helper.user_details.server_token,
        amount: amount,
        payment_gateway_type: this.cardData.payment_gateway_type,
        type: 10,
        is_new: host,
      };
      this._paymentService.get_payment_intent_wallet(json).then((response) => {
        let template = document.getElementById('Payu');
        template.innerHTML = response.data.html_form;
        document.body.appendChild(template);
        (<HTMLFormElement>document.getElementById("myForm")).submit();
      })

    } else if (this.cardData.payment_gateway_type == PAYMENT_GATEWAY.paytabs){
      this._helper.helper_is_loading = true;
      let host = `${window.location}`
      let json: any = { user_id: this._helper.user_details._id, token: this._helper.user_details.server_token,server_token: this._helper.user_details.server_token, amount: amount, payment_gateway_type: this.cardData.payment_gateway_type, type: 10, is_new:host }
      this._paymentService.get_stripe_payment_intent_wallet(json).then((response:any) => {
        setTimeout(() => {
          this._helper.helper_is_loading = false;
        }, 100);
        if(response.success){
          window.open(response.authorization_url, '_self');
        }else{
          // this._notifierService.showNotification('error', response.message)
        }
      })
    } else if (this.cardData.payment_gateway_type == PAYMENT_GATEWAY.razorpay) {
      let host = `${window.location}`
      let json: any = { user_id: this._helper.user_details._id, token: this._helper.user_details.server_token, amount: amount.toFixed(2), payment_gateway_type: this.cardData.payment_gateway_type, type: 10,is_new:host }
      this._paymentService.get_stripe_payment_intent_wallet(json).then((response:any) => {
        if(response.success){
          new Razorpay(response.options).open();
        }else{
          // this._notifierService.showNotification('error', response.message)
        }
      })
    } else if (this.cardData.payment_gateway_type == PAYMENT_GATEWAY.paystack) {
      const idx = this.cardData.card.findIndex(_c => _c.is_default);
      if (idx === -1) {
        if(this.cardData.card.length > 0){
          this.amount_error = this._helper.trans.instant('validation-title.please-select-card');
        }else{
          this._notifierService.showNotification('error',this._helper.trans.instant('validation-title.please-add-card'));
        }
        return;
      }
      if (idx != -1) {
        let card_id = this.cardData.card[idx]._id;
        let json: any = {
          card_id: card_id,
          trip_id: this.trip_id,
          user_id: this._helper.user_details._id,
          token: this._helper.user_details.server_token,
          amount: amount,
          payment_gateway_type: this.cardData.payment_gateway_type,
          type: 10,
        };
        this._paymentService.get_payment_intent_wallet(json).then((response) => {
          if (response.success) {
            this.fetchCardList();
            this.wAmount = false;
            this.walletFormGroup.patchValue({
              amount : 0
            })
          }
          if (!response.success && response.data) {
            if(response.data.required_param){
              this.paystack_status = response.data.required_param;
              setTimeout(() => {
                this.openPaystackPinModal();
              }, 1000);
              this.pin_data = response.data;
            }
          }
        })
      }
    } else {
      // for stripe or default payment gateway(stripe)
      const idx = this.cardData.card.findIndex(_c => _c.is_default);
      if (idx === -1) {
        if(this.cardData.card.length > 0){
          this.amount_error = this._helper.trans.instant('validation-title.please-select-card');
        }else{
          this._notifierService.showNotification('error',this._helper.trans.instant('validation-title.please-add-card'));
        }
        return;
      }
      if (idx != -1) {
        let json: any = {
          user_id: this._helper.user_details._id,
          token: this._helper.user_details.server_token,
          payment_gateway_type: this.cardData.payment_gateway_type,
          type: 10,
          amount: amount
        };
        this._paymentService.get_stripe_payment_intent_wallet(json).then((response:any) => {
          if (!response.client_secret || !response.payment_method || response.payment_method === null) {
            this.stripe_amount_error = this._helper.trans.instant(response.error_message);
            return;
          }
          stripe.confirmCardPayment(response.client_secret, { payment_method: response.payment_method }).then((result) => {
            if (result.paymentIntent) {
              let json: any = {
                user_id: this._helper.user_details._id,
                token: this._helper.user_details.server_token,
                payment_gateway_type: this.cardData.payment_gateway_type,
                payment_intent_id: result.paymentIntent.id,
                wallet: amount,
                type: 10,
              };
              this._paymentService.add_wallet_amount(json).then(is_added => {
                if (is_added) {
                  this.fetchCardList();
                  this.wAmount = false;
                }
              })
            } else {
              this._notifierService.showNotification('error', result.error.message);
            }
            this.walletFormGroup.setValue({ amount: 0 });
          });
        }).catch(error => {
          this.walletFormGroup.value.amount = 0;
        })
      }
    }
  }

  selectDefault(card) {
    let card_id = card._id;
    let payment_gateway_type = card.payment_gateway_type;
    let json: any = { card_id: card_id, payment_gateway_type: payment_gateway_type, user_id: this._helper.user_details._id, token: this._helper.user_details.server_token, type: 10 }
    this._paymentService.select_card(json).then((is_selected: any) => {
      if (is_selected) {
        this.cardData.card.forEach((element: any) => {
          element.is_default = 0
        });
        const index = this.cardData.card.findIndex((item: any) => {
          return item._id == is_selected.data.card._id
        });
        this.cardData.card[index].is_default = 1
      }
    })
  }

  removeCardId(card_id, payment_gateway_type) {
    const idx = this.cardData.card.findIndex(_card => _card._id.toString() === card_id.toString());
    this.cardData.card.splice(idx, 1);
    let json: any = { card_id, payment_gateway_type, user_id: this._helper.user_details._id, token: this._helper.user_details.server_token, type: 10, }
    this._paymentService.delete_card(json).then(is_deleted => {
      if (is_deleted && this.cardData.card.length) {
        this.selectDefault(this.cardData.card[0]);
      }
    });
  }

  removeCardConfirm(card) {
    this.delete_card = card;
  }

  sendpin() {
    let json = {
      otp: this.pinForm.value.otp,
      reference: this.pin_data.reference,
      user_id: this._helper.user_details._id,
      token: this._helper.user_details.server_token,
      payment_gateway_type: this.cardData.payment_gateway_type,
      required_param: this.pin_data.required_param,
      pin: this.pinForm.value.pin,
      phone: this.pinForm.value.phone_number,
      type: 10,
    };
    this._paymentService.send_paystack_required_detail(json).then(response => {

      if (response.success) {
        this.fetchCardList();
      }
      if (!response.success && response.data.required_param) {
        this.paystack_status = response.data.required_param;
        setTimeout(() => {
          this.openPaystackPinModal();
        }, 1000);
        this.pin_data = response.data;
      }
    })
    this.wAmount = false;
    this.walletFormGroup.setValue({ amount: 0 });
    this.PaystackPincloseModal();
    this.pinForm.reset();
    this.pin_data = ''
  }

  add(): void {
    this.wAmount = true;
  }

  fetchAddress() {
    let json: any = { token: this._helper.user_details.server_token, user_id: this._helper.user_details._id };
    this._commonService.get_address(json).then(is_success => {
      if (is_success) {
        this.res_data = is_success
        this.home_Address = is_success.user_address.home_address;
        this.home_autocomplete_address = is_success.user_address.home_address;
        this.work_Address = is_success.user_address.work_address
        this.home_location = is_success.user_address.home_location
        this.work_location = is_success.user_address.work_location
      }
    })
  }

  _inithomeAutoComplete() {
    let autoEletment = document.getElementById("home_address") as HTMLInputElement;
    let autocomplete = new google.maps.places.Autocomplete((autoEletment), { types: [] });

    autocomplete.addListener('place_changed', () => {
      let place = autocomplete.getPlace();

      let lat = place.geometry.location.lat();
      let lng = place.geometry.location.lng();
      let address = place['formatted_address'];
      this.home_Address = address;
      this.home_autocomplete_address = address;
      this.home_location = [lat, lng];
    });
    $('.home-address-search-location').find("#home_address").on("focus click keypress", () => {
      $('.home-address-search-location').find("#home_address").parent(".input-wrp").css({ position: "relative" }).append($(".pac-container"));
    });
  }

  _initworkAutoComplete() {
    let autoEletment = document.getElementById("work_address") as HTMLInputElement;
    let autocomplete = new google.maps.places.Autocomplete((autoEletment), { types: [] });

    autocomplete.addListener('place_changed', () => {
      let place = autocomplete.getPlace();

      let lat = place.geometry.location.lat();
      let lng = place.geometry.location.lng();
      let address = place['formatted_address'];
      this.work_location[0] = lat;
      this.work_location[1] = lng;
      this.work_Address = address;
      this.work_autocomplete_address = address;
    });
    $('.work-address-search-location').find("#work_address").on("focus click keypress", () => {
      $('.work-address-search-location').find("#work_address").parent(".input-wrp1").css({ position: "relative" }).append($(".pac-container"));
    });
  }

  getAddress() {
    if (this.home_Address == '') {
      this.home_location = [];
      this.home_autocomplete_address = '';
    }
    if (this.work_Address == '') {
      this.work_location = [];
      this.work_autocomplete_address = '';
    }
  }

  homeAddressAdd(isAdd: boolean) {
    if (isAdd === true) {
      if (this.home_Address == '' || !this.home_location[0] || (this.home_location[0] == 0 && this.home_location[1] == 0)) {
        this.home_Address = '';
        this.home_location = [];
        this.home_autocomplete_address = '';
      }
      if(this.home_location.length == 0 || !this.home_location[0]){
        this.home_address_validation = true;
        return;
      }
      let json: any = { token: this._helper.user_details.server_token, user_id: this._helper.user_details._id, home_address: this.home_autocomplete_address, home_latitude: this.home_location[0], home_longitude: this.home_location[1] };
      this._commonService.UserHomeAndWorkaddress(json).then(is_success => {
        if (is_success) {
          this.home_Address = this.home_autocomplete_address;
          this.home_address_validation = false;
        }
      })
    }
    else {
      this.home_Address = '';
      this.home_location = [];
      let json: any = { token: this._helper.user_details.server_token, user_id: this._helper.user_details._id, home_address: '', home_latitude: 0, home_longitude: 0 };
      this._commonService.UserHomeAndWorkaddress(json).then(is_success => {
        if (is_success) {
          this.home_Address = '';
          this.home_address_validation = false;
        }
      })
    }
  }

  WorkAddressAdd(isAdd: boolean) {
    if (isAdd === true) {
      if (this.work_Address == '' || !this.work_location[0] || (this.work_location[0] == 0 && this.work_location[1] == 0)) {
        this.work_Address = '';
        this.work_location = [];
        this.work_autocomplete_address = '';
      }
      if(this.work_location.length == 0 || !this.work_location[0]){
        this.work_address_validation = true;
        return;
      }
      let json: any = {
        token: this._helper.user_details.server_token, user_id: this._helper.user_details._id,
        work_address: this.work_autocomplete_address, work_latitude: this.work_location[0], work_longitude: this.work_location[1]
      };
      this._commonService.UserHomeAndWorkaddress(json).then(is_success => {
        if (is_success) {
          this.work_Address = this.work_autocomplete_address;
          this.work_address_validation = false;
        }
      })
    } else {
      this.work_Address = '';
      this.work_location = [];
      let json: any = {
        token: this._helper.user_details.server_token, user_id: this._helper.user_details._id,
        work_address: '', work_latitude: 0, work_longitude: 0
      };
      this._commonService.UserHomeAndWorkaddress(json).then(is_success => {
        if (is_success) {
          this.work_Address = '';
          this.work_address_validation = false;
        }
      })
    }
  }

  openAddressMap(type): void {
    let json: any = { "map_pin": DEFAULT_IMAGE.DRIVER_ICON, "type": type }
    if (type == "home") {
      json.address = this.home_Address;
      json.latitude = this.home_location[0];
      json.longitude = this.home_location[1];
    } else {
      json.address = this.work_Address;
      json.latitude = this.work_location[0];
      json.longitude = this.work_location[1];
    }
    this.registerAddress.show(json);
  }

  saveAddress(event) {
    if (event.type == 'home') {
      this.home_Address = event.address;
      this.home_autocomplete_address = event.address;
      this.home_location[0] = event.latitude;
      this.home_location[1] = event.longitude;
      // this.homeAddressAdd(true)
    } else if (event.type == 'work') {
      this.work_Address = event.address;
      this.work_autocomplete_address = event.address;
      this.work_location[0] = event.latitude;
      this.work_location[1] = event.longitude;
      // this.WorkAddressAdd(true)
    }
  }

  paypalAdd() {
    this.show_paypal = false;
    this.amount_error = '';
    const amount = Number(this.walletFormGroup.value.amount);
    const currency_code = this._helper.user_details.wallet_currency_code;
    if (!this.walletFormGroup.valid) {
      this.walletFormGroup.markAllAsTouched();
      return;
    }

    if (amount <= 0 || this.walletFormGroup.invalid) {
      this.amount_error = this._helper.trans.instant('validation-title.invalid-amount');
      return;
    }

    this.show_paypal = true
    this.payPalConfig = {
      currency: `${currency_code}`,
      clientId: this.setting_detail.paypal_client_id,
      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: `${currency_code}`,
            value: `${amount}`,
            breakdown: {
              item_total: {
                currency_code: `${currency_code}`,
                value: `${amount}`
              }
            }
          },
          items: [{
            name: 'Enterprise Subscription',
            quantity: '1',
            category: 'DIGITAL_GOODS',
            unit_amount: {
              currency_code: `${currency_code}`,
              value: `${amount}`,
            },
          }]
        }]
      },
      advanced: {
        commit: 'true',
        extraQueryParams: [{ name: "disable-funding", value: "credit,card" }]
      },
      style: {
        layout: 'vertical',
        shape: 'pill',
        label: 'pay'
      },
      onApprove: (data, actions) => {
        actions.order.get().then(details => {
        });
      },
      onClientAuthorization: (data) => {
        if (data.status === "COMPLETED") {
          let json: any = {
            user_id: this._helper.user_details._id,
            token: this._helper.user_details.server_token,
            payment_gateway_type: this.cardData.payment_gateway_type,
            payment_intent_id: data.id,
            wallet: amount,
            type: 10,
            card_id: data.payer.payer_id,
            last_four: "Paypal",
          };
          this._paymentService.add_wallet_amount(json).then(is_added => {
            if (is_added) {
              this.fetchCardList();
              this.wAmount = false;
              location.reload();
            }
          })
        }
      },
      onCancel: (data, actions) => {
      },
      onError: err => {
      },
      onClick: (data, actions) => {
      }
    };
  }

  get_paypal_data(bool){
    this.is_paypal_supported = bool;
  }

  getError(): boolean{
    if(!this.redeem_point && this.redeem_point != 0){
      this.redeem_error = this._helper.trans.instant('validation-title.this-is-required');
      return false;
    }
    if(this.user?.total_redeem_point == 0){
      this.redeem_error = this._helper.trans.instant('validation-title.insufficient-redeem-points');
      return false;
    }
    if(this.redeem_point > this.user?.total_redeem_point){
      this.redeem_error = this._helper.trans.instant('validation-title.insufficient-redeem-points');
      return false;
    }
    if(this.redeem_point < this.user?.user_minimum_point_require_for_withdrawal || this.redeem_point == 0){
      this.redeem_error = this._helper.trans.instant('validation-title.please-enter-at-least') + ' ' + this.user?.user_minimum_point_require_for_withdrawal + ' ' + this._helper.trans.instant('validation-title.points-for-redeem');
      return false;
    }
    this.redeem_error = '';
    return true;
  }

  withdrawRedeem(): void{
    let error = this.getError();
    if(error === false){
      let redeem_input = document.getElementById("redeem-points");
      redeem_input?.focus();
      return;
    }
    let json:any = {user_id:this._helper.user_details._id,token:this._helper.user_details.server_token,redeem_point:this.redeem_point,type:10};
    this._paymentService.withdraw_redeem_point_to_wallet(json).then(res => {
      if(res.success){
        this.redeem_error = '';
        this.redeem_point = null;
        this.fetchUserSettingDetail();
        this.fetchCardList();
      }
    })
  }

  send_money_popup(modal: TemplateRef<any>){
    this.sendMoneyModal = this.modalService.show(modal, this.config);
  } 

  search_user(){
    if(this.search_user_profile == ''){
      this.submitted = true ;
      return;
    }

    let json = {
      user_id : this._helper.user_details._id,
      type : this.userType,
      phone : this.search_user_profile
    }
    
    this._commonService.search_user_by_phone(json).then((res_data) =>{
      if(res_data.success){
        this.searched_user_details = res_data.user_detail;
        this.is_searched_user = true ;
      }else{
        this.searched_user_details = {};
        this.is_searched_user = false ;
      }
    })
  }

  send_money(){
    if(!this.send_amount || this.send_amount == 0){
      this.isAmount = true ;
      return;
    }

    let json = {
      user_id : this._helper.user_details._id,
      friend_id : this.searched_user_details._id,
      type : this.userType,
      amount : Number(this.send_amount)
    }
    
    this._commonService.send_money_to_friend(json).then((res_data) => {
      this.close();
      if(res_data.success){
        this.fetchCardList();
      }
    })
  }

  formatCurrency(value: number, currencyCode: string): string {
    const formattedValue = value % 1 === 0 ? value.toFixed(0) : value.toFixed(this._helper.to_fixed_number);
    return `${formattedValue} ${currencyCode}`;
  }

  close(){
    this.sendMoneyModal.hide();
    this.search_user_profile = '';
    this.send_amount = null;
    this.searched_user_details = {};
    this.is_searched_user = false ;
    this.submitted = false ;
    this.isAmount = false;
  }
}
