"use client"
import React, { useRef } from 'react';
import { IRefPhaserGame, PhaserGame } from '@/game/PhaserGame';
import { EventBus } from '@/game/EventBus';
import { Game as GameScene } from '@/game/scenes/Game';
import { useSocket } from '@/hooks/useSocket';

const Game: React.FC = () => {
    const { createRoom, joinRoom, rooms } = useSocket();
    const phaserRef = useRef<IRefPhaserGame | null>(null);



    return (
        <div id="app">
            <PhaserGame ref={phaserRef} />
        </div>
    );
};

export default Game;
