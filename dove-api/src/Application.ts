import { Express } from 'express';
import cors from 'cors';
import busboy from 'connect-busboy';
import fs from 'fs-extra';
import { Server } from 'http';

import videoRouter from './routes/video.routes';
import osdRouter from './routes/osd.routes';
import { UPLOADS_DIRECTORY } from './settings/settings.const';

export class Application {
    app: Express;
    server: Server | undefined;
    port: number;

    constructor(app: Express, port: number | string = 3000) {
        this.app = app;
        this.port = (typeof port === 'string') ? Number(port) : port;
    }

    setMiddlewares() {
        this.app.use(cors());
        this.app.use(busboy());
    }

    start() {
        this.server = this.app.listen(this.port, () => {
            console.log(`Server running at http://localhost:${this.port}`);
        });
    }

    stop() {
        if (this.server) {
            this.server.close();
        }
    }

    setRoutes() {
        this.app.use('/video', videoRouter);
        this.app.use('/osd', osdRouter);
    }

    initialize() {
        if (fs.existsSync(UPLOADS_DIRECTORY)) {
            fs.rmSync(UPLOADS_DIRECTORY, { recursive: true, force: true });
        }
    
        if (!fs.existsSync(UPLOADS_DIRECTORY)) {
            fs.mkdirSync(UPLOADS_DIRECTORY);
        }
    }
}