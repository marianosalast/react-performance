// collect-data.js
import puppeteer from 'puppeteer';
import { exec } from 'child_process';

// --- 1. Definimos nuestros valores X (al menos 20) ---
// Usamos una distribución variada para ver mejor la curva
const ITEM_COUNTS = [
  100, 200, 300, 500, 800, 1000, 1500, 2000, 2500, 3000,
  4000, 5000, 6000, 7000, 8000, 9000, 10000, 12000, 15000, 18000, 20000, 150000
];

const VITE_PORT = 5173; // Puerto por defecto de Vite
const results = [];

(async () => {
  console.log('Iniciando script de recolección de datos...');

  // 1. Iniciar el servidor de Vite en segundo plano
  const viteServer = exec('npm run dev');
  // Damos un tiempo para que Vite inicie
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log('Servidor de Vite iniciado.');

  // 2. Lanzar Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  console.log('Navegador (Puppeteer) iniciado.');

  // 3. Escuchar la consola del navegador
  page.on('console', msg => {
    const text = msg.text();
    if (text.startsWith('PROFILER_RESULT::')) {
      // Capturamos nuestro (X, Y)
      const [items, duration] = text.split('::')[1].split(',');
      results.push({ x: parseInt(items), y: parseFloat(duration) });
      console.log(`DATO CAPTURADO: (${items}, ${duration}ms)`);
    }
  });

  // 4. Iterar sobre cada valor de X
  for (const count of ITEM_COUNTS) {
    console.log(`Probando con N = ${count}...`);
    const url = `http://localhost:${VITE_PORT}/?items=${count}`;
    
    // Recargamos la página para forzar un 'mount' limpio
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    // Damos un pequeño margen para que React termine de renderizar y el Profiler emita el log
    await new Promise(resolve => setTimeout(resolve, 500)); 
  }

  // 5. Cerrar todo y mostrar resultados
  await browser.close();
  viteServer.kill();

  console.log('\n--- Recolección Finalizada ---');
  console.log('DATOS (X, Y) para Mínimos Cuadrados:');
  console.log('Items (X),Tiempo_ms (Y)');
  results.sort((a, b) => a.x - b.x).forEach(r => {
    console.log(`${r.x},${r.y}`);
  });

})();