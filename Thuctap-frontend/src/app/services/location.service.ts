import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiKey = 'AIzaSyDSObt4_bIwfovMlCTHXmWmjODFz6pG_F4';

  constructor(private http: HttpClient) {}

  getCoordinatesFromAddress(address: string) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;

    return this.http.get(url).toPromise().then((response: any) => {
      if (response.status === 'OK') {
        const location = response.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      }
      throw new Error('Không tìm thấy tọa độ');
    });
  }
}