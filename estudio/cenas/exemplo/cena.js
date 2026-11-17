// Cena de exemplo (12 s, vertical 1080x1920). Copie esta pasta para criar um vídeo novo
// e peça ao Claude: "edite cenas/MEU-VIDEO/cena.js para contar <assunto>".
import {
  THREE, gsap, criarMundo, boneco, moeda, chip, predio, chao, placa, barra,
  titulo, esconder, legendas, publicar, aleatorio,
} from 'motor';

const { cena, camera, alvo, tl, desenhar } = criarMundo({ fundo: '#8fc7ee' });
const rnd = aleatorio(42);

// ---------- Cenário 1 (x = 0): prédio, chip "IA" e bonecos ----------
cena.add(chao('#e9eef2'));
const fachada = predio();
fachada.position.set(0, 3, -6);
cena.add(fachada);
const letreiro = placa('R$ 0');
letreiro.position.set(0, 5.2, -5.4);
cena.add(letreiro);
const mesa = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.5, 32), new THREE.MeshLambertMaterial({ color: '#f1efe9' }));
mesa.position.set(0, 0.25, 0);
mesa.castShadow = mesa.receiveShadow = true;
cena.add(mesa);
const ia = chip('IA');
ia.position.set(0, 2.6, 0);
cena.add(ia);
const bonecos = ['#7b4fc9', '#1fa38a', '#e8663a', '#2f6fd6'].map((cor, i) => {
  const b = boneco(cor);
  const ang = -0.9 + i * 0.6;
  b.position.set(Math.sin(ang) * 2.8, 0, Math.cos(ang) * 2.8);
  b.lookAt(0, 0, 0);
  cena.add(b);
  return b;
});

// ---------- Moedas caindo (cenário 1, cena 2) ----------
const moedas = Array.from({ length: 40 }, () => {
  const m = moeda();
  m.position.set((rnd() - 0.5) * 9, 12 + rnd() * 6, (rnd() - 0.5) * 5);
  m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
  cena.add(m);
  return m;
});

// ---------- Cenário 2 (x = 40): gráfico de barras de moedas ----------
const base2 = new THREE.Group();
base2.position.x = 40;
cena.add(base2);
const chao2 = chao('#1b2440', 60);
chao2.position.set(0, 0.02, 0);
base2.add(chao2);
const alturas = [1.2, 2.2, 3.4, 5.2];
const barras = alturas.map((h, i) => {
  const b = barra('#f4c430', 0.01);
  b.position.set(-2.4 + i * 1.6, 0, 0);
  base2.add(b);
  return b;
});

// ================= LINHA DO TEMPO =================
// Cena 1 (0–3 s)
const t1 = titulo(tl, 0.1, 'Este vídeo', 'custou R$ 0', 'vermelho');
tl.fromTo(camera.position, { x: 0, y: 6, z: 16 }, { x: 0, y: 4.5, z: 12, duration: 3, ease: 'power1.inOut' }, 0);
tl.fromTo(ia.rotation, { y: 0 }, { y: Math.PI * 2, duration: 3, ease: 'none' }, 0);
tl.fromTo(ia.position, { y: 2.6 }, { y: 3.0, duration: 1.5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0);
esconder(tl, t1, 3);

// Cena 2 (3–6 s): chuva de moedas
const t2 = titulo(tl, 3.05, 'Sem programa', 'de edição', 'amarelo');
tl.set(camera.position, { x: 0, y: 3, z: 10 }, 3);
tl.to(camera.position, { z: 8, duration: 3, ease: 'power1.out' }, 3);
moedas.forEach((m, i) => {
  tl.to(m.position, { y: 0.6 + (i % 4) * 0.09, duration: 1.1 + rnd() * 0.6, ease: 'bounce.out' }, 3 + rnd() * 1.2);
  tl.to(m.rotation, { x: 0, z: 0, duration: 1.2 }, 3.2 + rnd());
});
bonecos.forEach((b, i) => {
  tl.to(b.position, { y: 0.6, duration: 0.25, yoyo: true, repeat: 3, ease: 'power2.out' }, 3.4 + i * 0.12);
});
esconder(tl, t2, 6);

// Cena 3 (6–9 s): gráfico subindo em fundo azul-escuro
const t3 = titulo(tl, 6.05, 'Só código', 'aberto e grátis', 'verde');
tl.set(cena.background, { r: 0.06, g: 0.09, b: 0.2 }, 6);
tl.set(camera.position, { x: 40, y: 4, z: 15 }, 6);
tl.set(alvo, { x: 40, y: 2.8 }, 6);
barras.forEach((b, i) => {
  tl.to(b.scale, { y: alturas[i], duration: 0.8, ease: 'back.out(1.6)' }, 6.3 + i * 0.35);
});
tl.to(camera.position, { x: 41.5, z: 13.5, duration: 3, ease: 'sine.inOut' }, 6);
esconder(tl, t3, 9);

// Cena 4 (9–12 s): volta aos bonecos, comemorando
const t4 = titulo(tl, 9.05, 'Agora é', 'a sua vez', 'verde');
tl.set(cena.background, { r: 0.56, g: 0.78, b: 0.93 }, 9);
tl.set(alvo, { x: 0, y: 1.5 }, 9);
tl.set(camera.position, { x: -6, y: 3.5, z: 9 }, 9);
tl.to(camera.position, { x: 6, duration: 3, ease: 'sine.inOut' }, 9);
bonecos.forEach((b, i) => {
  tl.to(b.position, { y: 0.9, duration: 0.3, yoyo: true, repeat: 7, ease: 'power2.out' }, 9.2 + i * 0.1);
  tl.to(b.rotation, { y: '+=' + Math.PI * 2, duration: 1.2, ease: 'power2.inOut' }, 10 + i * 0.1);
});

// Legendas (no vídeo real, use os tempos da narração / do faster-whisper)
legendas(tl, [
  { t: 0.2, fim: 2.9, texto: 'Esse vídeo inteiro custou zero reais' },
  { t: 3.1, fim: 5.9, texto: 'sem nenhum programa de edição' },
  { t: 6.1, fim: 8.9, texto: 'tudo feito com código aberto' },
  { t: 9.1, fim: 11.8, texto: 'e agora é a sua vez' },
]);

publicar({ tl, desenhar, duracao: 12 });
