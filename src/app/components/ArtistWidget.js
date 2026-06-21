'use client';

import { useState } from 'react';
import { getAccessToken } from '@/lib/auth';

export default function ArtistWidget({ selected, onChange }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (q) => {
    if (!q) return setResults([]);
    setLoading(true);
    const token = getAccessToken();
    const res = await fetch(`https://api.spotify.com/v1/search?type=artist&q=${encodeURIComponent(q)}&limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setResults(data.artists?.items || []);
    setLoading(false);
  };

  const toggleArtist = (artist) => {
    if (selected.find(a => a.id === artist.id)) {
      onChange(selected.filter(a => a.id !== artist.id));
    } else if (selected.length < 3) {
      onChange([...selected, artist]);
    }
  };

  return (
    <div style={{ backgroundColor: '#1A1F1A', border: '1px solid #2E3B2A', borderRadius: '4px', padding: '1rem' }}>
      <h2 style={{ color: '#8FBF7A', fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>Artistas</h2>
      <p style={{ color: '#6B7A66', fontSize: '0.8rem', marginBottom: '1rem' }}>Elige hasta 3</p>
      <input
        type="text"
        placeholder="Buscar artista..."
        value={query}
        onChange={e => { setQuery(e.target.value); search(e.target.value); }}
        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #2E3B2A', backgroundColor: '#242B22', color: '#C8DCC0', marginBottom: '0.5rem', boxSizing: 'border-box' }}
      />
      {loading && <p style={{ color: '#6B7A66', fontSize: '0.8rem' }}>Buscando...</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        {results.map(artist => (
          <div
            key={artist.id}
            onClick={() => toggleArtist(artist)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '8px', borderRadius: '4px',
              backgroundColor: selected.find(a => a.id === artist.id) ? '#7FA86B' : '#242B22',
              cursor: 'pointer',
              border: selected.find(a => a.id === artist.id) ? '1px solid #7FA86B' : '1px solid #2E3B2A'
            }}
          >
            {artist.images?.[0] && <img src={artist.images[0].url} alt={artist.name} style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />}
            <span style={{ color: selected.find(a => a.id === artist.id) ? '#10180D' : '#C8DCC0', fontSize: '0.9rem' }}>{artist.name}</span>
          </div>
        ))}
      </div>
      {selected.length > 0 && (
        <div>
          <p style={{ color: '#6B7A66', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Seleccionados:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {selected.map(artist => (
              <span key={artist.id} onClick={() => toggleArtist(artist)} style={{ backgroundColor: '#7FA86B', color: '#10180D', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                {artist.name} ✕
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}