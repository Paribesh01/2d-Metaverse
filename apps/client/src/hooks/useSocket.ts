import { useEffect, useState, useCallback } from 'react';

export const useSocket = (onPlayerMove: (data: { userId: string; position: { x: number; y: number } }) => void) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        console.log("useSocket initializing...");
        const ws = new WebSocket('ws://localhost:8081'); // Change to your server address

        ws.onopen = () => {
            console.log("WebSocket connected");
            setSocket(ws);
            setIsConnected(true);
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
            setIsConnected(false);
            setSocket(null);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            messageHandler(data);
        };

        // Cleanup on unmount
        return () => {
            if (ws) {
                ws.close();
                console.log("WebSocket closed on cleanup");
                setIsConnected(false);
            }
        };
    }, []);

    const messageHandler = useCallback((data: any) => {
        switch (data.type) {
            case PLAYER_MOVE:
                onPlayerMove(data); // Call the provided callback with the new player position
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    }, [onPlayerMove]);

    const sendPlayerMove = useCallback((position: { x: number; y: number }) => {
        if (socket && isConnected) {
            const message = {
                action: 'playerMove', // Action type for player movement
                position
            };
            socket.send(JSON.stringify(message));
            console.log("Player move sent:", position);
        } else {
            console.error("WebSocket is not open or not connected.");
        }
    }, [socket, isConnected]);

    return { socket, sendPlayerMove, isConnected };
};
