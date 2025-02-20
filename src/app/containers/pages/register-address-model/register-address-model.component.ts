import { Component, EventEmitter, HostListener, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Helper } from 'src/app/shared/helper';
import * as $ from "jquery";

declare const google: any

@Component({
  selector: 'app-register-address-model',
  templateUrl: './register-address-model.component.html',
  styleUrls: ['./register-address-model.component.scss']
})
export class RegisterAddressModelComponent {
  addressCloseModal: BsModalRef;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-xl modal-dialog-centered',
    // keyboard: false
  };
  map_addresses: any = [];
  address: any;
  map: any = null;
  lat: number = 22.3039;
  lng: number = 70.8022;
  marker: any;
  type: string = '';
  address_validation: boolean = false;
  data_submitted: boolean = false;

  @Output() saveAddress: EventEmitter<any> = new EventEmitter();
  @ViewChild('addressModal', { static: true }) addressModal: TemplateRef<any>;

  constructor(private modalService: BsModalService, private helper: Helper) { }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.code === 'Escape') {
      if (this.addressCloseModal) {
        this.addressCloseModal.onHidden.subscribe(() => {
          setTimeout(() => {
            this.address = '';
            this.lat = 22.3039;
            this.lng = 70.8022;
          }, 500);
        })
      }
    }
  }

  closeModal() {
    this.addressCloseModal.hide();
    setTimeout(() => {
      this.address = '';
      this.lat = 22.3039;
      this.lng = 70.8022;
      this.address_validation = false;
      this.data_submitted = false;
    }, 500);
  }

  show(address, address_validation = false): void {
    this.address_validation = address_validation;
    if (address.latitude) {
      this.address = address.address
      this.lat = address.latitude
      this.lng = address.longitude
    }
    if (address.type) {
      this.type = address.type
    }
    this.addressCloseModal = this.modalService.show(this.addressModal, this.config)
    this.helper.loadGoogleScript("https://maps.googleapis.com/maps/api/js?key=" + this.helper.GOOGLE_KEY + "&libraries=places").then(() => {
      this.set_map(address.map_pin)
      this._inithomeAutoComplete();
    })
  }

  _inithomeAutoComplete() {
    let autoEletment = document.getElementById("_address") as HTMLInputElement;
    let autocomplete = new google.maps.places.Autocomplete((autoEletment), { types: [] });
    autocomplete.addListener('place_changed', () => {
      let place = autocomplete.getPlace();

      let lat = place.geometry.location.lat();
      let lng = place.geometry.location.lng();
      let address = place['formatted_address'];

      this.lat = lat;
      this.lng = lng;
      this.address = address;
      this.marker.setPosition(place.geometry.location);
      this.map.setCenter(place.geometry.location);
      this.map_addresses = {
        "address": this.address,
        "latitude": this.lat,
        "longitude": this.lng,
        "type": this.type
      }
    });
    $('.address-search-location').find("#_address").on("focus click keypress", () => {
      $('.address-search-location').find("#_address").parent(".input-wrp").css({ position: "relative" }).append($(".pac-container"));
    });
  }

  set_map(map_pin) {

    let theme = localStorage.getItem('vien-themecolor');
    if (theme.includes('dark')) {
      this.map = new google.maps.Map(document.getElementById('map1'), {
        zoom: 12,
        center: { lat: this.lat, lng: this.lng },
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
      this.map = new google.maps.Map(document.getElementById('map1'), {
        zoom: 12,
        center: { lat: this.lat, lng: this.lng },
        draggable: true,
        zoomControl: true,
        scrollwheel: true,
        disableDoubleClickZoom: false,
        fullscreenControl: true
      });
    }
    let location = new google.maps.LatLng(this.lat, this.lng);
    this.marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: map_pin,
      draggable: true
    });

    google.maps.event.addListener(this.marker, 'dragend', async (marker) => {
      this.lat = marker.latLng.lat();
      this.lng = marker.latLng.lng();
      let geocoder = new google.maps.Geocoder();
      let location = new google.maps.LatLng(this.lat, this.lng)
      let request = { latLng: location };
      this.marker.setPosition(location);
      this.map.setCenter(location);
      geocoder.geocode(request, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          this.address = results[0].formatted_address;
          this.map_addresses = {
            "address": this.address,
            "latitude": this.lat,
            "longitude": this.lng,
            "type": this.type
          }
        }
      });
    })
  }

  mapAddress() {
    this.data_submitted = true;
    if (this.address_validation && !this.address) {
      return;
    }
    this.address_validation = false;
    this.data_submitted = false;
    this.saveAddress.emit(this.map_addresses);
    this.addressCloseModal.hide()
  }

}
