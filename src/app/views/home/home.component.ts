import { TABS, TRIP_TYPE } from "./../../constants/constants";
import {
  Component,
  OnInit,
  Renderer2,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
} from "@angular/core";
import { environment } from "src/environments/environment";
import { VehicleService } from "src/app/services/vehicle.service";
import {
  LocationModel,
  LocationService,
} from "src/app/services/location.service";
import { Helper } from "src/app/shared/helper";
import { CommonService } from "src/app/services/common.service";
import { DEFAULT_IMAGE } from "src/app/constants/constants";
import { AuthModalComponent } from "src/app/containers/pages/auth-modal/auth-modal.component";
import { AuthService } from "src/app/services/auth.service";
import { LangService, Language } from "src/app/shared/lang.service";
import { debounceTime, map } from "rxjs/operators";
import { fromEvent } from "rxjs";
import {
  FormBuilder,
  FormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import * as $ from "jquery";
import { CreateTripService } from "src/app/services/create-trip.service";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ProfileService } from "src/app/services/profile.service";
import { SocketService } from "src/app/services/socket.service";
import { OwlOptions } from "ngx-owl-carousel-o";
import { HttpClient } from "@angular/common/http";

declare const google;
export class AdminDetail {
  admin_phone: number;
  contactUsEmail: string;
}

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  styles: [`
    .theme-Color {
      color: #3C3B3E;
    }
    .userNameBtn{
      background-color:#A880F4;
      border-color:#a880f4;
    }
      a#normal-link{
        color:#A880F4;
      }
      .homeImg {
          max-height: 300px !important;
          border-radius:20px;
      }
    img.feature-image-left.feature-image-charts.homeImg {
        object-position: inherit;
    }

    .footerSection{
      padding:15px 0;
      margin-top:50px;
      background-color:#000;
    }
    .footerLinks{
      gap:20px;
      list-style: none;
    }
    .footerLinks li a{
    font-size:16px;
    color:#fff;
    }
    ul.breadcrumbIcon {
    display: flex;
    justify-content: end;
    margin: 0;
    padding: 0;
    }
    .align-item-center{
      align-items:center;
    }
    .rideContent{
      color:#A880F4;
    }
    .contentBordder{
        width:30%;
        background-color:#A880F4;
        height:3px;
    }
    .downloadSubText{
    font-size:12px;
    }
  `]
})


export class HomeComponent implements OnInit, OnDestroy {
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: "modal-dialog-centered",
  };
  CREATED_BY_GUEST_TOKE: 6;
  modalRef: BsModalRef;
  confirmModelRef: BsModalRef;
  guestTripForm: UntypedFormGroup;
  ScheduleDatePickerModal: BsModalRef;
  checkModel: { left?: boolean; right?: boolean } = {
    left: true,
    right: false,
  };
  cancelModelConfig = {
    backdrop: true,
    ignoreBackdropClick: true,
  };
  math = Math;
  typelist: any;
  citytypes: any;
  pooltypes: any;
  user_reviews: any;
  store_marker: any = null;
  cancelTripmodal: boolean;
  cancellation_reasons_list: any;
  trip_cancellation_fee: number;
  cancellation_type: any = "";
  cancellation_reason: any = "";
  destination_marker: any = null;
  BASE_URL = environment.BASE_URL;
  IMAGE_URL = environment.IMAGE_URL;
  DEFAULT_USER_PROFILE = DEFAULT_IMAGE.USER_PROFILE;
  TAXI_ICON = DEFAULT_IMAGE.TAXI_ICON;
  WEBSITE_URL = environment.WEBSITE_URL;
  DEFAULT_IMAGE = DEFAULT_IMAGE;
  TRIP_TYPE = TRIP_TYPE;
  current_year: number;
  country_list: any;
  @ViewChild("authModal", { static: true }) authModal: AuthModalComponent;
  directionsService: any;
  DirectionsRenderer: any;
  DRIVER_WEB: string;
  darkTheme = localStorage.getItem("vien-themecolor");
  logoClr: boolean = false;
  languages: Language[];
  _distance: number[] = [];
  _duration: number[] = [];
  trip_path_array: any[] = [];
  provider_markers: any[] = [];
  scheduleTime: string;
  cityDetails: any;
  service_type_id_list: any;
  isSingleLang;
  current_language = localStorage.getItem("theme_lang");
  admin_detail: AdminDetail = new AdminDetail();
  setting_detail: any;
  TABS = TABS;
  selected_tab;
  isShowPopup: boolean = false;
  map: google.maps.Map;
  pickup_address: LocationModel = new LocationModel();
  destination_address: LocationModel = new LocationModel();
  estimateTime: any;
  tripDistance: number;
  allProviderData: any;
  fareEstimateData: any;
  nearbyProvider: any;
  fareEstimate: any;
  isRideShare: any;
  scheduleDate: any;
  provider: any;
  estimateFarePrice: any;
  isProvider: boolean = true;
  guestUserId: any = "";
  default_schedule_time: any;
  todayDate: Date = new Date();
  maxScheduleDate: Date = new Date();
  date: Date;
  time_for_schedule: any;
  trip_type: any;
  trackId: any = "";
  guestToken: any;
  isOrderLater = false;
  same_location_error: boolean = false;
  guestTripData: any;
  is_ride_later: any;
  @ViewChild("mapElement", { static: true }) mapElement: ElementRef<any>;
  @ViewChild("address", { static: true }) address: ElementRef;
  @ViewChild("createSchedulemodal", { static: true })
  createSchedulemodal: TemplateRef<any>;
  destinationaddress: ElementRef;
  @ViewChild("scheduleRideTime", { static: true })
  scheduleRideTime: TemplateRef<any>;
  @ViewChild("confirmationTemplate", { static: true })
  confirmationTemplate: TemplateRef<any>;
  submited: boolean;
  triplocation: any;
  trippath: any;
  change_lat: number;
  change_lng: number;
  is_business: boolean = true;
  is_ride_now: boolean;
  trip_id: any;
  isOutofCountry: boolean;
  selelectedCountry: any;
  isShowButtons: boolean = false;
  providerLocation: any;
  randomQueryParam: any;
  showMobileMenu = false;
  buyUrl = environment.buyUrl;
  adminRoot = environment.adminRoot;
  alpha2: any;

  bannerList : any ;

  customOptions: OwlOptions = {
    loop: true,
    autoplay: true,
    center: true,
    dots: false,
    autoHeight: false,
    autoWidth: false,
    items : 1,
  }

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
    public helper: Helper,
    public _locationService: LocationService,
    public _vehicleService: VehicleService,
    private _commonService: CommonService,
    public _authService: AuthService,
    private langService: LangService,
    private _fb: FormBuilder,
    private createTripService: CreateTripService,
    private modalService: BsModalService,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    private _socket: SocketService,
    private http : HttpClient
  ) {
    this.languages = this.langService.supportedLanguages;
    this.isSingleLang = this.langService.isSingleLang;
  }

  ngOnInit(): void {
    this.randomQueryParam = `random=${Math.random()}`;
    this.selected_tab = this.TABS.TAB1;
    this.helper
      .loadGoogleScript(
        "https://maps.googleapis.com/maps/api/js?key=" +
          this.helper.GOOGLE_KEY +
          "&libraries=places"
      )
      .then(() => {
        this._locationService.set_current_location().then(() => {
          this.get_vehicle_list();
        });
        this.get_vehicle_list();
      });
    this.userReviews();
    this.getCountry();
    this._initForm();
    this.getBannerList();
    // this.renderer.addClass(document.body, "no-footer");
    let date = new Date();
    this.current_year = date.getFullYear();
    if (this.darkTheme.startsWith("dark")) {
      this.logoClr = true;
    }
    this._commonService.get_setting_detail({}).then((setting_detail) => {
      this.admin_detail = setting_detail.setting_detail;
      this.setting_detail = setting_detail.setting_detail;
      this.DRIVER_WEB = setting_detail.setting_detail.driver_panel_url;
      let date = new Date();
      this.maxScheduleDate = new Date(date.setDate(date.getDate() + this.setting_detail.scheduled_request_pre_booking_days));
      this.guestTripForm
        .get("phone")
        .setValidators([
          Validators.required,
          Validators.minLength(
            this.setting_detail?.minimum_phone_number_length
          ),
          Validators.maxLength(
            this.setting_detail?.maximum_phone_number_length
          ),
        ]);
      this._commonService
        .getGuestUser({ token: this.setting_detail.active_guest_token })
        .then((res_data) => {
          this.guestToken = res_data.guest_token;
        });
    });

  }

  ngOnDestroy(): void {
    // this.renderer.removeClass(document.body, "no-footer");
    if (this.guestTripData?._id) {
      let listner = "'" + this.guestTripData?._id + "'";
      this._socket.disconnetRoom(listner);
    }
  }

  _initForm() {
    this.guestTripForm = this._fb.group({
      first_name: new FormControl("", [Validators.required]),
      last_name: new FormControl("", [Validators.required]),
      country_phone_code: new FormControl("", [Validators.required]),
      phone: new FormControl(""),
      pickup_address: new FormControl("", [Validators.required]),
      destination_address: new FormControl("", [Validators.required]),
      service_type_id: new FormControl("", [Validators.required]),
    });
  }

  openModal(): void {
    this.authModal.show();
  }

  RegisterModal(): void {
    this.authModal.showRegister();
  }

  @HostListener("window:resize", ["$event"])
  onResize(event): void {
    this.elRef.nativeElement.querySelector(".home-row").getBoundingClientRect();

    if (event.target.innerWidth >= 992) {
      this.renderer.removeClass(
        this.elRef.nativeElement.querySelector(".landing-page"),
        "show-mobile-menu"
      );
    }
  }

  @HostListener("window:click", ["$event"])
  onClick(event): void {
    this.showMobileMenu = false;
  }

  @HostListener("window:scroll", ["$event"])
  onScroll(event): void {
    this.showMobileMenu = false;
  }

  scrollTo(target): void {
    let targetMoveNum: string = target.split("_")[1];
    let elem: any = document.getElementById("scroll_" + targetMoveNum);
    if (elem) {
      const y: any = elem.offsetTop - 150;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  get_vehicle_list() {
    this.helper.ngZone.run(() => {
      let json: any = {
        token: "token",
        user_id: null,
        country: this._locationService._current_location.country_name,
        latitude: this._locationService._current_location.latitude,
        longitude: this._locationService._current_location.longitude,
      };
      if (this.helper.user_details) {
        json["user_id"] = this.helper.user_details._id;
        json["token"] = this.helper.user_details.server_token;
      }
      json.is_show_error_toast = false;
      json.is_show_success_toast = false;
      this._vehicleService.get_vehicles_list(json).then((res_data) => {
        this.typelist = res_data;
        this.citytypes = res_data.citytypes;
        this.pooltypes = res_data.pooltypes;
      });
    });
  }

  getCountry() {
    this._commonService.getCountryList().then((res_data) => {
      this.country_list = res_data.country_list;
    });
  }

  userReviews() {
    let json = {};
    this._commonService.user_reviews(json).then((res_data) => {
      if (res_data) {
        this.user_reviews = res_data.userReviews;
      }
    });
  }

  togglePopup() {
    this.isShowPopup = !this.isShowPopup;

    if (this.isShowPopup === true) {
      this.helper
        .loadGoogleScript(
          "https://maps.googleapis.com/maps/api/js?key=" +
            this.helper.GOOGLE_KEY +
            "&libraries=places"
        )
        .then(() => {
          this._initAutoComplete();
          this._initDestintionAutoComplete();
          this.directionsService = new google.maps.DirectionsService();
          this.DirectionsRenderer = new google.maps.DirectionsRenderer();
        });
      this.guestTripForm.reset();
      this.same_location_error = false;
      this.isOutofCountry = false;
      this.isShowButtons = false;
      this.selected_tab = this.TABS.TAB1;
      this.is_business = true;
      this.guestUserId = "";
      this.pickup_address = new LocationModel();
      this.destination_address = new LocationModel();
      this.trackId = "";
    }
  }

  signOut() {
    let json: any = {
      token: this.helper.user_details.server_token,
      user_id: this.helper.user_details._id,
    };
    this._authService.user_logout(json);
  }

  onLanguageChange(lang): void {
    this.langService.language = lang.code;
  }
  showBtn$ = fromEvent(document, "scroll").pipe(
    debounceTime(50),
    map(() => window.scrollY > 200)
  );

  setMap() {
    if (this.selected_tab == TABS.TAB2) {
      let theme = localStorage.getItem("vien-themecolor");
      if (theme.includes("dark")) {
        this.map = new google.maps.Map(document.getElementById("map"), {
          zoom: 12,
          center: {
            lat: this._locationService._current_location.latitude
              ? this._locationService._current_location.latitude
              : 22.3039,
            lng: this._locationService._current_location.longitude
              ? this._locationService._current_location.longitude
              : 70.8022,
          },
          mapTypeControl: false,
          streetViewControl: false,
          draggable: true,
          zoomControl: false,
          scrollwheel: false,
          disableDoubleClickZoom: false,
          fullscreenControl: false,
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER,
          },
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            {
              elementType: "labels.text.stroke",
              stylers: [{ color: "#242f3e" }],
            },
            {
              elementType: "labels.text.fill",
              stylers: [{ color: "#746855" }],
            },
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
        this.map = new google.maps.Map(document.getElementById("map"), {
          zoom: 12,
          center: {
            lat: this._locationService._current_location.latitude
              ? this._locationService._current_location.latitude
              : 22.3039,
            lng: this._locationService._current_location.longitude
              ? this._locationService._current_location.longitude
              : 70.8022,
          },
          mapTypeControl: false,
          streetViewControl: false,
          draggable: true,
          zoomControl: false,
          scrollwheel: false,
          disableDoubleClickZoom: false,
          fullscreenControl: false,
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER,
          },
        });
      }
    }
    let lat;
    let lng;
    if (!this.guestTripData) {
      lat = this.pickup_address.latitude;
      lng = this.pickup_address.longitude;
    }

    if (this.guestTripData && this.guestTripData !== null) {
      lat = this.guestTripData.sourceLocation[0];
      lng = this.guestTripData.sourceLocation[1];
      this.destination_address.latitude =
        this.guestTripData.destinationLocation[0];
      this.destination_address.longitude =
        this.guestTripData.destinationLocation[1];

      if (
        this.guestTripData.is_provider_accepted == 1 &&
        this.guestTripData.is_provider_status >=
          this.helper.PROVIDER_STATUS.STARTED
      ) {
        let json: any = { trip_id: this.guestTripData._id };

        this.createTripService.polyline(json).then((response) => {
          this.triplocation = response.data.triplocation;
          this.trip_path_array = [];
          this.triplocation.startTripToEndTripLocations.forEach((location) => {
            let lat = location[0];
            let lng = location[1];
            let trip_path = { lat: lat, lng: lng };
            this.trip_path_array.push(trip_path);
          });
          this.trippath = new google.maps.Polyline({
            path: this.trip_path_array,
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
          });
          this.trippath.setMap(this.map);
        });
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
        draggable: false,
        icon: DEFAULT_IMAGE.PICKUP_ICON,
      });
      google.maps.event.addListener(
        this.store_marker,
        "dragend",
        async (marker) => {
          this.pickup_address.latitude = marker.latLng.lat();
          this.pickup_address.longitude = marker.latLng.lng();
          this.change_lat = marker.latLng.lat();
          this.change_lng = marker.latLng.lng();
          this.getCountryFromLatLng(this.change_lat, this.change_lng)
            .then((result) => {
              this.pickup_address.country_name = result.country;
              this.pickup_address.country_code = result.countryCode;
            })
            .catch((error) => {
              console.error("Error:", error);
            });
          let geocoder = new google.maps.Geocoder();
          let request = {
            latLng: new google.maps.LatLng(
              this.pickup_address.latitude,
              this.pickup_address.longitude
            ),
          };
          geocoder.geocode(request, (results, status) => {
            if (status == google.maps.GeocoderStatus.OK) {
              this.pickup_address.address = results[0].formatted_address;
              this.matchPickupDestinationAddress();
              this.get_vehicle_list();
              this.provider_markers.forEach((marker) => {
                marker.setMap(null);
              });
              this.is_ride_now = true;
            }
          });
        }
      );
    }

    if (this.destination_marker) {
      this.destination_marker.setMap(null);
      this.destination_marker = null;
    }

    if (
      this.destination_address.latitude &&
      this.destination_address.longitude
    ) {
      let destination_location = new google.maps.LatLng(
        this.destination_address.latitude,
        this.destination_address.longitude
      );

      this.destination_marker = new google.maps.Marker({
        position: destination_location,
        map: this.map,
        draggable: false,
        icon: DEFAULT_IMAGE.DESTINATION_ICON,
      });
      bounds.extend(this.store_marker.position);
      bounds.extend(this.destination_marker.position);
      this.map.fitBounds(bounds);
      google.maps.event.addListener(
        this.destination_marker,
        "dragend",
        async (marker) => {
          this.destination_address.latitude = marker.latLng.lat();
          this.destination_address.longitude = marker.latLng.lng();
          this.getCountryFromLatLng(
            this.destination_address.latitude,
            this.destination_address.longitude
          )
            .then((result) => {
              this.destination_address.country_name = result.country;
              this.destination_address.country_code = result.countryCode;
            })
            .catch((error) => {
              console.error("Error:", error);
            });
          let geocoder = new google.maps.Geocoder();
          let request = {
            latLng: new google.maps.LatLng(
              this.destination_address.latitude,
              this.destination_address.longitude
            ),
          };
          geocoder.geocode(request, (results, status) => {
            if (status == google.maps.GeocoderStatus.OK) {
              this.helper.ngZone.run(() => {
                this.destination_address.address = results[0].formatted_address;
                this.matchPickupDestinationAddress();
                if (this.DirectionsRenderer) {
                  this.DirectionsRenderer.setMap(null);
                }
                this.is_ride_now = true;
              });
            }
          });
        }
      );
    }

    if (this.providerLocation) {
      this.provider_markers.forEach((marker) => {
        marker.setMap(null);
      });
      this.provider_markers = [];
      this.providerLocation.forEach((provider: any) => {
        let location = new google.maps.LatLng(
          provider.providerLocation[0],
          provider.providerLocation[1]
        );

        let marker = new google.maps.Marker({
          position: location,
          map: this.map,
          draggable: false,
          icon: DEFAULT_IMAGE.DRIVER_ICON,
        });
        this.provider_markers.push(marker);
      });
    }
  }

  getCountryFromLatLng(
    latitude: number,
    longitude: number
  ): Promise<{ country: string; countryCode: string }> {
    const geocoder = new google.maps.Geocoder();
    const latLng = new google.maps.LatLng(latitude, longitude);

    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            for (const addressComponent of results[0].address_components) {
              const addressType = addressComponent.types[0];
              if (addressType === "country") {
                const countryName = addressComponent.long_name;
                const countryCode = addressComponent.short_name;
                resolve({ country: countryName, countryCode: countryCode });
                return;
              }
            }

            reject(new Error("No country found."));
          } else {
            reject(new Error("No results found."));
          }
        } else {
          reject(new Error("Geocoder failed due to: " + status));
        }
      });
    });
  }

  _initAutoComplete() {
    let autocompleteElm = document.getElementById(
      "address"
    ) as HTMLInputElement;
    let autocomplete = new google.maps.places.Autocomplete(autocompleteElm, {
      types: [],
    });

    autocomplete.addListener("place_changed", () => {
      let place = autocomplete.getPlace();

      let lat = place.geometry.location.lat();
      let lng = place.geometry.location.lng();
      let address = place["formatted_address"];
      this.pickup_address.latitude = lat;
      this.pickup_address.longitude = lng;
      this.pickup_address.address = address;
      if (this.destination_address.address !== "") {
        this.matchPickupDestinationAddress();
        if (!this.same_location_error) {
          this.getAllProviders();
        }
      }
      place["address_components"].forEach((element) => {
        let type = element.types[0];
        switch (type) {
          case "country":
            this.pickup_address.country_name = element.long_name;
            this.pickup_address.country_code = element.short_name;
            break;
          case "administrative_area_level_1":
            this.pickup_address.state_code = element.short_name;
            this.pickup_address.state_name = element.long_name;
            break;
          case "administrative_area_level_2":
            this.pickup_address.city_name = element.short_name;
            break;
          case "postal_code":
            break;
          default:
            break;
        }
      });
      let json;

      if (
        this.guestTripForm.value.country_phone_code &&
        this.pickup_address.country_name !== this.selelectedCountry[0].name
      ) {
        this.isShowButtons = true;
        this.isOutofCountry = true;
      } else {
        this.isShowButtons = false;
        this.isOutofCountry = false;

        json = {
          token: "token",
          user_id: null,
          country: this.pickup_address.country_name,
          latitude: this.pickup_address.latitude,
          longitude: this.pickup_address.longitude,
          is_show_success_toast: false,
          is_show_error_toast: false
        };

        this._vehicleService.get_vehicles_list(json).then((res_data) => {
          if (res_data.success) {
            this.is_business = true;
            this.isShowButtons = false;
            this.typelist = res_data;
            this.citytypes = res_data.citytypes;
            this.pooltypes = res_data.pooltypes;
          } else {
            this.is_business = false;
            this.isShowButtons = true;
          }
        });
      }
    });
    $(".pickup-address-search-location")
      .find("#address")
      .on("focus click keypress", () => {
        $(".pickup-address-search-location")
          .find("#address")
          .parent(".input-wrp")
          .css({ position: "relative" })
          .append($(".pac-container"));
      });
  }

  _initDestintionAutoComplete() {
    let autocompleteElm = document.getElementById(
      "destinationAddress"
    ) as HTMLInputElement;
    let autocomplete = new google.maps.places.Autocomplete(autocompleteElm, {
      types: [],
    });
    autocomplete.addListener("place_changed", () => {
      let place = autocomplete.getPlace();
      let lat = place.geometry.location.lat();
      let lng = place.geometry.location.lng();
      let address = place["formatted_address"];
      this.destination_address.latitude = lat;
      this.destination_address.longitude = lng;
      this.destination_address.address = address;
      place["address_components"].forEach((element) => {
        let type = element.types[0];
        switch (type) {
          case "country":
            this.destination_address.country_name = element.long_name;
            this.destination_address.country_code = element.short_name;
            break;
          case "administrative_area_level_1":
            this.destination_address.state_code = element.short_name;
            this.destination_address.state_name = element.long_name;
            break;
          case "administrative_area_level_2":
            this.destination_address.city_name = element.short_name;
            break;
          case "postal_code":
            break;
          default:
            break;
        }
      });
      this.matchPickupDestinationAddress();
      if (!this.same_location_error) {
        this.getAllProviders();
      }
    });
    $(".destination-address-search-location")
      .find("#destinationAddress")
      .on("focus click keypress", () => {
        $(".destination-address-search-location")
          .find("#destinationAddress")
          .parent(".input-wrp1")
          .css({ position: "relative" })
          .append($(".pac-container"));
      });
  }

  onCountryChange(event) {
    this.selelectedCountry = this.country_list.filter((x) => x.code == event);
    this.alpha2 = this.selelectedCountry[0].alpha2;

    if (this.pickup_address.address !== "") {
      if (this.selelectedCountry[0].name === this.pickup_address.country_name) {
        this.isOutofCountry = false;
        this.isShowButtons = false;
      } else {
        this.isOutofCountry = true;
        this.isShowButtons = true;
      }
    }
  }

  matchPickupDestinationAddress() {
    if (
      this.pickup_address.latitude == this.destination_address.latitude &&
      this.pickup_address.longitude == this.destination_address.longitude
    ) {
      this.same_location_error = true;
      this.isShowButtons = true;
    } else {
      this.same_location_error = false;
      this.isShowButtons = false;
    }
    this.cdr.detectChanges();
  }

  getAllProviders() {
    this.directionsService
      .route({
        origin: {
          lat: this.pickup_address.latitude,
          lng: this.pickup_address.longitude,
        },
        destination: {
          lat: this.destination_address.latitude,
          lng: this.destination_address.longitude,
        },
        optimizeWaypoints: false,
        travelMode: google.maps.TravelMode.DRIVING,
      })
      .then((response) => {
        this._distance = [];
        this._duration = [];
        this.isOutofCountry = false;
        this.isShowButtons = false;
        this.DirectionsRenderer.setOptions({ suppressMarkers: true });

        const route = response.routes[0];
        for (const leg of route.legs) {
          let route_distance = leg.distance!.value;
          let route_duration = leg.duration!.value;

          this._distance.push(route_distance);
          this._duration.push(route_duration);
        }
        this.total_distance_duration();

        if (
          this.guestTripForm.value.pickup_address !== "" &&
          this.guestTripForm.value.destination_address !== ""
        ) {
          let json = {
            pickup_latitude: this.pickup_address.latitude,
            pickup_longitude: this.pickup_address.longitude,
            d_latitude: this.destination_address.latitude,
            d_longitude: this.destination_address.longitude,
            time: this.estimateTime,
            distance: this.tripDistance,
          };
          this.createTripService
            .getfareEstimateAllType(json)
            .then((res_data) => {
              this.allProviderData = res_data.data;
              this.cityDetails = res_data.data.city_detail;
              this.fareEstimateData = res_data.data.type_list.filter(
                (type) => type.is_ride_share == 0
              );
              this.guestTripForm.patchValue({
                service_type_id: this.fareEstimateData[0]._id,
              });
              this.get_nearby_provider();
              this.serviceFareEstimate();
            });
        }
      })
      .catch((e) => {
        console.error(e);
        this.isOutofCountry = true;
        this.isShowButtons = true;
      });
  }

  total_distance_duration() {
    let distance_sum = 0;
    let duration_sum = 0;
    this._distance.forEach((item) => {
      distance_sum += item;
    });
    this.tripDistance = distance_sum;
    this._duration.forEach((item) => {
      duration_sum += item;
    });
    this.estimateTime = duration_sum;
    return distance_sum && duration_sum;
  }

  get_nearby_provider() {
    this._vehicleService
      .get_nearby_provider({
        service_type_id: this.guestTripForm.value.service_type_id,
        latitude: this.pickup_address.latitude,
        longitude: this.pickup_address.longitude,
      })
      .then((res_data) => {
        if (res_data.success) {
          this.isProvider = true;
          this.providerLocation = res_data.providers;
        } else {
          this.isProvider = false;
        }
      });
  }

  show_providers(providers, providerLocation) {
    this.provider_markers.forEach((marker) => {
      marker.setMap(null);
    });
    this.provider_markers = [];
    if (providerLocation === "") {
      providers.forEach((provider: any) => {
        let location = new google.maps.LatLng(
          provider.providerLocation[0],
          provider.providerLocation[1]
        );
        let marker = new google.maps.Marker({
          position: location,
          map: this.map,
          draggable: false,
          icon: DEFAULT_IMAGE.DRIVER_ICON,
        });
        this.provider_markers.push(marker);
      });
    }
    if (providers === "") {
      let location = new google.maps.LatLng(
        providerLocation[0],
        providerLocation[1]
      );
      let marker = new google.maps.Marker({
        position: location,
        map: this.map,
        draggable: false,
        icon: DEFAULT_IMAGE.DRIVER_ICON,
      });
      this.provider_markers.push(marker);
    }
  }

  onChangeService() {
    this.get_nearby_provider();
    this.serviceFareEstimate();
  }

  serviceFareEstimate() {
    let json = {
      service_type_id: this.guestTripForm.value.service_type_id,
      pickup_latitude: this.pickup_address.latitude,
      pickup_longitude: this.pickup_address.longitude,
      destination_latitude: this.destination_address.latitude,
      destination_longitude: this.destination_address.longitude,
      time: this.estimateTime,
      distance: this.tripDistance,
    };
    this._vehicleService.get_fare_estimate(json).then((res_data) => {
      this.estimateFarePrice = res_data.estimated_fare;
      this.service_type_id_list = res_data;
    });
    this.citytypes.filter((x) => {
      if (x._id === this.guestTripForm.value.service_type_id) {
        this.isRideShare = x.is_ride_share;
      }
    });
    this.pooltypes.filter((x) => {
      if (x._id === this.guestTripForm.value.service_type_id) {
        this.isRideShare = x.is_ride_share;
      }
    });
    if (this.isRideShare) {
      this.fareEstimate = this.pooltypes.filter(
        (x) => x._id === this.guestTripForm.value.service_type_id
      );
    } else {
      this.fareEstimate = this.citytypes.filter(
        (x) => x._id === this.guestTripForm.value.service_type_id
      );
    }
  }

  tabChange(tab) {
    this.selected_tab = tab;
    this.helper
      .loadGoogleScript(
        "https://maps.googleapis.com/maps/api/js?key=" +
          this.helper.GOOGLE_KEY +
          "&libraries=places"
      )
      .then(() => {
        this.setMap();
      });
  }

  openModal2(modal: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(modal, this.config);
  }

  onBook(value) {
    this.isOrderLater = value;
    if (this.guestTripForm.invalid) {
      return this.guestTripForm.markAllAsTouched();
    }

    if (value === false) {
      this.is_ride_later = 0;
    } else {
      this.is_ride_later = 1;
    }

    if (this.scheduleDate && this.scheduleTime) {
      let d = new Date(
        new Date(
          new Date(this.scheduleDate).toLocaleString("en", {
            timeZone: this.cityDetails.timezone,
          })
        )
      );
      let array: any = this.scheduleTime.split(":");
      d = new Date(d.setHours(array[0], array[1]));
      let now = new Date(
        new Date(
          new Date().toLocaleString("en", {
            timeZone: this.cityDetails.timezone,
          })
        )
      ).getTime();
      this.time_for_schedule = d.getTime() - now;
    }

    this.trip_type = this.TRIP_TYPE.TRIP_TYPE_GUEST_TOKEN;

    let json = {
      created_by: 6,
      first_name: this.guestTripForm.value.first_name,
      last_name: this.guestTripForm.value.last_name,
      // email: this.guestTripForm.value.email,
      country_phone_code: this.guestTripForm.value.country_phone_code,
      phone: this.guestTripForm.value.phone,
      latitude: this.pickup_address.latitude,
      longitude: this.pickup_address.longitude,
      source_address: this.pickup_address.address,
      d_latitude: this.destination_address.latitude,
      d_longitude: this.destination_address.longitude,
      destination_address: this.destination_address.address,
      payment_mode: 1,
      city_id: this.cityDetails._id,
      is_ride_later: this.is_ride_later,
      start_time: "",
      user_type_id: this.guestToken[0]._id,
      user_id: this.guestUserId,
      timezone: this.cityDetails.timezone,
      trip_type: this.trip_type,
      service_type_id: this.guestTripForm.value.service_type_id,
      service_type_id_list: this.service_type_id_list,
      alpha2: this.alpha2,
    };
    this.helper.helper_is_loading = true;
    this.profileService.check_user(json).then((res_data) => {
      this.guestUserId = res_data.user._id;
      json.user_id = res_data.user._id;
      if (this.time_for_schedule) {
        json.start_time = this.time_for_schedule;
      }
      if (res_data.success) {
        this.createTripService.create_Trip(json).then((res_data) => {
          if (this.is_ride_later == 1) {
            this.trackId = res_data.trip.unique_id;
            this.onTrack();
          } else {
            this.trackId = res_data.trip_unique_id;
            this.onTrack();
          }
          this.guestTripForm.reset();
          this.selected_tab = TABS.TAB2;
          this.helper.helper_is_loading = true;
        });
      }
    });
  }

  date_time_picker(): void {
    this.ScheduleDatePickerModal = this.modalService.show(
      this.createSchedulemodal,
      {
        backdrop: true,
        ignoreBackdropClick: true,
        class: "modal-datepicker modal-dialog-centered",
      }
    );
  }

  scheduleRide(): void {
    if (this.guestTripForm.invalid) {
      this.guestTripForm.markAllAsTouched();
      return;
    }
    if (this.scheduleTime) {
      this.date = new Date();
      this.date.setMinutes(
        this.date.getMinutes() +
          this.setting_detail.scheduled_request_pre_start_minute -
          1
      );
      this.date.setSeconds(0);
      let s_time = this.scheduleTime.split(":");
      let s_date = new Date(this.scheduleDate);
      s_date.setHours(Number(s_time[0]));
      s_date.setMinutes(Number(s_time[1]));
      s_date.setSeconds(0);
      if (this.date.getTime() <= s_date.getTime()) {
        if (this.scheduleTime && this.scheduleDate) {
          this.onBook(true);
          return;
        }
      } else {
        this.modalRef = this.modalService.show(this.scheduleRideTime, {
          backdrop: true,
          ignoreBackdropClick: true,
          class: "modal-md modal-dialog-centered",
          keyboard: false,
        });
      }
    } else {
      this.date_time_picker();
    }
  }

  change(i) {
    this.scheduleDate = i;

    let date = new Date();
    if (this.scheduleDate <= date) {
      let current_time_hour = date.getHours();
      let current_time_minute = date.getMinutes();
      let total_minutes =
        current_time_minute +
        this.setting_detail.scheduled_request_pre_start_minute;
      if (total_minutes >= 60) {
        current_time_hour = current_time_hour + 1;
        total_minutes = total_minutes - 60;
      }
      this.default_schedule_time = current_time_hour + ":" + total_minutes;
      this.cdr.detectChanges();
    } else {
      this.default_schedule_time = 0;
      this.cdr.detectChanges();
    }
  }

  timeset(i) {
    this.scheduleTime = i;

    this.ScheduleDatePickerModal.hide();
  }

  onTrack() {
    if (this.trackId === "") {
      this.submited = true;
      return;
    }
    let json: any = {
      token: this.guestToken[0].token_value,
      trip_unique_id: this.trackId || "",
      trip_id: "",
    };

    this.helper.helper_is_loading = true;
    this.createTripService.getTrackTripData(json).then((res) => {
      if (res.trip_data !== null) {
        this.helper.helper_is_loading = false;
        this.guestTripData = res.trip_data;
        this.guestUserId = res.trip_data.user_id;
        if (
          this.guestTripData.is_provider_status >=
          this.helper.PROVIDER_STATUS.ARRIVED
        ) {
          this.trip_cancellation_fee = res.cancellation_fee;
        }
        this.trip_id = res.trip_data._id;
        this.show_providers("", res.trip_data.providerLocation);
        this.setMap();
        this.socket(this.guestTripData._id, res.guest_token.token_value);
      } else {
        this.helper.helper_is_loading = false;
        this.guestTripData = {};
        this.guestUserId = "";
        this.trip_id = "";
        this.setMap();
        this.show_providers("", "");
      }
    });
  }

  convertMinsToHrsMins(minutes) {
    if (minutes > 59) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      const formattedHours = String(hours).padStart(2, "0");
      const formattedMinutes = String(remainingMinutes).padStart(2, "0");
      return `${formattedHours}:${formattedMinutes}` + " hr";
    } else {
      return minutes + " min";
    }
  }

  async socket(id, token) {
    let listner = "'" + id + "'";
    this._socket.connectRoom(listner);
    this._socket.listener(listner).subscribe((res: any) => {
      let json: any = {
        token: this.guestToken[0].token_value,
        trip_unique_id: this.trackId,
        trip_id: id,
      };
      this.createTripService.getTrackTripData(json).then((res) => {
        this.guestTripData = res.trip_data;
        this.guestUserId = res.trip_data.user_id;
        setTimeout(() => {
          if (
            this.guestTripData?.is_provider_status ==
              this.helper.PROVIDER_STATUS.COMPLETED ||
            this.guestTripData.is_trip_cancelled == 1
          ) {
            this.helper._route.navigateByUrl("/");
            this.isShowPopup = true;
          }
        }, 1000);
        if (this.guestTripData) {
          this.destination_address.latitude =
            this.guestTripData.destinationLocation[0];
          this.destination_address.longitude =
            this.guestTripData.destinationLocation[1];

          if (
            this.guestTripData.is_provider_status >=
            this.helper.PROVIDER_STATUS.ARRIVED
          ) {
            this.trip_cancellation_fee = res.cancellation_fee;
          }

          if (
            this.guestTripData.is_provider_accepted == 1 &&
            this.guestTripData.is_provider_status >=
              this.helper.PROVIDER_STATUS.STARTED
          ) {
            let json: any = { trip_id: this.guestTripData._id };

            this.createTripService.polyline(json).then((response) => {
              this.triplocation = response.data.triplocation;
              this.trip_path_array = [];
              this.triplocation.startTripToEndTripLocations.forEach(
                (location) => {
                  let lat = location[0];
                  let lng = location[1];
                  let trip_path = { lat: lat, lng: lng };
                  this.trip_path_array.push(trip_path);
                }
              );
              this.trippath = new google.maps.Polyline({
                path: this.trip_path_array,
                geodesic: true,
                strokeColor: "#FF0000",
                strokeOpacity: 1.0,
                strokeWeight: 2,
              });
              this.trippath.setMap(this.map);
            });
          }
        }

        if (res.trip_data.confirmed_provider !== null) {
          let location = new google.maps.LatLng(
            res.trip_data.providerLocation[0],
            res.trip_data.providerLocation[1]
          );
          this.provider_markers = [];
          let marker = new google.maps.Marker({
            position: location,
            map: this.map,
            draggable: false,
            icon: DEFAULT_IMAGE.DRIVER_ICON,
          });
          this.provider_markers.push(marker);
        }
      });
    });
  }

  TotalTax() {
    return (
      this.guestTripData.user_tax_fee +
      this.guestTripData.tax_fee +
      this.guestTripData.user_miscellaneous_fee
    );
  }

  view_map() {
    $('#map div.gm-style button[title="Toggle fullscreen view"]').trigger(
      "click"
    );
  }

  cancel_trip() {
    this.createTripService
      .get_cancellation_reason({ user_type: 1, lang: this.helper.selectedLang })
      .then((res) => {
        let CANCEL_REASON = res.reasons;
        this.cancellation_reasons_list = CANCEL_REASON;
      });
    this.cancelTripmodal = true;
  }

  onSelectReason(event) {
    this.cancellation_type = event.target.value;
    if (event.target.value !== "Other") {
      this.cancellation_reason = event.target.value;
    } else {
      this.cancellation_reason = "";
    }
  }

  confirmationModalClose() {
    this.confirmModelRef.hide();
  }

  confirmCancelTrip() {
    let json = {
      user_id: this.guestTripData.user_id,
      cancel_reason: this.cancellation_reason,
      trip_id: this.guestTripData._id,
    };
    this.createTripService.trip_cancel_by_guest(json).then((response) => {
      if (response.success) {
        this.cancelTripmodal = false;
        this.cancellation_reason = null;
        this.trip_cancellation_fee = null;
      }
    });
  }

  getBannerList(){
    this._commonService.get_banner().then((res) =>  {
      console.log(res);
      this.bannerList = res.banners
    })
  }
}
