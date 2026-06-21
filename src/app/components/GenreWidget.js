'use client';

import { useState, useEffect } from 'react';

export default function GenreWidget({ selected, onChange }) {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generosFijos = [
      'pop', 'rock', 'hip-hop', 'electronic', 'jazz', 'classical',
      'r-n-b', 'latin', 'reggaeton', 'metal', 'indie', 'folk',
      'blues', 'country', 'soul', 'funk', 'punk', 'alternative',
      'dance', 'reggae', 'trap', 'k-pop', 'house', 'techno'
    ];
    setGenres(generosFijos);
    setLoading(false);
  }, []);

  const toggleGenre = (genre) => {
    if (selected.includes(genre)) {
      onChange(selected.filter(g => g !== genre));
    } else if (selected.length < 3) {
      onChange([...selected, genre]);
    }
  };

  return (
    <div style={{ backgroundColor: '#1A1F1A', border: '1px solid #2E3B2A', borderRadius: '4px', padding: '1rem' }}>
      <h2 style={{ color: '#8FBF7A', fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>Géneros</h2>
      <p style={{ color: '#6B7A66', fontSize: '0.8rem', marginBottom: '1rem' }}>Elige hasta 3</p>
      {loading ? (
        <p style={{ color: '#6B7A66' }}>Cargando...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto' }}>
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: selected.includes(genre) ? 'none' : '1px solid #2E3B2A',
                cursor: 'pointer',
                fontSize: '0.8rem',
                backgroundColor: selected.includes(genre) ? '#7FA86B' : '#242B22',
                color: selected.includes(genre) ? '#10180D' : '#C8DCC0',
                textAlign: 'center'
              }}
            >
              {genre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}