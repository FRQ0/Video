// O ANDAR 13 — Parte 1: "O bilhete" (~79 s)
import { gsap, criarMundo, titulo, esconder, legendas, publicar, aleatorio, painel, flash, escuro, tremer, piscar } from 'motor';
import { X, montarPredio, montarElevador, montarCorredor, montarApto } from '../cenario.js';

const { cena, camera, alvo, tl, desenhar } = criarMundo({ fundo: '#090b14', noite: true });
const rnd = aleatorio(1301);
const predio = montarPredio(cena);
const elevador = montarElevador(cena);
const corredor = montarCorredor(cena);
const apto = montarApto(cena);

const selo = document.createElement('div');
selo.className = 'selo';
selo.textContent = 'O ANDAR 13 • PARTE 1/5';
document.getElementById('camada').appendChild(selo);

// Corte seco de câmera: posição, alvo e abertura da lente.
function corte(t, pos, olhar, fov = 38) {
  tl.set(camera.position, pos, t);
  tl.set(alvo, olhar, t);
  tl.set(camera, { fov }, t);
}

// ---- 0–4.5 s · GANCHO: o bilhete no chão ----
corte(0, { x: X.apto + 0.3, y: 1.6, z: -0.3 }, { x: X.apto + 0.1, y: 0, z: -2.3 });
tl.to(camera.position, { y: 1.1, z: -1.2, duration: 4.5, ease: 'power1.in' }, 0);
const t1 = titulo(tl, 0.15, 'Um bilhete', 'com a letra dele', 'vermelho');
esconder(tl, t1, 4.5);

// ---- 4.5–9.5 s · O prédio antigo ----
corte(4.5, { x: X.predio, y: 3, z: 30 }, { x: X.predio, y: 12, z: 0 });
tl.to(camera.position, { y: 9, z: 21, duration: 5, ease: 'sine.inOut' }, 4.5);
const vermelho = { r: 0.9, g: 0.08, b: 0.06 }, apagada = { r: 0.05, g: 0.06, b: 0.1 };
for (let t = 4.5; t < 9.5; t += 0.08 + rnd() * 0.35) tl.set(predio.janela13.color, rnd() < 0.6 ? vermelho : apagada, t);
const t2 = titulo(tl, 4.6, 'Parte 1', 'O andar 13', 'vermelho');
esconder(tl, t2, 9.5);

// ---- 9.5–14.5 s · O elevador sem o 13 ----
corte(9.5, { x: X.elevador + 0.3, y: 1.7, z: 0.9 }, { x: X.elevador, y: 1.7, z: -1.48 });
tl.to(camera.position, { x: X.elevador - 0.1, y: 2.45, z: -0.55, duration: 5, ease: 'power2.inOut' }, 9.5);
tl.to(alvo, { x: X.elevador - 0.25, y: 2.52, duration: 5, ease: 'power2.inOut' }, 9.5);
piscar(tl, elevador.luz, 12.5, 14.4, aleatorio(5));
const t3 = titulo(tl, 9.6, 'O prédio não tem', '13º andar', 'amarelo');
esconder(tl, t3, 14.5);

// ---- 14.5–19.5 s · Mas a porta diz 1301 ----
corte(14.5, { x: X.corredor + 0.3, y: 1.8, z: -4.4 }, { x: X.corredor + 1.86, y: 1.9, z: -6 });
tl.to(camera.position, { x: X.corredor + 1.0, y: 1.9, z: -5.3, duration: 5, ease: 'power1.inOut' }, 14.5);
piscar(tl, corredor.lampada, 17, 19.4, aleatorio(8));
const t4 = titulo(tl, 14.6, 'Mas a porta dele', 'dizia 1301', 'vermelho');
esconder(tl, t4, 19.5);

// ---- 19.5–25 s · 03:33 ----
escuro(tl, 19.5, 1, 0.15);
const relogio = painel(tl, '03:33', 19.7, 25, 'relogio');
for (let t = 20.5; t < 24.8; t += 1) { tl.set(relogio, { opacity: 0.25 }, t); tl.set(relogio, { opacity: 1 }, t + 0.5); }
const t5 = titulo(tl, 19.6, 'Toda noite', 'na mesma hora', 'amarelo');
esconder(tl, t5, 25);
escuro(tl, 25, 0, 0.3);

// ---- 25–31 s · O elevador abre e ninguém sai ----
corte(25, { x: X.corredor, y: 1.6, z: 2 }, { x: X.corredor, y: 1.3, z: -15 });
tl.to(camera.position, { z: -3, duration: 6, ease: 'none' }, 25);
tl.to(corredor.portaE.position, { x: -1.22, duration: 1.2, ease: 'power2.inOut' }, 26.4);
tl.to(corredor.portaD.position, { x: 1.22, duration: 1.2, ease: 'power2.inOut' }, 26.4);
tl.to(corredor.luzElevador, { intensity: 9, duration: 0.6 }, 26.4);
piscar(tl, corredor.lampada, 27, 29.5, aleatorio(9));
tl.to(corredor.portaE.position, { x: -0.41, duration: 1.2, ease: 'power2.inOut' }, 29.6);
tl.to(corredor.portaD.position, { x: 0.41, duration: 1.2, ease: 'power2.inOut' }, 29.6);
tl.to(corredor.luzElevador, { intensity: 0, duration: 0.8 }, 30);
const t6 = titulo(tl, 25.1, 'As portas abriam', 'e ninguém saía', 'vermelho');
esconder(tl, t6, 31);

// ---- 31–37 s · O papel desliza por baixo da porta ----
corte(31, { x: X.apto + 2.4, y: 2.3, z: 3.2 }, { x: X.apto, y: 1.0, z: -2 });
tl.set(apto.bilhete.position, { z: -3.25 }, 31);
tl.to(apto.bilhete.position, { z: -2.3, duration: 1.4, ease: 'power2.out' }, 33.2);
tl.to(camera.position, { x: X.apto + 1.2, y: 1.6, z: 0.4, duration: 6, ease: 'power1.inOut' }, 31);
tl.to(alvo, { y: 0.3, z: -2.3, duration: 3, ease: 'power1.inOut' }, 34);
const t7 = titulo(tl, 31.1, 'Até que', 'naquela noite…', 'amarelo');
esconder(tl, t7, 37);

// ---- 37–43 s · O que estava escrito ----
escuro(tl, 37, 0.8, 0.2);
painel(tl, 'Não abra a porta pra ninguém hoje.<div class="assinatura">— Léo</div>', 37.2, 43, 'bilhete');
flash(tl, 37, '#ffffff', 0.35);
escuro(tl, 43, 0, 0.2);

// ---- 43–48 s · A letra era dele ----
corte(43, { x: X.apto + 0.4, y: 1.9, z: -2.4 }, { x: X.apto, y: 1.6, z: 0.6 });
tl.to(camera.position, { z: -1.5, duration: 5, ease: 'power1.in' }, 43);
tl.to(apto.leo.rotation, { z: 0.04, duration: 0.05, yoyo: true, repeat: 99, ease: 'none' }, 43);
tl.set(apto.leo.rotation, { z: 0 }, 48);
tl.to(apto.abajur, { intensity: 2, duration: 5 }, 43);
const t9 = titulo(tl, 43.1, 'A letra', 'era dele', 'vermelho');
esconder(tl, t9, 48);

// ---- 48–53.5 s · Toc. Toc. Toc. ----
corte(48, { x: X.apto + 1.7, y: 2.3, z: 3.0 }, { x: X.apto, y: 1.3, z: -3 });
tl.to(camera.position, { z: 1.8, duration: 5.5, ease: 'none' }, 48);
const t10 = titulo(tl, 48.1, 'Alguém', 'bateu na porta', 'vermelho');
for (const t of [49.2, 49.8, 50.4]) {
  tl.to(apto.porta.position, { z: '-=0.04', duration: 0.05, yoyo: true, repeat: 1 }, t);
  tremer(tl, camera, t, 0.2, 0.12, aleatorio(Math.round(t * 10)));
  flash(tl, t, '#5a0000', 0.25);
}
esconder(tl, t10, 53.5);

// ---- 53.5–59 s · Olho mágico: ninguém ----
corte(53.5, { x: X.corredor + 1.75, y: 1.7, z: -6 }, { x: X.corredor - 0.6, y: 1.5, z: -12 }, 100);
tl.to(alvo, { z: -9, duration: 5.5, ease: 'sine.inOut' }, 53.5);
tl.set(corredor.lampada, { intensity: 14 }, 53.5);
const olho = document.createElement('div');
olho.className = 'tela-cheia olho';
document.getElementById('camada').prepend(olho);
tl.set(olho, { autoAlpha: 0 }, 0);
tl.set(olho, { autoAlpha: 1 }, 53.5);
tl.set(olho, { autoAlpha: 0 }, 59);
piscar(tl, corredor.lampada, 55, 58.8, aleatorio(11), 14);
const t11 = titulo(tl, 53.6, 'No olho mágico', 'ninguém', 'vermelho');
esconder(tl, t11, 59);

// ---- 59–65 s · A mensagem do próprio número ----
escuro(tl, 59, 0.9, 0.2);
const cel = painel(tl, '<div class="hora">03:34</div><div class="msg"><div class="de">MEU NÚMERO • agora</div>Não abre.<br>Eu já estou aí dentro.</div>', 59.4, 65, 'celular');
tl.to(cel, { x: '+=14', duration: 0.03, yoyo: true, repeat: 15, ease: 'none' }, 60.2);
escuro(tl, 65, 0, 0.2);

// ---- 65–70 s · Ele se vira… ----
corte(65, { x: X.apto - 1.8, y: 1.7, z: -0.4 }, { x: X.apto + 1.5, y: 1.3, z: 5.6 });
tl.to(apto.leo.rotation, { y: 0, duration: 2, ease: 'power1.inOut' }, 65.3);
tl.to(camera.position, { x: X.apto - 1.2, z: 1.4, duration: 4.4, ease: 'power1.in' }, 65);
tl.to(apto.sombra.userData.olhos, { opacity: 1, duration: 0.15 }, 67.6);
tl.to(apto.abajur, { intensity: 0.8, duration: 0.2 }, 67.4);
const t13 = titulo(tl, 65.1, 'Eu já estou', 'aí dentro', 'vermelho');
flash(tl, 68.8, '#ffffff', 0.6);
tremer(tl, camera, 68.8, 0.5, 0.25, aleatorio(99));
esconder(tl, t13, 69.6);
escuro(tl, 69.4, 1, 0.15);

// ---- 70–79 s · Escolha dos seguidores ----
escuro(tl, 70, 0.92, 0.01);
painel(tl, `
  <div class="pergunta">O que o Léo faz?</div>
  <div class="opcao a"><div class="letra">A</div>Abre a porta</div>
  <div class="opcao b"><div class="letra">B</div>Procura quem está lá dentro</div>
  <div class="rodape">Comenta A ou B<br>a mais votada vira a parte 2</div>`, 70.3, null, 'escolha');

legendas(tl, [
  { t: 0.3, fim: 4.3, texto: 'Léo achou um bilhete escrito com a própria letra' },
  { t: 4.8, fim: 9.3, texto: 'Ele tinha acabado de se mudar para um prédio antigo' },
  { t: 9.8, fim: 14.3, texto: 'No elevador, os botões pulavam do doze direto pro quatorze' },
  { t: 14.8, fim: 19.3, texto: 'Mas a porta do apartamento dele dizia mil trezentos e um' },
  { t: 19.8, fim: 24.8, texto: 'E toda noite, às três e trinta e três, o elevador parava no andar dele' },
  { t: 25.3, fim: 30.8, texto: 'As portas se abriam… e ninguém saía' },
  { t: 31.3, fim: 36.8, texto: 'Até que naquela noite, um papel deslizou por baixo da porta' },
  { t: 43.3, fim: 47.8, texto: 'A letra era dele. Mas ele nunca tinha escrito aquilo' },
  { t: 48.2, fim: 49.1, texto: 'Então alguém bateu' },
  { t: 50.7, fim: 53.2, texto: 'Três vezes' },
  { t: 53.8, fim: 58.8, texto: 'Ele olhou pelo olho mágico. O corredor estava vazio' },
  { t: 65.3, fim: 68.6, texto: 'Ele se virou devagar…' },
]);

publicar({ tl, desenhar, duracao: 79 });
