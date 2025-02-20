import { Component, EventEmitter, HostListener, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { HistoryService } from '../../../services/history.service'
import { LocationService } from 'src/app/services/location.service';
import { Helper } from 'src/app/shared/helper'
import { environment } from 'src/environments/environment';
import { HistoryModelData } from 'src/app/models/history-model.model'
import { DEFAULT_IMAGE } from 'src/app/constants/constants';
import { CreateTripService } from 'src/app/services/create-trip.service';

declare const google: any;

@Component({
  selector: 'app-future-request-details-modal',
  templateUrl: './future-request-details-modal.component.html',
  styleUrls: ['./future-request-details-modal.component.scss']
})
export class FutureRequestDetailsModalComponent {
  modalRef: BsModalRef;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-right'
  };
  cancelModelConfig = {
    backdrop: true,
    ignoreBackdropClick: true,
  };
  confirmModelRef: BsModalRef;
  tripdetail: any;
  provider: HistoryModelData = new HistoryModelData();
  trip_id: any;
  destinationAddress: any;
  map: any = null;
  destination_marker: any;
  pickup_marker: any;
  change_lat: any;
  address: any;
  address_error: string;
  mylocation: any;
  pickup_address: any;
  destinationlat: any;
  destinationlng: any;
  sourcelat: any;
  sourcelng: any;
  imagefile: any;
  IMAGE_URL = environment.IMAGE_URL;
  DEFAULT_IMAGE = DEFAULT_IMAGE.USER_PROFILE;
  profile_image: any = this.DEFAULT_IMAGE;
  destlat: any;
  destlng: any;
  dest_marker: any;
  ratingData: any;
  rating_rate: any;
  rating_comment: any;
  token: any;
  phoneNumber: any;
  is_provider: boolean = false;
  trip_path_array: any[] = [];
  triplocation: any;
  cancellation_reasons_list: any;
  cancellation_type: any = '';
  cancellation_reason: any = '';
  trip_cancellation_fee: number;
  directionsService: any;
  DirectionsRenderer: any;

  @Output() historyDataHandler: EventEmitter<any> = new EventEmitter();
  @ViewChild('template', { static: true }) template: TemplateRef<any>;
  @ViewChild('confirmationTemplate', { static: true }) confirmationTemplate: TemplateRef<any>;

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.code === 'Escape') {
      this.modalRef?.onHidden.subscribe(() => {
        this.closeModal();
      })
    }
  }

  constructor(private modalService: BsModalService, private _usertripedetail: HistoryService, public _locationService: LocationService, public helper: Helper, private _createTripService: CreateTripService) { }

  show(trip: any): void {
    this.tripdetail = trip;
    this.trip_id = trip._id;
    this.futureRequestTripDetails();
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

  futureRequestTripDetails() {
    this.modalRef = this.modalService.show(this.template, this.config);
    this.phoneNumber = this.helper.user_details;
    this.profile_image = this.IMAGE_URL + this.phoneNumber.picture;
    this.sourcelat = this.tripdetail?.sourceLocation[0];
    this.sourcelng = this.tripdetail?.sourceLocation[1];
    this.destlat = this.tripdetail?.destinationLocation[0];
    this.destlng = this.tripdetail?.destinationLocation[1];
    if (this.tripdetail?.destination_addresses) {
      this.destinationAddress = this.tripdetail?.destination_addresses;
    }
    if (this.tripdetail?.is_provider_status >= this.helper.PROVIDER_STATUS.ARRIVED) {
      this.trip_cancellation_fee = this.tripdetail.service_type?.cancellation_fee;
    }

    if (this.tripdetail?.is_provider_accepted == 1 && this.tripdetail?.is_provider_status >= this.helper.PROVIDER_STATUS.STARTED) {
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
        let trippath = new google.maps.Polyline({
          path: this.trip_path_array,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
        trippath.setMap(this.map);
      });
    }

    this.helper.loadGoogleScript("https://maps.googleapis.com/maps/api/js?key=" + this.helper.GOOGLE_KEY + "&libraries=places").then(() => {
      this.directionsService = new google.maps.DirectionsService();
      this.DirectionsRenderer = new google.maps.DirectionsRenderer();
      this.setMap();
    })
    if (this.tripdetail.confirmed_provider) {
      let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, trip_id: this.trip_id, provider_id: this.tripdetail.confirmed_provider }
      this._usertripedetail.get_provider_info(json).then(res_data_p => {
        this.provider = res_data_p.provider;
        this.is_provider = true
        this.profile_image = this.IMAGE_URL + this.provider.picture;
      })
    }
  }

  setMap() {
    let lat = Number(this.sourcelat);
    let lng = Number(this.sourcelng);

    let theme = localStorage.getItem('vien-themecolor');
    if (theme.includes('dark')) {
      this.map = new google.maps.Map(document.getElementById('map'), {
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
      this.map = new google.maps.Map(document.getElementById('map'), {
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
      legend.appendChild(div);
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
    if (this.destinationAddress) {
      let stop_markers = 1;
      this.destinationAddress.forEach((address, index) => {
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

    this.map.fitBounds(bounds);

    if (this.tripdetail?.is_provider_accepted != 1 && this.tripdetail?.is_provider_status <= this.helper.PROVIDER_STATUS.STARTED) {
      const waypts: google.maps.DirectionsWaypoint[] = [];
      this.directionsService.route({
        origin: { lat: this.tripdetail?.sourceLocation[0], lng: this.tripdetail?.sourceLocation[1] },
        destination: { lat: this.tripdetail?.destinationLocation[0], lng: this.tripdetail?.destinationLocation[1] },
        waypoints: waypts,
        optimizeWaypoints: false,
        travelMode: google.maps.TravelMode.DRIVING,
      }).then((response) => {
        this.DirectionsRenderer.setDirections(response);
        this.DirectionsRenderer.setMap(this.map);
        this.DirectionsRenderer.setOptions({ suppressMarkers: true });
      })
    }
  }

  cancletrip() {
    this._createTripService.get_cancellation_reason({ user_type: 1, lang: this.helper.selectedLang }).then((res) => {
      let CANCEL_REASON = res.reasons;
      this.cancellation_reasons_list = CANCEL_REASON;
      this.confirmModelRef = this.modalService.show(this.confirmationTemplate, this.cancelModelConfig);
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

  confirm() {
    if (this.tripdetail.openride) {
      let json = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, open_ride_id: this.tripdetail._id, id: this.tripdetail.user_details?._id, cancel_reason: this.cancellation_reason }
      this._createTripService.openRideCancleTrip(json).then(response => {
        if (response.success) {
          this.cancel();
          this.closeModal();
          this.historyDataHandler.emit();
        }
      });
    } else {
      let json = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, trip_id: this.tripdetail._id, cancel_reason: this.cancellation_reason }
      this._createTripService.cancle_Trip(json).then(response => {
        if (response.success) {
          this.cancel();
          this.closeModal();
          this.historyDataHandler.emit();
        }
      });
    }
  }

  //cancel trip modal close
  cancel() {
    this.confirmModelRef.hide()
  }

  closeModal() {
    this.modalRef.hide();
    this.is_provider = false;
    this.cancellation_reasons_list = [];
    this.cancellation_reason = '';
    this.cancellation_type = '';
  }

}
