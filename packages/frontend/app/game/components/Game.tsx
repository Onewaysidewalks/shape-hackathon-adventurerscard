"use client";
import { useEffect, useState } from 'react';
import Phaser from 'phaser';
import type { AlchemyWebSigner } from "@account-kit/signer";
import type { UseUserResult } from '@account-kit/react';
import { Player } from './Player';
export default function Game({ user, signer }: { user: UseUserResult, signer: AlchemyWebSigner | null }) {
  const [game, setGame] = useState<Phaser.Game | null>(null);

  useEffect(() => {
    class MainScene extends Phaser.Scene {
      private player!: Player;

      constructor() {
        super({ key: 'MainScene' });
      }

      preload() {
        this.load.image('dungeon', '/Dungeon_Tileset_at.png');
        this.load.tilemapTiledJSON('dungeon', '/dungeon.json');
        this.load.spritesheet('player', 'images/Swordman.png', { frameWidth: 48, frameHeight: 48  });
      }

      create() {
        const map = this.make.tilemap({ key: 'dungeon' });
        const tileset = map.addTilesetImage('Dungeon_Tileset_at', 'dungeon', 16, 16);
        const walls = map.createLayer('Walls', tileset!);
        const ground = map.createLayer('Ground', tileset!);

        walls!.setCollisionByProperty({ collides: true });
        
        // const debugGraphics = this.add.graphics().setAlpha(0.75);
        // walls!.renderDebug(debugGraphics, { 
        //     tileColor: null, 
        //     collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255), 
        //     faceColor: new Phaser.Display.Color(40, 94, 155, 255) 
        // });

        this.player = new Player(this, 100, 100, walls!, true);
        this.player.init();
      }

      update() {
        this.player.update();
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
          gravity: { y: 0, x: 0 },
          debug: true
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