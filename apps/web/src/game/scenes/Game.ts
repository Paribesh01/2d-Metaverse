import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class Game extends Scene {
    public playerId: string | undefined;
    public player: Phaser.Physics.Arcade.Sprite | undefined;
    public cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    public RoomId: string | undefined;
    public players: { email: string; soul: Phaser.Physics.Arcade.Sprite }[] = [];
    private lastX: number = 0;
    private lastY: number = 0;
    private idleTimer: { [key: string]: NodeJS.Timeout } = {};


    constructor() {
        super('Game');
    }

    preload() {
        this.load.setPath('assets');
        console.log('Loading assets from:', this.load.path);

        this.load.image('background', 'ground.png');
        this.load.spritesheet('dude', 'playerr.png', { frameWidth: 156, frameHeight: 163 });
        this.load.image('logo', 'logo.png');
    }

    create() {
        this.add.image(512, 384, 'background').setScale(2);
        EventBus.on('message', (message: any) => this.handleIncomingMessage(message));

        // Create animations
        this.createAnimations();

        // Initialize cursor keys
        this.cursors = this.input.keyboard?.createCursorKeys();

        EventBus.emit('current-scene-ready', this);
    }

    update() {
        if (this.player) {
            this.handleMovement();
        }
    }

    createAnimations() {
        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 0 }],
            frameRate: 10,
        });

        this.anims.create({
            key: 'back',
            frames: this.anims.generateFrameNames("dude", { frames: [0, 3] }),
            repeat: -1,
            frameRate: 10,
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { frames: [2, 5] }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'backward',
            frames: this.anims.generateFrameNumbers('dude', { frames: [1, 4] }),
            frameRate: 10,
            repeat: -1,
        });
    }

    handleMovement() {
        this.player?.setVelocity(0); // Reset velocity

        // Handle movement and animations
        if (this.cursors?.left.isDown) {
            this.player?.setVelocityX(-200);
            this.player?.anims.play('left', true);
            this.player?.setFlipX(false);
            this.sendPlayerMove();
        } else if (this.cursors?.right.isDown) {
            this.player?.setVelocityX(200);
            this.player?.anims.play('left', true);
            this.player?.setFlipX(true);
            this.sendPlayerMove();
        } else if (this.cursors?.up.isDown) {
            this.player?.setVelocityY(-200);
            this.player?.anims.play('backward', true);
            this.player?.setFlipX(false);
            this.sendPlayerMove();
        } else if (this.cursors?.down.isDown) {
            this.player?.setVelocityY(200);
            this.player?.anims.play('back', true);
            this.player?.setFlipX(false);
            this.sendPlayerMove();
        } else {
            this.player?.anims.play('turn');
            this.player?.setFlipX(false);
        }
    }

    sendPlayerMove() {
        if (this.player && (Math.abs(this.player.x - this.lastX) >= 1 || Math.abs(this.player.y - this.lastY) >= 1)) {
            EventBus.emit('playerMove', { email: this.playerId, roomid: this.RoomId, position: { x: this.player.x, y: this.player.y } });
            this.lastX = this.player.x;
            this.lastY = this.player.y;
        }
    }

    addPlayer() {
        this.player = this.physics.add.sprite(25, 25, 'dude').setScale(0.3);
        this.player.setCollideWorldBounds(true);


        this.lastX = this.player.x;
        this.lastY = this.player.y;


    }

    handleIncomingMessage(message: any) {
        console.log("Received message in game:", message);

        switch (message.status) {
            case "Set-up":
                if (this.RoomId && this.playerId) return;
                this.RoomId = message.roomid;
                this.playerId = message.email;
                this.addPlayer();
                if (message.otherPlayers) {
                    this.handleOtherPlayersData(message.otherPlayers);
                }
                break;

            case "roomCreated":
                this.RoomId = message.roomid;
                break;

            case "playerMove":
                this.handlePlayersMovement(message);
                break;
            case "roomExited":
                console.log("room exited")
                this.handleRoomExited(message);
                break;
            case "roomJoined":
                if (message.email && message.email !== this.playerId) {
                    this.addPlayerToRoom(message.email, message.position);
                }
                break;

            case "messageSent":
                this.RoomId = message.roomid;
                break;
        }
    }
    handleOtherPlayersData(otherPlayersData: { email: string; position: { x: number, y: number } }[]) {
        otherPlayersData.forEach(({ email, position }) => {
            if (email !== this.playerId) {
                const player = this.players.find(p => p.email === email);

                if (player) {
                    // Update existing player position
                    player.soul.setPosition(position.x, position.y);
                } else {
                    // Add a new player if not found
                    this.addPlayerToRoom(email, position);
                }
            }
        });
    }

    handleRoomExited(message: any) {
        const { email, roomid } = message;
        const player = this.players.find(p => p.email === email);

        if (player) {
            player.soul.destroy();
            this.players = this.players.filter(p => p.email !== email);
            console.log(`Player ${email} exited room ${roomid}`);

        }
    }

    handlePlayersMovement(message: any) {
        const { email, position } = message;
        const player = this.players.find(p => p.email === email);

        if (player) {
            const dx = position.x - player.soul.x;
            const dy = position.y - player.soul.y;

            // Update position
            player.soul.setPosition(position.x, position.y);

            // Clear previous idle timer if it exists
            if (this.idleTimer[email]) {
                clearTimeout(this.idleTimer[email]);
                delete this.idleTimer[email]; // Delete the timer reference
            }

            // Determine the animation based on movement direction
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) {
                    player.soul.anims.play('left', true);
                    player.soul.setFlipX(true);
                } else if (dx < 0) {
                    player.soul.anims.play('left', true);
                    player.soul.setFlipX(false);
                }
            } else {
                if (dy > 0) {
                    player.soul.anims.play('back', true);
                    player.soul.setFlipX(false);
                } else if (dy < 0) {
                    player.soul.anims.play('backward', true);
                    player.soul.setFlipX(false);
                }
            }

            // If player is not moving, set an idle timer
            if (dx === 0 && dy === 0) {
                // Set the idle timer only if the player is not moving
                this.idleTimer[email] = setTimeout(() => {
                    player.soul.anims.play('turn', true); // Play the idle animation
                }, 200); // 1 second delay
            }
        }
    }



    addPlayerToRoom(email: string, position: { x: number, y: number }) {
        const existingPlayer = this.players.find(p => p.email === email);
        if (existingPlayer) {
            console.log(`Player with email ${email} already exists in the room.`);
            return;
        }

        const newPlayer = this.physics.add.sprite(position.x, position.y, 'dude').setScale(0.3);
        newPlayer.setCollideWorldBounds(true);
        this.players.push({ email, soul: newPlayer });

        console.log(`Added player ${email} at position:`, position);
        console.log('Current players in room:', this.players);
    }
}
