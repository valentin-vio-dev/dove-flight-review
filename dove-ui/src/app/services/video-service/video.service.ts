import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  constructor(private httpClient: HttpClient) { }

  uploadVideo(file: File) {;
    const formData = new FormData();
    formData.append("video", file);
    return this.httpClient.post(`${environment.API_URL}/video`, formData);
  }
}
