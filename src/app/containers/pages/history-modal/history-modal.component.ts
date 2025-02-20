import { Component, OnInit, OnDestroy, TemplateRef, ViewChild, HostListener } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Helper } from 'src/app/shared/helper';
import { HistoryService } from 'src/app/services/history.service';
import { environment } from 'src/environments/environment';
import { DEFAULT_IMAGE, PAYMENT_GATEWAY, TRIP_TYPE } from 'src/app/constants/constants';
import { HistoryModelData } from 'src/app/models/history-model.model'
import { CommonService } from 'src/app/services/common.service';
import { PaymentService } from 'src/app/services/payment.service';
import { PaymentGateway } from 'src/app/models/payment_gateway.model';
import { Card } from 'src/app/models/card.model';
import { NotifiyService } from 'src/app/services/notifier.service';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import * as html2pdf from 'html2pdf.js';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

declare let google;
declare let stripe: any;
declare let Razorpay: any;

export class CardData {
  is_use_wallet: number = 0;
  payment_gateway_type: number;
  wallet: number = 0;
  wallet_currency_code: string = null;
  payment_gateway: Array<PaymentGateway> = [];
  card: Array<Card> = [];
}

@Component({
  selector: 'app-history-modal',
  templateUrl: './history-modal.component.html',
  styleUrls: ['./history-modal.component.scss']
})
export class HistoryModalComponent implements OnInit, OnDestroy {
  modalRef: BsModalRef;
  userrate: BsModalRef;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-right'
  };
  userRate_config = {
    backdrop: false,
    ignoreBackdropClick: true,
    class: 'modal-md modal-dialog-centered',
    keyboard: false
  };
  tripdetail: any;
  tripservice: HistoryModelData = new HistoryModelData();
  provider: HistoryModelData = new HistoryModelData();
  TRIP_TYPE = TRIP_TYPE;
  tripAddress: any[] = [];
  trip_id: any;
  res_data: any;
  totaltax: any;
  total: any;
  map: any;
  pickup_marker: any;
  dest_marker: any;
  sourceLocation: any;
  source: any;
  sourcelat: number;
  sourcelet: any;
  sourcelng: any;
  destlat: number;
  destlng: number;
  destination_marker: any;
  destinationlat: any;
  destinationlng: any;
  IMAGE_URL = environment.IMAGE_URL;
  DEFAULT_IMAGE = DEFAULT_IMAGE.USER_PROFILE;
  profile_image: any = this.DEFAULT_IMAGE;
  imagefile: any;
  trip1: any;
  tripa: any;
  tripAddress1: any;
  ratingData: any;
  rating_rate: string;
  rating_comment: any;
  rate: any;
  tab: any;
  is_provider: boolean = false;
  rating_rate_value: string;
  is_tip: boolean;
  tip_amount: number;
  cardData: CardData = new CardData();
  stripe_amount_error: string = '';
  totalcharge: number;
  is_show_total: boolean = true;
  case_number: number = 0;
  totalOtherCharge: number;
  totalTax: number;
  userpayment: number;
  total_split_payment: number;
  split_payment_users: any;
  user_setting_details: any;
  PAYMENT_GATEWAY = PAYMENT_GATEWAY;
  public payPalConfig?: IPayPalConfig;
  show_paypal: boolean = false;
  buttonState = '';
  buttonDisabled = false;
  trip_location: any = [];
  trippath: any;
  payuForm:any
  pinForm: UntypedFormGroup;

  @ViewChild('template', { static: true }) template: TemplateRef<any>;
  paystackPinmodal: boolean = false;
  paystack_status: any;
  pin_data: any;
  cardPaymentFailModal: boolean;
  first_time_failed: boolean;

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.code === 'Escape') {
      this.modalRef?.onHidden.subscribe(() => {
        this.closemodal();
      })
    }
  }

  loadStripe(stripe_publishable_key: string): Promise<boolean> {
    return new Promise((resolve, rejects) => {
      let script = document.createElement('script');
      script.id = 'stripeload';
      script.type = 'text/javascript';
      script.innerHTML = "var stripe = Stripe('" + stripe_publishable_key + "'); var elements = stripe.elements();";
      document.getElementsByTagName('head')[0].appendChild(script);
      resolve(true);
    })
  }

  constructor(private modalService: BsModalService, private _usertripedetail: HistoryService, public helper: Helper, private usergiverating: HistoryService, private _commonService: CommonService, private _paymentService: PaymentService, private _notifierService: NotifiyService) { }

  ngOnInit(): void {
    this.is_provider = false;
    this.profile_image = "";
    this.provider = null;
    this.fetchUserSettingDetail();

    this.pinForm = new UntypedFormGroup({
      pin: new UntypedFormControl(null, [Validators.required]),
      otp: new UntypedFormControl(null, [Validators.required]),
      phone_number: new UntypedFormControl(null, [Validators.required])
    })
  }

  show(trip_id: any, tab: any, history_type): void {
    this.modalRef = this.modalService.show(this.template, this.config);
    this.trip_id = trip_id;
    this.getTripDetails(history_type);
    this.tab = tab;

    this.fetchCardList();
  }

  rate_us(modal: TemplateRef<any>): void {
    this.modalRef.hide();
    this.userrate = this.modalService.show(modal, this.userRate_config);
  }

  onSelectImageFile(event) {
    let files = event.target.files;
    if (files.length === 0)
      return;
    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      alert("Only images are supported.")
      return;
    }
    this.imagefile = files[0]
    const reader = new FileReader();
    reader.readAsDataURL(this.imagefile);
    reader.onload = (_event) => {
      this.profile_image = reader.result;
    }
  }

  getTripDetails(history_type) {
    let is_open_ride;
    if (history_type == this.helper.HISTORY_TYPE.OPEN_RIDE) {
      is_open_ride = true;
    } else {
      is_open_ride = false;
    }
    let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, trip_id: this.trip_id, is_open_ride: is_open_ride }
    json.is_show_success_toast = false;
    this._usertripedetail.get_usertripdetail(json).then((res_data: any) => {
      this.tripdetail = res_data.trip;
      if (res_data.startTripToEndTripLocations) {
        res_data.startTripToEndTripLocations?.forEach((location) => {
          this.trip_location.push({ lat: location[0], lng: location[1] })
        });
      }
      if (this.tripdetail.openride) {
        this.tripdetail.user_details = this.tripdetail.user_details?.filter((user) => user.user_id == this.helper.user_details._id);
        this.tripdetail.trip_status = this.tripdetail.trip_status?.filter((status) => {
          if (status.user_type === 1 && status.user_id !== this.helper.user_details._id) {
            return false
          } else if (status.openride_user_id && status.user_type === 2 && status.openride_user_id !== this.helper.user_details._id) {
            return false
          } else {
            return true
          }
        })
      }

      const tripStatus = res_data.trip.trip_status;
      tripStatus?.sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
      this.tripdetail.trip_status = tripStatus;

      this.totalcharge = 0;
      this.tripdetail = res_data.trip;
      if (this.tripdetail.trip_type == this.TRIP_TYPE.TRIP_TYPE_AIRPORT) {
        this.is_show_total = false;
        this.case_number = 1;
      } else if (this.tripdetail.trip_type == this.TRIP_TYPE.TRIP_TYPE_ZONE) {
        this.is_show_total = false;
        this.case_number = 2;
      } else if (this.tripdetail.trip_type == this.TRIP_TYPE.TRIP_TYPE_CITY) {
        this.is_show_total = false;
        this.case_number = 3;
      } else if (this.tripdetail.is_fixed_fare == 1) {
        this.is_show_total = false;
        this.case_number = 4;
      } else if (this.tripdetail.is_min_fare_used == 1) {
        this.is_show_total = true;
        this.case_number = 5;
      } else {
        this.is_show_total = true;
        this.case_number = 0;
      }

      this.totalOtherCharge = this.tripdetail.tip_amount + this.tripdetail.toll_amount;
      this.totalTax = this.tripdetail.user_tax_fee + this.tripdetail.tax_fee + this.tripdetail.user_miscellaneous_fee;
      if (this.tripdetail.openride) {
        this.userpayment = this.tripdetail.user_details[0].wallet_payment + this.tripdetail.user_details[0].cash_payment + this.tripdetail.user_details[0].card_payment + this.tripdetail.user_details[0].remaining_payment;
      } else {
        this.userpayment = this.tripdetail.wallet_payment + this.tripdetail.cash_payment + this.tripdetail.card_payment + this.tripdetail.remaining_payment;
      }
      this.split_payment_users = res_data.trip.split_payment_users;
      let total = 0;
      this.split_payment_users?.forEach((data) => {
        total += data.total;
      })
      this.total_split_payment = total;

      if (this.is_show_total === true && this.case_number == 0) {
        if (this.tripdetail.base_distance_cost > 0) {
          this.totalcharge += Number(this.tripdetail.base_distance_cost);
        }
        if (this.tripdetail.time_cost > 0) {
          this.totalcharge += Number(this.tripdetail.time_cost);
        }
        if (this.tripdetail.distance_cost > 0) {
          this.totalcharge += Number(this.tripdetail.distance_cost);
        }
        if (this.tripdetail.waiting_time_cost > 0) {
          this.totalcharge += Number(this.tripdetail.waiting_time_cost);
        }
        if (this.tripdetail.stop_waiting_time_cost > 0) {
          this.totalcharge += Number(this.tripdetail.stop_waiting_time_cost);
        }
        if (this.tripdetail.surge_fee > 0) {
          this.totalcharge += Number(this.tripdetail.surge_fee);
        }
      }
      if (this.is_show_total === false || this.case_number != 0) {
        this.totalcharge = this.tripdetail.total_after_surge_fees;
      }

      if (res_data.trip.confirmed_provider !== null && !this.is_provider) {
        let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, trip_id: this.trip_id, provider_id: res_data.trip.confirmed_provider }
        this._usertripedetail.get_provider_info(json).then(res_data_p => {
          this.provider = res_data_p.provider;
          this.is_provider = true;
          if (this.provider) {
            this.profile_image = this.IMAGE_URL + this.provider.picture;
          }
        })
      }

      this.rate = res_data.trip.is_provider_rated;

      this.tripservice = res_data.tripservice;
      this.sourcelat = res_data.trip.sourceLocation[0];
      this.sourcelng = res_data.trip.sourceLocation[1];
      this.destlat = res_data.trip.destinationLocation[0];
      this.destlng = res_data.trip.destinationLocation[1];
      this.tripAddress = res_data.trip.destination_addresses;
      this.helper.loadGoogleScript("https://maps.googleapis.com/maps/api/js?key=" + this.helper.GOOGLE_KEY + "&libraries=places,drawing").then(() => {
        this.setMap();
      })
    })
  }

  setMap() {
    let lat = Number(this.sourcelat);
    let lng = Number(this.sourcelng);
    let theme = localStorage.getItem('vien-themecolor');
    if (theme.includes('dark')) {
      this.map = new google.maps.Map(document.getElementById('history_map') as HTMLInputElement, {
        zoom: 2,
        center: { lat, lng },
        draggable: true,
        zoomControl: true,
        scrollwheel: true,
        disableDoubleClickZoom: false,
        fullscreenControl: true,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
          },
          {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
          },
        ],
      });
    } else {
      this.map = new google.maps.Map(document.getElementById('history_map') as HTMLInputElement, {
        zoom: 2,
        center: { lat, lng },
        draggable: true,
        zoomControl: true,
        scrollwheel: true,
        disableDoubleClickZoom: false,
        fullscreenControl: true
      });
    }

    const icons: Record<string, any> = {
      pickup_location: {
        name: this.helper.trans.instant('label-title.pickup'),
        icon: DEFAULT_IMAGE.PICKUP_ICON,
      },
      destination_location: {
        name: this.helper.trans.instant('label-title.destination'),
        icon: DEFAULT_IMAGE.DESTINATION_ICON,
      },
      stop_location: {
        name: this.helper.trans.instant('label-title.stops'),
        icon: DEFAULT_IMAGE.STOP_ICON,
      },
    };

    const legend = document.getElementById("legend");

    for (const key in icons) {
      const type = icons[key];
      const name = type.name;
      const icon = type.icon;
      const div = document.createElement("div");

      div.innerHTML = '<img src="' + icon + '"> ' + name;
      div.classList.add("legend-item"); // Add a class for styling
      legend?.appendChild(div);
    }

    this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);

    if (this.pickup_marker) {
      this.pickup_marker.setMap(null);
      this.pickup_marker = null;
    }
    let bounds = new google.maps.LatLngBounds();
    if (lat && lng) {
      this.pickup_marker = new google.maps.Marker({
        position: { lat, lng },
        map: this.map,
        draggable: false,
        icon: DEFAULT_IMAGE.PICKUP_ICON,
      });
      bounds.extend(this.pickup_marker.position);
    }

    if (this.tripAddress) {
      let stop_markers = 1;
      this.tripAddress.forEach((address, index) => {
        let location = new google.maps.LatLng(address.location[0], address.location[1]);
        let marker = new google.maps.Marker({
          position: location,
          map: this.map,
          label: {
            text: (stop_markers).toString(),
            fontSize: "16px",
            fontWeight: "bold",
            className: 'marker-position',
          },
          icon: DEFAULT_IMAGE.STOP_ICON
        });
        bounds.extend(marker.position);
        stop_markers++;
      });
    }

    if (this.dest_marker) {
      this.dest_marker.setMap(null);
      this.dest_marker = null;
    }

    let destla = Number(this.destlat);
    let destln = Number(this.destlng);
    let myLatlng = new google.maps.LatLng(this.destlat, this.destlng);
    if (destla && destln) {
      this.dest_marker = new google.maps.Marker({
        position: myLatlng,
        map: this.map,
        draggable: false,
        icon: DEFAULT_IMAGE.DESTINATION_ICON,

      });
      bounds.extend(this.dest_marker.position);
    }

    this.trippath = new google.maps.Polyline({
      path: this.trip_location,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    this.trippath.setMap(this.map);
    this.map.fitBounds(bounds);
  }

  submitInvoice(modal: TemplateRef<any>): void {
    let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, trip_id: this.trip_id }
    this.usergiverating.user_submit_invoice(json).then(res_data => {
      if (res_data.success) {
        this.modalRef.hide();
        this.userrate = this.modalService.show(modal, this.userRate_config);
      }
    })
  }

  rateUs() {
    this.stripe_amount_error = '';
    if (!this.rating_rate) {
      this.rating_rate_value = '';
      return;
    }

    if (this.is_tip === true && this.tripdetail.payment_mode == 0 && this.tip_amount && this.tip_amount != 0) {
      if (this.tripdetail.payment_gateway_type == PAYMENT_GATEWAY.stripe) {
        let json: any = {
          trip_id: this.trip_id,
          user_id: this.helper.user_details._id,
          token: this.helper.user_details.server_token,
          amount: this.tip_amount,
          type: 10,
          is_payment_for_tip: true,
        };
        this._paymentService.get_stripe_payment_intent_wallet(json).then((response: any) => {
          if (!response.client_secret || !response.payment_method || response.payment_method === null) {
            let stripe_amount_error = this.helper.trans.instant(response.error);
            this.stripe_amount_error = stripe_amount_error;
            return;
          }
          this.stripe_amount_error = '';
          if (response.success) {
            stripe.confirmCardPayment(response.client_secret, { payment_method: response.payment_method }).then((result) => {
              if (result.paymentIntent) {
                let json1: any = {
                  trip_id: this.trip_id,
                  user_id: this.helper.user_details._id,
                  token: this.helper.user_details.server_token,
                };
                this._commonService.pay_tip_payment(json1).then(res => {
                  if (res.success) {
                    let json: any = {
                      user_id: this.helper.user_details._id,
                      token: this.helper.user_details.server_token,
                      trip_id: this.trip_id,
                      rating: this.rating_rate,
                      review: this.rating_comment,
                    };
                    this.usergiverating.rate_Us(json).then(res_data => {
                      if (res_data) {
                        this.ratingData = res_data;
                        this.rating_comment = "";
                        this.userrate.hide();
                        window.location.reload();
                      }
                    })
                  }
                })
              } else {
                this._notifierService.showNotification('error', result.error.message);
              }
            });
          }
        })
      } else if (this.tripdetail.payment_gateway_type == PAYMENT_GATEWAY.paytabs) {
        let host = `${window.location}`
        let json: any = { is_trip: false, trip_id: this.trip_id, user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, amount: +this.tip_amount, type: 10, is_payment_for_tip: true, is_new: host, is_tip: true }
        this._paymentService.get_stripe_payment_intent_wallet(json).then((response: any) => {
          if (response.success) {
            let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, trip_id: this.trip_id, rating: this.rating_rate, review: this.rating_comment, is_tip: true }
            this.usergiverating.rate_Us(json).then(res_data => {
              if (res_data) {
                this.ratingData = res_data;
                this.rating_comment = "";
                window.open(response.authorization_url, '_self');
              }
            })
          } else {
            this._notifierService.showNotification('error', response.message)
          }
        })
      } else if (this.tripdetail.payment_gateway_type == PAYMENT_GATEWAY.razorpay) {
        let host = `${window.location}`
        let json: any = { is_trip: false, trip_id: this.trip_id, user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, amount: +this.tip_amount.toFixed(2), type: 10, is_payment_for_tip: true, is_new: host, is_tip: true }
        this._paymentService.get_stripe_payment_intent_wallet(json).then((response: any) => {
          if (response.success) {
            new Razorpay(response.options).open();
          }
        })
      } else if (this.tripdetail?.payment_gateway_type == PAYMENT_GATEWAY.payu) {
        let host = `${window.location}`;
        let json = { 
          is_trip: false, 
          trip_id: this.trip_id, 
          user_id: this.helper.user_details._id, 
          token: this.helper.user_details.server_token, 
          amount: +this.tip_amount, 
          type: 10, 
          is_payment_for_tip: true, 
          is_new: host, 
          is_tip: true, 
          payment_gateway_type: this.tripdetail?.payment_gateway_type 
        }
        this._paymentService.get_stripe_payment_intent_wallet(json).then((response: any) => {
          if (response.success) {
            let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, trip_id: this.trip_id, rating: this.rating_rate, review: this.rating_comment, is_tip: true }
            this.usergiverating.rate_Us(json).then(res_data => {
              if (res_data) {
                this.ratingData = res_data;
                this.rating_comment = "";
                let template = document.getElementById('Payu');
                template.innerHTML = response.html_form;
                document.body.appendChild(template);
                (<HTMLFormElement>document.getElementById("myForm")).submit();
              }
            })
          } else {
            this._notifierService.showNotification('error', response.message)
          }
        })
      } else if(this.tripdetail.payment_gateway_type == PAYMENT_GATEWAY.paystack){
        let host = `${window.location}`;
        let json = { 
          is_trip: false, 
          trip_id: this.trip_id, 
          user_id: this.helper.user_details._id, 
          token: this.helper.user_details.server_token, 
          amount: +this.tip_amount, 
          type: 10, 
          is_payment_for_tip: true, 
          is_new: host, 
          is_tip: true, 
          payment_gateway_type: this.tripdetail?.payment_gateway_type 
        }
        if (this.first_time_failed) {
          json['is_for_retry'] = true;
        }
        this._paymentService.get_payment_intent_wallet(json).then((response:any) => {
          console.log(response)
          this.first_time_failed = true;
          if (response?.success) {
            this.cardPaymentFailModal = false;
            let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, trip_id: this.trip_id, rating: this.rating_rate, review: this.rating_comment }
            this.usergiverating.rate_Us(json).then(res_data => {
              if (res_data) {
                this.ratingData = res_data;
                this.rating_comment = "";
                this.userrate.hide()
                window.location.reload();
              }
            })
          }
          if (!response?.success && response?.data) {
            this.paystack_status = response.data.required_param;
            if (response.data.required_param) {
              setTimeout(() => {
                this.paystackPinmodal = true;
              }, 1000);
            }
            this.pin_data = response.data;
          }
        })
      }
    }

    if (this.rating_rate) {
      this.rating_rate_value = this.rating_rate;
    }
    if (!this.tip_amount || this.tip_amount == 0) {
      let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, trip_id: this.trip_id, rating: this.rating_rate, review: this.rating_comment }
      this.usergiverating.rate_Us(json).then(res_data => {
        if (res_data) {
          this.ratingData = res_data;
          this.rating_comment = "";
          this.userrate.hide()
          window.location.reload();
        }
      })
    }
  }

  sendpin() {
    const idx = this.cardData.card.findIndex(_c => _c.is_default);
    console.log(idx);
    let json = { otp: this.pinForm.value.otp, trip_id: this.tripdetail._id, reference: this.pin_data.reference, user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, payment_gateway_type: this.cardData.payment_gateway_type, required_param: this.pin_data.required_param, pin: this.pinForm.value.pin, phone: this.pinForm.value.phone_number, type: 10 }
    this._paymentService.send_paystack_required_detail(json).then(response => {
      if (response.success) {
        this.paystackPinmodal = false;
        this.cardPaymentFailModal = false;       

        let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, trip_id: this.trip_id, rating: this.rating_rate, review: this.rating_comment }
        this.usergiverating.rate_Us(json).then(res_data => {
          if (res_data) {
            this.ratingData = res_data;
            this.rating_comment = "";
            this.userrate.hide()
            window.location.reload();
          }
        })

      }
      if (!response.success && response.data.required_param) {
        this.paystack_status = response.data.required_param;
        setTimeout(() => {
          this.paystackPinmodal = true;
        }, 1000);
        this.pin_data = response.data;
      }
    })
    this.paystackPinmodal = false;
    this.pinForm.reset();
    this.pin_data = ''
  }

  async fetchCardList() {
    let json: any = { server_token: this.helper.user_details.server_token, user_id: this.helper.user_details._id, type: 10 };
    this.cardData = await this._paymentService.get_card_list(json);
  }

  fetchUserSettingDetail() {
    let json = {}
    this._commonService.get_setting_detail(json).then((user_setting_detail) => {
      this.user_setting_details = user_setting_detail.setting_detail;
      this.is_tip = user_setting_detail.setting_detail.is_tip;
      this.loadStripe(user_setting_detail.setting_detail.stripe_publishable_key)
    })
  }

  getTipAmount(amount) {
    this.tip_amount = amount;
    if (this.is_tip === true && this.tripdetail.payment_mode == 0 && this.tip_amount && this.tip_amount != 0) {
      if (this.tripdetail.payment_gateway_type == PAYMENT_GATEWAY.paypal) {
        this.paypalAdd();
      }
    }
  }

  changeTipAmount($event) {
    this.stripe_amount_error = '';
  }

  closemodal() {
    this.modalRef.hide();
    this.trip_location = [];
    this.trippath = null;
    setTimeout(() => {
      this.trip_id = "";
      this.is_provider = false;
      this.profile_image = "";
      this.provider = null;
    }, 300);
  }

  ngOnDestroy(): void {
    this.trip_id = "";
    this.is_provider = false;
    this.profile_image = "";
    this.provider = null;
  }

  giveStarts() {
    if (this.is_tip === true && this.tripdetail.payment_mode == 0 && this.tip_amount && this.tip_amount != 0) {
      if (this.tripdetail.payment_gateway_type == PAYMENT_GATEWAY.paypal) {
        this.paypalAdd();
      }
    }
  }

  paypalAdd() {
    this.show_paypal = false;
    if (!this.rating_rate) {
      this.rating_rate_value = '';
      return;
    }
    this.show_paypal = true;
    const currency_code = this.helper.user_details.wallet_currency_code;
    this.payPalConfig = {
      currency: `${currency_code}`,
      clientId: this.user_setting_details.paypal_client_id,
      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: `${currency_code}`,
            value: `${this.tip_amount}`,
            breakdown: {
              item_total: {
                currency_code: `${currency_code}`,
                value: `${this.tip_amount}`
              }
            }
          },
          items: [{
            name: 'Enterprise Subscription',
            quantity: '1',
            category: 'DIGITAL_GOODS',
            unit_amount: {
              currency_code: `${currency_code}`,
              value: `${this.tip_amount}`,
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
          let json1: any = { trip_id: this.trip_id, user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, amount: this.tip_amount, type: 10, is_payment_for_tip: true, payment_intent_id: data, is_web: true, card_id: data.payer.payer_id, last_four: "Paypal" }
          this._commonService.pay_tip_payment(json1).then(res => {
            if (res.success) {
              let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, trip_id: this.trip_id, rating: this.rating_rate, review: this.rating_comment }
              this.usergiverating.rate_Us(json).then(res_data => {
                if (res_data) {
                  this.ratingData = res_data;
                  this.rating_comment = "";
                  this.userrate.hide()
                  window.location.reload();
                }
              })
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

  async downloadPdf() {
    this.buttonDisabled = true;
    this.buttonState = 'show-spinner';

    const element = document.getElementById('htmlContent');
    const clonedElement = element.cloneNode(true) as HTMLElement;

    const targetDiv = clonedElement.querySelector('#clone_of_trip');
    const additionalContentElement = document.createElement('div');
    additionalContentElement.innerHTML = `
    <div class="row d-flex flex-row justify-content-start justify-content-around mb-3">
    <div class="text-center ">
    <p class="text-center mb-1" style="font-size: large;font-weight: bold;">Trip ID : `+ this.tripdetail.unique_id + `</p>
    </div>
    </div>
    `;
    // Append the new HTML content to the cloned element
    targetDiv.appendChild(additionalContentElement);

    const date = Math.floor(new Date().getTime() / 1000);

    const options = {

      filename: date + this.tripdetail.invoice_number + '.pdf',
      margin: [10, 20, 10, 20],

    };

    await html2pdf().set(options).from(clonedElement).toPdf().save().then(() => {
      this.buttonState = '';
      this.buttonDisabled = false;
    }).catch((error) => {
      console.error('Error generating PDF', error);
    });

  }

  closeRateModal() {
    this.userrate.hide();
    window.location.reload();
  }

}
