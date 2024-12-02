import Phaser from "phaser";

export class Player {
    direction: number = 0;
    follow: boolean = true;
    walls: Phaser.Tilemaps.TilemapLayer;
    sprite: Phaser.Physics.Arcade.Sprite;
    scene: Phaser.Scene;
    constructor(scene: Phaser.Scene, x: number, y: number, walls: Phaser.Tilemaps.TilemapLayer, follow: boolean = true) {
        this.follow = follow;
        this.walls = walls;
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.scene = scene;
    }

    public init() {
        const idle_down = {
            key: 'idle_down',
            frames: this.sprite.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1,
            duration: 1000
        };
        const idle_side = {
            key: 'idle_side',
            frames: this.sprite.anims.generateFrameNumbers('player', { start: 6, end: 11 }),
            frameRate: 10,
            repeat: -1,
            duration: 1000
        };
        const idle_up = {
            key: 'idle_up',
            frames: this.sprite.anims.generateFrameNumbers('player', { start: 12, end: 17 }),
            frameRate: 10,
            repeat: -1,
            duration: 1000
        };
        const walk_down = {
            key: 'walk_down',
            frames: this.sprite.anims.generateFrameNumbers('player', { start: 18, end: 23 }),
            frameRate: 10,
            repeat: -1,
            duration: 1000
        };
        const walk_side = {
            key: 'walk_side',
            frames: this.sprite.anims.generateFrameNumbers('player', { start: 24, end: 29 }),
            frameRate: 10,
            repeat: -1,
            duration: 1000
        };
        const walk_up = {
            key: 'walk_up',
            frames: this.sprite.anims.generateFrameNumbers('player', { start: 30, end: 35 }),
            frameRate: 10,
            repeat: -1,
            duration: 1000
        };
    
        this.scene.anims.create(idle_down);
        this.scene.anims.create(idle_side);
        this.scene.anims.create(idle_up);
        this.scene.anims.create(walk_down);
        this.scene.anims.create(walk_side);
        this.scene.anims.create(walk_up);

        this.sprite.setScale(2);

        this.scene.physics.add.collider(this.sprite, this.walls);
        (this.sprite.body as Phaser.Physics.Arcade.Body).setSize(18, 24);
        (this.sprite.body as Phaser.Physics.Arcade.Body).setOffset(16, 16); 
        this.sprite.anims.play(idle_down.key, true);

        if (this.follow === true) {
            this.scene.cameras.main.startFollow(this.sprite);
        }
    }

    update() {
        const cursors = this.scene.input.keyboard!.createCursorKeys();
        const speed = 100;
        if (cursors.left.isDown && !cursors.right.isDown && !cursors.up.isDown && !cursors.down.isDown) {
        this.sprite.body!.velocity.x = -speed;
        this.sprite.body!.velocity.y = 0;
        this.sprite.anims.play("walk_side", true);
        this.sprite.setFlipX(true);
        this.direction = 0;
        }else if (cursors.right.isDown && !cursors.left.isDown && !cursors.up.isDown && !cursors.down.isDown) {
        this.sprite.body!.velocity.x = speed;
        this.sprite.body!.velocity.y = 0;
        this.sprite.anims.play("walk_side", true);
        this.sprite.setFlipX(false);
        this.direction = 1;
        } else if (cursors.up.isDown && !cursors.left.isDown && !cursors.right.isDown && !cursors.down.isDown) {
        this.sprite.body!.velocity.y = -speed;
        this.sprite.body!.velocity.x = 0;
        this.sprite.anims.play("walk_up", true);
        this.sprite.setFlipX(false);
        this.direction = 2;
        } else if (cursors.down.isDown && !cursors.left.isDown && !cursors.right.isDown && !cursors.up.isDown) {
        this.sprite.body!.velocity.y = speed;
        this.sprite.body!.velocity.x = 0;
        this.sprite.anims.play("walk_down", true);
        this.sprite.setFlipX(false);
        this.direction = 3;
        } 

        if (!cursors.left.isDown && !cursors.right.isDown && !cursors.up.isDown && !cursors.down.isDown) {
            this.sprite.body!.velocity.x = 0;
            this.sprite.body!.velocity.y = 0;
            if (this.direction == 0) {
                this.sprite.anims.play("idle_down", true);
                this.sprite.setFlipX(true);

            } else if (this.direction == 1) {
                this.sprite.anims.play("idle_side", true);
                this.sprite.setFlipX(false);

            } else if (this.direction == 2) {
                this.sprite.anims.play("idle_up", true);
                this.sprite.setFlipX(false);

            } else if (this.direction == 3) {
                this.sprite.anims.play("idle_down", true);
                this.sprite.setFlipX(false);
            }
        }
    }
}

