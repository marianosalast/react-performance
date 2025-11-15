// src/App.jsx
import React, { Profiler, useMemo } from 'react';

// Función para generar datos "dummy"
const generateItems = (count) => {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push({ id: `item-${i}`, content: `Item número ${i + 1}` });
  }
  return items;
};

// El componente de la lista
const MyList = ({ items }) => {
  return (
    <ul>
      {items.map(item => (
        // Usamos una key estable (id) como buena práctica
        <li key={item.id}>{item.content}</li>
      ))}
    </ul>
  );
};

// --- Opcional: Para el Experimento 2 (Update) ---
// const MemoizedItem = React.memo(({ content }) => {
//   return <li>{content}</li>;
// });

function App() {
  // 1. Obtener 'N' (X) desde la URL
  const params = new URLSearchParams(window.location.search);
  const itemsCount = parseInt(params.get('items') || '100', 10);

  // 2. Generar los datos
  const items = useMemo(() => generateItems(itemsCount), [itemsCount]);

  // 3. Callback del Profiler (Aquí está nuestra variable 'Y')
  const onRenderCallback = (
    id, // "ListProfiler"
    phase, // "mount" o "update"
    actualDuration, // ¡Nuestra variable Y!
    baseDuration,
    startTime,
    commitTime
  ) => {
    // Solo nos interesa el 'mount' inicial para este experimento
    if (phase === 'mount') {
      // Enviamos el resultado a la consola, donde Puppeteer lo leerá
      console.log(`PROFILER_RESULT::${itemsCount},${actualDuration}`);
    }
  };

  return (
    <div>
      <h1>Test de Renderizado (N={itemsCount})</h1>
      <Profiler id="ListProfiler" onRender={onRenderCallback}>
        <MyList items={items} />
      </Profiler>
    </div>
  );
}

export default App;