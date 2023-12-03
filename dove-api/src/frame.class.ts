import fs from 'fs';
import { OsdStartingCodes } from './codes.const';

const EARTH_RADIUS = 6_371_000;
const METER_IN_PIXEL = 0.89932;

export class Frame {
    index: number;
    data: Int16Array;

    constructor(index: number, data: Int16Array) {
        this.index = index;
        this.data = data;
    }

    osdMillis() {
        return Math.round(this.index * (1000 / 60));
    }

    convertToArray() {
        return this.data.toString().split(',').map(e => Number(e));
    }

    /**
     * Only debug.
     */
    writeToFile(path: string) {
        const data = this.convertToArray();
        const writer = fs.createWriteStream(path, { flags: 'w' });
        for (let i = 0; i < data.length; i++) {
            writer.write(`INDEX: ${i}\t\tCODE: ${data[i]}\t\tCHAR: ${String.fromCharCode(data[i])}\n`)
        }
        writer.close();
    }

    extractData(data: number[], code: number, add?: number) {
        let index = data.indexOf(code);
        if (index < 0) {
            return null;
        }

        index += 22 + (add ? add : 0);
        const result: number[] = [];
        let i = 0;
        
        while (true) {
            const element = data[index];
            index += 22;

            if ([0, 6, 12, 32, 158].includes(element)) {
                break;
            }
    
            result.push(element);
            i++;
    
            if (i == 100) {
                break
            }
        }
        
        return result.map(element => String.fromCharCode(element)).join('');
    }

    getAllData(format: boolean = true) {
        const result: any = {};
        Object.keys(OsdStartingCodes).forEach((key: string) => {
            let data: any = null;
            for (let i = 0; i < OsdStartingCodes[key].values.length; i++) {
                data ||= this.extractData(
                    this.convertToArray(), 
                    OsdStartingCodes[key].values[i], 
                    OsdStartingCodes[key].add
                );
            }

            if (format) {
                data = isNaN(Number(data)) ? data : Number(data);
            }

            result[key] = data;
        });
        result['osd_millis'] = this.osdMillis();
        const coordiante = this.latlonToxyz(result['latitude'], result['longitude'], result['altitude']);
        result['x'] = coordiante.x;
        result['y'] = coordiante.y;
        result['z'] = coordiante.z;
        return result;
    }

    latlonToxyz(lat: number, lon: number, alt: number) {
        const la = this.degreesToRadians(lat);
        const lo = this.degreesToRadians(lon);
        return {
          x: EARTH_RADIUS * Math.cos(la) * Math.cos(lo),
          y: EARTH_RADIUS * Math.cos(la) * Math.sin(lo),
          z: METER_IN_PIXEL * alt // TODO ??? scaling
        }
    }

    degreesToRadians(degrees: number) {
        return degrees * (Math.PI / 180);
    }
}
