// Cenários da saga "O Andar 13". Reaproveitados em todas as partes.
// Cada cenário fica numa posição X diferente do mundo; a câmera "corta" entre eles.
import { THREE, boneco, aleatorio, texturaTexto } from 'motor';

export const X = { predio: 0, elevador: 40, corredor: 80, apto: 120 };

const lambert = (cor, extra = {}) => new THREE.MeshLambertMaterial({ color: cor, flatShading: true, ...extra });
function malha(geo, mat, x, y, z) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function texturaCanvas(w, h, desenhar) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  desenhar(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function leo() {
  return boneco('#d9a21b', { cabeloCor: '#3a2416' });
}

export function sombraComOlhos() {
  const s = boneco('#050505', { pele: '#050505', cabeloCor: '#050505' });
  const brilho = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 });
  for (const x of [-0.14, 0.14]) {
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), brilho);
    olho.position.set(x, 1.88, 0.41);
    s.add(olho);
  }
  s.userData.olhos = brilho;
  return s;
}

// ---------- Prédio visto de fora, à noite ----------
export function montarPredio(cena) {
  const g = new THREE.Group();
  g.position.x = X.predio;
  const rnd = aleatorio(13);
  g.add(malha(new THREE.PlaneGeometry(120, 120).rotateX(-Math.PI / 2), lambert('#141722'), 0, 0, 0));
  const andares = 14, alturaAndar = 1.4;
  g.add(malha(new THREE.BoxGeometry(8, andares * alturaAndar + 0.6, 6), lambert('#343a52'), 0, (andares * alturaAndar + 0.6) / 2, 0));
  let janela13 = null;
  for (let a = 0; a < andares; a++) {
    for (let c = 0; c < 4; c++) {
      const especial = a === 12 && c === 2;
      const acesa = especial || rnd() < 0.3;
      const mat = new THREE.MeshBasicMaterial({ color: acesa ? '#ffcf73' : '#151a2b' });
      const j = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.8), mat);
      j.position.set(-2.7 + c * 1.8, 0.9 + a * alturaAndar, 3.01);
      g.add(j);
      if (especial) janela13 = mat;
    }
  }
  const lua = new THREE.Mesh(new THREE.SphereGeometry(2.2, 24, 16), new THREE.MeshBasicMaterial({ color: '#f3efd9' }));
  lua.position.set(-14, 30, -40);
  g.add(lua);
  cena.add(g);
  return { grupo: g, janela13 };
}

// ---------- Painel do elevador sem o botão 13 ----------
export function montarElevador(cena) {
  const g = new THREE.Group();
  g.position.x = X.elevador;
  const caixa = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 3), lambert('#5d6270', { side: THREE.BackSide }));
  caixa.position.y = 2; caixa.receiveShadow = true;
  g.add(caixa);
  const tex = texturaCanvas(512, 1024, (x, w, h) => {
    x.fillStyle = '#9aa0ab'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#80868f'; for (let i = 0; i < h; i += 6) x.fillRect(0, i, w, 2);
    const linhas = [['', '14'], ['11', '12'], ['9', '10'], ['7', '8'], ['5', '6'], ['3', '4'], ['1', '2']];
    linhas.forEach((par, l) => par.forEach((n, c) => {
      const cx = 150 + c * 212, cy = 120 + l * 130;
      if (!n) { // o lugar do 13: riscado
        x.strokeStyle = '#3b3b3b'; x.lineWidth = 6;
        for (let k = -3; k <= 3; k++) { x.beginPath(); x.moveTo(cx - 45 + k * 4, cy - 40); x.lineTo(cx + 45 + k * 6, cy + 42 - k * 3); x.stroke(); }
        return;
      }
      x.fillStyle = '#2b2e35'; x.beginPath(); x.arc(cx, cy, 52, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#e9e9e9'; x.font = '900 52px Montserrat'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(n, cx, cy + 3);
    }));
  });
  const painel = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.4), new THREE.MeshLambertMaterial({ map: tex }));
  painel.position.set(0, 1.6, -1.48);
  g.add(painel);
  const luz = new THREE.PointLight('#e6f0ff', 6, 8);
  luz.position.set(0, 3.6, 0.5);
  g.add(luz);
  cena.add(g);
  return { grupo: g, luz };
}

// ---------- Corredor do 13º andar ----------
export function montarCorredor(cena) {
  const g = new THREE.Group();
  g.position.x = X.corredor;
  g.add(malha(new THREE.BoxGeometry(4, 0.1, 26), lambert('#4a161d'), 0, -0.05, -6));      // carpete
  g.add(malha(new THREE.BoxGeometry(4, 0.1, 26), lambert('#2a2a26'), 0, 3.2, -6));        // teto
  g.add(malha(new THREE.BoxGeometry(0.1, 3.2, 26), lambert('#57533f'), -2, 1.6, -6));     // paredes
  g.add(malha(new THREE.BoxGeometry(0.1, 3.2, 26), lambert('#57533f'), 2, 1.6, -6));
  g.add(malha(new THREE.BoxGeometry(4, 3.2, 0.1), lambert('#3b3a33'), 0, 1.6, -15.5));    // fundo
  // porta 1301 na parede direita
  g.add(malha(new THREE.BoxGeometry(0.12, 2.3, 1.1), lambert('#5b3a22'), 1.93, 1.15, -6));
  const plaquinha = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.2),
    new THREE.MeshBasicMaterial({ map: texturaTexto('1301', { fundo: '#c9a24a', cor: '#1a1a1a', w: 256, h: 112, fonte: '900 80px Montserrat' }) }));
  plaquinha.rotation.y = -Math.PI / 2;
  plaquinha.position.set(1.86, 1.95, -6);
  g.add(plaquinha);
  // elevador no fim do corredor
  const interior = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.4), new THREE.MeshBasicMaterial({ color: '#fff6dd' }));
  interior.position.set(0, 1.2, -15.42);
  g.add(interior);
  const portaE = malha(new THREE.BoxGeometry(0.82, 2.4, 0.08), lambert('#9da3ad'), -0.41, 1.2, -15.36);
  const portaD = malha(new THREE.BoxGeometry(0.82, 2.4, 0.08), lambert('#9da3ad'), 0.41, 1.2, -15.36);
  g.add(portaE, portaD);
  const luzElevador = new THREE.PointLight('#fff1cc', 0, 9);
  luzElevador.position.set(0, 1.4, -14.6);
  g.add(luzElevador);
  const lampada = new THREE.PointLight('#ffe2a8', 5, 12);
  lampada.position.set(0, 3, -5);
  g.add(lampada);
  cena.add(g);
  return { grupo: g, portaE, portaD, luzElevador, lampada };
}

// ---------- Apartamento 1301 por dentro ----------
export function montarApto(cena) {
  const g = new THREE.Group();
  g.position.x = X.apto;
  g.add(malha(new THREE.BoxGeometry(10, 0.1, 12), lambert('#3e2c20'), 0, -0.05, 0));       // chão de madeira
  g.add(malha(new THREE.BoxGeometry(10, 3.4, 0.1), lambert('#4b4f5c'), 0, 1.7, -3.2));      // parede da porta
  g.add(malha(new THREE.BoxGeometry(10, 3.4, 0.1), lambert('#4b4f5c'), 0, 1.7, 6));         // parede de trás
  g.add(malha(new THREE.BoxGeometry(0.1, 3.4, 12), lambert('#444855'), -4, 1.7, 0));
  g.add(malha(new THREE.BoxGeometry(0.1, 3.4, 12), lambert('#444855'), 4, 1.7, 0));
  const porta = malha(new THREE.BoxGeometry(1.1, 2.3, 0.12), lambert('#5b3a22'), 0, 1.15, -3.1);
  const olhoMagico = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), lambert('#c9a24a'));
  olhoMagico.position.set(0, 0.45, 0.07);
  porta.add(olhoMagico);
  g.add(porta);
  // vão escuro do quarto (parede de trás) onde algo pode aparecer
  const vao = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.4), new THREE.MeshBasicMaterial({ color: '#020203' }));
  vao.position.set(1.5, 1.2, 5.94);
  vao.rotation.y = Math.PI;
  g.add(vao);
  const sombra = sombraComOlhos();
  sombra.position.set(1.5, 0, 5.6);
  sombra.rotation.y = Math.PI;
  g.add(sombra);
  // bilhete no chão
  const textoBilhete = texturaCanvas(256, 192, (x, w, h) => {
    x.fillStyle = '#f3ead2'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#222'; x.font = '900 26px Montserrat'; x.textAlign = 'center';
    ['NÃO DEIXE', 'NINGUÉM', 'ENTRAR HOJE'].forEach((l, i) => x.fillText(l, w / 2, 50 + i * 36));
    x.fillStyle = '#a11'; x.fillText('— LÉO', w / 2 + 50, 170);
  });
  const bilhete = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.375), new THREE.MeshLambertMaterial({ map: textoBilhete }));
  bilhete.rotation.x = -Math.PI / 2;
  bilhete.position.set(0.1, 0.02, -2.3);
  g.add(bilhete);
  const personagem = leo();
  personagem.position.set(0, 0, 0.6);
  personagem.rotation.y = Math.PI; // olhando para a porta
  g.add(personagem);
  const luzPorta = new THREE.PointLight('#8fa4ff', 2.5, 7);
  luzPorta.position.set(0.5, 2.2, -2.2);
  g.add(luzPorta);
  const abajur = new THREE.PointLight('#ffb866', 4, 10);
  abajur.position.set(-2.5, 2.2, 1.5);
  g.add(abajur);
  cena.add(g);
  return { grupo: g, porta, bilhete, leo: personagem, sombra, abajur };
}
