import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DEFAULT_IMAGE } from 'src/app/constants/constants';
import { CommonService } from 'src/app/services/common.service';
import { CreateTripService } from 'src/app/services/create-trip.service';
import { LocationModel, LocationService } from 'src/app/services/location.service';
import { Helper } from 'src/app/shared/helper';
import { environment } from 'src/environments/environment';
import { SocketService } from "src/app/services/socket.service";
import { HistoryService } from 'src/app/services/history.service';
import { NotifiyService } from 'src/app/services/notifier.service';

declare const google;

@Component({
  selector: 'app-track-trip',
  templateUrl: './track-trip.component.html',
  styleUrls: ['./track-trip.component.scss']
})
export class TrackTripComponent implements OnInit, OnDestroy {
  trip_path_array: any[] = [];
  provider_markers: any[] = [];
  trackId: any = "";
  submited: boolean;
  guestTripData: any;
  guestUserId: any = "";
  trip_id: any;
  triplocation: any;
  trippath: any;
  setting_detail: any;
  DirectionsRenderer: any;
  providerLocation: any;
  store_marker: any = null;
  destination_marker: any = null;
  admin_detail: any;
  guestToken: any;
  provider: any;
  track_params: any;
  map: google.maps.Map;
  DEFAULT_IMAGE = DEFAULT_IMAGE.USER_PROFILE;
  IMAGE_URL = environment.IMAGE_URL;
  pickup_address: LocationModel = new LocationModel();
  destination_address: LocationModel = new LocationModel();
  change_lat: number;
  change_lng: number;
  is_ride_now: boolean;
  is_provider: boolean = false;
  profile_image: any = this.DEFAULT_IMAGE;
  tripAddress: any;
  trip_type_name: any;
  trip_city_detail: any;
  isPromoUsed: any = 0;
  is_cancle_trip: boolean = false;
  trip_cancellation_fee: number;
  is_trip_running: any = true;

  constructor(public helper: Helper, private _commonService: CommonService, private createTripService: CreateTripService, private _locationService: LocationService, private route: ActivatedRoute, private _socket: SocketService, private historyService: HistoryService, private notifierService: NotifiyService) { }
  ngOnDestroy(): void {
    if (this.guestTripData?._id) {
      let listner = "'" + this.guestTripData?._id + "'";
      this._socket.disconnetRoom(listner);
    }
  }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
        this.track_params = params;
        if (!this.track_params.user_id) {
          this.helper._route.navigate(['/']);
        }
      }
      );

    if (this.track_params.user_id) {
      this.helper.loadGoogleScript("https://maps.googleapis.com/maps/api/js?key=" + this.helper.GOOGLE_KEY + "&libraries=places").then(() => {
        this.setMap();
      });

      this._commonService.get_setting_detail({}).then((setting_detail) => {
        this.admin_detail = setting_detail.setting_detail;
        this.setting_detail = setting_detail.setting_detail;
        this.onTrack()
      });
    }
  }

  onTrack() {
    // if (this.trackId === "") {
    //   return (this.submited = true);
    // // }
    // let json: any = {
    //   token: this.setting_detail.active_guest_token,
    //   trip_unique_id: this.track_id._id || '',
    //   trip_id: "",
    // };
    let json: any = { user_id: this.track_params.user_id, trip_id: this.track_params.trip_id, trackUrl: true }
    this.helper.helper_is_loading = true;
    this.historyService.get_usergettripstatus(json).then((res) => {
      if (res.success) {
        this.helper.helper_is_loading = false;
        this.guestTripData = res.trip;
        this.guestUserId = res.trip.user_id;
        this.trip_id = res.trip._id;
        this.tripAddress = res.trip.destination_addresses;
        this.trip_type_name = res.type_name;
        this.trip_city_detail = res.city_detail;
        this.isPromoUsed = res.isPromoUsed;
        this.is_trip_running = true;
        if (this.guestTripData.is_provider_status >= this.helper.PROVIDER_STATUS.STARTED) {
          this.is_cancle_trip = false;
        } else {
          this.is_cancle_trip = true;
          if (this.guestTripData.is_provider_status >= this.helper.PROVIDER_STATUS.ARRIVED) {
            this.trip_cancellation_fee = res.cancellation_fee
          }
        }
        this.setMap();
        this.show_providers("", res.trip.providerLocation);
        this.socket(this.guestTripData._id);
        if (res.trip.confirmed_provider !== null && !this.is_provider) {
          let json: any = { user_id: this.track_params.user_id, trip_id: this.track_params.trip_id, provider_id: res.trip.confirmed_provider }
          this.historyService.get_provider_info(json).then(res_data_p => {
            this.provider = res_data_p.provider;
            this.is_provider = true
            this.profile_image = this.IMAGE_URL + this.provider.picture;
            let location = new google.maps.LatLng(this.provider.providerLocation[0], this.provider.providerLocation[1]);
            this.provider_markers.forEach((marker) => {
              marker.setMap(null);
            });
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
      } else {
        this.helper.helper_is_loading = false;
        this.guestTripData = {};
        this.is_trip_running = false;
        this.helper._route.navigateByUrl('/')
        this.notifierService.showNotification('error', this.helper.trans.instant(`error-code.${res.error_code}`))
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

  setMap() {

    let theme = localStorage.getItem('vien-themecolor');
    if (theme.includes('dark')) {
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
        zoomControl: true,
        scrollwheel: true,
        disableDoubleClickZoom: true,
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
        zoomControl: true,
        scrollwheel: true,
        disableDoubleClickZoom: true,
        fullscreenControl: true,
      });
    }
    // }
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
        this.guestTripData.is_provider_status >= this.helper.PROVIDER_STATUS.STARTED
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
            for (let value of results[0].address_components) {
              const addressType = value.types[0];
              if (addressType === "country") {
                const countryName = value.long_name;
                const countryCode = value.short_name;
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

  async socket(id) {
    let listner = "'" + id + "'";
    this._socket.connectRoom(listner);
    this._socket.listener(listner).subscribe((res: any) => {
      let json: any = { user_id: this.track_params.user_id, trip_id: this.track_params.trip_id, trackUrl: true }
      this.historyService.get_usergettripstatus(json).then((res) => {
        this.guestTripData = res.trip;
        this.guestUserId = res.trip.user_id;
        if (this.guestTripData) {
          this.destination_address.latitude =
            this.guestTripData.destinationLocation[0];
          this.destination_address.longitude =
            this.guestTripData.destinationLocation[1];

          if (
            this.guestTripData.is_provider_accepted == 1 &&
            this.guestTripData.is_provider_status >= this.helper.PROVIDER_STATUS.STARTED
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

        if (res.trip.confirmed_provider !== null) {
          this.provider_markers.forEach((marker) => {
            marker.setMap(null);
          });
          let location = new google.maps.LatLng(
            res.trip.providerLocation[0],
            res.trip.providerLocation[1]
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
}
