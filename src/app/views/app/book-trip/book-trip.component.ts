import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AuthModalComponent } from 'src/app/containers/pages/auth-modal/auth-modal.component';
import { UntypedFormGroup, UntypedFormControl, UntypedFormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { LocationModel, LocationService } from 'src/app/services/location.service';
import { Helper } from 'src/app/shared/helper'
import { environment } from 'src/environments/environment';
import { VehicleService } from '../../../services/vehicle.service';
import { PaymentGateway } from 'src/app/models/payment_gateway.model';
import { Card } from 'src/app/models/card.model';
import { PaymentService } from 'src/app/services/payment.service';
import { CreateTripService } from 'src/app/services/create-trip.service';
import { AddcardModalComponent } from 'src/app/containers/pages/addcard-modal/addcard-modal.component';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { TRIP_TYPE, DEFAULT_IMAGE, PAYMENT_GATEWAY } from '../../../constants/constants';
import { CommonService } from 'src/app/services/common.service';
import { HistoryService } from 'src/app/services/history.service';
import { HistoryModalComponent } from 'src/app/containers/pages/history-modal/history-modal.component';
import { SocketService } from 'src/app/services/socket.service';
import { NotifiyService } from 'src/app/services/notifier.service';
import { RegisterAddressModelComponent } from 'src/app/containers/pages/register-address-model/register-address-model.component';
import { ChatService } from 'src/app/services/chat.service';
import * as $ from "jquery";
import { DocumentService } from 'src/app/services/document.service';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment-timezone';

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
export class CityDetailData {
  isPromoApplyForCard: number = 0;
  isPromoApplyForCash: number = 0;
  is_payment_mode_card: number = 0;
  is_payment_mode_cash: number = 0;
  _id: any;
  countryid: any;
  timezone: string;
  is_ask_user_for_fixed_fare: boolean;
}

@Component({
  selector: 'app-book-trip',
  templateUrl: './book-trip.component.html',
  styleUrls: ['./book-trip.component.scss']
})
export class BookTripComponent implements OnInit, OnDestroy, AfterViewChecked {
  map: any = null;
  store_marker: any = null;
  destination_marker: any = null;
  provider_markers: any[] = [];
  stop_markers: any[] = [];
  stop_addresses: any[] = [];
  stop_addresses_country: any[] = [];
  total_distance: number = 0;
  total_time: number = 0;
  city_detail: CityDetailData = new CityDetailData();
  IMAGE_URL = environment.IMAGE_URL;
  added_stops: number = 0;
  tabNum: number = 0;
  selected_address_index: number = -1;
  selected_index: number = 0;
  selected_type: number = 1;
  pool_selected_index: number;
  createTripmodal: boolean = false;
  is_changePaymentMode: boolean = false;
  modalRef: BsModalRef;
  modalRef1: BsModalRef;
  modalRef3: BsModalRef;
  splitModal: BsModalRef;
  ScheduleDatePickerModal: BsModalRef;
  confirmModelRef: BsModalRef;
  biddngModalRef: BsModalRef;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-md modal-dialog-centered modal-open-ride'
  };
  cancelModelConfig = {
    backdrop: true,
    ignoreBackdropClick: true,
  };
  promoWarningModelConfig = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-sm modal-dialog-centered'
  };
  viewEstimateForm: UntypedFormGroup;
  address_error = this.helper.trans.instant("label-title.select-address");
  destination_address: LocationModel = new LocationModel();
  pickup_address: LocationModel = new LocationModel();
  stop_address: LocationModel = new LocationModel();
  citytypes: any[] = [];
  car_rental_list: any[] = [];
  rental_list: any[] = [];
  typelist: any;
  pooltypes: any[] = [];
  package_id: string;
  trip_cancellation_fee: number;
  directionsService: any;
  DirectionsRenderer: any;
  _distance: number[] = [];
  _duration: number[] = [];
  cardData: CardData = new CardData();
  promoData: any;
  promo_id: string;
  cancellation_reasons_list: any;
  cancellation_type: any = '';
  cancellation_reason: any = '';
  cancelTripmodal: boolean;
  onCancelTripmodal: boolean;
  cardPaymentFailModal: boolean;
  cardPaymentWaitingModal: boolean;
  promocode: any;
  cardShow: boolean = false;
  promo_apply_for_card: number = 0;
  promo_apply_for_cash: number = 0;
  payment_mode: number = 0;
  scheduleTime: string;
  scheduleDate: any;
  todayDate: Date = new Date();
  maxScheduleDate: Date = new Date();
  is_add_card: boolean;
  is_use_wallet: number = 0;
  is_address_changed: boolean = true;
  userSubscription: Subscription;
  corporate_id: string;
  TRIP_TYPE = TRIP_TYPE;
  start_time: any;
  tripservice: any;
  tripAddress: any;
  provider: any;
  is_provider: boolean = false;
  tripdetail: any;
  DEFAULT_IMAGE = DEFAULT_IMAGE.USER_PROFILE;
  profile_image: any = this.DEFAULT_IMAGE;
  is_cancle_trip: boolean = false;
  trip_path_array: any[] = [];
  triplocation: any;
  trippath: any;
  total_wait_time: any;
  wait_time_interval: any;
  is_ride_now: boolean = true;
  is_rental: boolean = false;
  is_ride_share: boolean = false;
  paystackPinmodal: boolean = false;
  pin_data: any;
  paystack_status: any;
  pinForm: UntypedFormGroup;
  default_schedule_time: any;
  surgePricemodal: boolean = false;
  surge_multiplier: number = 1;
  is_business: boolean = false;
  is_surge_hours: any;
  isPromoUsed: any = 0;
  chats: any = [];
  message = '';
  chatSubscription: Subscription;
  is_message: boolean = false;
  date: Date;
  is_field_mandatory_arr: any[] = [];
  time_for_schedule: any;
  waiting_time_start_after_minute: number;
  max_split_user: number;
  scrolltop: number = null;
  trip_split_users: any[] = [];
  splitSearchData: string;
  search_users_detail: any;
  is_request_sent: boolean = false;
  remove_split_request: boolean = false;
  resend_request: boolean = false;
  rental_share: boolean = true;
  chatModalOpen: boolean = false;
  show_stop: boolean = true;
  isDropOpened: boolean = false;
  isDistDropOpended: boolean = false;
  is_show_confirmation_code: boolean = false;
  user_setting_details: any;
  selected_ride_details: any;
  change_country: string;
  same_location_error: boolean = false;
  same_stop_error: boolean = false;
  destination_later: boolean = false;
  checkModel: { left?: boolean; right?: boolean } = { left: true, right: false };
  is_click = false;
  PAYMENT_GATEWAY = PAYMENT_GATEWAY;
  public payPalConfig?: IPayPalConfig;
  is_paypal_supported: boolean = false;
  biddingModalOpen: boolean = false;
  is_bidding: boolean = false;
  bidding_amount: number;
  paymentWaitingModal: boolean = false;
  server_time: any;
  bidding_interval: any;
  promo_list: any[] = [];
  offersModal: BsModalRef;
  country_payment_gateway_type: number;
  trip_city_detail: any;
  first_time_failed: boolean = false;
  trip_type_name: any;
  route_path: any;
  local_storage_boolean: boolean = false;
  is_bid_error = false;
  home_work_address_condition: any = {
    is_home_address: false,
    is_work_address: false,
    is_pickup_add: false,
  }
  home_work_user_address: any = Object;
  pickup_location: Array<number> = [];
  EstimateTabType = {
    Normal: 1,
    Rental: 2,
    RideShare: 3,
    OpenRide: 4
  }
  openRideModal: BsModalRef;
  open_ride_type_list: any[] = [];
  open_ride_list: any[] = [];
  destination_address_for_open_ride: string = '';
  selected_open_ride_trip: any;
  total_time_string: any = '';
  user_details: any;
  document_expired_error: boolean = false;
  is_open_ride: boolean = false;
  promoWarningModelRef: BsModalRef;

  @ViewChild("timepicker") timepicker: any;
  @ViewChild('address', { static: true }) address: ElementRef;
  @ViewChild('timeInput', { static: true }) timeInput: ElementRef;
  @ViewChild('authModal', { static: true }) authModal: AuthModalComponent;
  @ViewChild('paymentChangePromoWarning', { static: true }) paymentChangePromoWarning: TemplateRef<any>;
  @ViewChild('addCardModal', { static: true }) addCardModal: AddcardModalComponent;
  @ViewChild('historyModal', { static: true }) historyModal: HistoryModalComponent;
  @ViewChild('destinationaddress', { static: true }) destinationaddress: ElementRef;
  @ViewChild('biddingTemplate', { static: true }) biddingTemplate: TemplateRef<any>;
  @ViewChild('scheduleRideTime', { static: true }) scheduleRideTime: TemplateRef<any>;
  @ViewChild('createSchedulemodal', { static: true }) createSchedulemodal: TemplateRef<any>;
  @ViewChild('confirmationTemplate', { static: true }) confirmationTemplate: TemplateRef<any>;
  @ViewChild('openRideModalTemplate', { static: true }) openRideModalTemplate: TemplateRef<any>;
  @ViewChild('registerAddress', { static: true }) registerAddress: RegisterAddressModelComponent;
  @ViewChild('biddingCheckbox', { static: false }) biddingCheckbox!: ElementRef<HTMLInputElement>;

  constructor(private cdr: ChangeDetectorRef, private _socket: SocketService, private _commonService: CommonService, private _usertripedetail: HistoryService, private _paymentService: PaymentService, public _authService: AuthService, private modalService: BsModalService, public _locationService: LocationService, public helper: Helper, public _vehicleService: VehicleService, private fb: UntypedFormBuilder, private _createTripService: CreateTripService, private _notifierService: NotifiyService, private _chatService: ChatService, public _documentService: DocumentService, private route: ActivatedRoute) { }

  ngAfterViewChecked(): void {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    //clear wait time interval so it don't add any new minutes
    if (this.wait_time_interval) {
      clearInterval(this.wait_time_interval);
    }
    this._notifierService = null;
    localStorage.removeItem('tripData');
    //disconnect socket room
    if (this.tripdetail?._id) {
      let listner = "'" + this.tripdetail?._id + "'";
      this._socket.disconnetRoom(listner);
    }
  }

  ngOnInit() {
    this.viewEstimateForm = this.fb.group({
      pickup_address: [''],
      dest_address: [''],
      roles: this.fb.array([]),
      address: new UntypedFormControl(null),
      latitude: new UntypedFormControl(null),
      longitude: new UntypedFormControl(null)
    });
    this.pinForm = new UntypedFormGroup({
      pin: new UntypedFormControl(null, [Validators.required]),
      otp: new UntypedFormControl(null, [Validators.required]),
      phone_number: new UntypedFormControl(null, [Validators.required])
    })

    this.userSubscription = this._authService.loginObservable.subscribe((user) => {
      if (this.helper.user_details) {
        this.fetchCardList();
        this.currentTrip();
        this.get_home_work_adress();
        this.fetchDocument();
        this.get_provider_create_schedule_openride_trip();
        this.paytabSocket("'paytabs_" + this.helper.user_details._id + "'");
        this.payuSocket("'payu_fail_payment_" + this.helper.user_details._id + "'");

        //when we add card then use localstorage data to fetch trip details
        if (localStorage.getItem('tripData')) {
          this.local_storage_boolean = true;
          setTimeout(() => {
            let tripData = JSON.parse(localStorage.getItem('tripData'));
            if (tripData.destination_later === true) {
              this.destination_later = tripData.destination_later;
              this.pickup_location[0] = tripData.latitude;
              this.pickup_location[1] = tripData.longitude;
              this.pickup_address.address = tripData.source_address;
              this.change_country = this.pickup_address.country_name;
              setTimeout(() => {
                this.add_destination_later();
              }, 500);
            } else {
              this.pickup_location[0] = tripData.latitude;
              this.pickup_location[1] = tripData.longitude;
              this.pickup_address.address = tripData.source_address;
              this.destination_address = tripData.destination_address;
              this.stop_addresses = tripData.destination_addresses;
              this.stop_addresses_country = tripData.stop_addresses_country;
              this.change_country = this.pickup_address.country_name;
              this.viewEstimateForm.patchValue({
                dest_address: tripData.destination_address.address,
              })
              if (this.stop_addresses?.length > 0) {
                for (let index = 0; index < this.stop_addresses?.length; index++) {
                  this.addStop(index);
                  const rolesData = this.stop_addresses.map(address => {
                    return { role: address.address };
                  });

                  this.viewEstimateForm.patchValue({
                    roles: rolesData
                  });
                }
              }
              setTimeout(() => {
                this.get_vehicle_list();
                this.setMap(true);
                if (this.stop_addresses?.length > 0) {
                  for (let index = 0; index < this.stop_addresses?.length; index++) {
                    this.initialize(index);
                  }
                  this.stop_setMap();
                }
              }, 500);
            }
          }, 2000);
        }
      } else {
        this.show_map();
      }
    });
    this._initPromocode();
  }

  paytabSocket(id: any) {
    this.route.queryParams.subscribe(params => {
      if (params.open_modal == "true") {
        this.paymentWaitingModal = true;
        setTimeout(() => {
          if (this.paymentWaitingModal === true) {
            this.paymentWaitingModal = false;
            this.helper._route.navigateByUrl('/app/create-trip');
          }
          this.first_time_failed = true;
        }, 13000);
      }
      let listner = id
      this._socket.listener(listner).subscribe((res: any) => {
        if (res) {
          this.paymentWaitingModal = false;
          if (res.payment_status === true && res.action == 2 && !res.msg) {
            this._notifierService.showNotification('success', this.helper.trans.instant('success-code.924'))
            this.helper._route.navigateByUrl('/app/create-trip');
          } else if (res.payment_status === true && res.action == 1 && !res.msg) {
            this._notifierService.showNotification('success', this.helper.trans.instant('success-code.91'))
            this.helper._route.navigateByUrl('/app/create-trip');
          } else {
            this.first_time_failed = true;
            this._notifierService.showNotification('error', this.helper.trans.instant(res.msg))
            this.helper._route.navigateByUrl('/app/create-trip');
          }
        }
      })
    })
  }

  payuSocket(id: any) {
    let listner = id;
    this._socket.listener(listner).subscribe((res: any) => {
      if (res) {
        if (res.payment_status === false) {
          this._notifierService.showNotification('error', this.helper.trans.instant('error-code.transaction-failed'))
          this.first_time_failed = true;
        }
      }
    })
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.code === 'Escape') {
      if (this.createTripmodal) {
        this.createTripmodal = false;
      }
      if (this.modalRef1) {
        this.modalRef1.onHidden.subscribe(() => {
          this.is_click = false;
        })
      }
      if (this.cancelTripmodal) {
        this.cancelTripmodal = false;
      }
      if (this.paystackPinmodal) {
        this.paystackPinmodal = false;
      }
      if (this.is_changePaymentMode) {
        this.is_changePaymentMode = false;
      }
      if (this.surgePricemodal) {
        this.closesurgemultiplier();
      }
      if (this.modalRef3) {
        this.modalRef3.onHidden.subscribe(() => {
          this.chatModalOpen = false;
          if (this.chatSubscription) {
            this.chatSubscription.unsubscribe();
            this._chatService.clearSubscription();
          }
          setTimeout(() => {
            this.scrolltop = 0;
          }, 500);
        })
      }
      if (this.biddngModalRef) {
        this.biddngModalRef.onHidden.subscribe(() => {
          this.biddingModalOpen = false;
        })
      }
      if (this.promoWarningModelRef) {
        this.promoWarningModelRef.onHidden.subscribe(() => {
          this.closePromoWarningModal();
        })
      }
    }
  }

  //get trip new from socket
  get_provider_create_schedule_openride_trip() {
    this._socket.listener(this.helper.user_details._id).subscribe((res: any) => {
      if (res.is_provider_create || res.type_id) {
        this.currentTrip()
      }
    })
  }

  //to set current location
  set_current_location() {
    this.destination_later = false;
    localStorage.removeItem('current_location')
    this._locationService.set_current_location().then(location => {
      if (location) {
        this._locationService._current_location = JSON.parse(JSON.stringify(location));
        this.matchCountryName();
        this.matchPickupDestinationAddress();
      } else {
        setTimeout(() => {
          this._notifierService.showNotification('error', this.helper.trans.instant('label-title.please-enable-location'));
        }, 500);
        this._locationService._current_location = new LocationModel();
        this.pickup_address = new LocationModel();
        this.map = null;
        this.setMap(true);
      }
    }).catch(() => {
      setTimeout(() => {
        this._notifierService.showNotification('error', this.helper.trans.instant('label-title.please-enable-location'));
      }, 500);
    })
  }

  //when destination later button clicked
  add_destination_later() {
    this.selected_type = 1;
    this.show_stops();
    this.destination_later = true;
    this.viewEstimateForm.value.dest_address = '';
    this.destination_address.longitude = null;
    this.destination_address.latitude = null;
    this.destination_address.address = '';
    (this.viewEstimateForm.get('roles') as UntypedFormArray).clear();
    this.waypoints();
    this.setMap(null);
    this.rental_share = true;
    this.DirectionsRenderer.setMap(null)
    this.stop_markers.forEach((marker) => {
      marker.setMap(null);
    });
    this._initAutoComplete();
    this._initDestintionAutoComplete();
  }

  //manage data when current location button clicked
  set_map_current_location() {
    if (this.home_work_address_condition?.is_home_address === true && this.home_work_address_condition?.is_pickup_add === true) {
      this.home_work_address_condition.is_home_address = false;
    }
    if (this.home_work_address_condition?.is_work_address === true && this.home_work_address_condition?.is_pickup_add === true) {
      this.home_work_address_condition.is_work_address = false;
    }
    this.set_current_location();
    this.pickup_address = this._locationService._current_location;
    this.destination_later = false;
    this.added_stops = 0;
    this.setMap(true);
    this.get_vehicle_list();
  }

  //hide schedule request date modal
  close() {
    this.ScheduleDatePickerModal.hide()
  }

  //get document list of user
  fetchDocument() {
    let json: any = { server_token: this.helper.user_details.server_token, user_id: this.helper.user_details._id, is_show_error_toast: false }
    this._documentService.fetch_document(json).then((user_document) => {
      if (user_document?.success) {
        user_document.userdocument.forEach((data) => {
          if (data.option == 1) {
            if (data.document_picture == '' && data.unique_code == '' && data.expired_date == null) {
              this.is_field_mandatory_arr.push(true);
            }
          }
        })
      }
    })
  }

  //when time set from time picker
  timeset(i) {
    this.scheduleTime = i;
    this.ScheduleDatePickerModal.hide();
  }

  //when date change from date picker
  change(i) {
    this.scheduleDate = i;
    let date: Date = new Date();
    if (this.city_detail.timezone) {
      const newDate = new Date(date.toLocaleString("en-US", { timeZone: this.city_detail.timezone }));
      date = newDate;
    }
    if (this.scheduleDate <= date) {
      let current_time_hour = date.getHours();
      let current_time_minute = date.getMinutes();
      let total_minutes = current_time_minute + this.user_setting_details.scheduled_request_pre_start_minute;
      if (total_minutes >= 60) {
        current_time_hour = current_time_hour + 1;
        total_minutes = total_minutes - 60;
      }
      if (this.tabNum != this.EstimateTabType.OpenRide) {
        this.default_schedule_time = current_time_hour + ':' + total_minutes;
        this.cdr.detectChanges();
      } else {
        this.default_schedule_time = date.getHours() + ':' + (date.getMinutes() + 1);
        this.cdr.detectChanges();
      }
    }
    else {
      this.default_schedule_time = 0;
      this.cdr.detectChanges();
    }
  }

  //open login modal
  openLoginModal(): void {
    this.authModal.show();
  }

  //open add card modals
  openaddCardModal(): void {
    if (this.cardData.payment_gateway_type == PAYMENT_GATEWAY.paystack || this.cardData.payment_gateway_type == PAYMENT_GATEWAY.paytabs) {
      if (localStorage.getItem('tripData')) {
        localStorage.removeItem('tripData')
      }
      localStorage.setItem('tripData', JSON.stringify({
        latitude: this.pickup_location[0],
        longitude: this.pickup_location[1],
        source_address: this.pickup_address.address,
        destination_address: this.destination_address,
        destination_addresses: this.stop_addresses?.length > 0 ? this.stop_addresses : null,
        stop_addresses_country: this.stop_addresses_country,
        pickup_address: this.pickup_address,
        destination_later: this.destination_later,
      }))
    }

    if (this.cardData.payment_gateway_type != PAYMENT_GATEWAY.paytabs) {
      this.addCardModal.show();
      if (this.cardData.payment_gateway_type == 10) {
        this.addCardModal.openaddCardModal();
      }
    } else {
      let host = `${window.location}`
      let json: any = {
        user_id: this.helper.user_details._id,
        token: this.helper.user_details.server_token,
        payment_gateway_type: this.cardData.payment_gateway_type,
        type: 10,
        is_new: host,
      };
      this._paymentService._get_stripe_add_card_intent(json).then((response: any) => {
        if (response) {
          window.open(response.authorization_url, '_self');
        } else {
          // this._notifierService.showNotification('error', response.message)
        }
      })
    }
  }

  openViewEstimateModal(modal: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(modal, this.config);
  }

  openCarRentalModal(modal: TemplateRef<any>): void {
    if (this.destination_address.address == '' && !this.destination_later) {
      this.viewEstimateForm.markAllAsTouched();
      return;
    }
    this.modalRef1 = this.modalService.show(modal, this.config);
  }

  openCreateTripModal() {
    if (this.destination_address.address == '' && !this.destination_later) {
      this.viewEstimateForm.markAllAsTouched();
      return;
    }
    if (this.city_detail.is_ask_user_for_fixed_fare === false) {
      this.rideNow(false);
    } else {
      this.createTripmodal = true;
    }
  }

  //fix fare ask modal close
  CreateTripModalclose() {
    this.createTripmodal = false;
  }

  //check trip is open ride trip or not
  checkOpenRideTrip() {
    if (this.tabNum != this.EstimateTabType.OpenRide) {
      this.surgemultiplier()
    } else {
      this.open_ride_list_for_user();
    }
  }

  //when schedule or open ride button clicked
  scheduleRide(): void {
    if (this.destination_address.address == '' && !this.destination_later) {
      this.viewEstimateForm.markAllAsTouched();
      return;
    }
    if (this.scheduleTime) {
      this.date = new Date()
      const newDate = new Date(this.date.toLocaleString("en-US", { timeZone: this.city_detail.timezone }));
      this.date = newDate;
      if (this.tabNum != this.EstimateTabType.OpenRide) {
        this.date.setMinutes(this.date.getMinutes() + this.user_setting_details.scheduled_request_pre_start_minute)
      } else {
        this.date.setMinutes(this.date.getMinutes())
        let currentDate = new Date();
        let currentHour = currentDate.getHours();
        let currentMinutes = currentDate.getMinutes();
        this.scheduleTime = currentHour + ':' + currentMinutes;
      }
      this.date.setSeconds(0)
      let s_time = this.scheduleTime.split(':')
      let s_date: Date = new Date(this.scheduleDate)
      const s_newDate = new Date(s_date.toLocaleString("en-US", { timeZone: this.city_detail.timezone }));
      s_date = s_newDate;
      s_date.setHours(Number(s_time[0]))
      s_date.setMinutes(Number(s_time[1]))
      s_date.setSeconds(0)
      if (this.date.getTime() <= s_date.getTime()) {
        if (this.scheduleTime && this.scheduleDate) {
          if (this.surge_multiplier != 1) {
            this.surgePricemodal = true;
          } else {
            this.checkOpenRideTrip();
          }
        }
      } else {
        this.modalRef = this.modalService.show(this.scheduleRideTime, {
          backdrop: true,
          ignoreBackdropClick: true,
          class: 'modal-md modal-dialog-centered',
          keyboard: false
        })
      }
    } else {
      this.date_time_picker();
    }
  }

  //hide schedule trip reminder modal
  confirm() {
    this.modalRef.hide()
    this.scheduleDate = ''
    this.scheduleTime = ''
  }

  //to create ride now trip
  nonscheduleRide(): void {
    if (this.destination_address.address == '' && !this.destination_later) {
      this.viewEstimateForm.markAllAsTouched();
      return;
    }
    this.scheduleTime = null;
    this.scheduleDate = null;
    this.start_time = null;
    if (this.surge_multiplier != 1 && !this.is_bidding) {
      this.surgePricemodal = true;
    } else {
      this.surgemultiplier()
    }
  }

  //open modal if surge multiplier is more than 1 else create trip
  surgemultiplier() {
    this.surgePricemodal = false;
    if (!this.destination_later && !this.is_bidding && this.tabNum != this.EstimateTabType.RideShare && this.tabNum != this.EstimateTabType.OpenRide) {
      this.openCreateTripModal();
    } else if (this.typelist.is_allow_trip_bidding === true && this.is_bidding) {
      this.rideNow(true);
    } else if (this.tabNum == this.EstimateTabType.OpenRide) {
      this.open_ride_list_for_user();
    } else {
      this.rideNow(false);
    }
  }

  closesurgemultiplier() {
    this.surgePricemodal = false;
  }

  date_time_picker(): void {
    this.ScheduleDatePickerModal = this.modalService.show(this.createSchedulemodal, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'modal-datepicker modal-dialog-centered'
    });
  }

  async fetchCardList() {
    let json: any = { server_token: this.helper.user_details.server_token, user_id: this.helper.user_details._id, type: 10 };
    this.cardData = await this._paymentService.get_card_list(json);
    this.is_add_card = this.cardData.payment_gateway[0].is_add_card;
    if (this.cardData.payment_gateway_type != PAYMENT_GATEWAY.paypal) {
      this.is_paypal_supported = true;
    }
  }

  //socket called when trip update
  async socket(id) {
    let listner = "'" + id + "'"
    this._socket.connectRoom(listner);
    this._socket.listener(listner).subscribe((res: any) => {
      if (res.is_trip_updated) {
        this.get_usergettripstatus(id, res.is_for_first_time, true)
      } else {
        this.tripdetail.total_time = res.total_time
        this.tripdetail.total_distance = res.total_distance
        if (res.location[0]) {
          this.trip_path_array.push(new google.maps.LatLng(res.location[0], res.location[1]))
          this.trippath?.setPath(this.trip_path_array);

          this.provider_markers[0].setPosition(new google.maps.LatLng(res.location[0], res.location[1]));
        }
      }
    })
  }

  //to get cuurent trip and call socket for trip
  async currentTrip() {
    let json: any = { token: this.helper.user_details.server_token, user_id: this.helper.user_details._id }
    this._commonService.get_setting_detail(json).then((user_setting_detail) => {
      this.user_setting_details = user_setting_detail.setting_detail;
      this.user_details = user_setting_detail.user_detail;
      let date = new Date();
      this.maxScheduleDate = new Date(date.setDate(date.getDate() + this.user_setting_details.scheduled_request_pre_booking_days));
      if (user_setting_detail.user_detail.trip_id) {
        this.socket(user_setting_detail.user_detail.trip_id)
        this.get_usergettripstatus(user_setting_detail.user_detail.trip_id, false, false)
      } else {
        if (!this.map) {
          this.show_map()
        }
        this.tripdetail = null;
      }
    })
  }

  //bids start
  closeBiddingModal() {
    this.biddngModalRef.hide()
    this.biddingModalOpen = true;
  }

  //gives remaining seconds for bid
  getRemainingTimeInSeconds(provider: any, server_time: any): number {
    this.cdr.detectChanges()
    const currentTime = new Date(server_time);
    const endTime = new Date(provider.bid_end_at);
    const timeDifference = endTime.getTime() - currentTime.getTime();
    const remainingTimeInSeconds = Math.max(0, Math.floor(timeDifference / 1000));

    if (remainingTimeInSeconds === 0) {
      this.removeProvider(provider);
    }

    return remainingTimeInSeconds;
  }

  //remove bid when it's remaining time is 0
  removeProvider(provider: any): void {
    const index = this.tripdetail.bids.indexOf(provider);
    if (index !== -1) {
      this.tripdetail.bids.splice(index, 1);
      if (this.tripdetail.bids.length == 0) {
        if (this.biddngModalRef) {
          this.biddngModalRef.hide();
        }
      }
    }
  }

  //filter bids
  removeExpiredBids(bid): void {
    this.tripdetail.bids = this.tripdetail.bids.filter((provider) => {
      return provider.provider_id != bid.provider_id;
    });
    if (this.tripdetail.bids.length == 0) {
      setTimeout(() => {
        if (this.biddngModalRef) {
          this.biddngModalRef.hide();
        }
      }, 1000);
    }
  }

  //manage bids
  manageBids() {
    this.tripdetail.bids.forEach(bid => {
      bid.remaining_seconds = bid.remaining_seconds ? (bid.remaining_seconds - 1) : this.getRemainingTimeInSeconds(bid, this.server_time);
      if (bid.remaining_seconds <= 0) {
        this.removeExpiredBids(bid);
      }
    });
  }

  //when bidding checkbox checked
  biddingChecked() {
    const isChecked = this.biddingCheckbox.nativeElement.checked;
    if (isChecked) {
      //when checked disable schedule button and hide rental and ride share tab
      this.is_bidding = true;
      this.rental_share = false;
      this.on_key_up();
    } else {
      this.is_bidding = false;
      this.rental_share = true;
      this.bidding_amount = this.selected_ride_details.estimated_fare;
    }
  }

  //user accept or rejct bid
  userAcceptRejectBid(status, provider_id) {
    let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, provider_id: provider_id, trip_id: this.tripdetail._id }
    if (status == 'accept') {
      this._createTripService.user_accept_bid(json).then(res => {
        if (res.success) {
          this.closeBiddingModal();
        }
      })
    }
    if (status == 'reject') {
      this._createTripService.user_reject_bid(json).then(res => {
        if (res.success && this.tripdetail.bids.length == 0) {
          this.closeBiddingModal();
        }
      })
    }
  }

  //get trip status and get povider information
  get_usergettripstatus(trip_id: any, is_for_first_time: boolean, is_socket) {
    let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, trip_id: trip_id }
    this._usertripedetail.get_usergettripstatus(json).then(res_data => {
      if (res_data.success) {
        if (res_data.trip.openride) {
          const user = res_data.trip.user_details.find((x) => x.user_id == this.helper.user_details._id)
          if (!(user && user.booking_cancelled == 0 && user.booking_cancelled_by_provider == 0 && user.booking_cancelled_by_user == 0)) {
            this.tripdetail = null;
            this.show_map();
            return
          }
        }
        this.waiting_time_start_after_minute = res_data.waiting_time_start_after_minute;
        this.tripdetail = res_data.trip;
        this.trip_type_name = res_data.type_name;

        //open modal if trip is cancelled
        if (res_data.trip?.is_trip_cancelled && (res_data.trip.payment_status == 1 || res_data.trip.is_provider_accepted == 0)) {
          this.onCancelTripmodal = true;
          return
        }

        if (this.tripdetail.openride && this.tripdetail.user_details?.length > 1) {
          this.tripdetail.user_details = this.tripdetail.user_details.filter((x) => x.user_id == this.helper.user_details._id);
        }

        //update payment_mode variable using trip variable
        if (this.tripdetail?.payment_mode == 0) {
          this.payment_mode = 0;
        } else if (this.tripdetail?.payment_mode == 1) {
          this.payment_mode = 1;
        }
        this.trip_city_detail = res_data.city_detail;
        this.server_time = res_data.server_time ? res_data.server_time : new Date();

        //bids modal open when bids array is not empty
        if (this.tripdetail.bids && this.tripdetail.bids.length > 0 && this.tripdetail.is_trip_bidding) {
          this.tripdetail.bids.sort((a, b) => b.ask_bid_price - a.ask_bid_price);
          if (this.biddingModalOpen === false) {
            setTimeout(() => {
              this.biddngModalRef = this.modalService.show(this.biddingTemplate, {
                backdrop: true,
                ignoreBackdropClick: true,
                class: 'custom-class-modal-sm custom-class-dialog-centered'
              });
              this.biddingModalOpen = true;
            }, 500);

            if (this.bidding_interval) {
              clearInterval(this.bidding_interval)
            }
            this.manageBids()
            this.bidding_interval = setInterval(() => {
              this.manageBids()
            }, 1000);
          }
        } else {
          this.biddingModalOpen = false;
          if (this.biddngModalRef) {
            this.biddngModalRef.hide();
          }
        }

        if (res_data.trip.is_fixed_fare === true) {
          this.selected_ride_details = {
            estimated_fare: res_data.trip.fixed_price
          }
        } else {
          this.selected_ride_details = {
            estimated_fare: res_data.trip.remaining_payment
          }
        }
        if (res_data.trip.payment_gateway_type == PAYMENT_GATEWAY.paypal) {
          this.paypalAdd();
        }
        this.trip_split_users = this.tripdetail.split_payment_users;
        if (this.search_users_detail) {
          this.trip_split_users.forEach((data) => {
            if (data.phone == this.search_users_detail.phone) {
              this.search_users_detail = null;
            }
          })
        }
        this.tripservice = res_data.tripservice;
        this.tripAddress = res_data.trip.destination_addresses;
        this.isPromoUsed = res_data.isPromoUsed;
        this.city_detail = res_data.city_detail;
        if (this.wait_time_interval) {
          clearInterval(this.wait_time_interval);
        }
        if (this.tripdetail.is_provider_accepted == 1) {
          if (this.biddngModalRef) {
            this.biddngModalRef.hide();
          }
        }

        //calculate total waiting time
        let stat3 = res_data.trip.trip_status?.find((obj) => obj.status == 3)
        let stat4 = res_data.trip.trip_status?.find((obj) => obj.status == 4)
        let arrived_date = new Date(stat3?.timestamp)
        if (stat3 && !stat4) {
          let endDateFormat = moment(new Date(), "YYYY-MM-DD hh:mm:ss");
          let totalSeconds = endDateFormat.diff(moment(new Date(arrived_date), "YYYY-MM-DD hh:mm:ss"), 'seconds');
          let minutes = Math.floor(totalSeconds / 60);
          let seconds = totalSeconds % 60;
          let paddedSeconds = String(seconds).padStart(2, '0');

          this.total_wait_time = minutes + ':' + paddedSeconds;
          this.wait_time_interval = setInterval(() => {
            seconds += 1
            if (seconds == 60) {
              seconds = 0;
              minutes += 1
            }
            let paddedSeconds = String(seconds).padStart(2, '0');
            this.total_wait_time = minutes + ':' + paddedSeconds;
          }, 1000)
        }
        if (stat4) {
          let startDateFormat = moment(new Date(stat4.timestamp), "YYYY-MM-DD hh:mm:ss");
          let totalSeconds = startDateFormat.diff(moment(new Date(arrived_date), "YYYY-MM-DD hh:mm:ss"), 'seconds');
          let minutes = Math.floor(totalSeconds / 60);
          let seconds = totalSeconds % 60;
          let paddedSeconds = String(seconds).padStart(2, '0');
          this.total_wait_time = minutes + ':' + paddedSeconds;
        }

        //condition to hide and show cancel trip button and apply canclellation fee
        if (this.tripdetail.is_provider_status >= this.helper.PROVIDER_STATUS.STARTED) {
          this.is_cancle_trip = false;
        } else {
          this.is_cancle_trip = true;
          if (this.tripdetail.is_provider_status >= this.helper.PROVIDER_STATUS.ARRIVED) {
            this.trip_cancellation_fee = res_data.cancellation_fee
          }
        }
        if (this.tripdetail.is_provider_status >= this.helper.PROVIDER_STATUS.COMPLETED || this.tripdetail.is_trip_cancelled_by_user == 1) {
          if (this.tripdetail.payment_status == 0) {
            this.cardPaymentWaitingModal = true;
          } else if (this.tripdetail.payment_status == 2) {
            this.cardPaymentWaitingModal = false;
            if (is_for_first_time) {
              this.cardPaymentFailModal = false;
              this.cardPaymentWaitingModal = true;
              this.payAgain(false);
            } else if (is_socket) {
              this.helper.helper_is_loading = true;
              setTimeout(() => {
                this.cardPaymentFailModal = true;
                this.helper.helper_is_loading = false;
              }, 2000);
            } else {
              this.cardPaymentFailModal = true;
            }
          } else {
            this.cardPaymentWaitingModal = false;
            this.cardPaymentFailModal = false
          }
          if (this.splitModal) {
            this.splitModal.hide();
          }
        }

        //get provider information
        if (res_data.trip.confirmed_provider !== null && !this.is_provider) {
          let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, trip_id: trip_id, provider_id: res_data.trip.confirmed_provider }
          this._usertripedetail.get_provider_info(json).then(res_data_p => {
            this.provider = res_data_p.provider;
            this.onReadMessage(false);
            this.is_provider = true
            this.profile_image = this.IMAGE_URL + this.provider.picture;
            let location = new google.maps.LatLng(this.provider.providerLocation[0], this.provider.providerLocation[1]);
            this.provider_markers = []
            let marker = new google.maps.Marker({
              position: location,
              map: this.map,
              draggable: false,
              icon: DEFAULT_IMAGE.DRIVER_ICON
            });
            this.provider_markers.push(marker);
          })
        }
        this.helper.loadGoogleScript("https://maps.googleapis.com/maps/api/js?key=" + this.helper.GOOGLE_KEY + "&libraries=places").then(() => {
          this.setMap(false);
        })
      } else {
        this.onCancelTripmodal = true;
      }
    })
  }

  closeonCancelTripmodal() {
    this.onCancelTripmodal = false;
    window.location.reload();
  }

  show_map() {
    this.helper.loadGoogleScript("https://maps.googleapis.com/maps/api/js?key=" + this.helper.GOOGLE_KEY + "&libraries=places").then(() => {
      this._locationService.set_current_location().then((value) => {
        this.pickup_address.address = this._locationService._current_location.address;
        let json = {}
        this._commonService.get_setting_detail(json).then((user_setting_detail) => {
          this.user_setting_details = user_setting_detail.setting_detail;
          this.max_split_user = user_setting_detail.setting_detail.max_split_user;
          this.setMap(true);
          this._initAutoComplete();
          this._initDestintionAutoComplete();

          this.get_vehicle_list();
          this.directionsService = new google.maps.DirectionsService();
          this.DirectionsRenderer = new google.maps.DirectionsRenderer();
        })
        this._initForms();
      });
      this.set_current_location();
    })
  }

  //select the default card
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

  _initPromocode() {
    this.promo_apply_for_cash = 1;
    this.promo_apply_for_card = 0;
  }

  //promo apply to the trip
  promo_code() {
    let json: any = { payment_mode: this.payment_mode, user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, city_id: this.city_detail._id, country_id: this.city_detail.countryid, promocode: this.promocode, promo_apply_for_cash: this.promo_apply_for_cash, promo_apply_for_card: this.promo_apply_for_card }
    if (this.tripdetail?._id) {
      json.trip_id = this.tripdetail._id
    }
    if (this.promocode) {
      this._vehicleService.get_promocode(json).then(res_data => {
        if (res_data.success) {
          this.promoData = res_data;
          this.promo_id = res_data.promo_id;
          if (this.offersModal) {
            this.closeOffersModal();
          }
        }
      });
    }
  }

  //remove promo from trip
  remove_promo() {
    if (this.promoData) {
      if (this.tripdetail?._id) {
        let json = { "promo_id": this.tripdetail.promo_id, "user_id": this.helper.user_details._id, "token": this.helper.user_details.server_token, "trip_id": this.tripdetail._id }
        this._vehicleService.remove_promo_code(json).then(res_data => {
          if (res_data.success) {
            this.promoData = null;
            this.promocode = null;
          }
        });
      } else {
        this.promoData = null;
        this.promocode = null;
      }
    }
  }

  showContent(selectedMethod) {
    if (selectedMethod === 'card') {
      this.promo_apply_for_cash = 0;
      this.promo_apply_for_card = 1;
      this.cardShow = true;
      if (this.is_add_card === true || this.city_detail?.is_payment_mode_card == 1) {
        this.payment_mode = 0;
      } else {
        this.payment_mode = 1;
      }
    }
    if (selectedMethod === 'cash') {
      this.promo_apply_for_cash = 1;
      this.promo_apply_for_card = 0;
      this.cardShow = false;
      this.payment_mode = 1;
    }
  }

  initialize(i) {
    let autocompleteElm = document.getElementById('autocomplete_address-' + i);
    let autocomplete = new google.maps.places.Autocomplete((autocompleteElm), { types: [] });
    autocomplete.addListener('place_changed', () => {
      let place = autocomplete.getPlace();

      let lat = place.geometry.location.lat();
      let lng = place.geometry.location.lng();
      let address = place['formatted_address'];
      this.is_address_changed = true;
      if (this.DirectionsRenderer) {
        this.DirectionsRenderer.setMap(null);
      }
      this.stop_address.latitude = lat;
      this.stop_address.longitude = lng;
      this.stop_address.address = address;
      this.viewEstimateForm.patchValue({
        address: address,
        latitude: lat,
        longitude: lng
      })
      place['address_components'].forEach(element => {
        let type = element.types[0]
        switch (type) {
          case 'country':
            this.stop_address.country_name = element.long_name;
            this.stop_address.country_code = element.short_name;
            break;
          case 'administrative_area_level_1':
            this.stop_address.state_code = element.short_name;
            this.stop_address.state_name = element.long_name;
            break;
          case 'administrative_area_level_2':
            this.stop_address.city_name = element.short_name;
            break;
          case 'postal_code':
            break;
          default:
            break;
        }
      });
      this.stop_setMap();
      if (this.stop_addresses_country.length > 0) {
        this.stop_addresses_country.splice(i, 1);
      }
      this.stop_addresses_country.splice(i, 0, this.stop_address.country_name);
      if (this.pickup_address.country_name == '') {
        this.pickup_address.country_name = this._locationService._current_location.country_name;
      }
      this.matchCountryName();
      this.matchPickupDestinationAddress();
    });
    $('.stop-address-search-location-' + i).find("#autocomplete_address-" + i).on("focus click keypress", () => {
      $('.stop-address-search-location-' + i).find("#autocomplete_address-" + i).parent(".input-wrp-" + i).css({ position: "relative" }).append($(".pac-container"));
    });
  }

  editStopAddress(item, index) {
    if (this.stop_addresses.length > index) {
      this.selected_address_index = index;
      this.viewEstimateForm.patchValue({
        address: item.address,
      })
    }
  }

  stop_details() {
    if (this.stop_address.latitude && this.selected_address_index == -1) {
      this.stop_addresses.push({
        address: this.stop_address.address,
        location: [this.stop_address.latitude, this.stop_address.longitude],
      })
    }
    else {
      this.stop_addresses[this.selected_address_index].address = this.viewEstimateForm.value.address;
      this.stop_addresses[this.selected_address_index].location = [this.viewEstimateForm.value.latitude, this.viewEstimateForm.value.longitude];
    }
  }

  //match country names of the address and hide error accordingly
  matchCountryName() {
    if (this.pickup_address.country_name == '') {
      this.pickup_address.country_name = this._locationService._current_location.country_name;
    }
    if (this.stop_addresses_country?.length > 0) {
      this.stop_addresses_country?.forEach((country) => {
        if (this.pickup_address?.country_name && this.destination_address?.country_name) {
          if (country == this.pickup_address?.country_name && this.destination_address?.country_name == this.pickup_address.country_name) {
            this.is_business = false;
            this.cdr.detectChanges();
          }
        } else if (this.pickup_address?.country_name) {
          if (country == this.pickup_address?.country_name) {
            this.is_business = false;
            this.cdr.detectChanges();
          }
        } else if (this.destination_address?.country_name) {
          if (country == this.destination_address?.country_name) {
            this.is_business = false;
            this.cdr.detectChanges();
          }
        }
      })
    } else if (this.pickup_address?.country_name == this.destination_address?.country_name) {
      this.is_business = false;
      this.cdr.detectChanges();
    }
  }

  //match the addresses and remove hide error accordingly
  matchPickupDestinationAddress() {
    if (this.destination_address.latitude && this.pickup_location[0] != this.destination_address.latitude && this.pickup_location[1] != this.destination_address.longitude) {
      this.same_location_error = false;
      this.cdr.detectChanges();
    }
    if (this.stop_addresses.length > 0) {
      let matchFound = false;
      for (let i = 0; i < this.stop_addresses.length - 1; i++) {
        const locationKey1 = this.stop_addresses[i].location[0] + '-' + this.stop_addresses[i].location[1];
        const locationKey2 = this.stop_addresses[i + 1].location[0] + '-' + this.stop_addresses[i + 1].location[1];
        if (locationKey1 === locationKey2) {
          matchFound = true;
          break;
        }
      }
      if (!matchFound) {
        this.same_stop_error = false;
        this.cdr.detectChanges();
      }
    }
  }

  //on pickup address autocomplete
  _initAutoComplete() {
    let autocompleteElm = this.address.nativeElement;
    let autocomplete = new google.maps.places.Autocomplete((autocompleteElm), { types: [] });

    autocomplete.addListener('place_changed', () => {
      let place = autocomplete.getPlace();

      let lat = place.geometry.location.lat();
      let lng = place.geometry.location.lng();
      let address = place['formatted_address'];
      this.is_address_changed = true;
      if (this.DirectionsRenderer) {
        this.DirectionsRenderer.setMap(null);
      }
      this.pickup_address.latitude = lat;
      this.pickup_address.longitude = lng;
      this.pickup_address.address = address;
      place['address_components'].forEach(element => {
        let type = element.types[0]
        switch (type) {
          case 'country':
            this.pickup_address.country_name = element.long_name;
            this.pickup_address.country_code = element.short_name;
            break;
          case 'administrative_area_level_1':
            this.pickup_address.state_code = element.short_name;
            this.pickup_address.state_name = element.long_name;
            break;
          case 'administrative_area_level_2':
            this.pickup_address.city_name = element.short_name;
            break;
          case 'postal_code':
            break;
          default:
            break;
        }
      });
      this.setMap(true);
      this.provider_markers.forEach((marker) => {
        marker.setMap(null);
      });
      this.is_ride_now = true;
      this.destination_later = false;
      this.get_vehicle_list();
      this.matchCountryName();
      this.matchPickupDestinationAddress();
    });
    $('.pickup-address-search-location').find("#pickup_address").on("focus click keypress", () => {
      $('.pickup-address-search-location').find("#pickup_address").parent(".input-wrp").css({ position: "relative" }).append($(".pac-container"));
    });
  }

  //on destination address autocomplete
  _initDestintionAutoComplete() {
    let autocompleteElm = this.destinationaddress.nativeElement;
    let autocomplete = new google.maps.places.Autocomplete((autocompleteElm), { types: [] });
    autocomplete.addListener('place_changed', () => {
      let place = autocomplete.getPlace();
      let lat = place.geometry.location.lat();
      let lng = place.geometry.location.lng();
      let address = place['formatted_address'];
      this.destination_address.latitude = lat;
      this.destination_address.longitude = lng;
      this.destination_address.address = address;
      place['address_components'].forEach(element => {
        let type = element.types[0]
        switch (type) {
          case 'country':
            this.destination_address.country_name = element.long_name;
            this.destination_address.country_code = element.short_name;
            break;
          case 'administrative_area_level_1':
            this.destination_address.state_code = element.short_name;
            this.destination_address.state_name = element.long_name;
            break;
          case 'locality':
            this.destination_address.city_name = element.long_name; // Capture city name
            break;
          case 'postal_code':
            break;
          default:
            break;
        }
      });

      //get city,state and country name
      let geocoder = new google.maps.Geocoder();
      let component_this = this;
      geocoder.geocode({ location: { lat: lat, lng: lng } }, function (results, status) {
        if (status === "OK" && results && results.length > 0) {
          let city = getAddressComponent(results[0], "locality");
          let state = getAddressComponent(results[0], "administrative_area_level_1");
          let country = getAddressComponent(results[0], "country");
          component_this.destination_address_for_open_ride = [city, state, country].filter(Boolean).join(', ');
        } else {
          console.error("Geocode was not successful for the following reason:", status);
        }
      });
      function getAddressComponent(result, component) {
        for (const addressComponent of result.address_components) {
          if (addressComponent.types.includes(component)) {
            return addressComponent.long_name;
          }
        }
        return null;
      }

      this.setMap(true);
      this.destination_later = false;
      if (this.pickup_address.country_name == '') {
        this.pickup_address.country_name = this._locationService._current_location.country_name;
      }
      this.matchCountryName();
      this.matchPickupDestinationAddress();
    });
    $('.destination-address-search-location').find("#dest_address").on("focus click keypress", () => {
      $('.destination-address-search-location').find("#dest_address").parent(".input-wrp1").css({ position: "relative" }).append($(".pac-container"));
    });
  }

  //set map
  setMap(is_draggable) {
    if (this.address !== undefined) {
      this.address_error = ''
    }

    let default_latitude = (this.user_setting_details?.location && this.user_setting_details?.location.length > 0) ? this.user_setting_details.location[0] : 22.3039;
    let default_longitude = (this.user_setting_details?.location && this.user_setting_details?.location.length > 0) ? this.user_setting_details.location[1] : 70.8022;

    if (!this.map) {
      let theme = localStorage.getItem('vien-themecolor');
      if (theme.includes('dark')) {
        this.map = new google.maps.Map(document.getElementById('map'), {
          zoom: 12,
          center: { lat: this._locationService._current_location.latitude ? this._locationService._current_location.latitude : default_latitude, lng: this._locationService._current_location.longitude ? this._locationService._current_location.longitude : default_longitude },
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
        this.map = new google.maps.Map(document.getElementById('map'), {
          zoom: 12,
          center: { lat: this._locationService._current_location.latitude ? this._locationService._current_location.latitude : default_latitude, lng: this._locationService._current_location.longitude ? this._locationService._current_location.longitude : default_longitude },
          draggable: true,
          zoomControl: true,
          scrollwheel: true,
          disableDoubleClickZoom: false,
          fullscreenControl: true
        });
      }
    }
    let lat: number;
    let lng: number;
    if (this.tripdetail) {
      lat = this.tripdetail.sourceLocation[0];
      lng = this.tripdetail.sourceLocation[1];
      this.destination_address.latitude = this.tripdetail.destinationLocation[0];
      this.destination_address.longitude = this.tripdetail.destinationLocation[1];

      if (this.tripAddress) {
        let bounds = new google.maps.LatLngBounds();
        this.tripAddress.forEach((address, index) => {
          let location = new google.maps.LatLng(address.location[0], address.location[1]);
          let marker = new google.maps.Marker({
            position: location,
            map: this.map,
            label: {
              text: (index + 1).toString(),
              fontSize: "16px",
              fontWeight: "bold",
              className: 'marker-position',
            },
            icon: DEFAULT_IMAGE.STOP_ICON
          });
          bounds.extend(marker.position);
        });
      }

      if (this.tripdetail.is_provider_accepted == 1 && this.tripdetail.is_provider_status >= this.helper.PROVIDER_STATUS.STARTED) {
        let json: any = { trip_id: this.tripdetail._id }

        this._createTripService.polyline(json).then(response => {
          this.triplocation = response.data.triplocation;
          this.trip_path_array = [];
          this.triplocation.startTripToEndTripLocations.forEach(location => {
            let lat = location[0];
            let lng = location[1];
            let trip_path = { 'lat': lat, 'lng': lng };
            this.trip_path_array.push(trip_path);
          });
          this.trippath = new google.maps.Polyline({
            path: this.trip_path_array,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
          });
          this.trippath.setMap(this.map);
        });
      }
    } else {
      lat = this.pickup_address.latitude;
      lng = this.pickup_address.longitude;
      if (lat === null) {
        lat = this._locationService._current_location.latitude ? this._locationService._current_location.latitude : default_latitude;
      }
      if (lng === null) {
        lng = this._locationService._current_location.longitude ? this._locationService._current_location.longitude : default_longitude;
      }

      if (this.home_work_address_condition?.is_home_address === true && this.home_work_address_condition?.is_pickup_add === true) {
        lat = this.home_work_user_address.user_address.home_location[0];
        lng = this.home_work_user_address.user_address.home_location[1];
      }
      if (this.home_work_address_condition?.is_home_address === true && this.home_work_address_condition?.is_pickup_add === false) {
        this.destination_address.latitude = this.home_work_user_address.user_address.home_location[0];
        this.destination_address.longitude = this.home_work_user_address.user_address.home_location[1];
      }
      if (this.home_work_address_condition?.is_work_address === true && this.home_work_address_condition?.is_pickup_add === true) {
        lat = this.home_work_user_address.user_address.work_location[0];
        lng = this.home_work_user_address.user_address.work_location[1];
      }
      if (this.home_work_address_condition?.is_work_address === true && this.home_work_address_condition?.is_pickup_add === false) {
        this.destination_address.latitude = this.home_work_user_address.user_address.work_location[0];
        this.destination_address.longitude = this.home_work_user_address.user_address.work_location[1];
      }
      this.pickup_address.latitude = lat;
      this.pickup_address.longitude = lng;
      this.pickup_location[0] = lat;
      this.pickup_location[1] = lng;
      this.change_country = this.pickup_address.country_name
      if (this.pickup_address.country_name == '') {
        this.change_country = this._locationService._current_location.country_name;
      }
    }

    if (this.store_marker) {
      this.store_marker.setMap(null);
      this.store_marker = null;
    }

    let bounds = new google.maps.LatLngBounds();
    if (lat && lng) {
      this.store_marker = new google.maps.Marker({
        position: { lat, lng },
        map: this.map,
        draggable: is_draggable,
        icon: DEFAULT_IMAGE.PICKUP_ICON,
      });
      google.maps.event.addListener(this.store_marker, 'dragend', async (marker) => {
        this.pickup_address.latitude = marker.latLng.lat();
        this.pickup_address.longitude = marker.latLng.lng();
        this.pickup_location[0] = marker.latLng.lat();
        this.pickup_location[1] = marker.latLng.lng();
        this.getCountryFromLatLng(this.pickup_location[0], this.pickup_location[1]).then((result) => {
          this.pickup_address.country_name = result.country;
          this.pickup_address.country_code = result.countryCode;
        }).catch((error) => {
          console.error('Error:', error);
        });
        let geocoder = new google.maps.Geocoder();
        let request = { latLng: new google.maps.LatLng(this.pickup_address.latitude, this.pickup_address.longitude) };
        geocoder.geocode(request, (results, status) => {
          if (status == google.maps.GeocoderStatus.OK) {
            this.pickup_address.address = results[0].formatted_address;
            this.matchCountryName();
            this.matchPickupDestinationAddress();
            this.get_vehicle_list();
            this.provider_markers.forEach((marker) => {
              marker.setMap(null);
            });
            this.is_ride_now = true;
          }
        });
      })
    }

    if (this.destination_marker) {
      this.destination_marker.setMap(null);
      this.destination_marker = null;
    }
    if (this.destination_later) {
      this.destination_address.latitude = null;
      this.destination_address.longitude = null;
    }
    if (this.destination_address.latitude && this.destination_address.longitude) {
      let destination_location = new google.maps.LatLng(this.destination_address.latitude, this.destination_address.longitude);
      this.destination_marker = new google.maps.Marker({
        position: destination_location,
        map: this.map,
        draggable: is_draggable,
        icon: DEFAULT_IMAGE.DESTINATION_ICON,
      });
      bounds.extend(this.store_marker.position);
      bounds.extend(this.destination_marker.position);
      this.map.fitBounds(bounds);
      google.maps.event.addListener(this.destination_marker, 'dragend', async (marker) => {
        this.destination_address.latitude = marker.latLng.lat();
        this.destination_address.longitude = marker.latLng.lng();
        this.getCountryFromLatLng(this.destination_address.latitude, this.destination_address.longitude).then((result) => {
          this.destination_address.country_name = result.country;
          this.destination_address.country_code = result.countryCode;
        }).catch((error) => {
          console.error('Error:', error);
        });
        let geocoder = new google.maps.Geocoder();
        let request = { latLng: new google.maps.LatLng(this.destination_address.latitude, this.destination_address.longitude) };
        geocoder.geocode(request, (results, status) => {
          if (status == google.maps.GeocoderStatus.OK) {
            this.helper.ngZone.run(() => {
              this.destination_address.address = results[0].formatted_address;
              this.is_address_changed = true
              this.matchCountryName();
              this.matchPickupDestinationAddress();
              if (this.DirectionsRenderer) {
                this.DirectionsRenderer.setMap(null);
              }
              this.is_ride_now = true;
            })
          }
        });
      })
    }

    if (this.destination_later) {
      bounds.extend(this.store_marker.position);
      this.map.fitBounds(bounds);
    }

    this.is_address_changed = true;
    if (this.DirectionsRenderer) {
      this.DirectionsRenderer.setMap(null);
    }
  }

  //set map for stop address
  stop_setMap() {
    let bounds = new google.maps.LatLngBounds();
    this.stop_markers.forEach((marker) => {
      marker.setMap(null);
    });
    if (this.stop_address.address) {
      this.stop_details();
    }
    this.stop_markers = [];
    this.stop_addresses.forEach((address, index) => {
      let location = new google.maps.LatLng(address.location[0], address.location[1]);
      let marker = new google.maps.Marker({
        position: location,
        map: this.map,
        draggable: true,
        label: {
          text: (index + 1).toString(),
          fontSize: "16px",
          fontWeight: "bold",
          className: 'marker-position',
        },
        icon: DEFAULT_IMAGE.STOP_ICON
      });
      this.stop_markers.push(marker);
      bounds.extend(marker.position);

      google.maps.event.addListener(marker, 'dragend', async (marker) => {
        this.stop_addresses[index].location = [marker.latLng.lat(), marker.latLng.lng()];
        this.getCountryFromLatLng(this.stop_addresses[index].location[0], this.stop_addresses[index].location[1]).then((result) => {
          this.stop_addresses_country[index] = result.country;
        }).catch((error) => {
          console.error('Error:', error);
        });
        let geocoder = new google.maps.Geocoder();
        let request = { latLng: new google.maps.LatLng(this.stop_addresses[index].location[0], this.stop_addresses[index].location[1]) };
        geocoder.geocode(request, (results, status) => {
          if (status == google.maps.GeocoderStatus.OK) {
            this.helper.ngZone.run(() => {
              this.stop_addresses[index].address = results[0].formatted_address;
              this.is_address_changed = true;
              this.matchCountryName();
              if (this.DirectionsRenderer) {
                this.DirectionsRenderer.setMap(null);
              }
              this.is_ride_now = true;
            })
          }
        });
      })

    });
    this.map.fitBounds(bounds);
  }

  //calculate distance and duration of address locations
  total_distance_duration() {
    let distance_sum = 0;
    let duration_sum = 0;
    this._distance.forEach(item => {
      distance_sum += item;
    });
    this.total_distance = distance_sum;
    this._duration.forEach(item => {
      duration_sum += item;
    });
    this.total_time = duration_sum;
    const time: any = (this.total_time / 60).toFixed(0);
    this.total_time_string = this.formatTime(time);
    return distance_sum && duration_sum;
  }

  //convert and show time for in fare estimate modal
  formatTime(total_time: number): string {
    if (total_time < 60) {
      return `<span class="text-large">${total_time}</span>` + `${this.helper.trans.instant('label-title.min')}`;
    } else if (total_time < 1440) {
      const hours = Math.floor(total_time / 60);
      const minutes = total_time % 60;
      return `<span class="text-large">${hours}</span> ${this.helper.trans.instant('label-title.hr')} <span class="text-large">${minutes}</span> ${this.helper.trans.instant('label-title.min')}`;
    } else {
      const days = Math.floor(total_time / 1440);
      const remainingMinutes = total_time % 1440;
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      return `<span class="text-large">${days}</span> ${this.helper.trans.instant('label-title.d')} <span class="text-large">${hours}</span> ${this.helper.trans.instant('label-title.hr')} <span class="text-large">${minutes}</span> ${this.helper.trans.instant('label-title.min')}`;
    }
  }

  //show country and address errors and calculate distance duration make route
  waypoints() {
    this.viewEstimateForm.get('roles').markAllAsTouched();
    if (!this.viewEstimateForm.value.pickup_address) {
      this.viewEstimateForm.markAllAsTouched();
      return;
    }
    if (!this.viewEstimateForm.value.dest_address && !this.destination_later) {
      this.viewEstimateForm.markAllAsTouched();
      return;
    }

    let isValid = true;
    if (this.pickup_address.address == '') {
      this.pickup_address.address = this._locationService._current_location.address;
    }
    if (!this.citytypes || this.destination_address.address == '' || this.pickup_address.address == '') {
      isValid = false;
    }
    if (this.viewEstimateForm.value.roles) {
      this.viewEstimateForm.value.roles.forEach((role) => {
        if (!role.role) {
          isValid = false;
        }
      })
    }
    if (this.destination_later) {
      isValid = true;
    }

    if (isValid) {
      const waypts: google.maps.DirectionsWaypoint[] = [];
      if (this.stop_addresses?.length > 0 && !this.destination_later) {
        for (const stopAddress of this.stop_addresses) {
          waypts.push({
            location: new google.maps.LatLng(stopAddress.location[0], stopAddress.location[1]),
            stopover: true,
          });
        }
      }

      if (this.pickup_address.country_name == '') {
        this.pickup_address.country_name = this._locationService._current_location.country_name;
      }
      if (this.pickup_address.country_name) {
        if (this.pickup_address.country_name != this.destination_address.country_name) {
          this.is_business = true;
        }
        if (this.stop_addresses_country.length > 0) {
          this.stop_addresses_country.forEach((country) => {
            if (this.pickup_address.country_name != country) {
              this.is_business = true;
            }
          })
        }
      }
      if (this.destination_address.country_name) {
        if (this.destination_address.country_name != this.pickup_address.country_name) {
          this.is_business = true;
        }
        if (this.stop_addresses_country.length > 0) {
          this.stop_addresses_country.forEach((country) => {
            if (this.destination_address.country_name != country) {
              this.is_business = true;
            }
          })
        }
      }
      if (this.stop_addresses_country.length > 0) {
        this.stop_addresses_country.forEach((country) => {
          if (country != this.pickup_address.country_name || country != this.destination_address.country_name) {
            this.is_business = true;
          }
        })
      }
      if (this.destination_later) {
        this.is_business = false;
      }
      if (this.is_business === true) {
        return;
      }

      let is_get_error = false;
      if(this.stop_addresses?.length <= 0 && this.pickup_location[0] == this.destination_address.latitude && this.pickup_location[1] == this.destination_address.longitude){
        is_get_error = true;
        this.same_location_error = true;
      }
      if (this.stop_addresses?.length > 0 && this.destination_address.latitude && this.destination_address.longitude ) {
        let matchFound = false;
        for (let i = 0; i < this.stop_addresses.length - 1; i++) {
          const locationKey1 = this.stop_addresses[i].location[0] + '-' + this.stop_addresses[i].location[1];
          const locationKey2 = this.stop_addresses[i + 1].location[0] + '-' + this.stop_addresses[i + 1].location[1];
          if (locationKey1 === locationKey2) {
            matchFound = true;
            break;
          }
        }
        if (matchFound) {
          is_get_error = true;
          this.same_stop_error = true;
        }
      }

      // to check if all entered locations are same
      if (this.stop_addresses?.length == 1 && this.pickup_location[0] == this.destination_address.latitude && this.pickup_location[1] == this.destination_address.longitude ) {
        const locationKey1 = this.stop_addresses[0].location[0] + '-' + this.stop_addresses[0].location[1];
        const pickupKey1 = this.pickup_location[0] + '-' + this.pickup_location[1];
        const destinationKey1 = this.destination_address.latitude + '-' + this.destination_address.longitude;
        if( locationKey1 === pickupKey1 && locationKey1 === destinationKey1){
          is_get_error = true;
          this.same_location_error = true;
        }
      }

      if (is_get_error) {
        return;
      }


      this.scheduleDate = null;
      this.scheduleTime = null;

      if (!this.destination_later) {
        const originLatLng = new google.maps.LatLng(this.pickup_location[0], this.pickup_location[1]);
        const destinationLatLng = new google.maps.LatLng(this.destination_address.latitude, this.destination_address.longitude);
        this.directionsService.route({
          origin: originLatLng,
          destination: destinationLatLng,
          waypoints: waypts,
          optimizeWaypoints: false,
          travelMode: google.maps.TravelMode.DRIVING,
        }).then((response) => {
          this.is_business = false;
          this.same_location_error = false;
          this.same_stop_error = false;
          this._distance = [];
          this._duration = [];

          this.DirectionsRenderer.setDirections(response);
          this.DirectionsRenderer.setMap(this.map);
          this.DirectionsRenderer.setOptions({ suppressMarkers: true });

          const route = response.routes[0];
          this.route_path = response;
          for (const leg of route.legs) {
            let route_distance = leg.distance!.value;
            let route_duration = leg.duration!.value;

            this._distance.push(route_distance);
            this._duration.push(route_duration);
          }
          this.is_address_changed = false;
          this.local_storage_boolean = false;
          localStorage.removeItem('tripData');
          this.total_distance_duration();
          if (this.selected_type == 1) {
            if (this.citytypes && this.citytypes.length > 0) {
              this.getFareEstimate(this.selected_index, this.EstimateTabType.Normal);
            } else if (this.pooltypes && this.pooltypes.length > 0) {
              this.getFareEstimate(this.pool_selected_index, this.EstimateTabType.RideShare);
            } else if (this.open_ride_type_list && this.open_ride_type_list.length > 0) {
              this.show_stop = false;
              this.getFareEstimate(this.selected_index, this.EstimateTabType.OpenRide);
            }
          }
          if (this.selected_type == 2 && this.open_ride_type_list && this.open_ride_type_list.length > 0) {
            this.show_stop = false;
            this.getFareEstimate(this.selected_index, this.EstimateTabType.OpenRide);
          }
          if (this.selected_ride_details?.pool_id && this.selected_type == 0) {
            if (this.pooltypes && this.pooltypes.length > 0) {
              this.getFareEstimate(this.pool_selected_index, this.EstimateTabType.RideShare);
            }
          }
        }).catch((e) => {
          let no_route = e.toString().split(":");
          let err_message = no_route[no_route.length - 1];
          this._notifierService.showNotification('error', `${err_message}`);
        });
      } else {
        const originLatLng = new google.maps.LatLng(this.pickup_location[0], this.pickup_location[1]);
        const destinationLatLng = new google.maps.LatLng(this.pickup_location[0], this.pickup_location[1]);
        this.directionsService.route({
          origin: originLatLng,
          destination: destinationLatLng,
          waypoints: waypts,
          optimizeWaypoints: false,
          travelMode: google.maps.TravelMode.DRIVING,
        }).then((response) => {
          this.is_business = false;
          this.same_location_error = false;
          this.same_stop_error = false;
          this._distance = [];
          this._duration = [];
          this.DirectionsRenderer.setOptions({ suppressMarkers: true });

          const route = response.routes[0];
          for (const leg of route.legs) {
            let route_distance = leg.distance!.value;
            let route_duration = leg.duration!.value;

            this._distance.push(route_distance);
            this._duration.push(route_duration);
          }
          this.is_address_changed = false;
          this.local_storage_boolean = false;
          localStorage.removeItem('tripData');
          this.total_distance_duration();
          if (this.selected_type == 1) {
            if (this.citytypes && this.citytypes.length > 0) {
              this.getFareEstimate(this.selected_index, this.EstimateTabType.Normal);
            } else if (this.pooltypes?.length > 0) {
              this.getFareEstimate(this.pool_selected_index, this.EstimateTabType.RideShare);
            }
          }
          if (this.selected_ride_details?.pool_id && this.selected_type == 0) {
            if (this.pooltypes && this.pooltypes.length > 0) {
              this.getFareEstimate(this.pool_selected_index, this.EstimateTabType.RideShare);
            }
          }
        }).catch((e) => {
          let no_route = e.toString().split(":");
          console.log(e);

          let err_message = no_route[no_route.length - 1];
          this._notifierService.showNotification('error', `${err_message}`);
        });
      }
    } else {
      if (this.pickup_address.address == '') {
        this.pickup_address.address = this._locationService._current_location.address;
      }
      if (this.destination_address.address == '') {
        this.viewEstimateForm.markAllAsTouched();
        return;
      }
      if (this.pickup_address.address == '') {
        this.viewEstimateForm.markAllAsTouched();
        return;
      }
    }
  }

  //get typelist to show
  get_vehicle_list() {
    if (this.pickup_address.country_code == '') {
      this.pickup_address.country_code = this._locationService._current_location.country_code
    }
    this.helper.ngZone.run(() => {
      let json: any = { token: 'token', user_id: null, country: this.change_country, latitude: this.pickup_location[0], longitude: this.pickup_location[1], country_code: this.pickup_address.country_code }
      if (this.helper.user_details) {
        json['user_id'] = this.helper.user_details._id;
        json['token'] = this.helper.user_details.server_token;
      }
      json.is_show_error_toast = false;
      json.is_show_success_toast = false;
      this._vehicleService.get_vehicles_list(json).then(res_data => {
        if (res_data.success) {
          if (res_data.length == 0) {
            this.is_business = false;
          }

          if (res_data.city_detail.timezone) {
            let date: Date = new Date();
            const newDate = new Date(date.toLocaleString("en-US", { timeZone: res_data.city_detail.timezone }));
            this.todayDate = newDate;
          }

          this.car_rental_list = [];
          this.open_ride_type_list = [];
          this.typelist = res_data;
          this.city_detail = res_data.city_detail;
          this.citytypes = res_data.citytypes;
          this.pooltypes = res_data.pooltypes;
          if (res_data.openridetypes) {
            this.open_ride_type_list = res_data.openridetypes;
          } else {
            this.open_ride_type_list = [];
          }
          if (this.open_ride_type_list?.length > 0) {
            this.open_ride_type_list.forEach((type) => {
              if (type.type_details.is_default_selected === true) {
                let idx = this.open_ride_type_list.indexOf(type);
                let element = this.open_ride_type_list.splice(idx, 1);
                this.open_ride_type_list.unshift(element[0]);
              }
            })
          }
          if (this.city_detail && this.city_detail.is_payment_mode_card == 1) {
            this.showContent('card')
          } else {
            this.showContent('cash')
          }

          if (this.citytypes) {
            if (this.citytypes?.length > 0) {
              this.citytypes.forEach((value) => {
                if (value.is_car_rental_business == 1 && value.car_rental_list.length > 0) {
                  this.car_rental_list.push(value)
                  if (value.type_details.is_default_selected === true) {
                    let idx = this.car_rental_list.indexOf(value);
                    let element = this.car_rental_list.splice(idx, 1);
                    this.car_rental_list.unshift(element[0]);
                  }
                }
              })
            } else {
              this.car_rental_list = [];
            }

            for (let i = 0; i < this.citytypes.length; i++) {
              if (this.citytypes[i].type_details.is_default_selected === true) {
                this.selected_index = i;
                let element = this.citytypes.splice(this.selected_index, 1);
                this.citytypes.unshift(element[0]);
                this.selected_index = 0;
              }
            }

            this.is_address_changed = true;
            if (this.local_storage_boolean) {
              this.waypoints();
            }
            if (this.DirectionsRenderer) {
              this.DirectionsRenderer.setMap(null);
            }
          } else {
            this.provider_markers.forEach((marker) => {
              marker.setMap(null);
            });
            this.is_ride_now = true;
          }
          if (this.pooltypes?.length > 0) {
            for (let i = 0; i < this.pooltypes.length; i++) {
              if (this.pooltypes[i].type_details.is_default_selected === true) {
                this.pool_selected_index = i;
                let element = this.pooltypes.splice(this.pool_selected_index, 1);
                this.pooltypes.unshift(element[0]);
                this.pool_selected_index = 0;
              }
            }
          } else {
            this.provider_markers.forEach((marker) => {
              marker.setMap(null);
            });
            this.is_ride_now = true;
          }
        } else {
          this.citytypes = null;
          this.pooltypes = null;
        }
      })
    });
  }

  //show provider markers in map
  show_providers(providers) {
    this.provider_markers.forEach((marker) => {
      marker.setMap(null);
    });
    this.provider_markers = [];
    providers.forEach((provider: any) => {
      let location = new google.maps.LatLng(provider.providerLocation[0], provider.providerLocation[1]);
      let marker = new google.maps.Marker({
        position: location,
        map: this.map,
        draggable: false,
        icon: DEFAULT_IMAGE.DRIVER_ICON
      });
      this.provider_markers.push(marker);
    });
  }

  //get near by providers for trip
  get_nearby_provider(service_type_id: any, is_ride_share = false) {
    if (this.helper.user_details) {
      let json: any = { service_type_id: service_type_id, latitude: this.pickup_location[0], longitude: this.pickup_location[1], type: 1, user_id: this.helper.user_details._id, is_ride_share: is_ride_share }

      if (is_ride_share && this.destination_address.latitude) {
        json['destination_latitude'] = this.destination_address.latitude;
        json['destination_longitude'] = this.destination_address.longitude;
      }

      if (this.is_field_mandatory_arr.length > 0) {
        this.is_ride_now = true;
        this._notifierService.showNotification('error', this.helper.trans.instant('validation-title.add-mandatory-documents'));
      }
      if (this.cardData.payment_gateway_type == PAYMENT_GATEWAY.paypal && !this.is_paypal_supported && this.payment_mode == 0) {
        this._notifierService.showNotification('error', this.helper.trans.instant('validation-title.paypal-not-supported'));
      }
      if (this.user_details.is_documents_expired) {
        this.is_ride_now = true;
        this.document_expired_error = true;
        this._notifierService.showNotification('error', this.helper.trans.instant('validation-title.add-expired-documents'));
      }

      this._vehicleService.getnearbyprovider(json).then(res_data => {
        if (res_data.success) {
          if (res_data.providers.length > 0) {
            this.show_providers(res_data.providers)
            this.is_ride_now = false;
          }
        } else {
          this.provider_markers.forEach((marker) => {
            marker.setMap(null);
          });
          this.is_ride_now = true;
        }
      })
    }
  }

  //calculate fare estimate price of the trip
  async getFareEstimate(i, estimateTabType: number) {
    this.tabNum = estimateTabType;
    this.scheduleTime = null;
    this.scheduleDate = null;
    if (!this.city_detail.is_payment_mode_cash) {
      this.showContent('card');
    }
    if (estimateTabType == this.EstimateTabType.Normal) {
      this.is_open_ride = false;
      this.get_nearby_provider(this.citytypes[i]._id)
      if (this.helper.user_details && this.destination_address.address == '' && !this.destination_later) {
        this.viewEstimateForm.markAllAsTouched();
        return;
      }
      this.selected_type = 1;
      this.selected_index = i;
      if (i > this.citytypes.length) {
        i = 1;
      }
      this.selected_ride_details = {
        selected_id: this.citytypes[i]._id,
        selected_url: this.citytypes[i].type_details.type_image_url,
        selected_car: this.citytypes[i].type_details.typename,
        max_space: this.citytypes[i].max_space,
        base_price_distance: this.citytypes[i].base_price_distance,
        price_for_total_time: this.citytypes[i].price_for_total_time,
        price_per_unit_distance: this.citytypes[i].price_per_unit_distance,
      }
      let is_multiple_stop = 0
      if (this.stop_addresses && this.stop_addresses.length > 0) {
        is_multiple_stop = 1
      }
      this.surge_multiplier = 1;
      let surge_response;
      if (this.destination_address.address) {
        surge_response = await this.caluSurge(i, 'normal')
      }
      if (!this.destination_later) {
        let json: any = { service_type_id: this.selected_ride_details.selected_id, time: this.total_time, distance: this.total_distance, pickup_latitude: this.pickup_location[0], pickup_longitude: this.pickup_location[1], destination_latitude: this.destination_address.latitude, destination_longitude: this.destination_address.longitude, surge_multiplier: surge_response.multiplier, is_surge_hours: surge_response.is_surge_hours, is_multiple_stop: is_multiple_stop }
        this._vehicleService.get_fare_estimate(json).then(res_data => {
          this.selected_ride_details.estimated_fare = res_data.estimated_fare;
          this.selected_ride_details.unit_set = res_data.unit_set;
          this.bidding_amount = this.selected_ride_details.estimated_fare;
          this.selected_ride_details.trip_type = res_data.trip_type;
          if (this.selected_ride_details.trip_type == this.TRIP_TYPE.TRIP_TYPE_NORMAL || this.selected_ride_details.trip_type == this.TRIP_TYPE.TRIP_TYPE_CITY) {
            this.selected_ride_details.cancellation_fee = this.citytypes[i].cancellation_fee;
            this.selected_ride_details.base_price = this.citytypes[i].base_price;
            this.selected_ride_details.tax = this.citytypes[i].tax;
          } else {
            this.selected_ride_details.base_price = null;
            this.selected_ride_details.cancellation_fee = null;
            this.selected_ride_details.tax = null;
          }
        })
      }
    } else if (estimateTabType == this.EstimateTabType.Rental) {
      this.is_open_ride = false;
      this.get_nearby_provider(this.car_rental_list[i]._id)
      if (this.helper.user_details && this.destination_address.address == '' && !this.destination_later) {
        this.viewEstimateForm.markAllAsTouched();
        return;
      }
      this.selected_ride_details.selected_id = this.car_rental_list[i]._id;
      this.rental_list = this.car_rental_list[i].car_rental_list;
    } else if (estimateTabType == this.EstimateTabType.RideShare) {
      this.is_open_ride = false;
      this.get_nearby_provider(this.pooltypes[i]._id, true)
      if (this.helper.user_details && this.destination_address.address == '') {
        this.viewEstimateForm.markAllAsTouched();
        return;
      } else if (!this.helper.user_details && this.destination_address.address == '') {
        return;
      }
      this.selected_type = 0;
      this.pool_selected_index = i;
      if (i > this.pooltypes.length) {
        i = 1;
      }
      this.selected_ride_details = {
        pool_id: this.pooltypes[i]._id,
        selected_url: this.pooltypes[i].type_details.type_image_url,
        selected_car: this.pooltypes[i].type_details.typename,
        max_space: this.pooltypes[i].max_space,
        base_price_distance: this.pooltypes[i].base_price_distance,
        price_for_total_time: this.pooltypes[i].price_for_total_time,
        price_per_unit_distance: this.pooltypes[i].price_per_unit_distance,
      }
      this.surge_multiplier = 1
      let res = await this.caluSurge(i, 'pool')
      let json: any = { service_type_id: this.selected_ride_details.pool_id, time: this.total_time, distance: this.total_distance, pickup_latitude: this.pickup_location[0], pickup_longitude: this.pickup_location[1], destination_latitude: this.destination_address.latitude, destination_longitude: this.destination_address.longitude, surge_multiplier: res.multiplier, is_surge_hours: res.is_surge_hours }
      this._vehicleService.get_fare_estimate(json).then(res_data => {
        this.selected_ride_details.estimated_fare = res_data.estimated_fare;
        this.selected_ride_details.unit_set = res_data.unit_set;
        this.selected_ride_details.trip_type = res_data.trip_type;

        if (this.selected_ride_details.trip_type == this.TRIP_TYPE.TRIP_TYPE_NORMAL || this.selected_ride_details.trip_type == this.TRIP_TYPE.TRIP_TYPE_CITY) {
          this.selected_ride_details.cancellation_fee = this.pooltypes[i].cancellation_fee;
          this.selected_ride_details.base_price = this.pooltypes[i].base_price;
          this.selected_ride_details.tax = this.pooltypes[i].tax;
        } else {
          this.selected_ride_details.base_price = null;
          this.selected_ride_details.cancellation_fee = null;
          this.selected_ride_details.tax = null;
        }
      })
    } else if (estimateTabType == this.EstimateTabType.OpenRide) {
      if (this.destination_address.address) {
        await this.caluSurge(i, 'openride')
      }
      this.selected_type = 2;
      this.selected_index = i;
      if (i > this.open_ride_type_list.length) {
        i = 1;
      }
      this.is_open_ride = true;
      if (this.helper.user_details && this.destination_address.address == '' && !this.destination_later) {
        this.viewEstimateForm.markAllAsTouched();
        return;
      }
      this.showContent('cash');
      if (this.cardData.is_use_wallet == 1) {
        this.walletStatus();
      }
      if (this.selected_ride_details?.selected_id) {
        this.selected_ride_details.selected_id = this.open_ride_type_list[i]._id;
      } else {
        this.selected_ride_details = {
          selected_id: this.open_ride_type_list[i]._id
        }
      }
    }
  }

  async caluSurge(i, type) {
    let surge_multiplier: number;
    let surge_time: any;
    let rich_area_surge_multiplier: any;
    let schedule_time;
    let now: any;
    let now1: any;
    let week_day;
    let is_surge_hours;
    let multiplier;

    if (type == 'normal') {
      surge_multiplier = this.citytypes[i].surge_multiplier
      surge_time = this.citytypes[i].surge_hours
      rich_area_surge_multiplier = this.citytypes[i].rich_area_surge_multiplier
    }
    if (type == 'pool') {
      surge_multiplier = this.pooltypes[i].surge_multiplier
      surge_time = this.pooltypes[i].surge_hours
      rich_area_surge_multiplier = this.pooltypes[i].rich_area_surge_multiplier
    }
    if (type == 'openride') {
      surge_multiplier = this.open_ride_type_list[i].surge_multiplier
      surge_time = this.open_ride_type_list[i].surge_hours
      rich_area_surge_multiplier = this.open_ride_type_list[i].rich_area_surge_multiplier
    }
    let response = await this._vehicleService.get_server_time()

    if (this.scheduleDate && this.scheduleTime) {
      let d = new Date(this.scheduleDate);
      let array: any = this.scheduleTime.split(':')
      d = new Date(d.setHours(array[0], array[1]))
      this.start_time = d.getTime();
      schedule_time = new Date(response.server_date).getTime() + Number(this.start_time - new Date().getTime())
      now1 = new Date(schedule_time).toLocaleString("en-US", { timeZone: this.city_detail.timezone })
      now1 = new Date(now1)
      week_day = now1.getDay();
      is_surge_hours = 0;
      multiplier = 1;
    } else {
      now = response.server_date;
      now1 = new Date(now).toLocaleString("en-US", { timeZone: this.city_detail.timezone })
      now1 = new Date(now1)
      week_day = now1.getDay();
      is_surge_hours = 0;
      multiplier = 1;
    }

    if (surge_multiplier == 1) {
      if (surge_time[week_day]?.is_surge == 1) {
        let current_date = response.server_date;
        if (this.scheduleDate && this.scheduleTime) {
          current_date = schedule_time
        }
        current_date = new Date(current_date).toLocaleString("en-US", { timeZone: this.city_detail.timezone })
        current_date = new Date(current_date)
        surge_time[week_day].day_time.forEach(function (day_time: any) {
          let day_time_multiplier = day_time.multiplier;
          let start_time = day_time.start_time;
          let end_time = day_time.end_time;
          start_time = start_time.split(':');
          end_time = end_time.split(':');
          let start_date_time = current_date.setHours(start_time[0], start_time[1], 0, 0);
          start_date_time = new Date(start_date_time);
          let end_date_time = current_date.setHours(end_time[0], end_time[1], 0, 0);
          end_date_time = new Date(end_date_time);
          if (now1.getTime() > start_date_time.getTime() && now1.getTime() < end_date_time.getTime()) {
            is_surge_hours = 1;
            multiplier = day_time_multiplier;
          }
        })
      }
    }
    if (multiplier < rich_area_surge_multiplier) {
      is_surge_hours = 1;
      multiplier = rich_area_surge_multiplier;
    }
    this.surge_multiplier = multiplier;
    this.is_surge_hours = is_surge_hours;
    return {
      is_surge_hours, multiplier
    }
  }

  get_package_details(i) {
    this.package_id = this.rental_list[i]._id;
  }

  hide_stop(tab_no: number) {
    this.show_stop = false;
    if (tab_no == this.EstimateTabType.Rental) {
      this.is_rental = true;
      this.is_ride_share = false;
    } else if (tab_no == this.EstimateTabType.RideShare) {
      this.is_ride_share = true;
      this.is_rental = false;
    } else if (tab_no == this.EstimateTabType.OpenRide) {
      this.is_ride_share = false;
      this.is_rental = false;
    }
  }

  show_stops() {
    this.show_stop = true;
  }

  _initForms() {
    this.viewEstimateForm = this.fb.group({
      pickup_address: [''],
      dest_address: [''],
      roles: this.fb.array([]),
      address: new UntypedFormControl(null),
      latitude: new UntypedFormControl(null),
      longitude: new UntypedFormControl(null)
    });
  }

  get rolesFieldAsFormArray(): any {
    return this.viewEstimateForm.get('roles') as UntypedFormArray;
  }

  role(): any {
    return this.fb.group({
      role: this.fb.control('', [Validators.required]),
    });
  }

  //add stop
  addStop(a) {
    let matchFound = false;
    for (let i = 0; i < this.stop_addresses.length - 1; i++) {
      const locationKey1 = this.stop_addresses[i].location[0] + '-' + this.stop_addresses[i].location[1];
      const locationKey2 = this.stop_addresses[i + 1].location[0] + '-' + this.stop_addresses[i + 1].location[1];
      if (locationKey1 === locationKey2) {
        matchFound = true;
        break;
      }
    }
    if (matchFound) {
      this.same_stop_error = true;
      this.cdr.detectChanges();
      return;
    }
    this.selected_address_index = -1;
    this.same_location_error = false;
    if (this.pickup_address.address == '') {
      this.pickup_address.address = this._locationService._current_location.address;
    }
    if (a == 0 || this.stop_addresses[a - 1]?.address) {
      if (a > 0 && this.pickup_address.address == '' && this.destination_address.address == '' && this.stop_addresses[a - 1].address == '') {

        return;
      }
      this.is_address_changed = true;
      if (this.DirectionsRenderer) {
        this.DirectionsRenderer.setMap(null);
      }
      this.added_stops = a + 1;
      this.rolesFieldAsFormArray.push(this.role());
      setTimeout(() => {
        this.initialize(a);
      }, 1000);
    } else {
      this.viewEstimateForm.get('roles').markAllAsTouched();
    }
    if (this.rolesFieldAsFormArray.controls.length > 0) {
      this.rental_share = false;
    }
  }

  //remove stop
  removeStop(i: number): void {
    this.same_stop_error = false;
    this.cdr.detectChanges();
    this.rolesFieldAsFormArray.removeAt(i);
    this.added_stops = this.added_stops - 1;
    if (this.rolesFieldAsFormArray.controls.length == 0) {
      this.rental_share = true;
    }
    this.stop_addresses_country.splice(i, 1);
    this.stop_addresses.splice(i, 1);
    if (this.stop_markers[i]) {
      this.stop_markers[i].setMap(null);
    }
    this.stop_markers.splice(i, 1);
    this._distance.splice(i, 1);
    this._duration.splice(i, 1);
    this.is_address_changed = true;
    this.is_business = false;
    if (this.DirectionsRenderer) {
      this.DirectionsRenderer.setMap(null);
    }
    this._initAutoComplete();
    this._initDestintionAutoComplete();
  }

  //on corporate checkbox check or uncheck
  corporate_checked(e) {
    if (e.currentTarget.checked && this.helper.user_details.corporate_id) {
      this.corporate_id = this.helper.user_details.corporate_id;
    } else {
      this.corporate_id = null;
    }
  }

  //create trip
  async rideNow(bool) {
    if (this.typelist?.is_allow_trip_bidding && this.typelist.is_user_can_set_bid_price && this.is_bidding) {
      let min_bidding_amount: any = ((this.selected_ride_details.estimated_fare) - (this.selected_ride_details.estimated_fare) * (this.typelist.user_min_bidding_limit / 100)).toFixed(this.helper.to_fixed_number);
      if (this.bidding_amount < min_bidding_amount) {
        this._notifierService.showNotification('error', this.helper.trans.instant('validation-title.please-enter-valid-bid-price'));
        return;
      }
    }
    let res = null
    if (this.scheduleDate && this.scheduleTime) {
      let d_date: Date = new Date(this.scheduleDate);
      let d = new Date(d_date.toLocaleString("en-US", { timeZone: this.city_detail.timezone }));
      let array: any = this.scheduleTime.split(':')
      d = new Date(d.setHours(array[0], array[1]))
      d = new Date(d.toLocaleString("en-US", { timeZone: this.city_detail.timezone }));
      let date: Date = new Date();
      const newDate = new Date(date.toLocaleString("en-US", { timeZone: this.city_detail.timezone }));
      let now = newDate.getTime();
      this.time_for_schedule = d.getTime() - now;
    }

    let is_multiple_stop = 0
    if (this.stop_addresses && this.stop_addresses.length > 0) {
      is_multiple_stop = 1
    }

    let service_type: string = '';
    switch (this.tabNum) {
      case this.EstimateTabType.Normal:
        service_type = this.selected_ride_details.selected_id;
        break;
      case this.EstimateTabType.Rental:
        service_type = this.selected_ride_details.selected_id;
        this.selected_ride_details.trip_type = this.TRIP_TYPE.TRIP_TYPE_CAR_RENTAL;
        break;
      case this.EstimateTabType.RideShare:
        service_type = this.selected_ride_details.pool_id;
        break;
      case this.EstimateTabType.OpenRide:
        service_type = this.selected_ride_details.selected_id;
        break;
    }

    if (this.pickup_address.address == '') {
      this.pickup_address.address = this._locationService._current_location.address;
    }

    if (this.time_for_schedule) {
      this.selected_ride_details.trip_type = this.TRIP_TYPE.TRIP_TYPE_SCHEDULE;
    }

    let json: any;

    if (!this.destination_later) {
      json = {
        car_rental_id: null, destination_address: this.destination_address.address, d_latitude: this.destination_address.latitude, d_longitude: this.destination_address.longitude, user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, latitude: this.pickup_location[0], longitude: this.pickup_location[1], source_address: this.pickup_address.address, service_type_id: service_type, timezone: this.city_detail.timezone, fixed_price: this.selected_ride_details.estimated_fare, is_fixed_fare: bool, payment_mode: this.payment_mode, destination_addresses: null, start_time: null, corporate_id: null, trip_type: this.selected_ride_details.trip_type, is_surge_hours: this.is_surge_hours, surge_multiplier: this.surge_multiplier, accessibility: [], received_trip_from_gender: [], provider_language: [], is_multiple_stop: is_multiple_stop, promo_id: null, estimate_time: this.total_time, estimate_distance: this.total_distance
      }
    } else {
      json = {
        car_rental_id: null, user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, latitude: this.pickup_location[0], longitude: this.pickup_location[1], source_address: this.pickup_address.address, service_type_id: service_type, timezone: this.city_detail.timezone, fixed_price: this.selected_ride_details.estimated_fare, is_fixed_fare: bool, payment_mode: this.payment_mode, start_time: null, corporate_id: null, trip_type: this.selected_ride_details.trip_type, is_surge_hours: this.is_surge_hours, surge_multiplier: this.surge_multiplier, accessibility: [], received_trip_from_gender: [], provider_language: [], is_multiple_stop: is_multiple_stop, promo_id: null, estimate_time: this.total_time, estimate_distance: this.total_distance
      }
    }
    if (this.route_path) {
      json['googlePickUpLocationToDestinationLocation'] = JSON.stringify(this.route_path);
    }

    if (bool === false) {
      json['fixed_price'] = 0;
    }

    if (this.package_id) {
      json['car_rental_id'] = this.package_id;
    }
    if (this.stop_addresses && this.stop_addresses.length > 0 && !this.destination_later) {
      json['destination_addresses'] = this.stop_addresses;
    }
    if (this.time_for_schedule) {
      json['start_time'] = this.time_for_schedule;
    }
    if (this.corporate_id) {
      json['corporate_id'] = this.helper.user_details.corporate_id;
      json['trip_type'] = this.TRIP_TYPE.TRIP_TYPE_CORPORATE;
    }
    if (this.promoData) {
      json['promo_id'] = this.promo_id;
    }
    if (this.destination_later) {
      json['is_fixed_fare'] = false;
    }
    if (this.is_bidding === true) {
      json['is_trip_bidding'] = true;
      json['is_user_can_set_bid_price'] = true;
      json['bid_price'] = this.bidding_amount;
    }

    this._createTripService.create_Trip(json).then(response => {
      if (response.success) {
        localStorage.removeItem('tripData');
        if (this.time_for_schedule) {
          const url = "/app/future-requests?future_history_type=" + this.helper.HISTORY_TYPE.NORMAL;
          this.helper._route.navigateByUrl(url)
        } else {
          setTimeout(() => {
            this.provider_markers.forEach((marker) => {
              marker.setMap(null);
            });
            this.ngOnInit()
          }, 500);
        }
      }
    });
    if (!this.package_id) {
      this.CreateTripModalclose();
    }
  }

  //wallet option on or off
  walletStatus() {
    if (this.cardData.is_use_wallet == 0) {
      this.is_use_wallet = 1;
    }
    else {
      this.is_use_wallet = 0;
    }
    let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, is_use_wallet: this.is_use_wallet }
    this._paymentService.wallet_status(json).then(response => {
      if (response.success === true) {
        this.is_use_wallet = response.data.is_use_wallet;
        this.fetchCardList();
      }
    });
  }

  cancel_Trip_Modal(): void {
    this._createTripService.get_cancellation_reason({ user_type: 1, lang: this.helper.selectedLang }).then((res) => {
      let CANCEL_REASON = res.reasons;
      this.cancellation_reasons_list = CANCEL_REASON;
      this.cancelTripmodal = true;
    })
  }

  onSelectReason(event) {
    this.cancellation_type = event.target.value;
    if (event.target.value !== "Other") {
      this.cancellation_reason = event.target.value;
    } else {
      this.cancellation_reason = '';
    }
  }

  user_cancle_trip() {
    if (this.tripdetail.openride) {
      const user_trip_id = this.tripdetail.user_details.find((x) => x.user_id == this.helper.user_details._id);
      let json = {
        user_id: this.helper.user_details._id,
        token: this.helper.user_details.server_token,
        open_ride_id: this.tripdetail._id,
        cancel_reason: this.cancellation_reason,
      };
      this._createTripService.openRideCancleTrip(json).then(response => {
        if (response.success) {
          this.cancelTripmodal = false;
          this.ngOnInit();
          this.onCancelTripmodal = true;
        }
      });
    } else {
      let json = {
        cancel_reason: this.cancellation_reason,
        token: this.helper.user_details.server_token,
        user_id: this.helper.user_details._id,
        trip_id: this.tripdetail._id
      }
      this.cancelTripmodal = false;
      this._createTripService.cancle_Trip(json).then(response => {
        if (response.success) {
          this.cancelTripmodal = false;
          this.ngOnInit();
        }
      });
    }
  }

  cancletrip() {
    if (this.tripdetail.is_provider_accepted == 1) {
      this.cancel_Trip_Modal();
    } else {
      this.confirmModelRef = this.modalService.show(this.confirmationTemplate, this.cancelModelConfig);
    }
  }

  confirmCancelTrip() {
    let json = {
      user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, trip_id: this.tripdetail._id
    }
    this._createTripService.cancle_Trip(json).then(response => {
      if (response.success) {
        this.confirmationModalClose();
        this.ngOnInit()
      }
    });
  }

  confirmationModalClose() {
    this.confirmModelRef.hide();
  }

  //pay again if payment failed
  async payAgain(first_time_failed) {
    if (first_time_failed) {
      let payment_json: any = { use_id: this.helper.user_details._id, token: this.helper.user_details.server_token }
      let response: any = await this._paymentService.change_payment_gateway_type(payment_json);
      if (response.success) {
        this.country_payment_gateway_type = response.response_data.payment_gateway_type;
        this.tripdetail.payment_gateway_type = response.response_data.payment_gateway_type;
      }
    }

    if (this.tripdetail?.payment_gateway_type == PAYMENT_GATEWAY.payu) {
      let host = `${window.location}`;
      let json: any = {
        user_id: this.helper.user_details._id,
        token: this.helper.user_details.server_token,
        trip_id: this.tripdetail._id,
        payment_gateway_type: this.tripdetail?.payment_gateway_type,
        type: 10,
        is_new: host,
      };
      if (first_time_failed) {
        json['is_for_retry'] = true;
      }
      this._paymentService.get_payment_intent_wallet(json).then((response) => {
        this.first_time_failed = true;
        let template = document.getElementById('Payu');
        template.innerHTML = response.data.html_form;
        document.body.appendChild(template);
        (<HTMLFormElement>document.getElementById("myForm")).submit();
      })

    } else if (this.tripdetail?.payment_gateway_type == PAYMENT_GATEWAY.paytabs) {
      let host = `${window.location}`
      let json: any = {
        is_trip: true,
        user_id: this.helper.user_details._id,
        token: this.helper.user_details.server_token,
        trip_id: this.tripdetail._id,
        payment_gateway_type: this.tripdetail?.payment_gateway_type,
        type: 10,
        is_new: host,
      };
      if (first_time_failed) {
        json['is_for_retry'] = true;
      }
      this._paymentService.get_stripe_payment_intent_wallet(json).then((response: any) => {
        this.first_time_failed = true;
        if (response.success) {
          window.open(response.authorization_url, '_self');
        } else {
          this._notifierService.showNotification('error', response.message)
        }
      })
    } else if (this.tripdetail?.payment_gateway_type == PAYMENT_GATEWAY.razorpay) {
      let host = `${window.location}`
      let json: any = { is_trip: true, user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, trip_id: this.tripdetail._id, payment_gateway_type: this.tripdetail?.payment_gateway_type, type: 10, is_new: host }
      if (first_time_failed) {
        json['is_for_retry'] = true;
      }
      this._paymentService.get_stripe_payment_intent_wallet(json).then((response: any) => {
        this.first_time_failed = true;
        if (response.success) {
          new Razorpay(response.options).open();
        }
      })
    } else if (this.tripdetail?.payment_gateway_type == PAYMENT_GATEWAY.paystack){
      const idx = this.cardData.card.findIndex(_c => _c.is_default);
      let card_id = this.cardData.card[idx]?._id;
      let json: any = {
        card_id: card_id,
        trip_id: this.tripdetail._id,
        user_id: this.helper.user_details._id,
        token: this.helper.user_details.server_token,
        payment_gateway_type: this.tripdetail?.payment_gateway_type,
        type: 10
      };
      if (first_time_failed) {
        json['is_for_retry'] = true;
      }
      this._paymentService.get_payment_intent_wallet(json).then((response) => {
        this.first_time_failed = true;
        if (response.success) {
          this.cardPaymentFailModal = false;
          setTimeout(() => {
            this.ngOnInit()
          }, 500);
        }
        if (!response.success && response.data) {
          this.paystack_status = response.data.required_param;
          if (response.data.required_param) {
            setTimeout(() => {
              this.paystackPinmodal = true;
            }, 1000);
          }
          this.pin_data = response.data;
        }
      })
    } else {
      // for stripe or default payment gateway (Stripe)
      let json: any = {
        user_id: this.helper.user_details._id,
        token: this.helper.user_details.server_token,
        payment_gateway_type: this.tripdetail?.payment_gateway_type,
        trip_id: this.tripdetail._id,
        type: 10
      };
      if (first_time_failed) {
        json['is_for_retry'] = true;
      }
      this._paymentService.get_stripe_payment_intent_wallet(json).then((response: any) => {
        this.first_time_failed = true;
        if (response.success) {
          if (response.message == 109) {
            this._notifierService.showNotification('success', this.helper.trans.instant('success-code.' + response.message));
            this.cardPaymentFailModal = false;
          } else {
            this.cardPaymentWaitingModal = true
            this.cardPaymentFailModal = false;
            stripe.confirmCardPayment(response.client_secret, { payment_method: response.payment_method }).then((result: any) => {
              this.cardPaymentWaitingModal = false;

              if (result.paymentIntent) {
                let json: any = {
                  user_id: this.helper.user_details._id,
                  token: this.helper.user_details.server_token,
                  payment_gateway_type: this.tripdetail?.payment_gateway_type,
                  payment_intent_id: result.paymentIntent.id,
                  trip_id: this.tripdetail._id,
                  type: 10,
                };
                this._paymentService.pay_stripe_intent_payment(json).then((is_added) => {
                    if (is_added) {
                      this.cardPaymentFailModal = false;
                    }
                  });
              } else {
                this._notifierService.showNotification('error', result.error.message);
              }
            });
          }
        } else {
          this._notifierService.showNotification('error', response.error);
        }
      }).catch(error => {
        this.first_time_failed = true;
        this._notifierService.showNotification('error', error);
      })
    }
  }

  sendpin() {
    // unused code const idx = this.cardData.card.findIndex(_c => _c.is_default);
    let json = { otp: this.pinForm.value.otp, trip_id: this.tripdetail._id, reference: this.pin_data.reference, user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, payment_gateway_type: this.cardData.payment_gateway_type, required_param: this.pin_data.required_param, pin: this.pinForm.value.pin, phone: this.pinForm.value.phone_number, type: 10 }
    this._paymentService.send_paystack_required_detail(json).then(response => {
      if (response.success) {
        this.paystackPinmodal = false;
        this.cardPaymentFailModal = false;
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

  showinvoice() {
    let history_type: number;
    if (this.tripdetail.openride) {
      history_type = this.helper.HISTORY_TYPE.OPEN_RIDE;
    } else {
      history_type = this.helper.HISTORY_TYPE.NORMAL;
    }
    this.historyModal.show(this.tripdetail._id, 2, history_type);
  }

  //get home and work address
  get_home_work_adress() {
    let json: any = { token: this.helper.user_details.server_token, user_id: this.helper.user_details._id };
    this._commonService.get_address(json).then(is_success => {
      if (is_success) {
        this.home_work_user_address.home_Address = is_success.user_address.home_address
        this.home_work_user_address.home_Address_location = is_success.user_address.home_location;
        this.home_work_user_address.work_Address = is_success.user_address.work_address
        this.home_work_user_address.work_Address_location = is_success.user_address.work_location;
        this.home_work_user_address.user_address = is_success.user_address
      }
    })
  }

  //get country from lat lng
  getCountryFromLatLng(latitude: number, longitude: number): Promise<{ country: string, countryCode: string }> {
    const geocoder = new google.maps.Geocoder();
    const latLng = new google.maps.LatLng(latitude, longitude);

    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            for (const address_component of results[0].address_components) {
              const addressType = address_component.types[0];
              if (addressType === 'country') {
                const countryName = address_component.long_name;
                const countryCode = address_component.short_name;
                resolve({ country: countryName, countryCode: countryCode });
                return;
              }
            }
            reject(new Error('No country found.'));
          } else {
            reject(new Error('No results found.'));
          }
        } else {
          reject(new Error('Geocoder failed due to: ' + status));
        }
      });
    });
  }

  getAdress(number) {
    this.isDistDropOpended = false;
    this.isDropOpened = false;
    this.setMap(true);
    this.destination_later = false;
    this.added_stops = 0;
    if (number === 1) {
      this.home_work_address_condition.is_pickup_add = true;
      this.home_work_address_condition.is_home_address = true;
      this.home_work_address_condition.is_work_address = false;
      this.pickup_address.address = this.home_work_user_address.home_Address;
    }
    if (number === 2) {
      this.home_work_address_condition.is_pickup_add = true;
      this.home_work_address_condition.is_home_address = false;
      this.home_work_address_condition.is_work_address = true;
      this.pickup_address.address = this.home_work_user_address.work_Address;
    }
    if (number === 3) {
      this.home_work_address_condition.is_pickup_add = false;
      this.home_work_address_condition.is_home_address = true;
      this.home_work_address_condition.is_work_address = false;
      this.destination_address.address = this.home_work_user_address.home_Address;
    }
    if (number === 4) {
      this.home_work_address_condition.is_pickup_add = false;
      this.home_work_address_condition.is_home_address = false;
      this.home_work_address_condition.is_work_address = true;
      this.destination_address.address = this.home_work_user_address.work_Address;
    }
    this.is_business = false;

    let latitude;
    let longitude;
    if (number === 1 || number === 3) {
      latitude = this.home_work_user_address.home_Address_location[0];
      longitude = this.home_work_user_address.home_Address_location[1];
    } else {
      latitude = this.home_work_user_address.work_Address_location[0];
      longitude = this.home_work_user_address.work_Address_location[1];
    }

    this.getCountryFromLatLng(latitude, longitude).then((result) => {
      if (number == 1 || number == 2) {
        this.pickup_address.country_name = result.country;
        this.pickup_address.country_code = result.countryCode;
        this.setMap(true);
        this.get_vehicle_list();
      } else {
        this.destination_address.country_name = result.country;
        this.destination_address.country_code = result.countryCode;
        this.setMap(true);
      }
    }).catch((error) => {
      console.error('Error:', error);
    });
  }

  isDropOpen(num) {
    if (num == 1) {
      this.isDistDropOpended = false;
      this.isDropOpened = !this.isDropOpened;
    }
    if (num == 2) {
      this.isDropOpened = false;
      this.isDistDropOpended = !this.isDistDropOpended;
    }
  }

  changePaymentModeModel() {
    if (this.tripdetail.payment_mode == 0) {
      this.showContent('card')
    }
    this.is_changePaymentMode = true;
  }

  //when change payment mode of the running trip
  changePaymentMode(promo_removed = false) {
    if (!promo_removed) {
      let response = this.checkPromoUsed();
      if (!response) {
        return false;
      }
    } else {
      this.closePromoWarningModal();
    }
    let json = { "trip_id": this.tripdetail._id, "payment_type": this.payment_mode, "user_id": this.helper.user_details._id, "token": this.helper.user_details.server_token }
    this._createTripService.userchangepaymenttype(json).then(response => {
      if (response.success) {
        this.is_changePaymentMode = false;
      }
    });
  }

  //open destination address enter modal
  open_destination_address(destination_address) {
    let json = { "address": destination_address, "latitude": this.tripdetail.destinationLocation[0], "longitude": this.tripdetail.destinationLocation[1], map_pin: DEFAULT_IMAGE.DESTINATION_ICON }
    this.registerAddress.show(json, true);
  }

  //change destination address of the running trip
  async change_destination_address(event) {
    this.directionsService = new google.maps.DirectionsService();
    this.DirectionsRenderer = new google.maps.DirectionsRenderer();
    const waypts: google.maps.DirectionsWaypoint[] = [];
    const originLatLng = new google.maps.LatLng(this.tripdetail.sourceLocation[0], this.tripdetail.sourceLocation[1]);
    const destinationLatLng = new google.maps.LatLng(event.latitude, event.longitude);
    console.log(this.directionsService);
    
    await this.directionsService.route({
      origin: originLatLng,
      destination: destinationLatLng,
      waypoints: waypts,
      optimizeWaypoints: false,
      travelMode: google.maps.TravelMode.DRIVING,
    }).then((response) => {
      
      this.is_business = false;
      this.same_location_error = false;
      this.same_stop_error = false;
      this._distance = [];
      this._duration = [];

      const route = response.routes[0];
      this.route_path = response;
      
      for (const leg of route.legs) {
        let route_distance = leg.distance!.value;
        let route_duration = leg.duration!.value;

        this._distance.push(route_distance);
        this._duration.push(route_duration);
      }
      this.is_address_changed = false;
      this.local_storage_boolean = false;
      localStorage.removeItem('tripData');
      this.total_distance_duration();
      console.log(this.route_path);
      
    }).catch((e) => {
      let no_route = e.toString().split(":");
      let err_message = no_route[no_route.length - 1];
      this._notifierService.showNotification('error', `${err_message}`);
    });
    let json = { "trip_id": this.tripdetail._id, "destination_address": event.address, "d_latitude": event.latitude, "d_longitude": event.longitude, "user_id": this.helper.user_details._id, "token": this.helper.user_details.server_token }
    this._createTripService.usersetdestination(json).then(response => {
      if (response.success) {
        this.tripdetail.destination_addresses = event.address
        this.tripdetail.destination_location = [event.latitude, event.longitude]
        
        let params = { trip_id : this.tripdetail._id , googlePathStartLocationToPickUpLocation : "" , googlePickUpLocationToDestinationLocation: JSON.stringify(this.route_path)}
        this._createTripService.setGooglePath(params).then((res) => {
          
        })
      }
    });
  }

  //chat modal open
  chatModal(modal: TemplateRef<any>): void {
    this.modalRef3 = this.modalService.show(modal, this.config);
    setTimeout(() => {
      let comment = document.getElementById("chatbox");
      this.scrolltop = comment.scrollHeight;
    }, 100);
    this.chatModalOpen = true;
    this.onReadMessage(true)
  }

  splitPaymentModal(modal: TemplateRef<any>): void {
    this.splitModal = this.modalService.show(modal, this.config);
  }

  //chat modal close
  closeChat() {
    this.modalRef3.hide();
    this.chatModalOpen = false;
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
      this._chatService.clearSubscription();
    }
    setTimeout(() => {
      this.scrolltop = 0;
    }, 500);
  }

  showNotification(message: string, name: string): void {
    if (Notification.permission === 'granted') {
       let notifications = new Notification(name ?? 'New Message', {
        body: message, 
        icon: this.IMAGE_URL + 'web_images/user_logo.png?' + this.helper.randomQueryParam
      }); 
      console.log(notifications);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
         let notifications = new Notification(name ?? 'New Message', {
            body: message
          }); 
          console.log(notifications);
        }
      }); 
    }
  }

  // Add a variable to track the last unread message
  private lastUnreadMessage: any;

  // get chats and show dot on unread message
  onReadMessage(is_read) {
    this._chatService.readChat(this.tripdetail._id, is_read, this.helper.user_details._id);
    this.chatSubscription = this._chatService._chatObservable.subscribe(data => {
      if (data) {
        setTimeout(() => {
          let comment = document.getElementById("chatbox");
          this.scrolltop = comment?.scrollHeight;
        }, 100);

        let chats = [];
        let latestUnreadMessage = null;

        Object.keys(data).forEach((element: any) => {
          if (element == this.helper.user_details._id) {
            let newObject = data[element];

            Object.keys(newObject).forEach((ele: any) => {
              chats.push(newObject[ele]);
              if (newObject[ele].type === 11) {
                this.is_message = !newObject[ele].is_read;
                if (this.is_message === true && this.chatModalOpen === false) {
                  let message = document.getElementById("is_message")
                  message.classList.add("is-message")
                } else {
                  let message = document.getElementById("is_message")
                  message.classList.remove("is-message")
                }
              }
              if (newObject[ele].type === 11 && !newObject[ele].is_read) {
                // Check if it's the latest unread message
                if (!latestUnreadMessage || newObject[ele].time > latestUnreadMessage.time) {
                  latestUnreadMessage = newObject[ele];
                }
              }
            });
          }
        });

        this.chats = chats;
        // Show notification only for the latest unread message
        if (latestUnreadMessage && this.chatModalOpen === false) {
          // Check if the message has changed since the last check
          if (!this.lastUnreadMessage || latestUnreadMessage.id !== this.lastUnreadMessage.id) {
            const provider_name: string = this.provider?.first_name + ' ' + this.provider?.last_name;
            this.showNotification(latestUnreadMessage.message, provider_name);
            // Update the last unread message
            this.lastUnreadMessage = latestUnreadMessage;
            // Add the class to the message element
            let message = document.getElementById("is_message");
            message?.classList.add("is-message");
          }
        } else {
          let message = document.getElementById("is_message");
          message?.classList.remove("is-message");
        }
      } else {
        this.chats = [];
      }
    });
  }

  //on send message
  onSendMessage() {
    let input = document.getElementById("chat_input") as HTMLInputElement;
    if (input) {
      input.value = ""
    }

    if (this.message.trim() === '') {
      return
    }
    this._chatService.sendMessage(this.tripdetail._id, 1, this.helper.user_details._id, this.message);
    let name: string = this.helper.user_details.first_name + ' ' + this.helper.user_details.last_name;
    let title: string = name ?? "Message";
    this._chatService.sendPushNotification(this.provider.device_token, title, this.message, this.user_setting_details.android_user_app_gcm_key)
    this.message = '';

    this.onReadMessage(true);
    setTimeout(() => {
      let comment = document.getElementById("chatbox");
      this.scrolltop = comment.scrollHeight;
    }, 100);
  }

  onClose() {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
      this._chatService.clearSubscription();
    }
    this.onModalClose()
  }

  onModalClose() {
    this.modalRef.hide();
  }

  //find user for split payment
  searchSplitUser() {
    let json: any = { token: this.helper.user_details.server_token, user_id: this.helper.user_details._id, search_user: this.splitSearchData };
    this._createTripService.search_user_for_split_payment(json).then(response => {
      if (response.success) {
        let data = response.data.search_user_detail
        this.search_users_detail = data;
        setTimeout(() => {
          this.splitSearchData = '';
        }, 500);
      }
    })
  }

  //send split payment request to user
  sendRequest(i) {
    let json: any = { token: this.helper.user_details.server_token, user_id: this.helper.user_details._id, split_request_user_id: null, trip_id: this.tripdetail._id };
    if (this.tripdetail.split_payment_users && this.resend_request === true) {
      json['split_request_user_id'] = this.tripdetail.split_payment_users[i].user_id;
    } else {
      json['split_request_user_id'] = this.search_users_detail._id;
    }
    this._createTripService.send_split_payment_request(json).then(response => {
      if (response.data.success) {
        this.is_request_sent = true;
      }
    })
    this.resend_request = false;
  }

  //remove split payment request
  removeRequest(i) {
    let json: any = { token: this.helper.user_details.server_token, user_id: this.helper.user_details._id, split_request_user_id: this.trip_split_users[i].user_id };
    this._createTripService.remove_split_payment_request(json).then(response => {
      if (response.success) {
        this.remove_split_request = true;
      }
    })
  }

  //resend split payment request
  resendRequest(i) {
    this.resend_request = true;
    this.sendRequest(i);
    let resendreq = document.getElementById('resend-' + i)
    resendreq.classList.add("d-none");
    let removereq = document.getElementById('remove-' + i)
    removereq.classList.remove("d-none");
  }

  onClickConfirmationCode() {
    this.is_show_confirmation_code = !this.is_show_confirmation_code
  }

  //on paypal payment
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
            value: `${this.selected_ride_details.estimated_fare}`,
            breakdown: {
              item_total: {
                currency_code: `${currency_code}`,
                value: `${this.selected_ride_details.estimated_fare}`
              }
            }
          },
          items: [{
            name: 'Enterprise Subscription',
            quantity: '1',
            category: 'DIGITAL_GOODS',
            unit_amount: {
              currency_code: `${currency_code}`,
              value: `${this.selected_ride_details.estimated_fare}`,
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
            user_id: this.helper.user_details._id,
            token: this.helper.user_details.server_token,
            payment_gateway_type: this.tripdetail?.payment_gateway_type,
            payment_intent_id: data,
            trip_id: this.tripdetail._id,
            type: 10,
            card_id: data.payer.payer_id,
            last_four: "Paypal",
            is_web: true,
          };
          this._paymentService.pay_stripe_intent_payment(json).then(is_added => {
            if (is_added) {
              this.cardPaymentFailModal = false;
            }
          })
        }
      },
      onCancel: (data, actions) => { },
      onError: err => { },
      onClick: (data, actions) => { }
    };
  }

  get_paypal_data(bool) {
    this.is_paypal_supported = bool;
  }

  //view promocode list
  viewOffers(modal: TemplateRef<any>): void {
    let json: any = { country_id: this.city_detail.countryid, city_id: this.city_detail._id };
    this._vehicleService.get_promo_code_list(json).then(res => {
      if (res.success) {
        this.promo_list = res.promo_codes;
        this.offersModal = this.modalService.show(modal, this.config);
      }
    })
  }

  closeOffersModal() {
    this.offersModal.hide();
  }

  //show bidding amount error
  on_key_up() {
    let amount: any = ((this.selected_ride_details.estimated_fare - this.selected_ride_details.estimated_fare * this.typelist.user_min_bidding_limit * 0.01).toFixed(this.helper.to_fixed_number))
    if (this.bidding_amount < amount) {
      this.is_bid_error = true
    } else {
      this.is_bid_error = false
    }
  }

  getOpenRideDetails(trip) {
    this.selected_open_ride_trip = trip;
  }

  //book open ride trip
  bookOpenRide() {
    const waypts: google.maps.DirectionsWaypoint[] = [];
    if (this.stop_addresses?.length > 0 && !this.destination_later) {

      for (const stop_addresses of this.stop_addresses) {
        waypts.push({
          location: new google.maps.LatLng(stop_addresses.location[0], stop_addresses.location[1]),
          stopover: true,
        });
      }
    }

    let pickup_location = this.selected_open_ride_trip.sourceLocation;
    let destination_location = this.selected_open_ride_trip.destinationLocation;
    this.directionsService.route({
      origin: { lat: pickup_location[0], lng: pickup_location[1] },
      destination: { lat: destination_location[0], lng: destination_location[1] },
      waypoints: waypts,
      optimizeWaypoints: false,
      travelMode: google.maps.TravelMode.DRIVING,
    }).then((response) => {
      const route = response.routes[0];
      //calculate distance and duration
      let _distance = [];
      let _duration = [];
      for (const leg of route.legs) {
        let route_distance = leg.distance!.value;
        let route_duration = leg.duration!.value;

        _distance.push(route_distance);
        _duration.push(route_duration);
      }
      let distance_sum = 0;
      let duration_sum = 0;
      _distance.forEach(item => {
        distance_sum += item;
      });
      let total_distance = distance_sum;
      _duration.forEach(item => {
        duration_sum += item;
      });
      let total_time = duration_sum;

      //get fare estimate
      let json: any = { service_type_id: this.selected_open_ride_trip.service_type_id, time: total_time, distance: total_distance, pickup_latitude: pickup_location[0], pickup_longitude: pickup_location[1], destination_latitude: destination_location[0], destination_longitude: destination_location[1], surge_multiplier: 1, is_surge_hours: false, is_multiple_stop: this.selected_open_ride_trip.destination_addresses?.length > 0 }
      this._vehicleService.get_fare_estimate(json).then((response) => {
        if (response.success) {
          let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, open_ride_id: this.selected_open_ride_trip._id, country_id: this.selected_open_ride_trip.country_id, payment_mode: this.payment_mode, total_price: response.estimated_fare, sourceLocation: this.pickup_location, destinationLocation: [this.destination_address.latitude, this.destination_address.longitude], source_address: this.pickup_address.address, destination_address: this.destination_address.address }
          this.is_address_changed = true;
          //book open ride
          this._createTripService.user_book_ride(json).then((response) => {
            if (response.success) {
              const url = "/app/future-requests?future_history_type=" + this.helper.HISTORY_TYPE.OPEN_RIDE;
              this.helper._route.navigateByUrl(url)
            }
            this.openRideModal.hide();
          })
        }
      })
    })
  }

  //open select timepicker for schedule or open ride trip
  clickInput() {
    if (this.tabNum == this.EstimateTabType.OpenRide) {
      let d = new Date(new Date(new Date(this.scheduleDate).toLocaleString('en', { timeZone: this.city_detail.timezone })));
      const time_for_schedule = d.getTime();
      let json: any = {
        service_type_id: this.selected_ride_details.selected_id,
        type_id: this.helper.user_details._id,
        token: this.helper.user_details.server_token,
        date: time_for_schedule,
        destination_address: this.destination_address_for_open_ride,
        type: 1, //type 1 is for user
      }
      this._createTripService.open_ride_list_for_user(json).then((response: any) => {
        if (response.success) {
          if (response.user_ride_list.length == 0) {
            this._notifierService.showNotification('error', this.helper.trans.instant('error-code.415'));
          } else {
            let currentDate = new Date();
            let currentHour = currentDate.getHours();
            let currentMinutes = currentDate.getMinutes();
            this.scheduleTime = currentHour + ':' + currentMinutes;
            this.ScheduleDatePickerModal.hide();
          }
        }
      })
    } else {
      this.timeInput.nativeElement.click();
    }
  }

  //get open ride list
  open_ride_list_for_user() {
    let d = new Date(new Date(new Date(this.scheduleDate).toLocaleString('en', { timeZone: this.city_detail.timezone })))
    let array: any = this.scheduleTime.split(':')
    d = new Date(d.setHours(array[0], array[1]))
    const time_for_schedule = d.getTime();
    let json: any = {
      service_type_id: this.selected_ride_details.selected_id,
      type_id: this.helper.user_details._id,
      token: this.helper.user_details.server_token,
      date: time_for_schedule,
      destination_address: this.destination_address_for_open_ride,
      type: 1, //type 1 is for user
    }
    this._createTripService.open_ride_list_for_user(json).then((response: any) => {
      if (response.success) {
        this.open_ride_list = response.user_ride_list;
        this.open_ride_list.forEach((ride) => {
          const time: any = ride.total_time.toFixed(0);
          ride.total_time_string = this.formatOpenRideTime(time);
        })
        this.openRideModal = this.modalService.show(this.openRideModalTemplate, this.config);
        const modalElement = document.querySelector('.modal-open-ride');
        if (modalElement) {
          modalElement.id = 'modal-open-ride';
        }
      }
    })
  }

  //show formated time in open ride trip list modal
  formatOpenRideTime(total_time: number): string {
    if (total_time < 60) {
      return `<span>${total_time}&nbsp</span>` + `${this.helper.trans.instant('label-title.min')}`;
    } else if (total_time < 1440) {
      const hours = Math.floor(total_time / 60);
      const minutes = total_time % 60;
      return `<span>${hours}&nbsp</span>${this.helper.trans.instant('label-title.hr')}<span>&nbsp${minutes}&nbsp</span>${this.helper.trans.instant('label-title.min')}`;
    } else {
      const days = Math.floor(total_time / 1440);
      const remainingMinutes = total_time % 1440;
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      return `<span>${days}&nbsp</span>${this.helper.trans.instant('label-title.d')}<span>&nbsp${hours}&nbsp</span>${this.helper.trans.instant('label-title.hr')}<span>&nbsp${minutes}&nbsp</span>${this.helper.trans.instant('label-title.min')}`;
    }
  }

  checkPromoUsed(): boolean {
    if ((this.payment_mode == 1 && !this.city_detail.isPromoApplyForCash) || (this.payment_mode == 0 && !this.city_detail.isPromoApplyForCard) && this.isPromoUsed) {
      this.is_changePaymentMode = false;
      this.promoWarningModelRef = this.modalService.show(this.paymentChangePromoWarning, this.promoWarningModelConfig);
      return false;
    }
    return true;
  }

  closePromoWarningModal(from_close = false): void {
    if (from_close) {
      if (this.payment_mode == 0) {
        this.payment_mode = 1;
        this.cardShow = false;
      } else if (this.payment_mode == 1) {
        this.payment_mode = 0;
        this.cardShow = true;
      }
    }
    this.promoWarningModelRef?.hide();
  }

}
