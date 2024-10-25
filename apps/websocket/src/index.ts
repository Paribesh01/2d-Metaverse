import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';
import url from "url"
export const wss = new WebSocketServer({ port: 8081 });

const gameManager = new GameManager();

wss.on('connection', function connection(ws, req) {

    //@ts-ignore

    const email: string = url.parse(req.url, true).query.email;

    //@ts-ignore
    const roomId: string = url.parse(req.url, true).query.roomId;

    console.log('Connection made');
    console.log(email);
    gameManager.addUser(ws, email, roomId);

    ws.on('close', () => {
        gameManager.removeUser(ws);
    });

});