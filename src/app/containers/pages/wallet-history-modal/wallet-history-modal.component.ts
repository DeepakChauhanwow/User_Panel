import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { WalletHistory } from 'src/app/models/wallet-history.model';
import { ProfileService } from 'src/app/services/profile.service';
import { Helper } from 'src/app/shared/helper';
import { Card } from 'src/app/models/card.model';
import { PaymentGateway } from 'src/app/models/payment_gateway.model';
import { PaymentService } from 'src/app/services/payment.service';

export class CardData {
  card: Array<Card> = [];
  is_use_wallet: boolean = false;
  payment_gateway_type: number;
  wallet: number = 0;
  wallet_currency_code: string = null;
  payment_gateway: Array<PaymentGateway> = [];
}
@Component({ 
  selector: 'app-wallet-history-modal',
  templateUrl: './wallet-history-modal.component.html',
  styleUrls: ['./wallet-history-modal.component.scss']
})
export class WalletHistoryModalComponent {
  modalRef: BsModalRef;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-right'
  };
  cardData: CardData = new CardData();
  walletHistory: Array<WalletHistory> = [];
  type:number;
  redeemPointsHistory: Array<any> = [];

  @ViewChild('template', { static: true }) template: TemplateRef<any>;

  constructor(private _paymentService: PaymentService, private modalService: BsModalService, public _profileService: ProfileService, public _helper: Helper) { }

  show(type): void {
    this.type = type;
    this.fetchWalletHistory();
    this.fetchCardList();
    this.modalRef = this.modalService.show(this.template, this.config);
  }

  async fetchWalletHistory() {
    let json:any = { user_id: this._helper.user_details._id, token: this._helper.user_details.server_token,type: 10 }
    if(this.type == this._helper.OPEN_MODAL_TYPE.WALLET){
      this.walletHistory = await this._profileService.get_wallet_history(json)
    }else{
      this.redeemPointsHistory = await this._profileService.get_redeem_point_history(json);
    }
  }
  
  async fetchCardList() {
    let json:any = { server_token: this._helper.user_details.server_token, user_id: this._helper.user_details._id,type: 10  };
    this.cardData = await this._paymentService.get_card_list(json);
  }
}
