"use client";
import { useEffect, useState } from 'react';
import { useLogout, useUser, useSigner } from "@account-kit/react";
import { useRouter } from "next/navigation";
import {Suspense} from "react";
import Phaser from 'phaser';

export default function GamePage() {
  const { logout } = useLogout();
  const user = useUser();
  const signer = useSigner();
  const router = useRouter();
  const [game, setGame] = useState<Phaser.Game | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    class MainScene extends Phaser.Scene {
      private player!: Phaser.GameObjects.Rectangle;
      private worldSize = { width: 2000, height: 2000 };

      constructor() {
        super({ key: 'MainScene' });
      }

      create() {
        this.cameras.main.setBounds(0, 0, this.worldSize.width, this.worldSize.height);

        const tileSize = 32;
        for (let y = 0; y < this.worldSize.height; y += tileSize) {
          for (let x = 0; x < this.worldSize.width; x += tileSize) {
            const green = Phaser.Math.Between(0x557744, 0x88AA77);
            this.add.rectangle(x + tileSize/2, y + tileSize/2, tileSize, tileSize, green);
          }
        }

        const centerX = this.worldSize.width / 2;
        const centerY = this.worldSize.height / 2;
        this.player = this.add.rectangle(centerX, centerY, 32, 32, 0xff0000);
        this.player.setStrokeStyle(2, 0xffffff);

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
  }, [user, router]);

  return (
    <div className="relative w-full h-screen">
      <div className="w-full p-4 bg-gray-800 flex justify-end items-center">
        <span className="text-white font-mono truncate max-w-[60%] mr-4">
          {user?.address}
        </span>
        <button 
          className="btn btn-primary"
          onClick={() => logout()}
        >
          Logout
        </button>
      </div>
      <Suspense fallback={<>Loading...</>}>
        <div id="game-container" className="w-full h-[calc(100vh-4rem)]" />
      </Suspense>
    </div>
  );
}