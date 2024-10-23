import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class Game extends Scene {

    private player: Phaser.Physics.Arcade.Sprite;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

    constructor() {
        super('Game');
    }

    preload() {
        this.load.setPath('assets');

        this.load.image('background', 'ground.png');
        this.load.spritesheet('dude', 'playerr.png', { frameWidth: 156, frameHeight: 163 }); // Frame dimensions
        this.load.image('logo', 'logo.png');
    }

    create() {
        this.add.image(512, 384, 'background').setScale(2);
        this.player = this.physics.add.sprite(25, 25, 'dude').setScale(0.3);
        this.player.setCollideWorldBounds(true);

        // Create animations
        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 0 }], // Frame 1 for turning
            frameRate: 10,
        });

        this.anims.create({
            key: 'back',
            frames: this.anims.generateFrameNames("dude", { frames: [0, 3] }),
            // frames: [{ key: 'dude', frame: 1,3 }], // Frame 2 for back
            repeat: -1,
            frameRate: 10,
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { frames: [2, 5] }),
            // frames: [{ key: 'dude', frame: [1,4] }],
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'backward',

            frames: this.anims.generateFrameNumbers('dude', { frames: [1, 4] }),
            // frames: [{ key: 'dude', frame: [1,4] }],
            frameRate: 10,
            repeat: -1
        });

        // Initialize cursor keys
        this.cursors = this.input.keyboard?.createCursorKeys();

        EventBus.emit('current-scene-ready', this);
    }

    update() {
        if (this.player) {
            this.player.setVelocity(0); // Reset velocity

            // Handle movement and animations
            if (this.cursors?.left.isDown) {
                this.player.setVelocityX(-200);
                this.player.anims.play('left', true); // Play left animation
                this.player.setFlipX(false); // Ensure the sprite faces left

                console.log(`Player moved left: X=${this.player.x}, Y=${this.player.y}`);
                this.sendPlayerMove()
            } else if (this.cursors?.right.isDown) {
                this.player.setVelocityX(200);
                this.player.anims.play('left', true); // Play left animation for right movement
                this.player.setFlipX(true); // Flip the sprite to face right
                console.log(`Player moved right: X=${this.player.x}, Y=${this.player.y}`);
                this.sendPlayerMove()
            } else if (this.cursors?.up.isDown) {
                this.player.setVelocityY(-200);
                this.player.anims.play('backward', true); // Play back animation
                this.player.setFlipX(false); // Ensure the sprite faces up
                console.log(`Player moved up: X=${this.player.x}, Y=${this.player.y}`);
                this.sendPlayerMove()
            } else if (this.cursors?.down.isDown) {
                this.player.setVelocityY(200);
                this.player.anims.play('back', true); // Play back animation
                this.player.setFlipX(false); // Ensure the sprite faces down
                console.log(`Player moved down: X=${this.player.x}, Y=${this.player.y}`);
                this.sendPlayerMove()
            } else {
                this.player.anims.play('turn'); // Play idle animation when not moving
                this.player.setFlipX(false); // Ensure the sprite is facing front when idle
            }
        }
    }
    sendPlayerMove() {
        EventBus.emit('player-move', { x: this.player.x, y: this.player.y });
    }
}
