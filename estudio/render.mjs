// Renderiza uma cena em MP4 vertical (1080x1920).
// Uso: node render.mjs <cena> [--fps 30] [--audio narracao.mp3] [--saida arquivo.mp4] [--previa]
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const raiz = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opc = (nome, padrao) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : padrao; };
const cenaNome = args[0] && !args[0].startsWith('--') ? args[0] : 'exemplo';
const previa = args.includes('--previa');
const fps = Number(opc('--fps', previa ? 15 : 30));
const audio = opc('--audio');
const saida = path.resolve(opc('--saida', path.join(raiz, 'saida', `${cenaNome}.mp4`)));

const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };

// Servidor local só para a renderização (escuta apenas em 127.0.0.1).
const servidor = http.createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const arquivo = path.normalize(path.join(raiz, url === '/' ? 'motor/pagina.html' : url));
  if (!arquivo.startsWith(raiz)) { res.writeHead(403).end(); return; }
  try {
    res.writeHead(200, { 'Content-Type': tipos[path.extname(arquivo)] || 'application/octet-stream' });
    res.end(await readFile(arquivo));
  } catch { res.writeHead(404).end(); }
});
await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
const porta = servidor.address().port;

const navegador = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const pagina = await navegador.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
pagina.on('pageerror', (e) => console.error('Erro na cena:', e.message));
await pagina.goto(`http://127.0.0.1:${porta}/?cena=${encodeURIComponent(cenaNome)}`);
await pagina.waitForFunction(() => window.__pronto === true, null, { timeout: 60000 });
const duracao = await pagina.evaluate(() => window.__duracao);
const total = Math.round(duracao * fps);

await import('node:fs').then((fs) => fs.mkdirSync(path.dirname(saida), { recursive: true }));
const ff = spawn('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
  ...(audio ? ['-i', audio, '-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', previa ? '26' : '18', '-preset', previa ? 'veryfast' : 'medium',
  '-movflags', '+faststart', saida,
], { stdio: ['pipe', 'inherit', 'inherit'] });

const inicio = Date.now();
for (let f = 0; f < total; f++) {
  await pagina.evaluate((t) => window.__seek(t), f / fps);
  const img = await pagina.screenshot({ type: 'jpeg', quality: 92 });
  if (!ff.stdin.write(img)) await new Promise((ok) => ff.stdin.once('drain', ok));
  if (f % fps === 0) process.stdout.write(`\rQuadro ${f}/${total}`);
}
ff.stdin.end();
await new Promise((ok, erro) => ff.on('close', (c) => (c === 0 ? ok() : erro(new Error('ffmpeg falhou')))));
await navegador.close();
servidor.close();
console.log(`\nPronto: ${saida} (${total} quadros em ${((Date.now() - inicio) / 1000).toFixed(0)} s)`);
