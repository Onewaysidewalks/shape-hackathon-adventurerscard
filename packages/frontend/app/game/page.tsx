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
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
      
      {/* Profile Window */}
      {isProfileOpen && (
        <div className="absolute bottom-16 left-4 right-4 bg-gray-800 rounded-lg p-4 shadow-lg">
          <h2 className="text-white text-lg mb-2">Profile</h2>
          <div className="text-white">
            Address: {user?.address}
          </div>
        </div>
      )}

      {/* Profile Button */}
      <button 
        onClick={() => setIsProfileOpen(!isProfileOpen)}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 btn bg-brown-500 hover:bg-brown-600 text-white"
      >
        {isProfileOpen ? 'Close Profile' : 'Open Profile'}
      </button>
    </div>
  );
}