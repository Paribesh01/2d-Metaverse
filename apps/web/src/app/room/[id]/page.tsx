"use client"
import React, { useRef } from 'react';
import { IRefPhaserGame, PhaserGame } from '@/game/PhaserGame';
import { EventBus } from '@/game/EventBus';
import { Game as GameScene } from '@/game/scenes/Game';
import { useSocket } from '@/hooks/useSocket';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

const Game: React.FC = ({ params }: any) => {
    const session: any = useSession()
    console.log(session)
    const url = `ws://localhost:8081?email=${session?.data?.user.email}&roomId=${params.id}`
    console.log(url)
    const { socket } = useSocket(url);
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    // EventBus.emit("message", { status: "Set-up", email: session?.data?.user.email, roomId: params.id })

    EventBus.on('playerMove', (message: any) => {
        console.log(socket?.readyState)
        console.log("playerMove", message)
        socket?.send(JSON.stringify({ action: 'playerMove', email: message.email, position: message.position, roomid: message.roomid }));
        console.log("sent message player move")
    });
    // joinRoom(params.id)

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} />
        </div>
    );
};

export default Game;
