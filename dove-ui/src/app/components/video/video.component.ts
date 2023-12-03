import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('videoSource') videoSource: ElementRef;
  @ViewChild('video') video: ElementRef;
  @ViewChild('videoContainer') videoContainer: ElementRef;
  
  @Input() osdData: any[];
  @Input() videoFileName: string;
  @Input() sliderPosition: number;

  videoContainerSize: { width: number, height: number };

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this.video.nativeElement.height = 0;
      this.videoContainerSize = {
        width: this.videoContainer.nativeElement.clientWidth,
        height: this.videoContainer.nativeElement.clientHeight
      };
      this.video.nativeElement.height = this.videoContainerSize.height;
    });
  }

  ngAfterViewInit(): void {
    this.videoContainerSize = {
      width: this.videoContainer.nativeElement.clientWidth,
      height: this.videoContainer.nativeElement.clientHeight
    };
    this.video.nativeElement.height = this.videoContainerSize.height;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sliderPosition'] && !changes['sliderPosition'].firstChange) {
      this.video.nativeElement.currentTime = this.millisToSeconds(this.osdData[this.sliderPosition]['osd_millis']); // -1 or not?
    }

    if (changes['videoFileName'] && !changes['videoFileName'].firstChange) {
      this.videoSource.nativeElement.src = `${environment.API_URL}/video?name=${this.videoFileName}`;
      this.video.nativeElement.load();
      this.video.nativeElement.height = this.videoContainerSize.height;
    }
  }

  millisToSeconds(millis: number) {
    const time = millis / 1000
    return time;
  }
}
