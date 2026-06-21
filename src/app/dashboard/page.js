'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

// Importamos los 6 widgets y el componente de playlist
import GenreWidget from '../components/GenreWidget';
import ArtistWidget from '../components/ArtistWidget';
import TrackWidget from '../components/TrackWidget';
import DecadeWidget from '../components/DecadeWidget';
import MoodWidget from '../components/MoodWidget';
import PopularityWidget from '../components/PopularityWidget';
import PlaylistDisplay from '../components/PlaylistDisplay';

export default function Dashboard() {
  const router = useRouter();
  // useRouter nos permite redirigir al usuario a otra página mediante código
  // (a diferencia de <Link>, que solo funciona si el usuario hace clic)

  // ----------------------------------------------------------------
  // ESTADOS: aquí vive la "fuente de la verdad" de TODAS las selecciones.
  // Cada widget es un componente hijo "tonto": no guarda su propio estado
  // permanente, recibe el valor actual (selected) y una función para
  // cambiarlo (onChange) desde aquí, el padre.
  // ----------------------------------------------------------------
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectedDecades, setSelectedDecades] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedPopularity, setSelectedPopularity] = useState(null);
  
  const [loaded, setLoaded] = useState(false);
  // loaded: nos sirve para saber si ya hemos terminado de cargar las
  // preferencias guardadas, antes de empezar a guardarlas de nuevo
  // (evita sobreescribir lo guardado con valores vacíos al iniciar)


  // ----------------------------------------------------------------
  // EFECTO 1: se ejecuta SOLO al montar la página
  // Comprueba si el usuario está logueado, y si lo está, recupera
  // sus preferencias guardadas anteriormente en localStorage
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!isAuthenticated()) {
      // Si no hay token guardado, no debería estar aquí: lo mandamos al login
      router.push('/');
      return; // importante: salimos de la función para no seguir ejecutando
    }

    // Intentamos leer las preferencias guardadas anteriormente
    const saved = localStorage.getItem('taste_mixer_preferences');
    if (saved) {
      try {
        // localStorage solo guarda texto, así que convertimos el string
        // de vuelta a un objeto JS con JSON.parse
        const prefs = JSON.parse(saved);

        // Restauramos cada preferencia guardada (o un valor vacío si no existía)
        setSelectedGenres(prefs.genres || []);
        setSelectedArtists(prefs.artists || []);
        setSelectedTracks(prefs.tracks || []);
        setSelectedDecades(prefs.decades || []);
        setSelectedMood(prefs.mood || null);
        setSelectedPopularity(prefs.popularity || null);
      } catch (e) {
        // Si el JSON estuviera corrupto o mal formado, evitamos que rompa
        // toda la aplicación, y simplemente lo registramos en consola
        console.error('Error cargando preferencias:', e);
      }
    }
    setLoaded(true); // marcamos que ya terminamos de cargar
  }, [router]);
  // [router] como dependencia: técnicamente no cambia nunca, pero React
  // recomienda incluir cualquier valor externo que uses dentro del efecto


  // ----------------------------------------------------------------
  // EFECTO 2: se ejecuta cada vez que CUALQUIER preferencia cambia
  // Guarda automáticamente el estado actual en localStorage
  // ----------------------------------------------------------------
  useEffect(() => {
    // Si todavía no hemos terminado de cargar (loaded es false), no guardamos.
    // Esto evita que, justo al entrar a la página, sobreescribamos las
    // preferencias guardadas con los valores iniciales vacíos
    if (!loaded) return;
    
    const prefs = {
      genres: selectedGenres,
      artists: selectedArtists,
      tracks: selectedTracks,
      decades: selectedDecades,
      mood: selectedMood,
      popularity: selectedPopularity
    };

    // localStorage solo acepta strings, así que convertimos el objeto a
    // texto JSON con JSON.stringify antes de guardarlo
    localStorage.setItem('taste_mixer_preferences', JSON.stringify(prefs));
  }, [selectedGenres, selectedArtists, selectedTracks, selectedDecades, selectedMood, selectedPopularity, loaded]);
  // Esta lista de dependencias es clave: el efecto se vuelve a ejecutar
  // cada vez que CUALQUIERA de estos valores cambia. Así, en el momento
  // en que el usuario marca un género nuevo, automáticamente se guarda todo.
  
  return (
    <div style={{ backgroundColor: '#0F1410', minHeight: '100vh', color: '#C8DCC0', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '2rem', color: '#8FBF7A' }}>Spotify Taste Mixer</h1>

      /* Layout en 3 columnas: lateral izquierda - centro - lateral derecha */
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 180px', gap: '1rem' }}>
        /* Columna izquierda: Género (botones en columna, estrecha) */
        <div>
          <GenreWidget selected={selectedGenres} onChange={setSelectedGenres} />
          /* Aquí está la "comunicación padre-hijo":
              - selected={selectedGenres}: le pasamos el VALOR actual al hijo
              - onChange={setSelectedGenres}: le pasamos la FUNCIÓN para cambiarlo
              El hijo nunca modifica selectedGenres directamente, solo llama
              a la función onChange que el padre le dio, y es el padre quien
              realmente actualiza su propio estado. Esto es "prop drilling":
              pasar datos y funciones de padre a hijo a través de props. */
        </div>

        /* Centro: Artist+Track arriba, Mood+Popularity abajo */
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

        /* Columna derecha: Década */
        <div>
          <DecadeWidget selected={selectedDecades} onChange={setSelectedDecades} />
        </div>

      </div>

      /* PlaylistDisplay recibe TODAS las selecciones como props, para poder
          combinarlas y generar la búsqueda final en Spotify */
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
