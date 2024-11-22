"use client";
import { useEffect, useState } from 'react';
import { useLogout, useUser, useSigner } from "@account-kit/react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

// Remove the direct Phaser import
// import Phaser from 'phaser';

// Create a dynamic component for the game
const Game = dynamic(() => import('./components/Game'), {
  ssr: false,
  loading: () => <div>Loading game...</div>
});

export default function GamePage() {
  const { logout } = useLogout();
  const user = useUser();
  const signer = useSigner();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
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
      <Game user={user} signer={signer} />
    </div>
  );
}