# Dove 🕊️ a flight review application

Dove is an open-source application based on [wtfOS](https://github.com/fpv-wtf/wtfos) OSD data, that lets review your drone flight on a map, even in a 3D space along with your OSD video.

![](docs/preview.png)


## Setup and usage

##### User interface (Angular)
```
cd dove-ui
npm i
ng serve
```

##### Backend (Node.js)
```
cd dove-api
npm i
npm run start:dev
```

Currently Dove supports the following data types:
- Altitude
- Battery
- Distance from home
- Latitude, Longitude
- LQ
- RSSSI
- Satelites
- Speed
- Timer
