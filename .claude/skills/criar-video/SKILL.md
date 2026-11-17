---
name: criar-video
description: Cria um vídeo vertical animado (estilo explicativo com bonecos 3D, títulos grandes e legenda palavra por palavra) a partir de um assunto ou roteiro, usando o estúdio em estudio/. Use quando pedirem para fazer, roteirizar ou animar um vídeo curto.
---

# Criar vídeo animado

## 1. Roteiro (antes de qualquer código)
- Pergunte o assunto e o público se não estiverem claros.
- Gancho antes do 3º segundo: a primeira frase já diz do que o vídeo trata.
- Frases curtas, escritas para serem faladas. Nada de "não é só X, é Y".
- Uma mudança visual a cada 3–5 segundos.
- Todo fato precisa de fonte. Se não tiver fonte, corte o fato. Nunca invente números, notícias ou links.
- Entregue o roteiro como tabela: tempo | fala | título na tela | o que aparece | motivo do corte. Espere aprovação.

## 2. Cena
- Copie `estudio/cenas/exemplo/` para `estudio/cenas/<nome-do-video>/` e edite só o `cena.js` novo.
- Use as peças de `estudio/motor/motor.js`: `boneco`, `moeda`, `chip`, `predio`, `placa`, `barra`, `chao`, `titulo`, `esconder`, `legendas`.
- Cada cena do roteiro é um trecho da linha do tempo `tl` (GSAP). Para cortar de cenário, use `tl.set(camera.position, …)` e `tl.set(alvo, …)`.
- Aleatoriedade só com `aleatorio(semente)`, nunca `Math.random()`, para o vídeo sair igual toda vez.
- Termine com `publicar({ tl, desenhar, duracao })`.

## 3. Conferir e renderizar
- Prévia rápida: `cd estudio && node render.mjs <nome> --previa`.
- Extraia alguns quadros com ffmpeg e olhe antes de mostrar: texto cortado, objeto fora do quadro, legenda com mais de 2 linhas.
- Final: `node render.mjs <nome>`. Com narração: `--audio narracao.mp3` e legendas de `python ferramentas/legendas.py narracao.mp3`.

## Não fazer
- Não usar marca, logo ou rosto de pessoa real sem o usuário pedir e ter direito de uso.
- Não clonar a voz de ninguém sem autorização.
- Não reutilizar trechos de vídeos baixados com yt-dlp. Eles servem só como referência de estrutura.
