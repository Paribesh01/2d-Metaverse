import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { use } from 'react';

export class Game extends Scene {


    public playerId: string | undefined
    public player: Phaser.Physics.Arcade.Sprite | undefined;
    public cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    public RoomId: string | undefined;
    public players: { id: string, soul: Phaser.Physics.Arcade.Sprite }[] | undefined
    constructor() {
        super('Game');
        EventBus.on('message', this.handelIncommingMessage.bind(this));
    }

    preload() {
        this.load.setPath('assets');
        console.log('Loading assets from:', this.load.path);

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


                this.sendPlayerMove()
            } else if (this.cursors?.right.isDown) {
                this.player.setVelocityX(200);
                this.player.anims.play('left', true); // Play left animation for right movement
                this.player.setFlipX(true); // Flip the sprite to face right

                this.sendPlayerMove()
            } else if (this.cursors?.up.isDown) {
                this.player.setVelocityY(-200);
                this.player.anims.play('backward', true); // Play back animation
                this.player.setFlipX(false); // Ensure the sprite faces up

                this.sendPlayerMove()
            } else if (this.cursors?.down.isDown) {
                this.player.setVelocityY(200);
                this.player.anims.play('back', true); // Play back animation
                this.player.setFlipX(false); // Ensure the sprite faces down

                this.sendPlayerMove()
            } else {
                this.player.anims.play('turn'); // Play idle animation when not moving
                this.player.setFlipX(false); // Ensure the sprite is facing front when idle
            }
        }
    }
    sendPlayerMove() {
        EventBus.emit('player-move', { roomid: this.RoomId, position: { x: this.player?.x, y: this.player?.y } });
    }
    addPlayer(message: any) {
        const player = this.physics.add.sprite(25, 25, 'dude').setScale(0.3);
        player.setCollideWorldBounds(true);
        this.players?.push({ id: message.userId, soul: player })

    }
    handelIncommingMessage(message: any) {
        switch (message.status) {
            case "roomCreated":
                console.log("roomCreated", message)
                this.RoomId = message.roomid
                break;
            case "ID":
                this.playerId = message.userId
                break;
            case "RoomJoined":
                console.log("RoomJoined", message)
                this.addPlayer(message)
                break;
            case "messageSent":
                this.RoomId = message.roomid

                break;
        }
    }
    handelPlayersMovement(message: any) {
        const { userId, position } = message; // Assuming message contains userId and position
        const player = this.players?.find(p => p.id === userId);

        if (player) {
            player.soul.setPosition(position.x, position.y);
        }
    }
}
