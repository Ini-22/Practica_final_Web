'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getSpotifyAuthUrl } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = () => {
    window.location.href = getSpotifyAuthUrl();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <h1 className="text-4xl font-bold text-white mb-2">🎵 Spotify Taste Mixer</h1>
      <p className="text-gray-400 mb-8">Genera playlists personalizadas según tus gustos</p>
      <button
        onClick={handleLogin}
        className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3 rounded-full text-lg transition"
      >
        Iniciar sesión con Spotify
      </button>
    </div>
  );
}


