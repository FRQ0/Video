# Estúdio de vídeo animado — grátis e seguro

Faz vídeos verticais (1080x1920) no estilo explicativo: bonecos 3D low-poly, títulos grandes no topo e legenda palavra por palavra. Tudo é feito por código, sem programa de edição.

Veja o resultado em [`exemplos/exemplo.mp4`](exemplos/exemplo.mp4). Ele foi gerado inteiramente por este projeto.

## Qual vale mais a pena: 14 ferramentas ou 7 etapas?

Os dois vídeos falam de coisas diferentes:

| | Vídeo das **14 ferramentas** | Vídeo das **7 etapas** |
|---|---|---|
| O que é | Lista de **programas** para produzir vídeo | **Método** para criar um canal: nicho → validar → roteiro → referências → skills → vídeo → 48 horas |
| Ferramentas | 14 programas separados | Basicamente o Claude (ou ChatGPT) criando animação em HTML |
| Ponto forte | Cobre tudo: voz, 3D, imagem por IA, legenda | Ensina o que faz um vídeo dar certo (gancho, roteiro, postagem) |
| Ponto fraco | Pesado, muita coisa desnecessária, algumas peças exigem placa de vídeo | Não explica como transformar o HTML em MP4 com voz e legenda |

**Conclusão:** use o método das 7 etapas para decidir o que falar, e só 5 das 14 ferramentas para produzir. Este projeto já junta as duas coisas.

## O que foi escolhido, e por quê

| Ferramenta | Status | Por quê |
|---|---|---|
| **three.js** | ✅ instalado | 3D no navegador (bonecos, cenários). Licença MIT |
| **GSAP** | ✅ instalado | Linha do tempo das animações. Gratuito, inclusive para uso comercial |
| **FFmpeg** | ✅ instalado | Junta os quadros e o áudio em MP4 |
| **Playwright** (Chromium) | ✅ instalado | "Fotografa" cada quadro da animação. Substitui o Remotion |
| **faster-whisper** | ✅ instalado | Legendas automáticas da narração, rodando no seu PC |
| **yt-dlp** | ✅ instalado | Baixar vídeos de referência **para estudar a estrutura** |
| **Piper TTS** *(fora da lista)* | ✅ instalado | Narração grátis em português que roda sem placa de vídeo. Substitui o Chatterbox |
| Remotion / Remotion Skills | ❌ trocado | Empresas a partir de certo tamanho precisam pagar licença. O renderizador próprio (`render.mjs`) faz o mesmo papel |
| Chatterbox | ⚠️ opcional | Voz melhor, mas precisa de GPU NVIDIA e clona vozes |
| Blender + Blender MCP | ⚠️ opcional (`--extras`) | Só para 3D muito detalhado. O MCP deixa a IA executar código no Blender |
| ComfyUI | ⚠️ opcional | Imagem e vídeo por IA. Exige GPU com 8 GB ou mais, e há casos de *custom nodes* com malware |
| Chrome DevTools MCP | ⚠️ opcional | Dá à IA controle do navegador. Se usar, use um perfil sem contas logadas |
| HyperFrames, Impeccable | ⚪ dispensável | Fazem o mesmo papel do motor deste projeto |

## Instalar no seu computador

1. Baixe este projeto (botão **Code → Download ZIP** no GitHub, ou `git clone`).
2. Abra um terminal na pasta do projeto e rode:
   - **Windows:** `Set-ExecutionPolicy -Scope Process Bypass; .\instalar\windows.ps1`
   - **Mac/Linux:** `bash instalar/mac-linux.sh`
   - Para incluir o Blender, adicione `-Extras` (Windows) ou `--extras` (Mac/Linux).
3. Teste: `cd estudio` e depois `node render.mjs exemplo`. O vídeo sai em `estudio/saida/exemplo.mp4`.

Cuidados de segurança já aplicados nos instaladores:
- Os programas vêm só de fontes oficiais (winget, Homebrew, apt, npm, PyPI).
- As versões das bibliotecas estão travadas (`package-lock.json`) e o `npm audit` não aponta vulnerabilidades.
- As ferramentas Python ficam num ambiente isolado (`.venv`), sem mexer no sistema.
- O servidor de renderização escuta só em `127.0.0.1`, então ninguém de fora acessa.

## Fazer um vídeo novo

**Com o Claude Code** (recomendado): abra o projeto e peça *"crie um vídeo sobre &lt;assunto&gt;"*. A skill [`criar-video`](.claude/skills/criar-video/SKILL.md) faz o roteiro no formato das 7 etapas e depois anima.

**Na mão:**
```bash
cp -r estudio/cenas/exemplo estudio/cenas/meu-video   # edite estudio/cenas/meu-video/cena.js
cd estudio
node render.mjs meu-video --previa                    # prévia rápida (15 fps)
node render.mjs meu-video --audio ../narracao.mp3     # final com narração
```

**Narração e legendas** (use o Python do `.venv`):
```bash
python -m piper.download_voices pt_BR-faber-medium              # só na primeira vez
echo "Esse vídeo inteiro custou zero reais" | python -m piper -m pt_BR-faber-medium -f narracao.wav
python estudio/ferramentas/legendas.py narracao.wav > estudio/cenas/meu-video/legendas.json
```
Na primeira vez, o faster-whisper baixa o modelo de fala (cerca de 500 MB). A voz do Piper tem cerca de 60 MB.

**Trilha de suspense sintetizada** (sem música de ninguém, então sem risco de direitos autorais):
```bash
python estudio/ferramentas/trilha_suspense.py estudio/cenas/andar13/parte1/sons.json trilha.wav
```

## Saga "O Andar 13"

É uma minissérie de terror em 5 partes, em que os seguidores escolhem o próximo passo nos comentários.
- História e regras: [`estudio/cenas/andar13/SAGA.md`](estudio/cenas/andar13/SAGA.md)
- Texto para postar: [`estudio/cenas/andar13/POSTAGEM.md`](estudio/cenas/andar13/POSTAGEM.md)
- Parte 1 pronta: [`exemplos/O-Andar-13-Parte-1.mp4`](exemplos/O-Andar-13-Parte-1.mp4)

## Custo real

- **R$ 0:** todas as ferramentas acima.
- **Opcional:** o Claude Code exige plano pago. Sem ele, você pode pedir a cena no claude.ai (plano grátis) e colar o código em `cena.js`.
- **Seu PC:** qualquer computador com 8 GB de RAM roda o núcleo. GPU só é necessária para ComfyUI e Chatterbox.

## Regras para não ter problema

- Não use logo, marca ou foto de pessoa real sem direito de uso.
- Não clone a voz de ninguém sem autorização.
- Vídeos baixados com yt-dlp servem só para estudar estrutura. Não reposte trechos.
- Fatos e números precisam de fonte. A IA às vezes inventa links e dados.
