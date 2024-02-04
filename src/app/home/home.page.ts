import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { GoogleMap, Marker } from '@capacitor/google-maps';
import { ModalController } from '@ionic/angular';
import { ModalPage } from '../modal/modal.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  //npm install @capacitor/geolocation
  //npm i @capacitor/google-maps

  latitude: any;
  longitude: any;

  @ViewChild('map') mapRef: ElementRef | any;
  map: GoogleMap | any;

  constructor(private modalCtrl: ModalController) { }

  async createMap() {
    this.map = await GoogleMap.create({
      id: 'my-map',
      apiKey: 'AIzaSyAZrsUSmnpXrKpR_669whxoeU0awPLz5yQ',
      element: this.mapRef.nativeElement,
      config: {
        center: {
          lat: this.latitude,
          lng: this.longitude
        },
        zoom: 8,
      },
    });
    await this.addMarkers();
  }

  async addMarkers() {
    const currentLocationMarker: Marker = {
      coordinate: {
        lat: this.latitude,
        lng: this.longitude,
      },
      title: 'Current Location',
      snippet: 'You are here',
    };
    const result = await this.map.addMarker(currentLocationMarker);

    this.map.setOnMarkerClickListener(async (marker: any) => {
      const modal = await this.modalCtrl.create({
        component: ModalPage,
        componentProps: {
          marker,
        },
        breakpoints: [0, 0.3],
        initialBreakpoint: 0.3,
        backdropDismiss: false,
        showBackdrop: false,
      });
      modal.present();
    });
  }

  async getLocation() {
    this.latitude = null;
    this.longitude = null;
    try {
      const permissionStatus = await Geolocation.checkPermissions();

      if (permissionStatus.location === 'granted') {
        const position = await Geolocation.getCurrentPosition();
        const { latitude, longitude } = position.coords;

        this.latitude = latitude;
        this.longitude = longitude;

        if (this.latitude != null && this.longitude != null) {
          this.createMap();
        }
      } else if (permissionStatus.location === 'prompt') {
        const permissionResult = await Geolocation.requestPermissions();

        if (permissionResult.location === 'granted') {
          const position = await Geolocation.getCurrentPosition();
          const { latitude, longitude } = position.coords;

          this.latitude = latitude;
          this.longitude = longitude;

          if (this.latitude != null && this.longitude != null) {
            this.createMap();
          }
        }
      } else {
        console.error('Geolocation permission denied.');
      }
    } catch (error) {
      console.error('Error retrieving location:', error);
    }
  }
}
