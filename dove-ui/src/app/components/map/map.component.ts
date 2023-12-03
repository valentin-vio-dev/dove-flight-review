import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { MAX_LINES } from 'src/app/const/settings.const';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnChanges  {
  @Input() osdFrames: any[];
  @Input() osdStats: any;
  @Input() sliderPosition: number;

  map: L.Map;
  marker: L.Marker
  idx: number = 0;
  lines: L.Polyline[] = [];

  hasZoom: boolean = false;
  
  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['osdFrames'] && !changes['osdFrames'].firstChange) {
      this.initMapWithOSD();
    }
    
    if (changes['sliderPosition'] && !changes['sliderPosition'].firstChange) {
      this.updateView(this.sliderPosition);
      this.addLinePath();
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    this.map = L.map('map', {
      center: [47.298371, 15.3597601],
      zoom: 3
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }

  updateView(index: number) {
    if (this.hasZoom) {
      this.map.setView(this.getCoordiante(index));
    } else {
      this.map.setView(this.getCoordiante(index), 16);
      this.hasZoom = true;
    }
    this.putMarker(this.getCoordiante(index));
  }

  initMapWithOSD() {
    this.updateView(0);
  }

  getCoordiante(index: number): L.LatLng {
    return new L.LatLng(
      this.osdFrames[index]['latitude'], 
      this.osdFrames[index]['longitude'], 
      this.osdFrames[index]['altitude']
    );
  }

  putMarker(coordinate: L.LatLng) {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = new L.Marker(coordinate);
    this.marker = this.marker.setIcon(new L.Icon({ 
      iconUrl: 'assets/gps_point.png',
      iconSize: L.point(35, 35)
    }));
    this.map.addLayer(this.marker)
  }

  addLinePath() {
    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i].remove();
    }
    this.lines = [];

    if (this.sliderPosition > 0) {
      let lineCount = 0;
      for (let i = 0; i <= this.sliderPosition - 1; i++) {
        const speed = this.osdFrames[this.sliderPosition - i]['speed'];
        const speedPercentage = speed / this.osdStats['speed']['max'];
        const color = `hsl(${(1 - speedPercentage) * 120}, 100%, 50%)`;
        const line = new L.Polyline([this.getCoordiante(this.sliderPosition - i), this.getCoordiante(this.sliderPosition - i - 1)], { weight: 2, color })
        this.lines.push(line)
        this.map.addLayer(line);
        lineCount++;
        
        if (lineCount >= MAX_LINES) {
          break;
        }
      }
    }
  }
}
