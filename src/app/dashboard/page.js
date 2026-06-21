'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import GenreWidget from '../components/GenreWidget';
import ArtistWidget from '../components/ArtistWidget';
import TrackWidget from '../components/TrackWidget';
import DecadeWidget from '../components/DecadeWidget';
import MoodWidget from '../components/MoodWidget';
import PopularityWidget from '../components/PopularityWidget';
import PlaylistDisplay from '../components/PlaylistDisplay';

export default function Dashboard() {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectedDecades, setSelectedDecades] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedPopularity, setSelectedPopularity] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }

    const saved = localStorage.getItem('taste_mixer_preferences');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        setSelectedGenres(prefs.genres || []);
        setSelectedArtists(prefs.artists || []);
        setSelectedTracks(prefs.tracks || []);
        setSelectedDecades(prefs.decades || []);
        setSelectedMood(prefs.mood || null);
        setSelectedPopularity(prefs.popularity || null);
      } catch (e) {
        console.error('Error cargando preferencias:', e);
      }
    }
    setLoaded(true);
  }, [router]);

  useEffect(() => {
    if (!loaded) return;
    const prefs = {
      genres: selectedGenres,
      artists: selectedArtists,
      tracks: selectedTracks,
      decades: selectedDecades,
      mood: selectedMood,
      popularity: selectedPopularity
    };
    localStorage.setItem('taste_mixer_preferences', JSON.stringify(prefs));
  }, [selectedGenres, selectedArtists, selectedTracks, selectedDecades, selectedMood, selectedPopularity, loaded]);

  return (
    <div style={{ backgroundColor: '#0F1410', minHeight: '100vh', color: '#C8DCC0', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '2rem', color: '#8FBF7A' }}>Spotify Taste Mixer</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 180px', gap: '1rem' }}>

        <div>
          <GenreWidget selected={selectedGenres} onChange={setSelectedGenres} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <ArtistWidget selected={selectedArtists} onChange={setSelectedArtists} />
            <TrackWidget selected={selectedTracks} onChange={setSelectedTracks} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <MoodWidget selected={selectedMood} onChange={setSelectedMood} />
            <PopularityWidget selected={selectedPopularity} onChange={setSelectedPopularity} />
          </div>
        </div>

        <div>
          <DecadeWidget selected={selectedDecades} onChange={setSelectedDecades} />
        </div>

      </div>

      <PlaylistDisplay
        genres={selectedGenres}
        artists={selectedArtists}
        tracks={selectedTracks}
        mood={selectedMood}
        popularity={selectedPopularity}
        decades={selectedDecades}
      />
    </div>
  );
}