import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DEFAULT_IMAGE, SPLIT_PAYMENT, PAYMENT_GATEWAY } from 'src/app/constants/constants';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';
import { CreateTripService } from 'src/app/services/create-trip.service';
import { PaymentService } from 'src/app/services/payment.service';
import { Helper } from 'src/app/shared/helper';
import { LangService, Language } from 'src/app/shared/lang.service';
import { environment } from 'src/environments/environment';
import { AddcardModalComponent } from '../../pages/addcard-modal/addcard-modal.component';
import { SocketService } from 'src/app/services/socket.service';
import { NotifiyService } from 'src/app/services/notifier.service';
import { UserModel } from 'src/app/models/user.model';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import { SwPush } from '@angular/service-worker';
import { DocumentService } from 'src/app/services/document.service';
declare let stripe: any;
declare let Razorpay: any;

@Component({
  selector: 'app-topnav2',
  templateUrl: './topnav2.component.html',
  styleUrls: ['./topnav2.component.scss']
})
export class Topnav2Component implements OnInit {
  IMAGE_URL = environment.IMAGE_URL;
  DEFAULT_USER_PROFILE = DEFAULT_IMAGE.USER_PROFILE;
  languages: Language[];
  isSingleLang;
  splitPaymentRequest: boolean;
  corporateRequestModal: boolean;
  go_to_payment: boolean;
  cardData: any;
  split_payment_request: any;
  confirm: number = 0;
  status: number;
  payment_mode: number = 1;
  corporate_details: any;
  paypal_supported: boolean = false;
  user_setting_details: any;
  public payPalConfig?: IPayPalConfig;
  PAYMENT_GATEWAY = PAYMENT_GATEWAY;
  user: UserModel = new UserModel();
  notifications = [];
  dateFormate = {
    HH_MM_A: "d MMM yy - h:mm a",
  }
  tripdetail: any;
  split_pay = false;
  split_pay_json: any;


  @Input() is_address_changed;
  @Output() addNewItem: EventEmitter<any> = new EventEmitter();
  @Output() cardData_emit: EventEmitter<any> = new EventEmitter();
  @Output() is_paypal_supported: EventEmitter<any> = new EventEmitter();
  @Output() corporate_request_accept_event: EventEmitter<any> = new EventEmitter();
  @ViewChild('addCardModal', { static: true }) addCardModal: AddcardModalComponent;

  constructor(public _swPush: SwPush, public _notifierService: NotifiyService, public _authService: AuthService, private _socket: SocketService, public helper: Helper, private langService: LangService, private _createTripService: CreateTripService, private _commonService: CommonService, private _paymentService: PaymentService, private _documentService: DocumentService, private cdr: ChangeDetectorRef) {
    this.languages = this.langService.supportedLanguages;
    this.isSingleLang = this.langService.isSingleLang;
  }

  ngOnInit(): void {
    if (this.helper.user_details) {
      this.helper.islogin = false;
      this.adminDeclineSocket(this.helper.user_details._id)
      this.fetchUserSettingDetail(this.helper.user_details._id);
      this.fetchDocument();
      this.socket(this.helper.user_details._id)
      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
        });
      }
      if ('Notification' in window && Notification.permission === 'granted') {
        navigator.serviceWorker.ready
          .then((registration) => {
            return registration.pushManager.getSubscription();
          })
          .then(async (subscription) => {
            if (subscription) {
              return;
            } else {
              let webpush_config = await this.requestSubscription()
              this._commonService.update_webpush_config({ user_id: this.helper.user_details._id, webpush_config: webpush_config })
            }
          })
          .catch(function (error) {
            console.error('Error retrieving subscription:', error);
          });
      }
    }

    if (this.helper.user_details == null) {
      this.helper._route.navigate(['/app/create-trip'])
    }
  }

  requestSubscription() {
    return new Promise((resolve, reject) => {
      if (!this._swPush.isEnabled) {
        return ({})
      }
      this._commonService.get_setting_detail({}).then((user_setting_detail) => {
        this._swPush.requestSubscription({
          serverPublicKey: user_setting_detail.setting_detail.webpush_public_key
        }).then((_) => {
          resolve(JSON.parse(JSON.stringify(_)))
        }).catch((_) => resolve({}));
      })
    })
  }

  adminDeclineSocket(id: any) {
    let listner = id
    this._socket.listener(listner).subscribe((res: any) => {
      if (res.is_admin_decline) {
        let json: any = { token: this.helper.user_details.server_token, user_id: this.helper.user_details._id, is_admin_decline: true };
        this._authService.user_logout(json).then(() => { })
      }
    })
  }

  signOut() {
    let json: any = { token: this.helper.user_details.server_token, user_id: this.helper.user_details._id };
    this._authService.user_logout(json);
  }

  onAddNewItem(): void {
    this.addNewItem.emit(null);
  }

  onLanguageChange(lang): void {
    this.langService.language = lang.code;
    window.location.reload();
  }

  async fetchCardList() {
    let json: any = { server_token: this.helper.user_details.server_token, user_id: this.helper.user_details._id, type: 10 };
    this.cardData = await this._paymentService.get_card_list(json);
    this.cdr.detectChanges();
    if (this.cardData && this.cardData.payment_gateway_type == PAYMENT_GATEWAY.paypal && this.user) {
      this._paymentService.paypal_supported_currency({}).then(res => {
        res.response_data.forEach(currency => {
          if (currency == this.user.wallet_currency_code) {
            this.paypal_supported = true;
          }
        })
        this.is_paypal_supported.emit(this.paypal_supported);
      })
    }
  }

  getCardList() {
    this.cardData_emit.emit();
    this.fetchCardList();
  }

  async payAgain(first_time_failed = true) {
    if (first_time_failed) {
      let payment_json: any = { use_id: this.helper.user_details._id, token: this.helper.user_details.server_token }
      let response: any = await this._paymentService.change_payment_gateway_type(payment_json);
      if (response.success) {
        this.cardData.payment_gateway_type = response.response_data.payment_gateway_type;
      }
    }

    if (this.cardData.payment_gateway_type == PAYMENT_GATEWAY.payu) {
      let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, trip_id: this.split_payment_request._id, payment_gateway_type: this.cardData.payment_gateway_type, type: 10 }
      if (first_time_failed) {
        json['is_for_retry'] = true;
      }
      this._paymentService.get_payment_intent_wallet(json).then((response) => {
        if (response.payment_gateway_type == PAYMENT_GATEWAY.paypal) {
          this.payAgain(true);
        }
        let template = document.getElementById('Payu');
        template.innerHTML = response.data.html_form;
        document.body.appendChild(template);
        (<HTMLFormElement>document.getElementById("myForm")).submit();
      })

    } else if (this.cardData.payment_gateway_type == PAYMENT_GATEWAY.paytabs) {
      let host = `${window.location}`
      let json: any = { is_trip: true, is_split_payment: true, user_id: this.helper.user_details._id, amount: this.split_pay_json.total, token: this.helper.user_details.server_token, trip_id: this.split_payment_request.trip_id, payment_gateway_type: this.cardData.payment_gateway_type, type: 10, is_new: host }
      if (first_time_failed) {
        json['is_for_retry'] = true;
      }
      this._paymentService.get_stripe_payment_intent_wallet(json).then((response: any) => {
        if (response.success) {
          window.open(response.authorization_url, '_self');
          if (response.payment_gateway_type == PAYMENT_GATEWAY.paypal) {
            this.payAgain(true);
          }
        } else {
          this._notifierService.showNotification('error', response.message)
        }
      })
    } else if (this.cardData.payment_gateway_type == PAYMENT_GATEWAY.razorpay) {
      let host = `${window.location}`
      let json: any = { is_trip: true, is_split_payment: true, user_id: this.helper.user_details._id, amount: this.split_pay_json.total.toFixed(2), token: this.helper.user_details.server_token, trip_id: this.split_payment_request._id, payment_gateway_type: this.cardData.payment_gateway_type, type: 10, is_new: host }
      if (first_time_failed) {
        json['is_for_retry'] = true;
      }
      this._paymentService.get_stripe_payment_intent_wallet(json).then((response: any) => {
        if (response.success) {
          if (response.payment_gateway_type == PAYMENT_GATEWAY.paypal) {
            this.payAgain(true);
          }
          new Razorpay(response.options).open();
        }
      })
    }
    else {
      const idx = this.cardData.card.findIndex(_c => _c.is_default);
      let card_id = this.cardData.card[idx]?._id;
      if (this.cardData.payment_gateway_type == PAYMENT_GATEWAY.stripe) {
        let json: any = { card_id: card_id, trip_id: this.split_payment_request.trip_id, user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, amount: this.split_payment_request.total, payment_gateway_type: this.cardData.payment_gateway_type, type: 10 }
        if (first_time_failed) {
          json['is_for_retry'] = true;
        }
        this._paymentService.get_stripe_payment_intent_wallet(json).then((response: any) => {
          if (response.success) {
            if (response.payment_gateway_type == PAYMENT_GATEWAY.paypal) {
              this.payAgain(true);
            }
            if (response.message == 109) {
              this.split_pay = false
              return;
            } else {
              stripe.confirmCardPayment(response.client_secret, { payment_method: response.payment_method }).then((result: any) => {
                if (result.paymentIntent) {
                  let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, payment_gateway_type: this.cardData.payment_gateway_type, payment_intent_id: result.paymentIntent.id, trip_id: this.split_payment_request._id, type: 10 }
                  if (result.paymentIntent) {
                    this._paymentService.pay_stripe_intent_payment(json).then(is_added => {
                      if (is_added) {
                        this.split_pay = false
                      }
                    })
                  }
                } else {
                  this.split_pay = true;
                  this._notifierService.showNotification('error', result.error.message);
                }
              });
            }
          } else if (response.error) {
            this._notifierService.showNotification('error', response.error);

          }
        }).catch(error => {
          this._notifierService.showNotification('error', error);
        })
      }
      else if (this.cardData.payment_gateway_type == PAYMENT_GATEWAY.paystack) {
        let json: any = { card_id: card_id, trip_id: this.split_payment_request.trip_id, user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, payment_gateway_type: this.cardData.payment_gateway_type }
        if (first_time_failed) {
          json['is_for_retry'] = true;
        }
        this._paymentService.get_payment_intent_wallet(json).then((response) => {
          if (response.payment_gateway_type == PAYMENT_GATEWAY.paypal) {
            this.payAgain(true);
          }
          if (response.success) {
            this.split_pay = false;
          }
          if (!response.success && response.data) {
            this.split_pay = true
          }
        })
      }
    }
  }

  fetchUserSettingDetail(id) {
    let json: any = { token: this.helper.user_details.server_token, user_id: id }
    this._commonService.get_setting_detail(json).then((user_setting_detail) => {
      this.helper.created_at.next(user_setting_detail.user_detail.created_at);
      this.helper.decimal.next(user_setting_detail.setting_detail.decimal_point_value);
      this.user_setting_details = user_setting_detail.setting_detail;
      this.user = user_setting_detail.user_detail;
      this.fetchCardList();
      if (user_setting_detail.split_payment_request) {
        this.split_payment_request = user_setting_detail.split_payment_request;
        this.confirm = 0
        this.splitPaymentRequest = true
        if (this.split_payment_request.status == SPLIT_PAYMENT.ACCEPTED) {
          this.confirm = 1
        }
        if (this.split_payment_request.is_trip_end == 1 && this.split_payment_request.payment_mode == 0 && this.split_payment_request.payment_status != 1) {
          this.split_pay = true
          this.split_pay_json = this.split_payment_request
        }
        if (this.split_payment_request.is_trip_end == 1) {
          this.splitPaymentRequest = false;
        }
      } else {
        this.confirm = 0
        this.splitPaymentRequest = false
      }
      if (user_setting_detail.user_detail.corporate_detail && user_setting_detail.user_detail.corporate_detail.status == 0) {
        this.corporate_details = user_setting_detail.user_detail.corporate_detail;
        this.corporateRequestModal = true;
      } else {
        this.corporateRequestModal = false;
      }
      if (user_setting_detail.user_detail.is_documents_expired) {
        this._notifierService.showNotification('error', this.helper.trans.instant('validation-title.add-expired-documents'));
      }
    })
  }

  socket(id: any) {
    let listner = id
    this._socket.listener(listner).subscribe((res: any) => {
      this.fetchUserSettingDetail(res.type_id)
      this.split_card_pay(res.type_id)
    })
  }

  split_card_pay(id) {
    let json: any = { token: this.helper.user_details.server_token, user_id: id }
    this._commonService.get_setting_detail(json).then((user_setting_detail) => {
      if (user_setting_detail.split_payment_request) {
        this.split_payment_request = user_setting_detail.split_payment_request;
        if (this.split_payment_request.is_trip_end == 1 && this.split_payment_request.payment_mode == 0 && this.split_payment_request.payment_status != 1) {
          if (this.cardData.payment_gateway_type == PAYMENT_GATEWAY.paypal) {
            this.paypalAdd();
          }
          this.split_pay = true
          this.split_pay_json = this.split_payment_request
        } else {
          this.split_pay = false
        }
      }
    })
  }

  splitPaymentRequestStatus(is_request_accepted: boolean) {
    this.status = is_request_accepted ? SPLIT_PAYMENT.ACCEPTED : SPLIT_PAYMENT.REJECTED;

    let json: any = { token: this.helper.user_details.server_token, user_id: this.helper.user_details._id, trip_id: this.split_payment_request.trip_id, status: this.status };
    this._createTripService.accept_or_reject_split_payment_request(json).then(response => {
      if (response.success) {
        this.confirm = is_request_accepted ? 1 : 0;
        if (!is_request_accepted) {
          this.splitPaymentRequest = false;
        }
      }
    })
  }

  selectMethod(method) {
    if (method == 'cash') {
      this.payment_mode = 1;
    }
    if (method == 'card') {
      this.payment_mode = 0;
    }
  }

  updateSplitPaymentMode() {
    let json: any = { token: this.helper.user_details.server_token, user_id: this.helper.user_details._id, trip_id: this.split_payment_request.trip_id, payment_mode: this.payment_mode }
    this._createTripService.update_split_payment_payment_mode(json).then(response => {
      if (response.success) {
        this.splitPaymentRequest = false;
        this.confirm = 0;
      } else {
        this._commonService.get_setting_detail(json).then((user_setting_detail) => {
          if (!user_setting_detail.split_payment_request) {
            window.location.reload();
          }
        })
      }
    })
  }

  async close_go_to_payment() {
    this.go_to_payment = false
    this.selectMethod('card')
    const cardRadio = document.querySelector<HTMLInputElement>(".select-card-radio");
    if (cardRadio) {
      cardRadio.checked = true;
    }

    if(this.cardData.card.length > 0) {
      const index = this.cardData.card.findIndex((card) => card.is_default == 1)
      
      if (index != -1) {
        const defaultRadio = document.querySelector<HTMLInputElement>(`#card-${index}`)
        if (defaultRadio) {
          defaultRadio.checked = true;
        }
      }
    }
  }

  openaddCardModal(): void {
    if (this.cardData.payment_gateway_type == PAYMENT_GATEWAY.paytabs) {
      let host = `${window.location}`
      let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, payment_gateway_type: this.cardData.payment_gateway_type, type: 10, is_new: host }
      this._paymentService._get_stripe_add_card_intent(json).then((response: any) => {
        if (response) {
          window.open(response.authorization_url, '_self');
        } else {
          // this._notifierService.showNotification('error', response.message)
        }
      })
      return
    }
    this.addCardModal.show();
  }

  selectDefault(card) {
    let card_id = card._id;
    let payment_gateway_type = card.payment_gateway_type;
    let json: any = { card_id: card_id, payment_gateway_type: payment_gateway_type, user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, type: 10 }
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

  corporateRquestStatus(bool) {
    let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, is_accepted: bool, corporate_id: this.corporate_details._id }
    this._commonService.user_accept_reject_corporate_request(json).then((response) => {
      if (response.success) {
        this.corporateRequestModal = false;
        this.corporate_request_accept_event.emit();
      }
    })
  }

  paypalAdd() {
    const currency_code = this.helper.user_details.wallet_currency_code;
    this.payPalConfig = {
      currency: `${currency_code}`,
      clientId: this.user_setting_details.paypal_client_id,
      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: `${currency_code}`,
            value: `${this.split_payment_request.total}`,
            breakdown: {
              item_total: {
                currency_code: `${currency_code}`,
                value: `${this.split_payment_request.total}`
              }
            }
          },
          items: [{
            name: 'Enterprise Subscription',
            quantity: '1',
            category: 'DIGITAL_GOODS',
            unit_amount: {
              currency_code: `${currency_code}`,
              value: `${this.split_payment_request.total}`,
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
          let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, payment_gateway_type: this.cardData.payment_gateway_type, payment_intent_id: data, trip_id: this.split_payment_request._id, type: 10, card_id: data.payer.payer_id, last_four: "Paypal", is_web: true }
          this._paymentService.pay_stripe_intent_payment(json).then(is_added => {
            if (is_added) {
              this.split_pay = false;
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

  fetchDocument() {
    let json: any = { server_token: this.helper.user_details.server_token, user_id: this.helper.user_details._id }
    this._documentService.fetch_document(json).then((user_document) => {
      let check_mandatory = user_document?.userdocument?.filter(value => {
        return value.is_uploaded == 0 && value.option == 1
      })
      if (check_mandatory?.length > 0) {
        this._notifierService.showNotification('error', this.helper.trans.instant('validation-title.add-mandatory-documents'));
      }
    })
  }

  loadNotifications(): void {
    if(this.helper.user_details){
      const user_id = this.helper.user_details._id
      this._commonService.get_mass_notification_history({user_type: 1, user_id: user_id, device_type: 'web'}).then((response) => {
        if (response.success) {
          this.notifications = response.notifications;
        } else {
          this.notifications = [];
        }
      })
    }
  }

}
