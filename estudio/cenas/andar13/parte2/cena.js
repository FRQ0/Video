// O ANDAR 13 — Parte 2: "A porta" (escolha da Parte 1: A, abrir a porta)
// Tempos "originais" do roteiro.json; m() converte para os tempos finais (tempos.json, gerado pelo narrar.py).
import { THREE, criarMundo, titulo, esconder, legendas, publicar, aleatorio, painel, flash, escuro, tremer, piscar } from 'motor';
import { X, montarPredio, montarElevador, montarCorredor, montarApto, montarCozinha, dobradica, faca, calendarioNoElevador, leo } from '../cenario.js';
import tempos from './tempos.json' with { type: 'json' };

const { cena, camera, alvo, tl, desenhar } = criarMundo({ fundo: '#090b14', noite: true });
montarPredio(cena);
montarElevador(cena);
const corredor = montarCorredor(cena);
const apto = montarApto(cena);
const cozinha = montarCozinha(apto);
calendarioNoElevador(corredor);

const { secoes, fim, novas } = tempos;
function m(t) {
  for (let i = 0; i < secoes.length; i++) {
    const ini = secoes[i], fimS = i + 1 < secoes.length ? secoes[i + 1] : fim;
    if (t < fimS || i === secoes.length - 1) return novas[i] + (t - ini) * ((novas[i + 1] - novas[i]) / (fimS - ini));
  }
}
const D = (ini, dur) => m(ini + dur) - m(ini);

const selo = document.createElement('div');
selo.className = 'selo';
selo.textContent = 'O ANDAR 13 • PARTE 2/5';
document.getElementById('camada').appendChild(selo);

function corte(t, pos, olhar, fov = 38) {
  tl.set(camera.position, pos, m(t));
  tl.set(alvo, olhar, m(t));
  tl.set(camera, { fov }, m(t));
}
const T = (l1, l2, cor, ini, fimT) => esconder(tl, titulo(tl, m(ini), l1, l2, cor), m(fimT));

// Portas com dobradiça
const portaApto = dobradica(apto.porta, new THREE.Vector3(-0.55, 0, 0));
const porta1301 = dobradica(corredor.porta, new THREE.Vector3(0, 0, 0.55));

// Faca na mão do Léo (aparece quando ele pega a da cozinha)
const facaNaMao = faca();
facaNaMao.position.set(-0.5, 0.95, 0.2);
facaNaMao.rotation.x = 1.25;
apto.leo.add(facaNaMao);
tl.set(facaNaMao, { visible: false }, 0);

// Léo no corredor (mesmo personagem, outro cenário)
const leoCorredor = leo();
const facaCorredor = faca();
facaCorredor.position.set(-0.5, 0.95, 0.2);
facaCorredor.rotation.x = 1.25;
leoCorredor.add(facaCorredor);
leoCorredor.position.set(X.corredor, 0, -8);
leoCorredor.rotation.y = Math.PI;
cena.add(leoCorredor);
tl.set(leoCorredor, { visible: false }, 0);
tl.set(leoCorredor, { visible: true }, m(32));

// Luz vermelha vazando por baixo da porta 1301
const fresta = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1.0), new THREE.MeshBasicMaterial({ color: '#ff1a1a', transparent: true, opacity: 0 }));
fresta.rotation.x = -Math.PI / 2;
fresta.position.set(X.corredor + 1.75, 0.02, -6);
cena.add(fresta);
const brilhoFresta = new THREE.PointLight('#ff2020', 0, 4);
brilhoFresta.position.set(X.corredor + 1.6, 0.2, -6);
cena.add(brilhoFresta);

// ---- Recapitulação: a mensagem e os olhos no escuro ----
corte(0, { x: X.apto - 1.2, y: 1.6, z: 1.4 }, { x: X.apto + 1.5, y: 1.4, z: 5.6 });
tl.set(apto.leo.rotation, { y: 0 }, 0);
tl.set(apto.sombra.userData.olhos, { opacity: 1 }, 0);
tl.set(apto.abajur, { intensity: 0.8 }, 0);
escuro(tl, 0, 0.55, 0.01);
const cel = painel(tl, '<div class="hora">03:34</div><div class="msg"><div class="de">MEU NÚMERO • agora</div>Não abre.<br>Eu já estou aí dentro.</div>', m(0.3), m(6), 'celular');
tl.to(cel, { x: '+=14', duration: 0.03, yoyo: true, repeat: 15, ease: 'none' }, m(0.6));
T('Parte 2', 'A porta', 'vermelho', 0.1, 6);
escuro(tl, m(6), 0, 0.2);

// ---- Vocês escolheram ----
escuro(tl, m(6), 0.9, 0.01);
painel(tl, `<div class="pergunta">Vocês escolheram</div>
  <div class="opcao a vencedora"><div class="letra">A</div>Abrir a porta</div>`, m(6.3), m(10), 'escolha');
escuro(tl, m(10), 0, 0.2);
tl.set(apto.sombra, { visible: false }, m(6)); // quando ele olha de novo… não tem ninguém
tl.set(apto.abajur, { intensity: 3 }, m(10));

// ---- A faca da cozinha ----
corte(10, { x: X.apto + 0.9, y: 2.6, z: -2.7 }, { x: X.apto - 2.4, y: 1.2, z: 0.2 });
tl.to(apto.leo.position, { x: -2.2, z: 0.5, duration: D(10.5, 1.6), ease: 'power1.inOut' }, m(10.5));
tl.to(apto.leo.rotation, { y: -Math.PI / 2, duration: D(10.5, 1.0) }, m(10.5));
tl.to(cozinha.faca.position, { y: 1.35, x: -2.7, z: 0.2, duration: 0.5, ease: 'power2.out' }, m(13));
tl.set(cozinha.faca, { visible: false }, m(13.5));
tl.set(facaNaMao, { visible: true }, m(13.5));
flash(tl, m(13.4), '#dfe9ff', 0.3);
tl.to(camera.position, { x: X.apto + 0.3, y: 2.3, z: -2.5, duration: D(10, 6), ease: 'power1.inOut' }, m(10));
T('Mas antes…', 'a faca', 'vermelho', 10.1, 16);

// ---- Ele abre a porta ----
corte(16, { x: X.apto + 1.8, y: 2.5, z: 3.0 }, { x: X.apto - 0.2, y: 1.3, z: -3.2 });
tl.set(apto.leo.position, { x: 0.5, z: -1.7 }, m(16));
tl.set(apto.leo.rotation, { y: Math.PI }, m(16));
tl.to(portaApto.rotation, { y: -1.35, duration: D(17.2, 2.6), ease: 'power1.inOut' }, m(17.2));
tl.to(camera.position, { x: X.apto + 1.4, y: 2.3, z: 2.0, duration: D(16, 5), ease: 'power1.in' }, m(16));
T('Ele abriu', 'a porta', 'vermelho', 16.1, 21);

// ---- O corredor vazio ----
corte(21, { x: X.corredor + 1.6, y: 1.65, z: -6 }, { x: X.corredor - 0.4, y: 1.4, z: -12 }, 62);
tl.set(porta1301.rotation, { y: -1.3 }, m(21)); // a porta 1301 está aberta
tl.to(alvo, { z: -10, duration: D(21, 6), ease: 'sine.inOut' }, m(21));
tl.set(corredor.lampada, { intensity: 9 }, m(21));
piscar(tl, corredor.lampada, m(22.5), m(26.8), aleatorio(21), 9);
T('O corredor', 'estava vazio', 'amarelo', 21.1, 27);

// ---- 03:33 de novo ----
escuro(tl, m(27), 1, 0.15);
const relogio = painel(tl, '03:33', m(27.2), m(32), 'relogio');
for (let t = 28; t < 31.8; t += 1) { tl.set(relogio, { opacity: 0.25 }, m(t)); tl.set(relogio, { opacity: 1 }, m(t + 0.5)); }
T('O elevador', 'apitou', 'vermelho', 27.1, 32);
escuro(tl, m(32), 0, 0.3);

// ---- As portas do elevador abrem: tinha algo lá dentro ----
corte(32, { x: X.corredor + 0.7, y: 2.0, z: -4.2 }, { x: X.corredor, y: 1.4, z: -15 });
for (const [porta, aberta] of [[corredor.portaE, -1.22], [corredor.portaD, 1.22]]) {
  tl.to(porta.position, { x: aberta, duration: 1.4, ease: 'power2.inOut' }, m(33));
}
tl.to(corredor.luzElevador, { intensity: 9, duration: 0.6 }, m(33));
tl.to(camera.position, { x: X.corredor + 0.2, y: 1.6, z: -11.5, duration: D(32, 6), ease: 'power1.in' }, m(32));
tl.to(alvo, { y: 1.45, duration: D(32, 6) }, m(32));
T('Tinha algo', 'lá dentro', 'vermelho', 32.1, 38);

// ---- O calendário ----
escuro(tl, m(38), 0.85, 0.2);
const dias = Array.from({ length: 30 }, (_, i) => i + 1)
  .map((d) => (d === 17 ? `<div class="dia hoje">17<div class="circulo"></div><div class="anotacao">DE NOVO</div></div>` : `<div class="dia">${d}</div>`)).join('');
const cal = painel(tl, `<div class="topo">TODOS OS DIAS</div><div class="grade">${dias}</div>`, m(38.2), m(46), 'calendario');
const circulo = cal.querySelector('.circulo');
const anotacao = cal.querySelector('.anotacao');
tl.set([circulo, anotacao], { autoAlpha: 0 }, 0);
tl.fromTo(circulo, { autoAlpha: 0, scale: 1.8 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, m(42.4));
tl.to(anotacao, { autoAlpha: 1, duration: 0.3 }, m(43.6));
escuro(tl, m(46), 0, 0.15);

// ---- A porta bate sozinha atrás dele ----
corte(46, { x: X.corredor - 0.9, y: 1.8, z: -10.5 }, { x: X.corredor + 1.6, y: 1.2, z: -6 });
tl.to(porta1301.rotation, { y: 0, duration: 0.18, ease: 'power3.in' }, m(46.3));
tremer(tl, camera, m(46.45), 0.4, 0.22, aleatorio(46));
flash(tl, m(46.45), '#ffffff', 0.4);
tl.to(leoCorredor.rotation, { y: 0.75, duration: 0.35, ease: 'power2.out' }, m(46.6));
tl.to(leoCorredor.position, { y: 0.25, duration: 0.12, yoyo: true, repeat: 1 }, m(46.5));
T('A porta', 'bateu sozinha', 'vermelho', 46.1, 51);

// ---- A voz lá de dentro ----
corte(51, { x: X.corredor + 0.2, y: 1.5, z: -4.6 }, { x: X.corredor + 1.86, y: 1.0, z: -6 });
tl.to(camera.position, { x: X.corredor + 0.9, y: 1.2, z: -5.3, duration: D(51, 7), ease: 'power1.in' }, m(51));
tl.to(fresta.material, { opacity: 0.9, duration: 1.2 }, m(52));
tl.to(brilhoFresta, { intensity: 4, duration: 1.2 }, m(52));
tl.set(corredor.lampada, { intensity: 12 }, m(51));
piscar(tl, corredor.lampada, m(53.5), m(57.4), aleatorio(52), 12);
T('A voz', 'era dele', 'vermelho', 51.1, 54.6);
painel(tl, 'Eu avisei<br>pra não abrir.', m(54.8), m(57.6), 'sussurro');
flash(tl, m(54.6), '#5a0000', 0.5);
tremer(tl, camera, m(54.6), 0.5, 0.15, aleatorio(54));
escuro(tl, m(57.4), 1, 0.15);

// ---- Escolha da Parte 3 ----
escuro(tl, m(58), 0.92, 0.01);
painel(tl, `
  <div class="pergunta">O que o Léo faz?</div>
  <div class="opcao a"><div class="letra">A</div>Entra no elevador</div>
  <div class="opcao b"><div class="letra">B</div>Volta e bate na própria porta</div>
  <div class="rodape">Comenta A ou B<br>a mais votada vira a parte 3</div>`, m(58.3), null, 'escolha');

legendas(tl, tempos.falas);
publicar({ tl, desenhar, duracao: tempos.duracao });
