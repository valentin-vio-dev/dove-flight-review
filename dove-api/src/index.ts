
import express, { Request, Response } from 'express';
import cors from 'cors';
import busboy from 'connect-busboy';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

import { OsdRecord } from './osd-record.class';

const app = express();
const port = process.env.PORT || 3000;

const UPLOADS_DIRECTORY = 'public/';
const CHUNKS_IZE = (10 ** 6);

app.use(cors());
app.use(busboy());

app.post('/osd', (req: Request, res: Response) => {
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        let buffer: any = [];
        file.on('data', (chunk) => {
            buffer.push(chunk)
        });

        file.on('end', () => {
            buffer = Buffer.concat(buffer);
            const osdRecord = OsdRecord.parseOsdFileFromBuffer(buffer);
            const data = osdRecord.getAllFrameData();
            const stats = OsdRecord.createStats(data);
            const fps = OsdRecord.calculateFps(data);
            res.send({ data, stats, fps, length: data.length });
        });
    }); 
});

app.post('/video', (req: Request, res: Response) => {
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        const generatedFileName = `${uuidv4()}.mp4`;

        const fstream = fs.createWriteStream(UPLOADS_DIRECTORY + generatedFileName);
        file.pipe(fstream);
        fstream.on('close', async function () {    
            res.send({ filename: generatedFileName }); 
        });
    }); 
});

app.get('/video', (req: Request, res: Response) => {
    const range = req.headers.range;
    if (!range) {
        res.status(400).send('Requires range header!');
    }

    const videoPath = UPLOADS_DIRECTORY + req.query['name'];
    const videoSize = fs.statSync(videoPath).size;

    const start = Number(range?.replace(/\D/g, ''));
    const end = Math.min(start + CHUNKS_IZE, videoSize - 1);
    
    const contentLength = end - start + 1;
    const headers = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges' : 'bytes',
        'Content-Length': contentLength,
        'Content-Type': 'video/mp4'
    };

    res.writeHead(206, headers);
    
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
});

const initialize = () => {
    if (fs.existsSync(UPLOADS_DIRECTORY)) {
        fs.rmSync(UPLOADS_DIRECTORY, { recursive: true, force: true });
    }

    if (!fs.existsSync(UPLOADS_DIRECTORY)) {
        fs.mkdirSync(UPLOADS_DIRECTORY);
    }
}

app.listen(port, () => {
    initialize();
    console.log(`Server running at http://localhost:${port}`);
});