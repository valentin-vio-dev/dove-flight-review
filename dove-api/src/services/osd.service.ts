import { Request, Response } from 'express';
import { OsdRecord } from '../osd_core/osd-record.class';
import { response } from '../response/response';

export class OsdService {
    static generateOsdData(req: Request, res: Response) {
        let buffer: any = [];
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            file.on('data', (chunk) => {
                buffer.push(chunk)
            });

            file.on('error', (err) => {
                res.send(response(null, false, 400));
            });

            file.on('end', () => {
                buffer = Buffer.concat(buffer);
                const osdRecord = OsdRecord.parseOsdFileFromBuffer(buffer);
                const osdData = osdRecord.getAllFrameData();
                const stats = OsdRecord.createStats(osdData);
                const fps = OsdRecord.calculateFps(osdData);
                res.send(response({ osdData, stats, fps }))
            });
        });
    }
}