// O ANDAR 13 — Parte 1: "O bilhete"
// Os tempos abaixo são os "originais" (roteiro.json). A função m() converte para os tempos
// finais calculados pelo ferramentas/narrar.py (tempos.json), que estica as cenas para caber a voz.
import { criarMundo, titulo, esconder, legendas, publicar, aleatorio, painel, flash, escuro, tremer, piscar } from 'motor';
import { X, montarPredio, montarElevador, montarCorredor, montarApto } from '../cenario.js';
import tempos from './tempos.json' with { type: 'json' };

const { cena, camera, alvo, tl, desenhar } = criarMundo({ fundo: '#090b14', noite: true });
const rnd = aleatorio(1301);
const predio = montarPredio(cena);
const elevador = montarElevador(cena);
const corredor = montarCorredor(cena);
const apto = montarApto(cena);

const { secoes, fim, novas } = tempos;
function m(t) {
  for (let i = 0; i < secoes.length; i++) {
    const ini = secoes[i], fimS = i + 1 < secoes.length ? secoes[i + 1] : fim;
    if (t < fimS || i === secoes.length - 1) return novas[i] + (t - ini) * ((novas[i + 1] - novas[i]) / (fimS - ini));
  }
}
const D = (ini, dur) => m(ini + dur) - m(ini); // duração convertida

const selo = document.createElement('div');
selo.className = 'selo';
selo.textContent = 'O ANDAR 13 • PARTE 1/5';
document.getElementById('camada').appendChild(selo);

function corte(t, pos, olhar, fov = 38) {
  tl.set(camera.position, pos, m(t));
  tl.set(alvo, olhar, m(t));
  tl.set(camera, { fov }, m(t));
}
const T = (l1, l2, cor, ini, fimT) => esconder(tl, titulo(tl, m(ini), l1, l2, cor), m(fimT));

// ---- Gancho: o bilhete no chão ----
corte(0, { x: X.apto + 0.3, y: 1.6, z: -0.3 }, { x: X.apto + 0.1, y: 0, z: -2.3 });
tl.to(camera.position, { y: 1.1, z: -1.2, duration: D(0, 4.5), ease: 'power1.in' }, m(0));
T('Um bilhete', 'com a letra dele', 'vermelho', 0.15, 4.5);

// ---- O prédio antigo ----
corte(4.5, { x: X.predio, y: 3, z: 30 }, { x: X.predio, y: 12, z: 0 });
tl.to(camera.position, { y: 9, z: 21, duration: D(4.5, 5), ease: 'sine.inOut' }, m(4.5));
const vermelho = { r: 0.9, g: 0.08, b: 0.06 }, apagada = { r: 0.05, g: 0.06, b: 0.1 };
for (let t = 4.5; t < 9.5; t += 0.08 + rnd() * 0.35) tl.set(predio.janela13.color, rnd() < 0.6 ? vermelho : apagada, m(t));
T('Parte 1', 'O andar 13', 'vermelho', 4.6, 9.5);

// ---- O elevador sem o 13 ----
corte(9.5, { x: X.elevador + 0.3, y: 1.7, z: 0.9 }, { x: X.elevador, y: 1.7, z: -1.48 });
tl.to(camera.position, { x: X.elevador - 0.1, y: 2.45, z: -0.55, duration: D(9.5, 5), ease: 'power2.inOut' }, m(9.5));
tl.to(alvo, { x: X.elevador - 0.25, y: 2.52, duration: D(9.5, 5), ease: 'power2.inOut' }, m(9.5));
piscar(tl, elevador.luz, m(12.5), m(14.4), aleatorio(5));
T('O prédio não tem', '13º andar', 'amarelo', 9.6, 14.5);

// ---- Mas a porta diz 1301 ----
corte(14.5, { x: X.corredor + 0.3, y: 1.8, z: -4.4 }, { x: X.corredor + 1.86, y: 1.9, z: -6 });
tl.to(camera.position, { x: X.corredor + 1.0, y: 1.9, z: -5.3, duration: D(14.5, 5), ease: 'power1.inOut' }, m(14.5));
piscar(tl, corredor.lampada, m(17), m(19.4), aleatorio(8));
T('Mas a porta dele', 'dizia 1301', 'vermelho', 14.6, 19.5);

// ---- 03:33 ----
escuro(tl, m(19.5), 1, 0.15);
const relogio = painel(tl, '03:33', m(19.7), m(25), 'relogio');
for (let t = 20.5; t < 24.8; t += 1) { tl.set(relogio, { opacity: 0.25 }, m(t)); tl.set(relogio, { opacity: 1 }, m(t + 0.5)); }
T('Toda noite', 'na mesma hora', 'amarelo', 19.6, 25);
escuro(tl, m(25), 0, 0.3);

// ---- O elevador abre e ninguém sai ----
corte(25, { x: X.corredor, y: 1.6, z: 2 }, { x: X.corredor, y: 1.3, z: -15 });
tl.to(camera.position, { z: -3, duration: D(25, 6), ease: 'none' }, m(25));
for (const [porta, aberta] of [[corredor.portaE, -1.22], [corredor.portaD, 1.22]]) {
  tl.to(porta.position, { x: aberta, duration: 1.2, ease: 'power2.inOut' }, m(26.4));
  tl.to(porta.position, { x: aberta > 0 ? 0.41 : -0.41, duration: 1.2, ease: 'power2.inOut' }, m(29.6));
}
tl.to(corredor.luzElevador, { intensity: 9, duration: 0.6 }, m(26.4));
tl.to(corredor.luzElevador, { intensity: 0, duration: 0.8 }, m(30));
piscar(tl, corredor.lampada, m(27), m(29.5), aleatorio(9));
T('As portas abriam', 'e ninguém saía', 'vermelho', 25.1, 31);

// ---- O papel desliza por baixo da porta ----
corte(31, { x: X.apto + 2.4, y: 2.3, z: 3.2 }, { x: X.apto, y: 1.0, z: -2 });
tl.set(apto.bilhete.position, { z: -3.25 }, m(31));
tl.to(apto.bilhete.position, { z: -2.3, duration: 1.4, ease: 'power2.out' }, m(33.2));
tl.to(camera.position, { x: X.apto + 1.2, y: 1.6, z: 0.4, duration: D(31, 6), ease: 'power1.inOut' }, m(31));
tl.to(alvo, { y: 0.3, z: -2.3, duration: D(34, 3), ease: 'power1.inOut' }, m(34));
T('Até que', 'naquela noite…', 'amarelo', 31.1, 37);

// ---- O que estava escrito ----
escuro(tl, m(37), 0.8, 0.2);
painel(tl, 'Não deixe ninguém entrar hoje.<div class="assinatura">— Léo</div>', m(37.2), m(43), 'bilhete');
flash(tl, m(37), '#ffffff', 0.35);
escuro(tl, m(43), 0, 0.2);

// ---- A letra era dele ----
corte(43, { x: X.apto + 0.4, y: 1.9, z: -2.4 }, { x: X.apto, y: 1.6, z: 0.6 });
tl.to(camera.position, { z: -1.5, duration: D(43, 5), ease: 'power1.in' }, m(43));
tl.to(apto.leo.rotation, { z: 0.04, duration: 0.05, yoyo: true, repeat: Math.round(D(43, 5) / 0.05) - 1, ease: 'none' }, m(43));
tl.set(apto.leo.rotation, { z: 0 }, m(48));
tl.to(apto.abajur, { intensity: 2, duration: D(43, 5) }, m(43));
T('A letra', 'era dele', 'vermelho', 43.1, 48);

// ---- Toc. Toc. Toc. ----
corte(48, { x: X.apto + 1.7, y: 2.3, z: 3.0 }, { x: X.apto, y: 1.3, z: -3 });
tl.to(camera.position, { z: 1.8, duration: D(48, 5.5), ease: 'none' }, m(48));
for (const t of [50.0, 50.6, 51.2]) {
  tl.to(apto.porta.position, { z: '-=0.04', duration: 0.05, yoyo: true, repeat: 1 }, m(t));
  tremer(tl, camera, m(t), 0.2, 0.12, aleatorio(Math.round(t * 10)));
  flash(tl, m(t), '#5a0000', 0.25);
}
T('Alguém', 'bateu na porta', 'vermelho', 48.1, 53.5);

// ---- Olho mágico: ninguém ----
corte(53.5, { x: X.corredor + 1.75, y: 1.7, z: -6 }, { x: X.corredor - 0.6, y: 1.5, z: -12 }, 100);
tl.to(alvo, { z: -9, duration: D(53.5, 5.5), ease: 'sine.inOut' }, m(53.5));
tl.set(corredor.lampada, { intensity: 14 }, m(53.5));
const olho = document.createElement('div');
olho.className = 'tela-cheia olho';
document.getElementById('camada').prepend(olho);
tl.set(olho, { autoAlpha: 0 }, 0);
tl.set(olho, { autoAlpha: 1 }, m(53.5));
tl.set(olho, { autoAlpha: 0 }, m(59));
piscar(tl, corredor.lampada, m(55), m(58.8), aleatorio(11), 14);
T('No olho mágico', 'ninguém', 'vermelho', 53.6, 59);

// ---- A mensagem do próprio número ----
escuro(tl, m(59), 0.9, 0.2);
const cel = painel(tl, '<div class="hora">03:34</div><div class="msg"><div class="de">MEU NÚMERO • agora</div>Fica calmo.<br>Eu já estou aí dentro.</div>', m(59.4), m(65), 'celular');
tl.to(cel, { x: '+=14', duration: 0.03, yoyo: true, repeat: 15, ease: 'none' }, m(60.2));
escuro(tl, m(65), 0, 0.2);

// ---- Ele olha para trás… ----
corte(65, { x: X.apto - 1.8, y: 1.7, z: -0.4 }, { x: X.apto + 1.5, y: 1.3, z: 5.6 });
tl.to(apto.leo.rotation, { y: 0, duration: D(65.3, 2), ease: 'power1.inOut' }, m(65.3));
tl.to(camera.position, { x: X.apto - 1.2, z: 1.4, duration: D(65, 4.4), ease: 'power1.in' }, m(65));
tl.to(apto.sombra.userData.olhos, { opacity: 1, duration: 0.15 }, m(67.6));
tl.to(apto.abajur, { intensity: 0.8, duration: 0.2 }, m(67.4));
T('Eu já estou', 'aí dentro', 'vermelho', 65.1, 69.6);
flash(tl, m(68.8), '#ffffff', 0.6);
tremer(tl, camera, m(68.8), 0.5, 0.25, aleatorio(99));
escuro(tl, m(69.4), 1, 0.15);

// ---- Escolha dos seguidores ----
escuro(tl, m(70), 0.92, 0.01);
painel(tl, `
  <div class="pergunta">O que o Léo faz?</div>
  <div class="opcao a"><div class="letra">A</div>Abre a porta</div>
  <div class="opcao b"><div class="letra">B</div>Procura quem está lá dentro</div>
  <div class="rodape">Comenta A ou B<br>a mais votada vira a parte 2</div>`, m(70.3), null, 'escolha');

legendas(tl, tempos.falas);
publicar({ tl, desenhar, duracao: tempos.duracao });
