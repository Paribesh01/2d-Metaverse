// useSocket.js
import { EventBus } from '@/game/EventBus';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

let socketInstance: WebSocket | null = null; // Singleton instance

export const useSocket = (url = 'ws://localhost:8081') => {
    const router = useRouter();

    interface Message {
        userId: string;
        message: string;
    }

    interface Game {
        roomid: string;
        players: string[];
        message: Record<string, string>[];
    }

    interface ServerMessage {
        status: 'roomCreated' | 'roomJoined' | 'messageSent' | 'roomExited' | 'Rooms' | 'ID';
        roomid?: string;
        userId?: string;
        message?: Message[];
        rooms: Game[];
    }

    const [messages, setMessages] = useState<Message[]>([]);
    const [roomid, setRoomId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [rooms, setRooms] = useState<Game[]>([]);

    useEffect(() => {
        if (!socketInstance) {
            // Create a new WebSocket instance
            socketInstance = new WebSocket(url);

            socketInstance.onopen = () => {
                console.log('WebSocket connection established');
            };

            socketInstance.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log(data);
                EventBus.emit('message', data);
                handleServerMessage(data);
            };

            socketInstance.onclose = () => {
                console.log('WebSocket connection closed');
            };
        }

        // Event listener for player moves
        EventBus.on('player-move', (message: any) => {
            socketInstance?.send(JSON.stringify({ action: 'sendMessage', position: message.position, roomid: message.roomid }));
        });

        // Cleanup function
        return () => {
            // Optional: socketInstance.close() if you want to close the socket when component unmounts
        };
    }, [url]);

    const handleServerMessage = (data: ServerMessage) => {
        console.log(data);
        switch (data.status) {
            case 'roomCreated':
                setRoomId(data.roomid ?? null);
                console.log('Room created with ID:', data.roomid);
                break;

            case 'ID':
                setUserId(data.userId ?? null);
                console.log('User ID:', data.userId);
                break;

            case 'Rooms':
                setRooms(data.rooms);
                break;

            case 'roomJoined':
                setRoomId(data.roomid ?? null);
                setMessages(data.message ?? []);
                router.push("/room/615dsa1f6asdfsa");
                console.log('Joined room with ID:', data.roomid);
                break;

            case 'messageSent':
                if (data.message) {
                    const newMessage: Message = {
                        userId: data.userId ?? 'Unknown',
                        message: data.message as any,
                    };
                    setMessages(prev => [...prev, newMessage]);
                }
                break;

            case 'roomExited':
                if (data.userId === userId) {
                    setRoomId(null);
                    setUserId(null);
                    setMessages([]);
                    console.log('Exited room with ID:', data.roomid);
                } else {
                    console.log(`User with ID ${data.userId} exited`);
                }
                break;

            default:
                console.log('Unknown server message:', data);
                break;
        }
    };

    const createRoom = () => {
        if (socketInstance) {
            socketInstance.send(JSON.stringify({ action: 'createRoom' }));
        }
    };

    const joinRoom = (roomid: string) => {
        if (socketInstance) {
            socketInstance.send(JSON.stringify({ action: 'joinRoom', roomid }));
        }
    };

    const sendMessage = (message: string) => {
        if (socketInstance) {
            socketInstance.send(JSON.stringify({ action: 'sendMessage', roomid, message }));
        }
    };

    const exitRoom = () => {
        if (socketInstance) {
            socketInstance.send(JSON.stringify({ action: 'exitRoom', roomid, userId }));
        }
    };

    return {
        messages,
        createRoom,
        joinRoom,
        sendMessage,
        exitRoom,
        userId,
        roomid,
        rooms,
    };
};
