// Foto de perfil do canal: o Léo assustado e a figura de olhos brilhando atrás dele.
// Renderize e recorte o quadrado central:  node render.mjs perfil  (ver README)
import { THREE, criarMundo, publicar } from 'motor';
import { leo, sombraComOlhos } from '../andar13/cenario.js';

const { cena, camera, alvo, tl, desenhar, ceu, sol } = criarMundo({ fundo: '#07080d', noite: true });
ceu.intensity = 0.25;
sol.intensity = 0.2;

// Halo vermelho atrás dos personagens
const halo = new THREE.Mesh(new THREE.CircleGeometry(2.3, 64), new THREE.MeshBasicMaterial({ color: '#5c0a0a' }));
halo.position.set(0.25, 2.0, -3);
cena.add(halo);
const halo2 = new THREE.Mesh(new THREE.RingGeometry(2.3, 2.45, 64), new THREE.MeshBasicMaterial({ color: '#c41414' }));
halo2.position.copy(halo.position);
cena.add(halo2);

const sombra = sombraComOlhos();
sombra.scale.setScalar(1.25);
sombra.position.set(0.75, -0.25, -1.6);
sombra.rotation.y = -0.25;
sombra.userData.olhos.opacity = 1;
cena.add(sombra);

const personagem = leo();
personagem.position.set(-0.35, 0, 0);
personagem.rotation.y = 0.35;
cena.add(personagem);
const boca = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), new THREE.MeshBasicMaterial({ color: '#120606' }));
boca.scale.set(1, 1.5, 0.5);
boca.position.set(0, 1.68, 0.41);
personagem.add(boca);

// Luz fria vinda de baixo no rosto do Léo (clima de lanterna) + contraluz vermelha
const lanterna = new THREE.PointLight('#bcd2ff', 3, 6);
lanterna.position.set(-0.2, 1.0, 1.6);
cena.add(lanterna);
const contraluz = new THREE.PointLight('#ff2a2a', 10, 6);
contraluz.position.set(0.6, 2.6, -1.2);
cena.add(contraluz);

camera.position.set(0, 1.9, 7.2);
alvo.set(0.2, 1.75, 0);
camera.fov = 30;

publicar({ tl, desenhar, duracao: 0.1 });
