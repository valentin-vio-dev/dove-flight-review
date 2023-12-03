import express from 'express';
import { VideoService } from '../services/video.service';

const videoRouter = express.Router();
videoRouter.get('/', (req, res) => VideoService.loadVideo(req, res));
videoRouter.post('/', (req, res) => VideoService.uploadVideo(req, res));

export default videoRouter;