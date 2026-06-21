'use client';

import { useState, useEffect } from 'react';
// useState: para guardar valores que cambian y provocan que el componente se redibuje
// useEffect: para ejecutar código en momentos concretos del ciclo de vida del componente

export default function GenreWidget({ selected, onChange }) {
  // useState devuelve un array de 2 elementos: [valorActual, funciónParaCambiarlo]
  // genres empieza como array vacío [], loading empieza en true
  
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  
// useEffect ejecuta la función que le pasamos DESPUÉS de que el componente
  // se haya pintado en pantalla por primera vez.
  useEffect(() => {

    // En la versión original, aquí se hacía un fetch() a la API de Spotify
    // para traer los géneros disponibles. Pero Spotify eliminó ese endpoint
    // en 2026, así que usamos una lista fija en su lugar:
    const generosFijos = [
      'pop', 'rock', 'hip-hop', 'electronic', 'jazz', 'classical',
      'r-n-b', 'latin', 'reggaeton', 'metal', 'indie', 'folk',
      'blues', 'country', 'soul', 'funk', 'punk', 'alternative',
      'dance', 'reggae', 'trap', 'k-pop', 'house', 'techno'
    ];
    setGenres(generosFijos);
    setLoading(false);
  }, []);
// El array vacío [] al final es la "lista de dependencias".
  // Significa: "ejecuta este código SOLO una vez, cuando el componente se monta".
  // Si no pusiéramos nada, se ejecutaría en cada renderizado, provocando un bucle infinito
  // (porque setGenres() provoca un render, que ejecutaría el efecto otra vez, etc.)

  // Igual que en DecadeWidget, pero con un límite máximo de 3 elegidos
  const toggleGenre = (genre) => {
    if (selected.includes(genre)) {
      onChange(selected.filter(g => g !== genre));
    } else if (selected.length < 3) {
      // Solo añadimos si hay menos de 3 ya seleccionados
      onChange([...selected, genre]);
    }
    // Si ya hay 3 y el usuario intenta añadir un cuarto, no pasa nada (se ignora)
  };

  return (
    <div style={{ backgroundColor: '#1A1F1A', border: '1px solid #2E3B2A', borderRadius: '4px', padding: '1rem' }}>
      <h2 style={{ color: '#8FBF7A', fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>Géneros</h2>
      <p style={{ color: '#6B7A66', fontSize: '0.8rem', marginBottom: '1rem' }}>Elige hasta 3</p>
/* Renderizado condicional: si loading es true, muestra "Cargando...",
          si es false, muestra la lista de botones */

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
