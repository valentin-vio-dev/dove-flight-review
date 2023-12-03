import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OsdService {

  constructor(private httpClient: HttpClient) { }

  generateDataFromOSD(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.httpClient.post(`${environment.API_URL}/osd`, formData);
  }
}
