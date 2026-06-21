'use client';
// Le decimos a Next.js que este componente se ejecuta en el navegador (cliente),
// no en el servidor. Es obligatorio porque usamos onClick (interactividad).

// Lista fija de décadas disponibles. No viene de ninguna API porque son datos
// que no cambian, así que no tiene sentido pedirlos por red.
const decades = ['60s', '70s', '80s', '90s', '2000s', '2010s', '2020s'];

// "selected" y "onChange" son props que recibe del componente padre (dashboard/page.js).
// selected: array con las décadas que el usuario ya marcó, ej: ['90s', '2000s']
// onChange: función que el padre nos pasa para avisarle cuando cambia algo
export default function DecadeWidget({ selected, onChange }) {

  // Esta función decide si añadir o quitar una década del array de seleccionadas
  const toggle = (decade) => {

    // selected.includes(decade) comprueba si esa década YA está en el array
    if (selected.includes(decade)) {

      // Si ya estaba, la quitamos creando un NUEVO array sin ella.
      // .filter() recorre el array y se queda solo con los elementos que
      // cumplen la condición (aquí: todos menos el que coincide con "decade")
      onChange(selected.filter(d => d !== decade));
    } else {

      // Si no estaba, la añadimos creando un NUEVO array:
      // [...selected, decade] = copia todo lo que había antes (...selected)
      // y añade la década nueva al final
      onChange([...selected, decade]);
    }
    // Nota: en React nunca modificamos el array original directamente
    // (ej. selected.push(decade) estaría mal), siempre creamos uno nuevo,
    // porque React necesita detectar el cambio para volver a renderizar.
  };

  return (
    <div style={{ backgroundColor: '#1A1F1A', border: '1px solid #2E3B2A', borderRadius: '4px', padding: '1rem' }}>
  /* .map() recorre el array "decades" y crea un <button> por cada elemento */
  
      <h2 style={{ color: '#8FBF7A', fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>Décadas</h2>
      <p style={{ color: '#6B7A66', fontSize: '0.8rem', marginBottom: '1rem' }}>Elige una o varias</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {decades.map(decade => (
          <button
            key={decade}
         // key es OBLIGATORIO en listas de React: le permite identificar
            // cada elemento de forma única para saber qué cambió entre renders
         
            onClick={() => toggle(decade)}
         // Al hacer clic, llamamos a toggle() pasándole esta década concreta
         
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              // Operador ternario: condición ? valorSiTrue : valorSiFalse
              border: selected.includes(decade) ? 'none' : '1px solid #2E3B2A',
              cursor: 'pointer',
              // Si la década está seleccionada, fondo verde; si no, gris oscuro
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
