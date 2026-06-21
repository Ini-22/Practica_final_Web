'use client';

const options = [
  { id: 'mainstream', label: 'Mainstream', desc: 'Hits populares' },
  { id: 'mixed', label: 'Mixto', desc: 'Un poco de todo' },
  { id: 'hidden', label: 'Joyas ocultas', desc: 'Artistas independientes' },
];

export default function PopularityWidget({ selected, onChange }) {
  return (
    <div style={{ backgroundColor: '#1A1F1A', border: '1px solid #2E3B2A', borderRadius: '4px', padding: '1rem' }}>
      <h2 style={{ color: '#8FBF7A', fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>Popularidad</h2>
      <p style={{ color: '#6B7A66', fontSize: '0.8rem', marginBottom: '1rem' }}>Elige uno</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => onChange(opt)}
            style={{
              padding: '10px 16px',
              borderRadius: '4px',
              border: selected?.id === opt.id ? '1px solid #7FA86B' : '1px solid #2E3B2A',
              cursor: 'pointer',
              backgroundColor: selected?.id === opt.id ? '#27331F' : '#242B22',
              color: '#C8DCC0',
              textAlign: 'left'
            }}
          >
            <div style={{ fontWeight: 500, color: selected?.id === opt.id ? '#8FBF7A' : '#C8DCC0' }}>{opt.label}</div>
            <div style={{ fontSize: '0.75rem', color: '#6B7A66' }}>{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}