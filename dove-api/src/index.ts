
import express from 'express';
import { Application } from './Application';
import dotenv from 'dotenv';

dotenv.config();

const application = new Application(express(), process.env.PORT);
application.setMiddlewares();
application.setRoutes();
application.initialize();
application.start();