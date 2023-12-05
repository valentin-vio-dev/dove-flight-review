import { app, BrowserWindow } from 'electron';
import url from 'url';
import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import { Application } from '../Application';

dotenv.config();

let window: BrowserWindow;
const application = new Application(express(), process.env.PORT);

const initBackend = () => {
    application.setMiddlewares();
    application.setRoutes();
    application.initialize();
    application.start();
};

const onReady = async () => {
    initBackend();

    window = new BrowserWindow({
        width: 1000,
        height: 720,
        autoHideMenuBar: true
    });

    await loadIndexfile();

    window.on('close', () => {
        application.stop();
    });

    window.webContents.on('did-fail-load', async () => {
        await loadIndexfile();
    });
}

const loadIndexfile = () => {
    return window.loadURL(url.format({
        pathname: path.join(__dirname, 'dove-ui', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
}

app.on('ready', onReady);