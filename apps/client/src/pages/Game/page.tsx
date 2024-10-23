import { IRefPhaserGame, PhaserGame } from '@/game/PhaserGame';
import { useRef } from 'react';

function Game() {

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);


    return (
        <div id="app">
            <PhaserGame ref={phaserRef} />

        </div>
    )
}

export default Game
