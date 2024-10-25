// useSocket.js
import { CHAT, SET_UP } from '@/const';
import { EventBus } from '@/game/EventBus';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


export const useSocket = (url: string) => {
    const router = useRouter();

    interface Message {
        email: string;
        chat: string
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
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [roomid, setRoomId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        console.log("url")
        console.log(url)
        // Create a new WebSocket instance
        const ws = new WebSocket(url);
        setSocket(ws)

        ws.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data);
            if (data.status === CHAT) {
                console.log("Chat is got ")
                console.log(data)
                handelChat(data);
            } else if (data.status === SET_UP) {
                setUserEmail(data.email)
                setRoomId(data.roomid)
                EventBus.emit('message', data);
            } else {
                EventBus.emit('message', data);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };




        return () => {
            ws.close();
        };
    }, [url]);


    const handelChat = (data: any) => {
        if (data.chat) {

            const newMessage: Message = {
                email: data.email ?? 'Unknown',
                chat: data.chat
            };

            setMessages(prev => [...prev, newMessage]);
        }
    }

    const sendMessage = (message: string) => {
        if (socket) {
            socket.send(JSON.stringify({ action: CHAT, roomid, chat: message }));
        }
    };


    return {
        socket,
        messages,
        userEmail,
        sendMessage
    };
};
