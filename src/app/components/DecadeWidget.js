'use client';

const decades = ['60s', '70s', '80s', '90s', '2000s', '2010s', '2020s'];

export default function DecadeWidget({ selected, onChange }) {
  const toggle = (decade) => {
    if (selected.includes(decade)) {
      onChange(selected.filter(d => d !== decade));
    } else {
      onChange([...selected, decade]);
    }
  };

  return (
    <div style={{ backgroundColor: '#1A1F1A', border: '1px solid #2E3B2A', borderRadius: '4px', padding: '1rem' }}>
      <h2 style={{ color: '#8FBF7A', fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>Décadas</h2>
      <p style={{ color: '#6B7A66', fontSize: '0.8rem', marginBottom: '1rem' }}>Elige una o varias</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {decades.map(decade => (
          <button
            key={decade}
            onClick={() => toggle(decade)}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: selected.includes(decade) ? 'none' : '1px solid #2E3B2A',
              cursor: 'pointer',
              backgroundColor: selected.includes(decade) ? '#7FA86B' : '#242B22',
              color: selected.includes(decade) ? '#10180D' : '#C8DCC0',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}
          >
            {decade}
          </button>
        ))}
      </div>
    </div>
  );
}