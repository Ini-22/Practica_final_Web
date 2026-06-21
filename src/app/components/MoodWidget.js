'use client';

// Array de OBJETOS (no strings) porque cada mood tiene varias propiedades:
// id (identificador único), label (texto que se muestra), energy (dato extra
// que podríamos usar más adelante para afinar la búsqueda de canciones)
const moods = [
  { id: 'happy', label: 'Feliz', energy: 'high' },
  { id: 'sad', label: 'Triste', energy: 'low' },
  { id: 'energetic', label: 'Energético', energy: 'high' },
  { id: 'chill', label: 'Relajado', energy: 'low' },
  { id: 'romantic', label: 'Romántico', energy: 'medium' },
  { id: 'focused', label: 'Concentrado', energy: 'medium' },
];

// A diferencia de los widgets anteriores, aquí "selected" NO es un array,
// es un único objeto (o null si no se ha elegido nada). Por eso no hay
// función toggle ni .filter(), simplemente sobreescribimos el valor anterior.
export default function MoodWidget({ selected, onChange }) {
  return (
    <div style={{ backgroundColor: '#1A1F1A', border: '1px solid #2E3B2A', borderRadius: '4px', padding: '1rem' }}>
      <h2 style={{ color: '#8FBF7A', fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>Mood</h2>
      <p style={{ color: '#6B7A66', fontSize: '0.8rem', marginBottom: '1rem' }}>Elige uno</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {moods.map(mood => (
          <button
            key={mood.id}
            // Al pulsar, simplemente le pasamos el mood completo (objeto) al padre.
            // No hay lógica de añadir/quitar: el último click siempre "gana"
            onClick={() => onChange(mood)}
            style={{
              padding: '6px 16px',
              borderRadius: '4px',
              // selected?.id : el "?." evita un error si selected es null.
              // Sin el "?", "null.id" rompería el programa.
              // Con "?.", si selected es null, el resultado es undefined,
              // y undefined === mood.id siempre es false (no rompe nada)
              border: selected?.id === mood.id ? 'none' : '1px solid #2E3B2A',
              cursor: 'pointer',
              backgroundColor: selected?.id === mood.id ? '#7FA86B' : '#242B22',
              color: selected?.id === mood.id ? '#10180D' : '#C8DCC0',
              fontSize: '0.9rem'
            }}
          >
            {mood.label}
          </button>
        ))}
      </div>
    </div>
  );
}
