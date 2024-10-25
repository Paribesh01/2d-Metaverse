import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import { db } from './db';

interface Message {
    action: string,
    position: { x: number, y: number },
    roomid: string
}

interface Game {
    roomid: string;
    players: string[];
    message: { [email: string]: { x: number, y: number } }; // New field for tracking positions
    admin: string;
}

export class GameManager {
    private games: Game[];
    private users: { ws: WebSocket, email: string }[]; // Track WebSocket with email

    constructor() {
        this.games = [];
        this.users = [];
        // this.fetchRooms()
    }

    // fetchRooms = async () => {
    //     const rooms = await db.room.findMany({
    //         select: {
    //             id: true,
    //             name: true,
    //             authorId: true,
    //             players: {
    //                 select: {
    //                     id: true,
    //                     email: true
    //                 }
    //             }
    //         }
    //     })



    // }


    async fetchRooms(roomId: string) {
        const room = await db.room.findUnique({
            where: { id: roomId }, select: {
                id: true,
                author: {
                    select: {
                        email: true
                    }
                },
                players: {
                    select: {
                        email: true
                    }
                }
            }
        },);
        return room;
    }

    async addUser(ws: WebSocket, email: string, roomid: string) {
        const room = await this.fetchRooms(roomid);
        console.log("Fetched room:", room);

        if (!room) {
            this.notifyUser(email, { status: "RoomError", message: "Room Not Found" });
            return;
        }

        const isPlayerInRoom = room.players.some(player => player.email === email);
        if (!isPlayerInRoom) {
            this.notifyUser(email, { status: "UserError", message: "You are not a part of this room." });
            return;
        }

        const existingGame = this.games.find(game => game.roomid === roomid);
        if (existingGame) {
            const playerExists = existingGame.players.includes(email);
            if (playerExists) {
                this.notifyUser(email, { status: "UserError", message: "You are already in this room." });
                return;
            } else {
                existingGame.players.push(email);
                this.users.push({ ws, email });

                // Send list of existing players to the new player with their last known positions
                const otherPlayersData = existingGame.players
                    .filter(playerEmail => playerEmail !== email)
                    .map(playerEmail => {
                        const position = existingGame.message[playerEmail] || { x: 0, y: 0 };
                        return { email: playerEmail, position };
                    });

                this.notifyUser(email, { status: "Set-up", email, roomid, otherPlayers: otherPlayersData });
                this.broadcastToRoom(roomid, { status: 'roomJoined', roomid, email, position: { x: 25, y: 25 } });
            }
        } else {
            // Create a new game if no existing game is found, with an empty positions object
            this.games.push({ roomid, players: [email], message: { [email]: { x: 25, y: 25 } }, admin: room.author.email });
            this.users.push({ ws, email });
            this.notifyUser(email, { status: "Set-up", email, roomid, otherPlayers: [] });
        }

        this.handleMessages(email, ws);
    }

    removeUser(ws: WebSocket) {
        // Find the user based on WebSocket connection
        const user = this.users.find(u => u.ws === ws);

        if (user) {
            const { email } = user;

            this.users = this.users.filter(u => u.ws !== ws);
            console.log(`User ${email} disconnected and removed`);

            this.games = this.games.filter(game => {

                game.players = game.players.filter(player => player !== email);
                const roomid = game.roomid
                this.broadcastToRoom(roomid, { status: 'roomExited', roomid, email });
                console.log("room user removed")
                if (game.players.length === 0) {
                    console.log(`Game in room ${game.roomid} has no players left and is removed.`);
                    return false;
                }
                return true;
            });
        }
    }


    handleMessages(email: string, ws: WebSocket) {
        console.log("indide handel message")
        ws.on('message', (message: string) => {
            const parsedMessage: Message = JSON.parse(message);
            const { action, roomid } = parsedMessage;
            console.log("message from the server")
            console.log(parsedMessage)

            switch (action) {
                case 'sendMessage':
                    this.sendMessage(email, roomid, parsedMessage.position);
                    break;

                case "playerMove":
                    this.handelPlayerMove(email, roomid, parsedMessage.position);
                    break;
                case 'exitRoom':
                    this.exitRoom(email, roomid);
                    break;
                default:
                    console.log('Unknown action:', action);
                    break;
            }
        });
    }

    // createRoom(email: string) {
    //     const roomid = uuidv4();
    //     const newGame: Game = {
    //         roomid,
    //         players: [email],
    //         message: [],
    //         admin: email
    //     };
    //     this.games.push(newGame);
    //     this.broadcastToAll({ status: "Rooms", rooms: this.games })
    //     console.log(`Room created with ID: ${roomid} by User ID: ${email}`);

    //     this.notifyUser(email, { status: 'roomCreated', roomid });
    // }


    handelPlayerMove(email: string, roomid: string, position: { x: number, y: number }) {
        const user = this.users.find(u => u.email === email);
        const game = this.games.find(g => g.roomid === roomid);

        if (game) {
            if (user && user.ws.readyState === WebSocket.OPEN) {
                game.message[email] = position; // Store the latest position for each player
                console.log("position", position);
                this.broadcastToRoomPlayer(roomid, { status: 'playerMove', roomid, email, position }, email);
                console.log(`User ID: ${email} sent message to room ID: ${roomid}`);
            } else {
                console.log(`WebSocket for User ID ${email} not found or not open`);
            }
        } else {
            this.notifyUser(email, { status: 'roomNotFound', roomid });
        }

    }

    sendMessage(email: string, roomid: string, position: { x: number, y: number }) {
        const user = this.users.find(u => u.email === email);
        const game = this.games.find(g => g.roomid === roomid);

        if (game) {
            if (user && user.ws.readyState === WebSocket.OPEN) {
                game.message[email] = position; // Store the latest position for each player
                console.log("position", position);
                this.broadcastToRoom(roomid, { status: 'messageSent', roomid, email, position });
                console.log(`User ID: ${email} sent message to room ID: ${roomid}`);
            } else {
                console.log(`WebSocket for User ID ${email} not found or not open`);
            }
        } else {
            this.notifyUser(email, { status: 'roomNotFound', roomid });
        }

    }


    joinRoom(email: string, roomid: string) {
        const game = this.games.find((g: Game) => g.roomid === roomid);

        if (game) {
            if (!game.players.includes(email)) {
                game.players.push(email);
                console.log(`User ID: ${email} joined room ID: ${roomid}`);
                this.broadcastToRoom(roomid, { status: 'roomJoined', message: game.message, roomid, email });
            } else {
                this.notifyUser(email, { status: 'alreadyInRoom', roomid });
            }
        } else {
            this.notifyUser(email, { status: 'roomNotFound', roomid });
        }
    }

    exitRoom(email: string, roomid: string) {
        const game = this.games.find(g => g.roomid === roomid);

        if (game) {
            game.players = game.players.filter(player => player !== email);
            console.log(`User ID: ${email} exited room ID: ${roomid}`);

            this.notifyUser(email, { status: 'roomExited', email, roomid });
            this.broadcastToRoom(roomid, { status: 'roomExited', email, roomid });

            if (game.players.length === 0) {
                this.games = this.games.filter(g => g.roomid !== roomid);
                console.log(`Room ID: ${roomid} removed as it has no players`);
            }
        } else {
            this.notifyUser(email, { status: 'roomNotFound', roomid });
        }
    }

    notifyUser(email: string, message: object) {
        const user = this.users.find(u => u.email === email);

        if (user && user.ws.readyState === WebSocket.OPEN) {
            user.ws.send(JSON.stringify(message));
        } else {
            console.log(`WebSocket for User ID ${email} not found or not open`);
        }
    }



    broadcastToRoomPlayer(roomid: string, message: object, excludeEmail: string) {
        const game = this.games.find(g => g.roomid === roomid);

        if (game) {
            game.players.forEach(playerEmail => {
                if (playerEmail !== excludeEmail) {
                    this.notifyUser(playerEmail, message);
                }
            });
        }
    }


    broadcastToRoom(roomid: string, message: object) {
        const game = this.games.find(g => g.roomid === roomid);

        if (game) {
            game.players.forEach(playerId => {
                this.notifyUser(playerId, message);
            });
        }
    }
    broadcastToAll(message: object) {
        if (this.users) {

            this.users.forEach(playerId => this.notifyUser(playerId.email, message));
        }

    }

}