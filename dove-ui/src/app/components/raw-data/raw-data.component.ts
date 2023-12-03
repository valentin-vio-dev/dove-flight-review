import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-raw-data',
  templateUrl: './raw-data.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./raw-data.component.scss']
})
export class RawDataComponent implements OnInit {
  @Input() osdFrames: any[];
  @Input() sliderPosition: number;

  ngOnInit(): void {
    
  }

  getFrameDataAsArray() {
    if (!this.osdFrames) {
      return [];
    }
    
    const fixedDecimalsElement = ['x', 'y', 'z'];
    const data = { ...this.osdFrames[this.sliderPosition] };
    let arrayData = Object.keys(data).map((key: string) => [key, data[key]]);
    arrayData = arrayData.sort((a, b) => a[0].localeCompare(b[0]));
    arrayData = arrayData.map(d => 
      fixedDecimalsElement.includes(d[0]) ? [d[0], d[1].toFixed(4)] : d
    );
    return arrayData;
  }
}
