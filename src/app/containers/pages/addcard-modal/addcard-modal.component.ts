import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { Card } from 'src/app/models/card.model';
import { PaymentGateway } from 'src/app/models/payment_gateway.model';
import { CommonService } from 'src/app/services/common.service';
import { NotifiyService } from 'src/app/services/notifier.service';
import { PaymentService } from 'src/app/services/payment.service';
import { Helper } from 'src/app/shared/helper';

declare let stripe: any;
declare let elements: any;

export class CardData {
  is_use_wallet: boolean = false;
  payment_gateway_type: number;
  wallet: number = 0;
  wallet_currency_code: string = null;
  payment_gateway: Array<PaymentGateway> = [];
  card: Array<Card> = [];
}
@Component({
  selector: 'app-addcard-modal',
  templateUrl: './addcard-modal.component.html',
  styleUrls: ['./addcard-modal.component.scss']
})
export class AddcardModalComponent implements OnInit {
  cardData: CardData = new CardData();
  addCardmodal: boolean = false;
  card_error: string;
  card;
  cardHandler = this.onChange.bind(this);
  isLoading = false;
  is_add_card: boolean;
  stripe_publishable_key: string;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-dialog-centered',
  };

  @Output() cardDataHandler: EventEmitter<any> = new EventEmitter();
  @ViewChild('cardInfo', { static: false }) cardInfo: ElementRef;

  constructor(private cd: ChangeDetectorRef, private _paymentService: PaymentService, public _helper: Helper, private _notifierService: NotifiyService, private _commonService: CommonService) { }

  loadStripe(): Promise<boolean> {
    return new Promise((resolve, rejects) => {
      let script = document.createElement('script');
      script.id = 'stripeload';
      script.type = 'text/javascript';
      script.innerHTML = "var stripe = Stripe('" + this.stripe_publishable_key + "'); var elements = stripe.elements();";
      document.getElementsByTagName('head')[0].appendChild(script);
      resolve(true);
    })
  }

  ngOnInit(): void {
    if (this._helper.user_details) {
      this.fetchCardList();
      this.get_setting_detail();
    }
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.code === 'Escape') {
      this.addCardcloseModal();
    }
  }

  childToParentClick() {
    this.cardDataHandler.emit();
  }

  show(): void {
    this.onClickAddCard()
  }

  onChange({ error }) {
    if (error) {
      this.card_error = error.message;
    } else {
      this.card_error = null;
    }
    this.cd.detectChanges();
  }

  async fetchCardList() {
    let json: any = { server_token: this._helper.user_details.server_token, user_id: this._helper.user_details._id, type: 10 };
    this.cardData = await this._paymentService.get_card_list(json);
    this.is_add_card = this.cardData.payment_gateway[0].is_add_card;
  }

  openaddCardModal() {
    this.loadStripe().then(() => {
      if (elements || elements._elements.length) {
        elements._elements = [];
      }
      this.card = elements.create('card');
    })
    setTimeout(() => {
      this.card.mount(this.cardInfo.nativeElement);
      this.card.addEventListener('change', this.cardHandler);
    }, 0);
    this.addCardmodal = true;
  }

  addCardcloseModal() {
    this.addCardmodal = false;
  }

  onClickAddCard() {
    let host = `${window.location}`
    if (this.cardData.payment_gateway_type == 11) {
      let json: any = { payment_gateway_type: 11, server_token: this._helper.user_details.server_token, user_id: this._helper.user_details._id, type: 10, is_new: host };
      this._paymentService._get_stripe_add_card_intent(json).then(data => {
        if (data.success) {
          window.open(data.authorization_url, "_self")
        }
      })
    } else if (this.cardData.payment_gateway_type == 10) {
      setTimeout(() => {
        this.openaddCardModal();
      }, 500);
    } else {
      return
    }
  }

  async addcard() {
    const { error } = await stripe.createToken(this.card);
    if (error) {
      this._notifierService.showNotification('error', this._helper.trans.instant(error.message));
    } else {
      this.isLoading = true;
      let json: any = { payment_getway_type: this.cardData.payment_gateway_type };
      this._paymentService.get_stripe_add_card_intent(json).then(client_secret => {
        if (client_secret) {
          stripe.handleCardSetup(client_secret, this.card, {
            payment_method_data: {
              billing_details: {}
            }
          }).then((result) => {
            if (result.error) {
              this.card.clear();
              this.card.removeEventListener('change', this.cardHandler);
              this.card_error = result.error.message;
              this._notifierService.showNotification('error', this.card_error);
              this.isLoading = false;
            } else {
              let json: any = {
                payment_method: result.setupIntent.payment_method,
                user_id: this._helper.user_details._id,
                token: this._helper.user_details.server_token,
                type: 10,
              };
              this._paymentService.add_card(json).then(is_card_added => {
                if (is_card_added) {
                  this.card.clear();
                  this.card.removeEventListener('change', this.cardHandler);
                  this.isLoading = false;
                  setTimeout(() => {
                    this.childToParentClick()
                  }, 500);
                  this.fetchCardList();
                  this.addCardcloseModal();
                } else {
                  this.isLoading = false;
                }
              })
            }
          });
        }
      })
    }
  }

  get_setting_detail() {
    let json: any = { token: this._helper.user_details.server_token, user_id: this._helper.user_details._id }
    this._commonService.get_setting_detail(json).then((setting_detail) => {
      this.stripe_publishable_key = setting_detail.setting_detail.stripe_publishable_key;

    })
  }
}
