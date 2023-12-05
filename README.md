# Dove 🕊️ a flight review application

Dove is an open-source application based on [wtfOS](https://github.com/fpv-wtf/wtfos) OSD data, that lets review your drone flight on a map, even in a 3D space along with your OSD video.

![](docs/preview.png)


## Setup and usage

#### a, Desktop application
https://github.com/valentin-vio-dev/dove-flight-review/releases/tag/v1.0.0

```
Extract the .zip file and open Dove.exe 
```

#### b, Locally hosted

##### User interface
```
cd dove-ui
npm i
ng serve
```

##### Backend
```
cd dove-api
npm i
npm run start:dev
```
Finally open http://localhost:4200 in your browser.

Currently Dove supports the following data types:
- Latitude, Longitude, Altitude **(These three are required in order to work with Dove)!**
- Battery
- Distance from home
- LQ
- RSSI
- Satelites
- Speed
- Timer
