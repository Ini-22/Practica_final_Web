'use client';

import { useState } from 'react';
import { getAccessToken } from '@/lib/auth';

// Este componente recibe TODAS las selecciones de los 6 widgets como props.
// Es el ejemplo de "prop drilling" hacia arriba: el padre (dashboard) recoge
// el estado de cada widget hijo, y se lo pasa hacia abajo a este componente,
// que los combina todos para generar la playlist final.
export default function PlaylistDisplay({ genres, artists, tracks, mood, popularity, decades }) {
  
  // playlist: el array de canciones que se muestra en pantalla
  const [playlist, setPlaylist] = useState([]);

  // loading: true mientras esperamos la respuesta de Spotify
  const [loading, setLoading] = useState(false);

  // favorites: array de IDs de canciones marcadas como favoritas (con el corazón)
  const [favorites, setFavorites] = useState([]);

  // saving: true mientras se está guardando la playlist en Spotify
  const [saving, setSaving] = useState(false);

  // saveMessage: mensaje de éxito o error tras intentar guardar, ej:
  // { type: 'success', text: '...', url: '...' }
  const [saveMessage, setSaveMessage] = useState(null);

  // ----------------------------------------------------------------
  // FUNCIÓN 1: Generar la playlist buscando canciones según preferencias
  // ----------------------------------------------------------------
  const generatePlaylist = async () => {
    setLoading(true);
    setSaveMessage(null); // limpiamos cualquier mensaje anterior al regenerar
    const token = getAccessToken();

    // Construimos un array de "trozos" de búsqueda según lo que el usuario eligió.
    // La idea: combinar todas las preferencias en una sola query de texto,
    // porque la API de búsqueda de Spotify funciona con texto libre.
    let queryParts = [];

    // Si hay artistas seleccionados, usamos el nombre del primero
    if (artists.length > 0) queryParts.push(artists[0].name);

    // Si hay géneros seleccionados, usamos el primero
    if (genres.length > 0) queryParts.push(genres[0]);

    // Si hay canciones seleccionadas, usamos el nombre de la primera
    if (tracks.length > 0) queryParts.push(tracks[0].name);

    // Si el usuario no eligió absolutamente nada, ponemos un valor por defecto
    // para que la búsqueda no quede vacía
    if (queryParts.length === 0) queryParts.push('top hits');

    // .join(' ') convierte el array en un único string separado por espacios
    // Ej: ['Bad Bunny', 'reggaeton'] -> 'Bad Bunny reggaeton'
    const query = queryParts.join(' ');

    // Llamada a la API de búsqueda de Spotify
    const res = await fetch(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(query)}&limit=10`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    // Nota: limit=10 porque Spotify limitó este valor en su migración de 2026
    // (antes podíamos pedir hasta 50, ahora el máximo es 10)

    const data = await res.json();
    let results = data.tracks?.items || [];

    // NOTA IMPORTANTE: aquí originalmente había un filtro de popularidad,
    // pero Spotify eliminó el campo "popularity" de las canciones en su
    // migración de 2026, así que ese filtro ya no se puede aplicar con
    // datos reales. Por eso el widget de Popularidad sigue existiendo
    // visualmente, pero no afecta a los resultados actuales.

    setPlaylist(results); // guardamos los resultados en el estado
    setLoading(false);
  };

  // ----------------------------------------------------------------
  // FUNCIÓN 2: Quitar una canción de la lista (sin tocar Spotify, solo visual)
  // ----------------------------------------------------------------
  const removeTrack = (id) => {
    // Creamos un nuevo array filtrando la canción cuyo id coincide
    setPlaylist(playlist.filter(t => t.id !== id));
  };

  // ----------------------------------------------------------------
  // FUNCIÓN 3: Marcar/desmarcar una canción como favorita
  // ----------------------------------------------------------------
  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      // Ya era favorita: la quitamos del array
      setFavorites(favorites.filter(f => f !== id));
    } else {
      // No era favorita: la añadimos
      setFavorites([...favorites, id]);
    }
  };

  // ----------------------------------------------------------------
  // FUNCIÓN 4: Guardar la playlist actual en la cuenta REAL de Spotify
  // ----------------------------------------------------------------
  const saveToSpotify = async () => {
    if (playlist.length === 0) return; // no hay nada que guardar
    setSaving(true);
    setSaveMessage(null);
    const token = getAccessToken();

    // Usamos try/catch porque aquí pueden fallar varias peticiones en cadena,
    // y queremos capturar cualquier error sin que rompa toda la aplicación
    try {
      
      // PASO 1: Crear una playlist vacía en la cuenta del usuario.
      // Antes esto era POST /users/{user_id}/playlists, pero Spotify cambió
      // el endpoint en su migración de 2026 a simplemente /me/playlists
      // (usa automáticamente el usuario que está autenticado con el token)
      const createRes = await fetch(`https://api.spotify.com/v1/me/playlists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
          // Content-Type le dice al servidor que el "body" que enviamos
          // está en formato JSON
        },
        body: JSON.stringify({
          // JSON.stringify convierte un objeto JS en un string JSON,
          // que es el formato que espera la API
          name: 'Taste Mixer Playlist',
          description: 'Generada con Spotify Taste Mixer',
          public: false
        })
      });
      const playlistData = await createRes.json();

      // Si la respuesta NO fue exitosa (ej. error 403, 401...), lanzamos un
      // error manualmente con "throw new Error(...)". Esto hace que el
      // código salte directamente al bloque catch de abajo
      if (!createRes.ok) {
        throw new Error(playlistData.error?.message || 'Error al crear playlist');
      }

      // PASO 2: Añadir las canciones a la playlist que acabamos de crear.
      // playlistData.id es el ID que Spotify nos devolvió al crearla.

      // Convertimos cada canción de nuestro array en su "uri" (un identificador
      // especial de Spotify con formato spotify:track:XXXXX que necesita la API)
      const uris = playlist.map(t => t.uri);
      const addRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/items`, {
        // Nota: este endpoint también cambió de nombre en la migración de 2026,
        // antes era /tracks, ahora es /items
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

      // Si llegamos aquí, todo fue bien. Guardamos un mensaje de éxito,
      // incluyendo el link directo a la playlist en Spotify
      setSaveMessage({ type: 'success', text: '¡Playlist guardada en tu cuenta de Spotify!', url: playlistData.external_urls?.spotify });

    } catch (error) {
      // Si algo del try falló (en cualquiera de los dos pasos), llegamos aquí
      console.error('Error guardando playlist:', error);
      setSaveMessage({ type: 'error', text: error.message });
    }

    setSaving(false);
  };

  // ----------------------------------------------------------------
  // RENDERIZADO (lo que se muestra en pantalla)
  // ----------------------------------------------------------------
  return (
    <div style={{ marginTop: '2rem' }}>
  /* Botón principal para generar (o regenerar) la playlist */
      <button
        onClick={generatePlaylist}
        style={{ backgroundColor: '#1DB954', color: 'white', padding: '12px 32px', borderRadius: '50px', border: 'none', fontSize: '1rem', cursor: 'pointer', marginBottom: '1.5rem' }}
      >
        /* Texto del botón cambia según si está cargando o no */
        {loading ? 'Generando...' : '🎲 Generar Playlist'}
      </button>

/* Solo mostramos toda esta sección si hay canciones en la playlist */
      {playlist.length > 0 && (
        <div style={{ backgroundColor: '#1e1e1e', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ color: 'white', margin: 0 }}>🎧 Tu Playlist ({playlist.length} canciones)</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={generatePlaylist} style={{ backgroundColor: '#333', color: 'white', padding: '6px 16px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                🔄 Refrescar
              </button>
              <button onClick={saveToSpotify} disabled={saving} style={{ backgroundColor: '#1DB954', color: 'white', padding: '6px 16px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
              /* disabled={saving}: el botón se desactiva mientras se está guardando,
                    para evitar que el usuario haga doble clic y cree 2 playlists */
                {saving ? 'Guardando...' : '💾 Guardar en Spotify'}
              </button>
            </div>
          </div>

/* Mostramos el mensaje de éxito/error solo si existe */
          {saveMessage && (
            <div style={{ padding: '8px 12px', borderRadius: '8px', marginBottom: '1rem', backgroundColor: saveMessage.type === 'success' ? '#1a3d2b' : '#3d1a1a', color: 'white', fontSize: '0.85rem' }}>
              {saveMessage.text}
              /* El link solo aparece si saveMessage.url existe (solo en caso de éxito) */
              {saveMessage.url && (
                <a href={saveMessage.url} target="_blank" rel="noopener noreferrer" style={{ color: '#1DB954', marginLeft: '8px' }}>
                  Abrir en Spotify →
                </a>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          /* .map(track, index): el segundo parámetro "index" nos da la posición
                (0, 1, 2...) de cada elemento, útil para numerar la lista */
            {playlist.map((track, index) => (
              <div key={track.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '8px', borderRadius: '8px', backgroundColor: '#2a2a2a' }}>
              
              /* index + 1 porque empezamos a contar en 0, pero queremos mostrar
                    "1, 2, 3..." en vez de "0, 1, 2..." */
                <span style={{ color: '#aaa', fontSize: '0.85rem', width: '20px' }}>{index + 1}</span>
                {track.album?.images?.[0] && (
                  <img src={track.album.images[0].url} alt={track.name} style={{ width: '40px', height: '40px', borderRadius: '4px' }} />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'white', margin: 0, fontSize: '0.9rem' }}>{track.name}</p>
                  <p style={{ color: '#aaa', margin: 0, fontSize: '0.75rem' }}>{track.artists?.[0]?.name}</p>
                </div>
                  
                  /* Cálculo de la duración: Spotify da la duración en milisegundos
                    (duration_ms), hay que convertirla a "minutos:segundos" */
                <span style={{ color: '#aaa', fontSize: '0.75rem' }}>
                  {Math.floor(track.duration_ms / 60000)}
                /* 60000 ms = 1 minuto. Math.floor redondea hacia abajo
                      para quedarnos solo con los minutos completos */
                :
                {String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                /* % 60000 nos da los milisegundos que sobran tras quitar los minutos.
                      Dividimos por 1000 para pasar a segundos.
                      padStart(2, '0') añade un cero delante si el número tiene 1 sola cifra
                      (para que "5 segundos" se vea como "05" y no como "5") */
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
