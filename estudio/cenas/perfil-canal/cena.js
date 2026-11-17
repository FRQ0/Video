// Foto de perfil do CANAL (serve para todas as histórias): figura sombria com olhos "A" e "B".
// node render.mjs perfil-canal --fps 10 --saida saida/perfil-canal.mp4  e recorte o quadrado central.
import { THREE, criarMundo, publicar } from 'motor';
import { sombraComOlhos } from '../andar13/cenario.js';

const { cena, camera, alvo, tl, desenhar, ceu, sol } = criarMundo({ fundo: '#060609', noite: true });
ceu.intensity = 0.2;
sol.intensity = 0.15;

// Halo vermelho com brilho em degradê
const tex = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(256, 256, 40, 256, 256, 256);
  g.addColorStop(0, '#a3141a'); g.addColorStop(0.55, '#520b10'); g.addColorStop(1, 'rgba(6,6,9,0)');
  x.fillStyle = g; x.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const halo = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
halo.position.set(0, 2.35, -2.5);
cena.add(halo);

const figura = sombraComOlhos();
figura.scale.setScalar(1.35);
// esconde os olhos originais (usa os olhos-letra abaixo)
figura.traverse((o) => { if (o.isMesh && o.geometry.type === 'SphereGeometry' && o.geometry.parameters.radius < 0.1) o.visible = false; });
cena.add(figura);

function olhoLetra(letra, cor) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 60, 128, 128, 128);
  g.addColorStop(0, cor); g.addColorStop(0.72, cor); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  x.fillStyle = '#0b0b0b'; x.font = '900 120px Montserrat'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(letra, 128, 136);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshBasicMaterial({ map: t, transparent: true }));
}
const olhoA = olhoLetra('A', '#ffc61a');
const olhoB = olhoLetra('B', '#4be06b');
olhoA.position.set(-0.17, 1.88, 0.5);
olhoB.position.set(0.17, 1.88, 0.5);
figura.add(olhoA, olhoB);

const contraluz = new THREE.PointLight('#ff3030', 12, 7);
contraluz.position.set(0, 3.4, -1.0);
cena.add(contraluz);

camera.position.set(0, 2.4, 6.6);
alvo.set(0, 2.3, 0);
camera.fov = 30;

publicar({ tl, desenhar, duracao: 0.1 });
