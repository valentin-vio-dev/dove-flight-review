import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MAX_LINES, METER_IN_PIXEL } from 'src/app/const/settings.const';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

@Component({
  selector: 'app-ddd-view',
  templateUrl: './ddd-view.component.html',
  styleUrls: ['./ddd-view.component.scss']
})
export class DddViewComponent implements OnInit, AfterViewInit, OnChanges {
  /**
   * New coordiante sytem:
   * X: red
   * Y: green
   * Z: blue
   */

  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('canvasContainer') canvasContainer: ElementRef;

  @Input() osdFrames: any[];
  @Input() osdStats: any;
  @Input() sliderPosition: number;

  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  clock: THREE.Clock;
  drone: THREE.Mesh;
  path: Line2;
  grid: THREE.GridHelper;
  maxAllSize: number;
  boxHeight: number;
  xLine: THREE.Line;
  yLine: THREE.Line;
  zLine: THREE.Line;

  canvasContainerSize: { width: number, height: number };

  constructor() {}

  ngAfterViewInit(): void {
    this.canvas.nativeElement.height = 0;
    this.canvas.nativeElement.width = 0;
    this.canvasContainerSize = {
      width: this.canvasContainer.nativeElement.clientWidth,
      height: this.canvasContainer.nativeElement.clientHeight
    };
    this.canvas.nativeElement.width = this.canvasContainerSize.width;
    this.canvas.nativeElement.height = this.canvasContainerSize.height;

    this.initScene();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['osdFrames'] && !changes['osdFrames'].firstChange) {
      this.onOsdData();
      this.setInitialObjects();
      this.update();
    }
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this.canvas.nativeElement.height = 0;
      this.canvas.nativeElement.width = 0;
      this.canvasContainerSize = {
        width: this.canvasContainer.nativeElement.clientWidth,
        height: this.canvasContainer.nativeElement.clientHeight
      };
      this.canvas.nativeElement.width = this.canvasContainerSize.width;
      this.canvas.nativeElement.height = this.canvasContainerSize.height;

      this.camera.aspect = this.canvas.nativeElement.clientWidth / this.canvas.nativeElement.clientHeight;
      this.camera.updateProjectionMatrix();
  
      this.renderer.setSize(this.canvas.nativeElement.clientWidth, this.canvas.nativeElement.clientHeight);
      this.renderer.render(this.scene, this.camera);
    });
  }

  onOsdData() {
    const xLen = this.osdStats['x']['max'] - this.osdStats['x']['min'];
    const yLen = this.osdStats['y']['max'] - this.osdStats['y']['min'];
    this.maxAllSize = Math.max(xLen, yLen);
    
    // Remove inital grid
    this.grid.geometry.dispose();
    this.scene.remove(this.grid);
    this.grid = null as any;

    // Add new grid
    this.grid = new THREE.GridHelper(this.maxAllSize * 2, (this.maxAllSize * 2) / 10, 0x64666a, 0x43454a); // TODO maxSize / 10
    this.grid.rotateX(this.degreesToRadians(90));
    this.scene.add(this.grid); 

    this.boxHeight = this.osdStats['z']['max'] - this.osdStats['z']['min'];
    const geometry = new THREE.BoxGeometry(this.maxAllSize * 2, this.maxAllSize * 2, this.boxHeight); 
    const mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
    mesh.position.z = this.boxHeight / 2;
    const helper = new THREE.BoxHelper(mesh, 0x43454a);
    this.scene.add(helper);
  }

  initScene() {
    THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0,0,1);

    this.scene = new THREE.Scene();

    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    this.grid = new THREE.GridHelper(METER_IN_PIXEL * 500, 100, 0x64666a, 0x43454a);
    this.grid.rotateX(this.degreesToRadians(90));
    this.scene.add(this.grid); 

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.nativeElement.clientWidth / this.canvas.nativeElement.clientHeight,
      0.001,
      5000
    );
    this.camera.up.set(0,0,1);
    this.camera.position.z = METER_IN_PIXEL * 2;
    this.camera.position.y = 0;
    this.camera.rotateX(this.degreesToRadians(90))
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas.nativeElement });
    this.renderer.setClearColor(0x17181c, 1);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.5;
    this.renderer.setSize(this.canvas.nativeElement.clientWidth, this.canvas.nativeElement.clientHeight);

    this.clock = new THREE.Clock();
    this.renderer.render(this.scene, this.camera);
  }

  async setInitialObjects() {
    this.drone = await this.loadModel('assets/drone.obj');
    this.drone.scale.setScalar(METER_IN_PIXEL * 0.3);
    this.scene.add(this.drone);

    this.camera.position.y = this.maxAllSize * 1.5;
    this.camera.position.z = this.boxHeight * 2;
   
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.scene.add(directionalLight);

    const light = new THREE.AmbientLight( 0x999999); 
    this.scene.add(light);

    this.renderer.render(this.scene, this.camera);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);  
  }

  getCurrentPosition() {
    return { 
      x: this.osdFrames[this.sliderPosition]['x'], 
      y: this.osdFrames[this.sliderPosition]['y'], 
      z: this.osdFrames[this.sliderPosition]['z']
    };
  }

  update() {
    const elapsedTime = this.clock.getElapsedTime();

    if (this.drone) {
      const currentPosition = this.getCurrentPosition();
      this.drone.position.x = currentPosition.x;
      this.drone.position.y = currentPosition.y;
      this.drone.position.z = currentPosition.z;

      if (this.sliderPosition < this.osdFrames.length - 2) {
        const nextPosition = { 
          x: this.osdFrames[this.sliderPosition + 1]['x'],
          y: this.osdFrames[this.sliderPosition + 1]['y'],
          z: this.osdFrames[this.sliderPosition + 1]['z']
        };
        this.drone.lookAt(new THREE.Vector3(nextPosition.x, nextPosition.y, nextPosition.z));
      }

      this.drawPath();
      this.drawFullPath();
      //this.controls.target = this.drone.position;
      this.controls.update();
    }

    if (this.xLine) {
      this.xLine.geometry.dispose();
      this.scene.remove(this.xLine);
      this.xLine = null as any;
    }

    const xpoints = [
      new THREE.Vector3(-(this.maxAllSize), this.getCurrentPosition().y, this.getCurrentPosition().z),
      new THREE.Vector3(this.maxAllSize, this.getCurrentPosition().y, this.getCurrentPosition().z)
    ];
    
    this.xLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(xpoints), new THREE.LineBasicMaterial({ color: 0x0cd16b }));
    this.xLine.frustumCulled = false;
    this.scene.add(this.xLine);

    if (this.yLine) {
      this.yLine.geometry.dispose();
      this.scene.remove(this.yLine);
      this.yLine = null as any;
    }

    const ypoints = [
      new THREE.Vector3(this.getCurrentPosition().x, -(this.maxAllSize), this.getCurrentPosition().z),
      new THREE.Vector3(this.getCurrentPosition().x, this.maxAllSize, this.getCurrentPosition().z)
    ];
    
    this.yLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ypoints), new THREE.LineBasicMaterial({ color: 0x0cd16b }));
    this.yLine.frustumCulled = false;
    this.scene.add(this.yLine);

    if (this.zLine) {
      this.zLine.geometry.dispose();
      this.scene.remove(this.zLine);
      this.zLine = null as any;
    }

    const zpoints = [
      new THREE.Vector3(this.getCurrentPosition().x, this.getCurrentPosition().y, 0),
      new THREE.Vector3(this.getCurrentPosition().x, this.getCurrentPosition().y, this.boxHeight)
    ];
    
    this.zLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(zpoints), new THREE.LineBasicMaterial({ color: 0x0cd16b }));
    this.zLine.frustumCulled = false;
    this.scene.add(this.zLine);

    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.update.bind(this));
  }

  degreesToRadians(degrees: number) {
    return degrees * (Math.PI / 180);
  }

  drawPath() {
    if (this.path) {
      this.path.geometry.dispose();
      this.scene.remove(this.path);
      this.path = null as any;
    }

    if (this.sliderPosition > 0) {
      let lineCount = 0;

      const points: number[] = [];
      const colors: number[] = [];
      const color = new THREE.Color();

      for (let i = 0; i <= this.sliderPosition - 1; i++) {
        if (!this.osdFrames[this.sliderPosition - i]) {
          break;
        }
  
        const p1 = { 
          x: this.osdFrames[this.sliderPosition - i]['x'],
          y: this.osdFrames[this.sliderPosition - i]['y'],
          z: this.osdFrames[this.sliderPosition - i]['z']
        };

        const speed = this.osdFrames[this.sliderPosition - i]['speed'];
        const speedPercentage = speed / this.osdStats['speed']['max'];
        points.push(p1.x, p1.y, p1.z);
        color.setHSL((1 - speedPercentage) * 0.333, 1.0, 0.5, THREE.SRGBColorSpace);
        colors.push(color.r, color.g, color.b);
        
        lineCount++;
        
        if (lineCount >= MAX_LINES) {
          break;
        }
      }

      const geometry = new LineGeometry();
      geometry.setPositions(points);
      geometry.setColors(colors);

      this.path = new Line2(geometry, new LineMaterial({ color: 0xffffff, linewidth: 0.005, vertexColors: true }));
      this.path.computeLineDistances();
      this.path.scale.set(1, 1, 1);
      this.scene.add(this.path);
    }
  }

  drawFullPath() {
    const points: number[] = [];
    const colors: number[] = [];
    const color = new THREE.Color();

    for (let i = 0; i <= this.osdFrames.length; i++) {
      if (!this.osdFrames[i]) {
        break;
      }
      const p1 = { 
        x: this.osdFrames[i]['x'], 
        y: this.osdFrames[i]['y'], 
        z: this.osdFrames[i]['z']
      };
      
      points.push(p1.x, p1.y, p1.z);
      color.setHSL(0.625, 0.02, 0.58, THREE.SRGBColorSpace);
      colors.push(color.r, color.g, color.b);
    }

    const geometry = new LineGeometry();
    geometry.setPositions(points);
    geometry.setColors(colors);

    const fullPath = new Line2(geometry, new LineMaterial({ color: 0xffffff, linewidth: 0.005 / 4, vertexColors: true }));
    fullPath.computeLineDistances();
    fullPath.scale.set(1, 1, 1);
    this.scene.add(fullPath);
  }

  loadModel(modelPath: string): any {
    const loader = new OBJLoader();
    return new Promise((resolve, reject) => {
      loader.load(modelPath,
        (object) => { resolve(object) },
        (xhr) => {},
        (error) => { reject(error) }
      );
    });
  }
}
