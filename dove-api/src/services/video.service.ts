import { Request, Response } from 'express';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

import { UPLOADS_DIRECTORY, VIDEO_CHUNK_SIZE } from '../settings/settings.const';
import { response } from '../response/response';

export class VideoService {
    static loadVideo(req: Request, res: Response) {
        const range = req.headers.range;
        if (!range) {
            res.send(response('Requires range header!', false, 400));
        }

        const videoPath = UPLOADS_DIRECTORY + req.query['name'];
        const videoSize = fs.statSync(videoPath).size;

        const start = Number(range?.replace(/\D/g, ''));
        const end = Math.min(start + VIDEO_CHUNK_SIZE, videoSize - 1);

        const contentLength = end - start + 1;
        const headers = {
            'Content-Range': `bytes ${start}-${end}/${videoSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength,
            'Content-Type': 'video/mp4'
        };

        res.writeHead(206, headers);

        const videoStream = fs.createReadStream(videoPath, { start, end });
        videoStream.pipe(res);
    }

    static uploadVideo(req: Request, res: Response) {
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            const generatedFileName = `${uuidv4()}.mp4`;
            const fstream = fs.createWriteStream(UPLOADS_DIRECTORY + generatedFileName);
            file.pipe(fstream);
            fstream.on('close', async function () {
                res.send(response({ filename: generatedFileName }));
            });
        });
    }
}