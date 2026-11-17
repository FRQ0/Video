// Motor de animação: three.js (3D) + GSAP (linha do tempo) + HTML (títulos e legendas).
// Tudo é controlado pelo tempo: o renderizador chama window.__seek(t) quadro a quadro,
// então o vídeo final sai sempre igual (determinístico), sem depender da velocidade do PC.
import * as THREE from 'three';
import { gsap } from 'gsap';

export { THREE, gsap };

export const LARGURA = 1080;
export const ALTURA = 1920;

// Gerador aleatório com semente: o mesmo vídeo sempre sai igual.
export function aleatorio(semente = 1) {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function criarMundo({ fundo = '#8fc7ee' } = {}) {
  const canvas = document.createElement('canvas');
  document.getElementById('palco').appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(LARGURA, ALTURA, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const cena = new THREE.Scene();
  cena.background = new THREE.Color(fundo);

  const camera = new THREE.PerspectiveCamera(38, LARGURA / ALTURA, 0.1, 200);
  camera.position.set(0, 4, 14);
  const alvo = new THREE.Vector3(0, 1.5, 0);

  cena.add(new THREE.HemisphereLight('#ffffff', '#6b7a99', 1.6));
  const sol = new THREE.DirectionalLight('#ffffff', 2.2);
  sol.position.set(6, 12, 8);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30 });
  cena.add(sol);

  const tl = gsap.timeline({ paused: true });

  function desenhar() {
    camera.lookAt(alvo);
    renderer.render(cena, camera);
  }

  return { THREE, renderer, cena, camera, alvo, tl, desenhar };
}

const mat = (cor) => new THREE.MeshLambertMaterial({ color: cor, flatShading: true });

function sombra(obj) {
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return obj;
}

// Boneco low-poly no estilo "explicativo".
export function boneco(cor = '#7b4fc9') {
  const g = new THREE.Group();
  const corpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.55, 4, 10), mat(cor));
  corpo.position.y = 1.0;
  const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), mat('#f2c29b'));
  cabeca.position.y = 1.85;
  const cabelo = new THREE.Mesh(new THREE.SphereGeometry(0.44, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.3), mat('#2b2b2b'));
  cabelo.position.y = 1.9;
  for (const x of [-0.14, 0.14]) {
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), mat('#111111'));
    olho.position.set(x, 1.88, 0.39);
    g.add(olho);
  }
  for (const x of [-0.16, 0.16]) {
    const perna = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.55, 6), mat('#222222'));
    perna.position.set(x, 0.3, 0);
    g.add(perna);
  }
  g.add(corpo, cabeca, cabelo);
  return sombra(g);
}

export function moeda() {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 20), mat('#f4c430'));
  return sombra(m);
}

// Textura com texto (para placas, chips, telas).
export function texturaTexto(texto, { fundo = '#1f8f3a', cor = '#ffffff', w = 512, h = 160, fonte = '900 96px Montserrat' } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = fundo; x.fillRect(0, 0, w, h);
  x.fillStyle = cor; x.font = fonte; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(texto, w / 2, h / 2 + 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function placa(texto, opcoes = {}) {
  const tex = texturaTexto(texto, opcoes);
  const m = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1, 0.15), [mat('#145c25'), mat('#145c25'), mat('#145c25'), mat('#145c25'), new THREE.MeshBasicMaterial({ map: tex }), mat('#145c25')]);
  return sombra(m);
}

export function chip(texto = 'IA') {
  const tex = texturaTexto(texto, { fundo: '#151515', cor: '#3ad65a', w: 256, h: 256, fonte: '900 150px Montserrat' });
  const g = new THREE.Group();
  const topo = new THREE.MeshBasicMaterial({ map: tex });
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 2.2), [mat('#151515'), mat('#151515'), topo, mat('#151515'), mat('#151515'), mat('#151515')]);
  g.add(corpo);
  for (let i = 0; i < 5; i++) {
    for (const lado of [-1, 1]) {
      const pino = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.35), mat('#c9c9c9'));
      pino.position.set(-0.8 + i * 0.4, -0.05, lado * 1.25);
      g.add(pino);
    }
  }
  return sombra(g);
}

export function predio({ largura = 14, altura = 6 } = {}) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#d9ecf7'; x.fillRect(0, 0, 512, 256);
  x.strokeStyle = '#3b6f8f'; x.lineWidth = 6;
  for (let i = 0; i <= 512; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 256); x.stroke(); }
  for (let j = 0; j <= 256; j += 64) { x.beginPath(); x.moveTo(0, j); x.lineTo(512, j); x.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.BoxGeometry(largura, altura, 1), new THREE.MeshLambertMaterial({ map: t }));
  return sombra(m);
}

export function chao(cor = '#e9eef2', tamanho = 80) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(tamanho, tamanho), new THREE.MeshLambertMaterial({ color: cor }));
  m.rotation.x = -Math.PI / 2;
  m.receiveShadow = true;
  return m;
}

export function barra(cor = '#f4c430', altura = 1) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1, 24), mat(cor));
  m.geometry.translate(0, 0.5, 0); // cresce a partir da base
  m.scale.y = altura;
  return sombra(m);
}

// ---------- Camada HTML: título no topo e legenda palavra por palavra ----------

export function titulo(tl, t, linha1, linha2, cor2 = 'vermelho') {
  const el = document.createElement('div');
  el.className = 'titulo';
  el.innerHTML = `<div>${linha1}</div><div class="${cor2}">${linha2}</div>`;
  document.getElementById('camada').appendChild(el);
  tl.set(el, { autoAlpha: 0, scale: 0.6 }, 0);
  tl.to(el, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2.5)' }, t);
  return el;
}

export function esconder(tl, el, t) {
  tl.set(el, { autoAlpha: 0 }, t);
}

// frases: [{ t: inicio, fim, texto }]. Mostra até 3 palavras por vez, destacando a falada.
export function legendas(tl, frases) {
  const el = document.createElement('div');
  el.className = 'legenda';
  document.getElementById('camada').appendChild(el);
  for (const f of frases) {
    const palavras = f.texto.split(/\s+/);
    const passo = (f.fim - f.t) / palavras.length;
    palavras.forEach((_, i) => {
      const ini = Math.floor(i / 3) * 3;
      const grupo = palavras.slice(ini, ini + 3)
        .map((p, k) => (ini + k === i ? `<span class="ativa">${p}</span>` : p)).join(' ');
      tl.call(() => { el.innerHTML = grupo; }, null, f.t + i * passo);
    });
    tl.call(() => { el.innerHTML = ''; }, null, f.fim);
  }
}

// Conecta a cena ao renderizador.
export function publicar({ tl, desenhar, duracao }) {
  window.__duracao = duracao;
  window.__seek = (t) => { tl.seek(t, false); desenhar(); };
  window.__seek(0);
  window.__pronto = true;
}
