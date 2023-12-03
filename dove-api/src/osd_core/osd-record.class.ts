import fs from 'fs'
import { Frame } from "./frame.class";
import OSD_BYTE_CODES from './osd-byte-codes';

export class OsdRecord {
    header: string;
    version: number;
    charWidth: number;
    charHeight: number;
    fontWidth: number;
    fontHeight: number;
    fontVariant: number;
    xOffset: number;
    yOffset: number;
    frames: Frame[];
    
    constructor(
        header: string, 
        version: number, 
        charWidth: number, 
        charHeight: number, 
        fontWidth: number, 
        fontHeight: number, 
        fontVariant: number, 
        xOffset: number, 
        yOffset: number, 
        frames: Frame[] = []
    ) {
        this.header = header;
        this.version = version;
        this.charWidth = charWidth;
        this.charHeight = charHeight;
        this.fontWidth = fontWidth;
        this.fontHeight = fontHeight;
        this.fontVariant = fontVariant;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.frames = frames;
    }

    static parseOsdFile(filePath: string) {
        const fileContent = fs.readFileSync(filePath);
        const byteBuffer = Buffer.from(fileContent);
        let offset = 0;
    
        const readChar = () => String.fromCharCode(byteBuffer.readInt8(offset++));
    
        const header = Array.from({ length: 7 }, readChar).join('');
        const version = byteBuffer.readUInt16LE(offset);
        offset += 2;
        const charWidth = byteBuffer.readInt8(offset++);
        const charHeight = byteBuffer.readInt8(offset++);
        const fontWidth = byteBuffer.readInt8(offset++);
        const fontHeight = byteBuffer.readInt8(offset++);
        const xOffset = byteBuffer.readUInt16LE(offset);
        offset += 2;
        const yOffset = byteBuffer.readUInt16LE(offset);
        offset += 2;
        const fontVariant = byteBuffer.readInt8(offset++);
    
        const expectedHeader = 'MSPOSD\u0000';
        if (expectedHeader !== header) {
            throw new Error('File header is not as expected!');
        }
    
        const frames = [];
        let isFirstFrame = true;
    
        while (offset + 8 <= byteBuffer.length) {
            let frameIdx = byteBuffer.readInt32LE(offset);
            if (isFirstFrame && frameIdx > 100) frameIdx = 1;
            isFirstFrame = false;
            offset += 4;
    
            const frameSize = byteBuffer.readInt32LE(offset);
            offset += 4;
    
            const maxY = charHeight - 1;
            const maxX = charWidth - 1;
            const expectedSize = maxY + maxX * 22;
            if (frameSize < expectedSize) {
                console.error(`Frame size: ${frameSize} expected: ${expectedSize}`);
                break;
            }
    
            const frameData = new Int16Array(frameSize);
            for (let i = 0; i < frameSize; i++) {
                frameData[i] = byteBuffer.readInt16LE(offset);
                offset += 2;
            }
    
            frames.push(new Frame(frameIdx, frameData));
        }
    
        return new OsdRecord(
            header,
            version,
            charWidth,
            charHeight,
            fontWidth,
            fontHeight,
            fontVariant,
            xOffset,
            yOffset,
            frames,
        );
    }

    static parseOsdFileFromBuffer(byteBuffer: Buffer) {
        let offset = 0;
    
        const readChar = () => String.fromCharCode(byteBuffer.readInt8(offset++));
    
        const header = Array.from({ length: 7 }, readChar).join('');
        const version = byteBuffer.readUInt16LE(offset);
        offset += 2;
        const charWidth = byteBuffer.readInt8(offset++);
        const charHeight = byteBuffer.readInt8(offset++);
        const fontWidth = byteBuffer.readInt8(offset++);
        const fontHeight = byteBuffer.readInt8(offset++);
        const xOffset = byteBuffer.readUInt16LE(offset);
        offset += 2;
        const yOffset = byteBuffer.readUInt16LE(offset);
        offset += 2;
        const fontVariant = byteBuffer.readInt8(offset++);
    
        const expectedHeader = 'MSPOSD\u0000';
        if (expectedHeader !== header) {
            throw new Error('File header is not as expected!');
        }
    
        const frames = [];
        let isFirstFrame = true;
    
        while (offset + 8 <= byteBuffer.length) {
            let frameIdx = byteBuffer.readInt32LE(offset);
            if (isFirstFrame && frameIdx > 100) frameIdx = 1;
            isFirstFrame = false;
            offset += 4;
    
            const frameSize = byteBuffer.readInt32LE(offset);
            offset += 4;
    
            const maxY = charHeight - 1;
            const maxX = charWidth - 1;
            const expectedSize = maxY + maxX * 22;
            if (frameSize < expectedSize) {
                console.error(`Frame size: ${frameSize} expected: ${expectedSize}`);
                break;
            }
    
            const frameData = new Int16Array(frameSize);
            for (let i = 0; i < frameSize; i++) {
                frameData[i] = byteBuffer.readInt16LE(offset);
                offset += 2;
            }
    
            frames.push(new Frame(frameIdx, frameData));
        }
    
        return new OsdRecord(
            header,
            version,
            charWidth,
            charHeight,
            fontWidth,
            fontHeight,
            fontVariant,
            xOffset,
            yOffset,
            frames,
        );
    }

    getAllFrameData() {
        let result: any[] = [];
        this.frames.forEach(frame => {
            result.push(frame.getAllData(true));
        });

        // Coordinates are not in CODES.
        const firstCoordiante = { x: result[0]['x'], y: result[0]['y'], z: result[0]['z'] };
        result = result.map((element: any) => { 
            const normalizedCoordinate = { 
                x: firstCoordiante.x - element.x, 
                y: firstCoordiante.y - element.y,
                z: firstCoordiante.z + element.z 
            };
            return { ...element, ...normalizedCoordinate };
        });

         // TODO, for handle noise or missing data.
        for (let i = 1; i < result.length; i++) {
            const altitudeDiff = Math.abs(result[i]['altitude'] - result[i - 1]['altitude']);
            const zDiff = Math.abs(result[i]['z'] - result[i - 1]['z']);
            const speedDiff = Math.abs(result[i]['speed'] - result[i - 1]['speed']);
          
            result[i]['altitude'] = altitudeDiff > 50 ? result[i - 1]['altitude'] : result[i]['altitude'];
            result[i]['z'] = zDiff > 50 ? result[i - 1]['z'] : result[i]['z'];
            result[i]['speed'] = speedDiff > 50 ? result[i - 1]['speed'] : result[i]['speed']
        }

        // Filter the end of the record where there is no data.
        result = result.filter((element: any) => {
            let zeroCount = 0;
            Object.keys(element).forEach((key: string) => {
                zeroCount += element[key] === 0 ? 0 : 1
            });
            return zeroCount > Object.keys(element).length / 2;
        });

        return result;
    }

    static getStat(data: any[], key: string) {
        const d = data.map(el => el[key]);
        const min = Math.min.apply(Math, d);
        const max = Math.max.apply(Math, d);
        const avg = d.reduce((a, b) => a + b, 0) / d.length;
        d.sort();
        const med = d[Math.round(d.length / 2)];
        return { min, max, avg, med };
    }

    static createStats(data: any[]) {
        let stats: any = {};
        Object.keys(OSD_BYTE_CODES).forEach(key => {
            stats[key] = this.getStat(data, key);
        });
        stats['x'] = this.getStat(data, 'x');
        stats['y'] = this.getStat(data, 'y');
        stats['z'] = this.getStat(data, 'z');
        return stats;
    }

    static calculateFps(data: any[]) {
        const times = [1];
        let j = 0;
        let lastTimer = data[0]['timer'];

        for (let i = 1; i < data.length; i++) {
            if (lastTimer !== data[i]['timer']) {
                lastTimer = data[i]['timer']
                j++;
                times.push(1);
            } else {
                times[j]++;
            }
        }
        
        return times.reduce((a, b) => a + b, 0) / times.length;
    }
}