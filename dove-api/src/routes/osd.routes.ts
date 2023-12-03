import express from 'express';
import { OsdService } from '../services/osd.service';

const osdRouter = express.Router();
osdRouter.post('/', (req, res) => OsdService.generateOsdData(req, res));

export default osdRouter;