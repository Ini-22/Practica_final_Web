'use client';

import { useState } from 'react';
import { getAccessToken } from '@/lib/auth';
// Importamos la función que nos da el token guardado en localStorage,
// lo necesitamos para autenticarnos en cada llamada a la API de Spotify

export default function ArtistWidget({ selected, onChange }) {
  const [query, setQuery] = useState(''); // lo que el usuario escribe en el input
  const [results, setResults] = useState([]); // resultados de la búsqueda
  const [loading, setLoading] = useState(false); // si está buscando en este momento

  // Función async porque hace una petición de red, que tarda tiempo en responder
  const search = async (q) => {
    // Si el campo de búsqueda está vacío, no buscamos nada y limpiamos resultados
    if (!q) return setResults([]);
    setLoading(true);
    const token = getAccessToken();
    // await pausa la ejecución de esta función hasta que fetch() responda,
    // sin bloquear el resto de la aplicación mientras tanto

    // encodeURIComponent convierte espacios y símbolos especiales en algo
      // válido para una URL. Ej: "rock and roll" -> "rock%20and%20roll"
    const res = await fetch(`https://api.spotify.com/v1/search?type=artist&q=${encodeURIComponent(q)}&limit=5`, {
      headers: {
        // Así demostramos a Spotify que tenemos permiso: enviamos el token
          // que conseguimos al hacer login, en la cabecera Authorization
        'Authorization': `Bearer ${token}` }
    });
    const data = await res.json(); // convertimos la respuesta a un objeto JS

    // data.artists?.items: el "?." es optional chaining.
    // Si data.artists no existiera (por ejemplo, hubo un error), en vez de
    // romper el código con un error, simplemente da "undefined".
    // El "|| []" dice: si es undefined, usa un array vacío en su lugar.
    setResults(data.artists?.items || []);
    setLoading(false);
  };

  // Decide si añadir o quitar un artista de los seleccionados.
  // Usamos .find() en vez de .includes() porque los artistas son OBJETOS,
  // no strings simples, así que comparamos por su id único.
  const toggleArtist = (artist) => {
    if (selected.find(a => a.id === artist.id)) {
      // Ya estaba seleccionado: lo quitamos
      onChange(selected.filter(a => a.id !== artist.id));
    } else if (selected.length < 3) {
      // No estaba y hay sitio (menos de 3): lo añadimos
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
        // Cada vez que el usuario escribe una letra:
        // 1. Actualizamos el estado "query" con lo escrito
        // 2. Lanzamos inmediatamente una nueva búsqueda con ese texto
        // (Nota: esto busca en CADA tecla pulsada, sin esperar.
        //  Una versión más eficiente usaría "debounce" para esperar
        //  unos milisegundos tras la última tecla antes de buscar)
        onChange={e => { setQuery(e.target.value); search(e.target.value); }}
        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #2E3B2A', backgroundColor: '#242B22', color: '#C8DCC0', marginBottom: '0.5rem', boxSizing: 'border-box' }}
      />
      {loading && <p style={{ color: '#6B7A66', fontSize: '0.8rem' }}>Buscando...</p>}
        /* "loading && <p>" es un atajo: si loading es true, muestra el párrafo;
          si es false, no muestra nada (React ignora "false" como contenido) */
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
            /* Renderizado condicional: solo mostramos la imagen si existe */
            {artist.images?.[0] && <img src={artist.images[0].url} alt={artist.name} style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />}
            <span style={{ color: selected.find(a => a.id === artist.id) ? '#10180D' : '#C8DCC0', fontSize: '0.9rem' }}>{artist.name}</span>
          </div>
        ))}
      </div>
      /* Solo mostramos esta sección si hay al menos 1 artista seleccionado */
      {selected.length > 0 && (
        <div>
          <p style={{ color: '#6B7A66', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Seleccionados:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {selected.map(artist => (
              <span key={artist.id} onClick={() => toggleArtist(artist)} 
              // Al hacer clic en la "pastilla" de seleccionado, se vuelve a
                // llamar a toggleArtist, que esta vez lo QUITARÁ (porque ya está)
              style={{ backgroundColor: '#7FA86B', color: '#10180D', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                {artist.name} ✕
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
