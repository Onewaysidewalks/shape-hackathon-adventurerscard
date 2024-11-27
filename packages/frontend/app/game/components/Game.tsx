"use client";
import { useEffect, useState } from 'react';
import Phaser from 'phaser';
import type { AlchemyWebSigner } from "@account-kit/signer";
import type { UseUserResult } from '@account-kit/react';

export default function Game({ user, signer }: { user: UseUserResult, signer: AlchemyWebSigner | null }) {
  const [game, setGame] = useState<Phaser.Game | null>(null);

  useEffect(() => {
    class MainScene extends Phaser.Scene {
      private player!: Phaser.GameObjects.Sprite;
      private worldSize = { width: 2000, height: 2000 };

      constructor() {
        super({ key: 'MainScene' });
      }

      preload() {
        this.load.image('dungeon', '/Dungeon_Tileset_at.png');
        this.load.tilemapTiledJSON('dungeon', '/dungeon.json');
        this.load.spritesheet('player', 'images/Swordman.png', { frameWidth: 48, frameHeight: 48  });

      }

      create() {
        this.cameras.main.setBounds(0, 0, this.worldSize.width, this.worldSize.height);
        
        const centerX = this.worldSize.width / 2;
        const centerY = this.worldSize.height / 2;

        const map = this.make.tilemap({ key: 'dungeon' });
        const tileset = map.addTilesetImage('Dungeon_Tileset_at', 'dungeon', 16, 16);
        const walls = map.createLayer('Walls', tileset!);
        const ground = map.createLayer('Ground', tileset!,);

        walls!.setCollisionByProperty({ collides: true });
        
        // const debugGraphics = this.add.graphics().setAlpha(0.75);
        // walls!.renderDebug(debugGraphics, { 
        //     tileColor: null, 
        //     collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255), 
        //     faceColor: new Phaser.Display.Color(40, 94, 155, 255) 
        // });


        const idle = {
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1,
            duration: 1000
        };

        this.anims.create(idle);

        this.player = this.add.sprite(0, 0, 'player');
        console.log(this.player);
        console.log(this.anims);
        this.player.anims.play(idle, true);

        // this.player = this.add.rectangle(0, 0, 16, 16, 0xff0000);
        // this.player.setStrokeStyle(2, 0xffffff);

        this.cameras.main.startFollow(this.player);
      }

      update() {
        const cursors = this.input.keyboard!.createCursorKeys();
        const speed = 5;

        if (cursors.left.isDown) {
          this.player.x -= speed;
        }
        if (cursors.right.isDown) {
          this.player.x += speed;
        }
        if (cursors.up.isDown) {
          this.player.y -= speed;
        }
        if (cursors.down.isDown) {
          this.player.y += speed;
        }

        this.player.x = Phaser.Math.Clamp(this.player.x, 0, this.worldSize.width);
        this.player.y = Phaser.Math.Clamp(this.player.y, 0, this.worldSize.height);
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 390,
      height: 844,
      parent: 'game-container',
      scene: MainScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container',
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 }
        }
      }
    };

    const newGame = new Phaser.Game(config);
    setGame(newGame);

    return () => {
      newGame.destroy(true);
    };
  }, []);

  return (
    <div id="game-container" className="w-full h-[calc(100vh-4rem)]" />
  );
} 