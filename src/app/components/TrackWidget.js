'use client';

import { useState } from 'react';
import { getAccessToken } from '@/lib/auth';

// Es casi idéntico a ArtistWidget, cambia el endpoint (type=track en vez de
// type=artist) y los campos que mostramos (canción + artista en vez de solo artista)
export default function TrackWidget({ selected, onChange }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (q) => {
    if (!q) return setResults([]);
    setLoading(true);
    const token = getAccessToken();
    const res = await fetch(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(q)}&limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    // Aquí es "tracks.items" en vez de "artists.items", porque la respuesta
    // de Spotify organiza los resultados según el tipo de búsqueda (type=track)
    setResults(data.tracks?.items || []);
    setLoading(false);
  };

  const toggleTrack = (track) => {
    if (selected.find(t => t.id === track.id)) {
      onChange(selected.filter(t => t.id !== track.id));
    } else if (selected.length < 3) {
      onChange([...selected, track]);
    }
  };

  return (
    <div style={{ backgroundColor: '#1A1F1A', border: '1px solid #2E3B2A', borderRadius: '4px', padding: '1rem' }}>
      <h2 style={{ color: '#8FBF7A', fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>Canciones</h2>
      <p style={{ color: '#6B7A66', fontSize: '0.8rem', marginBottom: '1rem' }}>Elige hasta 3</p>
      <input
        type="text"
        placeholder="Buscar canción..."
        value={query}
        onChange={e => { setQuery(e.target.value); search(e.target.value); }}
        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #2E3B2A', backgroundColor: '#242B22', color: '#C8DCC0', marginBottom: '0.5rem', boxSizing: 'border-box' }}
      />
      {loading && <p style={{ color: '#6B7A66', fontSize: '0.8rem' }}>Buscando...</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        {results.map(track => (
          <div
            key={track.id}
            onClick={() => toggleTrack(track)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '8px', borderRadius: '4px',
              backgroundColor: selected.find(t => t.id === track.id) ? '#7FA86B' : '#242B22',
              cursor: 'pointer',
              border: selected.find(t => t.id === track.id) ? '1px solid #7FA86B' : '1px solid #2E3B2A'
            }}
          >
            /* track.album.images, porque la portada de una canción viene
                dentro de los datos de su álbum, no de la canción directamente */
            {track.album?.images?.[0] && <img src={track.album.images[0].url} alt={track.name} style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />}
            <div>
              <p style={{ color: selected.find(t => t.id === track.id) ? '#10180D' : '#C8DCC0', fontSize: '0.9rem', margin: 0 }}>{track.name}</p>
              /* track.artists es un ARRAY porque una canción puede tener
                  varios artistas (colaboraciones). Mostramos solo el primero */
              <p style={{ color: selected.find(t => t.id === track.id) ? '#1A2614' : '#6B7A66', fontSize: '0.75rem', margin: 0 }}>{track.artists?.[0]?.name}</p>
            </div>
          </div>
        ))}
      </div>
      {selected.length > 0 && (
        <div>
          <p style={{ color: '#6B7A66', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Seleccionadas:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {selected.map(track => (
              <div key={track.id} onClick={() => toggleTrack(track)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#7FA86B', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                <span style={{ color: '#10180D', fontSize: '0.8rem' }}>{track.name} ✕</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
