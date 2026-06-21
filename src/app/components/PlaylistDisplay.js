'use client';

import { useState } from 'react';
import { getAccessToken } from '@/lib/auth';

export default function PlaylistDisplay({ genres, artists, tracks, mood, popularity, decades }) {
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const generatePlaylist = async () => {
    setLoading(true);
    setSaveMessage(null);
    const token = getAccessToken();

    let queryParts = [];
    if (artists.length > 0) queryParts.push(artists[0].name);
    if (genres.length > 0) queryParts.push(genres[0]);
    if (tracks.length > 0) queryParts.push(tracks[0].name);
    if (queryParts.length === 0) queryParts.push('top hits');

    const query = queryParts.join(' ');

    const res = await fetch(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(query)}&limit=10`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    let results = data.tracks?.items || [];

    // Nota: el campo "popularity" fue eliminado por Spotify en la migración de 2026,
    // así que el filtro de popularidad ya no se puede aplicar con datos reales.

    setPlaylist(results);
    setLoading(false);
  };

  const removeTrack = (id) => {
    setPlaylist(playlist.filter(t => t.id !== id));
  };

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const saveToSpotify = async () => {
    if (playlist.length === 0) return;
    setSaving(true);
    setSaveMessage(null);
    const token = getAccessToken();

    try {
      // Crear la playlist vacía (usuario actual, ya no requiere user_id en la URL)
      const createRes = await fetch(`https://api.spotify.com/v1/me/playlists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Taste Mixer Playlist',
          description: 'Generada con Spotify Taste Mixer',
          public: false
        })
      });
      const playlistData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(playlistData.error?.message || 'Error al crear playlist');
      }

      // Añadir las canciones (endpoint renombrado a /items)
      const uris = playlist.map(t => t.uri);
      const addRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris })
      });

      if (!addRes.ok) {
        const addData = await addRes.json();
        throw new Error(addData.error?.message || 'Error al añadir canciones');
      }

      setSaveMessage({ type: 'success', text: '¡Playlist guardada en tu cuenta de Spotify!', url: playlistData.external_urls?.spotify });

    } catch (error) {
      console.error('Error guardando playlist:', error);
      setSaveMessage({ type: 'error', text: error.message });
    }

    setSaving(false);
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <button
        onClick={generatePlaylist}
        style={{ backgroundColor: '#1DB954', color: 'white', padding: '12px 32px', borderRadius: '50px', border: 'none', fontSize: '1rem', cursor: 'pointer', marginBottom: '1.5rem' }}
      >
        {loading ? 'Generando...' : '🎲 Generar Playlist'}
      </button>

      {playlist.length > 0 && (
        <div style={{ backgroundColor: '#1e1e1e', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ color: 'white', margin: 0 }}>🎧 Tu Playlist ({playlist.length} canciones)</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={generatePlaylist} style={{ backgroundColor: '#333', color: 'white', padding: '6px 16px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                🔄 Refrescar
              </button>
              <button onClick={saveToSpotify} disabled={saving} style={{ backgroundColor: '#1DB954', color: 'white', padding: '6px 16px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                {saving ? 'Guardando...' : '💾 Guardar en Spotify'}
              </button>
            </div>
          </div>

          {saveMessage && (
            <div style={{ padding: '8px 12px', borderRadius: '8px', marginBottom: '1rem', backgroundColor: saveMessage.type === 'success' ? '#1a3d2b' : '#3d1a1a', color: 'white', fontSize: '0.85rem' }}>
              {saveMessage.text}
              {saveMessage.url && (
                <a href={saveMessage.url} target="_blank" rel="noopener noreferrer" style={{ color: '#1DB954', marginLeft: '8px' }}>
                  Abrir en Spotify →
                </a>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {playlist.map((track, index) => (
              <div key={track.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '8px', borderRadius: '8px', backgroundColor: '#2a2a2a' }}>
                <span style={{ color: '#aaa', fontSize: '0.85rem', width: '20px' }}>{index + 1}</span>
                {track.album?.images?.[0] && (
                  <img src={track.album.images[0].url} alt={track.name} style={{ width: '40px', height: '40px', borderRadius: '4px' }} />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'white', margin: 0, fontSize: '0.9rem' }}>{track.name}</p>
                  <p style={{ color: '#aaa', margin: 0, fontSize: '0.75rem' }}>{track.artists?.[0]?.name}</p>
                </div>
                <span style={{ color: '#aaa', fontSize: '0.75rem' }}>
                  {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                </span>
                <button onClick={() => toggleFavorite(track.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
                  {favorites.includes(track.id) ? '❤️' : '🤍'}
                </button>
                <button onClick={() => removeTrack(track.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#aaa' }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}