import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import StartGame from './main';
import { EventBus } from './EventBus';
import { useSocket } from '@/hooks/useSocket';

export interface IRefPhaserGame {
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

interface IProps {
    currentActiveScene?: (scene_instance: Phaser.Scene) => void;
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(function PhaserGame({ currentActiveScene }, ref) {
    const game = useRef<Phaser.Game | null>(null);

    useLayoutEffect(() => {
        if (!game.current) {
            game.current = StartGame("game-container");

            setRef(ref, { game: game.current, scene: null });
        }

        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = null;
            }
        };
    }, [ref]);

    useEffect(() => {
        const handleSceneReady = (scene_instance: Phaser.Scene) => {
            if (currentActiveScene) {
                currentActiveScene(scene_instance);
            }

            setRef(ref, { game: game.current, scene: scene_instance });
        };

        // const handlePlayerMove = (data: any) => {
        //     console.log("player-move", data);
        //     sendMessage(data);
        // };

        EventBus.on('current-scene-ready', handleSceneReady);
        // EventBus.on('player-move', handlePlayerMove);

        return () => {
            EventBus.removeListener('current-scene-ready', handleSceneReady);
            // EventBus.removeListener('player-move', handlePlayerMove);
        };
    }, [currentActiveScene, ref]);

    const setRef = (ref: any, value: IRefPhaserGame) => {
        if (typeof ref === 'function') {
            ref(value);
        } else if (ref) {
            ref.current = value;
        }
    };

    return <div id="game-container"></div>;
});
