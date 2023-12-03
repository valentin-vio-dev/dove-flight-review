import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { OpenDataListBsheetComponent } from './components/open-data-list-bsheet/open-data-list-bsheet.component';
import { OsdService } from './services/osd-service/osd.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VideoService } from './services/video-service/video.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  osdFrames: any[];
  osdStats: any;
  sliderPosition: number = 0;
  endText: string = '00:00:00';
  loading: boolean = false;
  recordPlaying: boolean = false;
  recordInterval: any;
  videoFileName: string;

  FPS: number;
  FPS_INTERVAL: number;
  startTime: number;
  now: number;
  then: number;
  elapsed: number;
  playbackSpeedIndex: number = 2;
  playbackSpeeds: number[] = [0.25, 0.5, 1, 2, 4];

  osdFilename: string;

  version: string = '0.0.1';

  constructor(
    private bottomSheet: MatBottomSheet,
    private osdService: OsdService,
    private videoService: VideoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        this.togglePlay();
      } else if (event.code === 'ArrowRight' && this.osdFrames) {
        event.preventDefault();
        if (this.sliderPosition < this.osdFrames.length - 1) {
          this.sliderPosition++;
        }
      } else if (event.code === 'ArrowLeft' && this.osdFrames) {
        event.preventDefault();
        if (this.sliderPosition > 0) {
          this.sliderPosition--;
        }
      } else if (event.code === 'ArrowUp') {
        event.preventDefault();
        if (this.playbackSpeedIndex < this.playbackSpeeds.length - 1) {
          this.playbackSpeedIndex++;
          this.changePlaybackSpeed(this.playbackSpeedIndex);
        }
      } else if (event.code === 'ArrowDown') {
        event.preventDefault();
        if (this.playbackSpeedIndex > 0) {
          this.playbackSpeedIndex--;
          this.changePlaybackSpeed(this.playbackSpeedIndex);
        }
      }
    });
  }

  togglePlay() {
    if (!this.osdFrames) {
      return;
    }
    
    this.recordPlaying = !this.recordPlaying;
    this.recordPlaying ? this.play() : this.stop();
  }

  openUploadSheet() {
    if (this.loading) {
      return;
    }
    
    const config = { data: { osd: this.osdFrames !== undefined, video: this.videoFileName !== undefined } };
    const sheet = this.bottomSheet.open(OpenDataListBsheetComponent, config);
    sheet.afterDismissed().subscribe((res: { type: string, file: File }) => {
      if (!res) {
        return
      };

      if (res.type === 'OSD') {
        this.uploadOsdFile(res.file);
      } else if (res.type === 'VID') {
        this.uploadVideoFile(res.file);
      }
    });
  }

  uploadOsdFile(file: File) {
    this.osdFilename = file.name.split('.')[0];
    this.loading = true;
    this.osdService.generateDataFromOSD(file).subscribe((res: any) => {
      this.osdFrames = res['data']['osdFrames'];
      this.osdStats = res['data']['stats'];

      this.FPS = res['data']['fps'];
      this.FPS_INTERVAL = 1000 / this.FPS

      const lastMillis = this.osdFrames[this.osdFrames.length - 1]['osd_millis'];
      this.endText = this.millisToText(lastMillis);

      this.loading = false;
      this.snackBar.open('OSD file loaded!', '', { duration: 2000 });
    }, (err: any) => {
      this.snackBar.open('Something went wrong!', '', { duration: 2000 });
      this.loading = false;
    });
  }

  uploadVideoFile(file: File) {
    this.loading = true;
    this.videoService.uploadVideo(file).subscribe((res: any) => {
      this.videoFileName = res['data']['filename'];
      this.loading = false;
      this.snackBar.open('Video file loaded!', '', { duration: 2000 });
    }, (err: any) => {
      this.snackBar.open('Something went wrong!', '', { duration: 2000 });
      this.loading = false;
    });
  }

  downloadOsdAsCsv() {
    this.loading = true;
    const header = Object.keys(this.osdFrames[0]).join(';');
    const dataArray = this.osdFrames.map(
      (element: any) => Object.values(element).map(
        (e: any) => e.
          toString().
          replace(/\./g, ',').
          replace(/\:/g, '::') // TODO handle later
        ).join(';')
    );
    dataArray.unshift(header);
    const data = dataArray.join('\r\n');
    const blob = new Blob([data], { type: 'text/csv' })
    saveAs(blob, `${this.osdFilename}.csv`);
    this.loading = false;
  }

  millisToText(millis: number) {
    const time = millis / 1000
    let h = Math.floor(Math.abs(time / 60 / 60));
    let m = Math.floor(Math.abs(time / 60 % 60));
    let s = Math.floor(Math.abs(time % 60));
    let res = '';
    res += (h < 10 ? '0'+h+':' : h+':');
    res += (m < 10 ? '0'+m+':' : m+':');
    res += (s < 10 ? '0'+s : s);
    return res;
  }

  getCurrentTime() {
    if (!this.osdFrames) {
      return '00:00:00';
    }

    return this.millisToText(this.osdFrames[this.sliderPosition]['osd_millis']);
  }

  play() {
    this.then = Date.now();
    this.startTime = this.then;
    this.animate();
  }

  animate() {
    this.now = Date.now();
    this.elapsed = this.now - this.then;

    if (this.elapsed > this.FPS_INTERVAL) {
      this.then = this.now - (this.elapsed % this.FPS_INTERVAL);
      if (this.sliderPosition < this.osdFrames.length - 1) {
        this.sliderPosition += 1;
      } else {
        this.stop();
      }
    }

    if (!this.recordPlaying) {
      return;
    }

    requestAnimationFrame(this.animate.bind(this));
  }

  stop() {
    clearInterval(this.recordInterval);
    this.recordPlaying = false;
  }

  reset() {
    window.location.reload();
  }

  changePlaybackSpeed(speedIndex: number) {
    this.playbackSpeedIndex = speedIndex;
    this.FPS_INTERVAL = (1000 / this.FPS) / this.playbackSpeeds[this.playbackSpeedIndex];
  }
}
