"""Narração + trilha de um episódio, com as cenas se ajustando ao tempo da fala.

Uso (com o Python do .venv):
    python ferramentas/narrar.py cenas/andar13/parte1

Lê  <cena>/roteiro.json  (falas, seções e efeitos sonoros nos tempos "originais" da animação)
Gera <cena>/tempos.json  (novos tempos de cada seção + legendas; o cena.js lê esse arquivo)
     saida/<cena>/audio.wav  (voz grave + trilha de suspense, com a música abaixando quando a voz fala)

Se uma fala não cabe na sua seção, a seção inteira é esticada proporcionalmente.
A voz é a do Piper (grátis, local) com o tom abaixado para soar mais grossa.
"""
import json
import os
import subprocess
import sys
import tempfile
import wave

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from trilha_suspense import SR, salvar_wav, sintetizar  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Voz mais grossa: tom ~2,6 semitons abaixo, um pouco mais lenta, graves reforçados e eco curto de ambiente.
FILTRO_VOZ = ",".join([
    "aresample=44100",
    "asetrate=44100*0.86", "aresample=44100", "atempo=1.11",
    "bass=g=6:f=110", "equalizer=f=2800:t=q:w=1.2:g=2.5", "highpass=f=55",
    "aecho=0.8:0.6:45|95:0.16|0.08",
    "silenceremove=start_periods=1:start_threshold=-50dB",
    "areverse", "silenceremove=start_periods=1:start_threshold=-50dB", "areverse",
    "loudnorm=I=-15:TP=-1.5",
])


def ler_wav(caminho):
    with wave.open(caminho) as w:
        assert w.getframerate() == SR and w.getsampwidth() == 2
        dados = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32767
        if w.getnchannels() == 2:
            dados = dados.reshape(-1, 2).mean(axis=1)
    return dados


def sintetizar_fala(texto, modelo, destino, tmp):
    bruto = os.path.join(tmp, "bruto.wav")
    subprocess.run([sys.executable, "-m", "piper", "-m", modelo, "--length-scale", "1.12", "--noise-scale", "0.5",
                    "-f", bruto], input=texto.encode(), check=True, capture_output=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", bruto, "-af", FILTRO_VOZ, "-ar", str(SR), "-ac", "1", destino],
                   check=True)
    return ler_wav(destino)


# Sua voz gravada, "dada uma mudada": um pouco mais grave, sem ruído, com eco curto de suspense.
FILTRO_GRAVACAO = ",".join([
    "highpass=f=70", "afftdn=nf=-30",
    "asetrate=44100*0.93", "aresample=44100", "atempo=1.04",
    "bass=g=4:f=120", "equalizer=f=3200:t=q:w=1.2:g=2",
    "aecho=0.8:0.55:50|100:0.14|0.07",
    "loudnorm=I=-15:TP=-1.5",
])


def _norm(p):
    import unicodedata
    p = unicodedata.normalize("NFD", p.lower())
    return "".join(c for c in p if c.isalnum())


def cortar_gravacao(rot, pasta_raiz, tmp):
    """Corta uma gravação contínua em uma fala por linha do roteiro, alinhando pelas palavras do whisper."""
    import difflib
    from faster_whisper import WhisperModel
    caminho = os.path.join(pasta_raiz, rot["gravacao"])
    limpo = os.path.join(tmp, "gravacao.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", caminho, "-af", FILTRO_GRAVACAO, "-ar", str(SR), "-ac", "1", limpo],
                   check=True)
    audio = ler_wav(limpo)
    escala = 1 / (0.93 * 1.04)  # o filtro muda a velocidade; ajusta os tempos do whisper (feito no original)
    modelo = WhisperModel("small", device="cpu", compute_type="int8")
    segs, _ = modelo.transcribe(caminho, language="pt", word_timestamps=True)
    palavras = [w for sg in segs for w in sg.words]
    reconhecidas = [_norm(w.word) for w in palavras]
    roteiro, dono = [], []
    for i, f in enumerate(rot["falas"]):
        for p in f["texto"].split():
            if _norm(p):
                roteiro.append(_norm(p))
                dono.append(i)
    casa = difflib.SequenceMatcher(None, roteiro, reconhecidas, autojunk=False)
    mapa = {}
    for bloco in casa.get_matching_blocks():
        for k in range(bloco.size):
            mapa[bloco.a + k] = bloco.b + k
    n = len(rot["falas"])
    inicio = [0] * n
    for i in range(1, n):
        idx = [j for j in range(len(roteiro)) if dono[j] == i]
        casadas = [(j, mapa[j]) for j in idx if j in mapa]
        if casadas:
            j, r = casadas[0]
            inicio[i] = max(inicio[i - 1] + 1, r - (j - idx[0]))
        else:
            inicio[i] = inicio[i - 1] + 1
    audios = []
    for i in range(n):
        a_idx = inicio[i]
        b_idx = (inicio[i + 1] if i + 1 < n else len(palavras)) - 1
        ini = palavras[a_idx].start - 0.12
        fim = palavras[b_idx].end + 0.25
        if a_idx > 0:
            ini = max(ini, (palavras[a_idx - 1].end + palavras[a_idx].start) / 2)
        if b_idx + 1 < len(palavras):
            fim = min(fim, (palavras[b_idx].end + palavras[b_idx + 1].start) / 2)
        a, b = int(max(0, ini) * escala * SR), int(fim * escala * SR)
        trecho = audio[a:b].copy()
        rampa = min(int(0.03 * SR), len(trecho) // 2)
        trecho[:rampa] *= np.linspace(0, 1, rampa)
        trecho[-rampa:] *= np.linspace(1, 0, rampa)
        audios.append(trecho)
        print(f"Fala {i + 1}: {ini:5.1f}-{fim:5.1f}s  «{' '.join(w.word.strip() for w in palavras[a_idx:b_idx + 1])}»")
    return audios


def clonar(rot, pasta_falas):
    """Gera as falas com a voz clonada (Chatterbox) e aplica o mesmo tratamento da gravação."""
    python_cb = os.environ.get("CHATTERBOX_PYTHON", "python")
    referencia = os.path.join(RAIZ, rot.get("referencia", "vozes/minha/referencia.wav"))
    subprocess.run([python_cb, os.path.join(RAIZ, "ferramentas", "clonar_voz.py"), referencia, pasta_falas]
                   + [f["texto"] for f in rot["falas"]], check=True)
    audios = []
    for i in range(len(rot["falas"])):
        bruto, tratado = os.path.join(pasta_falas, f"f{i}.wav"), os.path.join(pasta_falas, f"t{i}.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", bruto, "-af", "aresample=44100," + FILTRO_GRAVACAO,
                        "-ar", str(SR), "-ac", "1", tratado], check=True)
        audios.append(ler_wav(tratado))
    return audios


def main():
    pasta = sys.argv[1].rstrip("/")
    nome = os.path.relpath(os.path.abspath(pasta), os.path.join(RAIZ, "cenas"))
    rot = json.load(open(os.path.join(pasta, "roteiro.json"), encoding="utf-8"))
    modelo = os.path.join(RAIZ, "vozes", rot.get("voz", "") + ".onnx")
    if not rot.get("gravacao") and rot.get("voz") != "clonada" and not os.path.exists(modelo):
        sys.exit(f"Voz não encontrada. Rode: python -m piper.download_voices {rot['voz']} --download-dir vozes")

    secoes, fim = rot["secoes"], rot["fim"]
    duracoes = [b - a for a, b in zip(secoes, secoes[1:] + [fim])]

    with tempfile.TemporaryDirectory() as tmp:
        audios = []
        if rot.get("gravacao"):
            audios = cortar_gravacao(rot, RAIZ, tmp)
        elif rot.get("voz") == "clonada":
            audios = clonar(rot, os.path.join(RAIZ, "saida", nome, "falas-clonadas"))
        for i, f in enumerate([] if audios else rot["falas"]):
            print(f"Voz {i + 1}/{len(rot['falas'])}: {f['texto']}", flush=True)
            audios.append(sintetizar_fala(f["texto"], modelo, os.path.join(tmp, f"f{i}.wav"), tmp))

    # Fator de esticamento de cada seção para a fala caber (com 0,4 s de folga).
    fator = [1.0] * len(secoes)
    for i, f in enumerate(rot["falas"]):
        s, dur = f["secao"], len(audios[i]) / SR
        limite = f.get("ate", duracoes[s] - 0.4)
        fator[s] = max(fator[s], dur / (limite - f["ofs"]))
        proximas = [g for g in rot["falas"] if g["secao"] == s and g["ofs"] > f["ofs"]]
        if proximas:
            prox = min(g["ofs"] for g in proximas)
            fator[s] = max(fator[s], (dur + 0.2) / (prox - f["ofs"]))
    novas = [0.0]
    for d, k in zip(duracoes, fator):
        novas.append(novas[-1] + d * k)
    duracao = novas[-1]

    def mapa(t):
        for i in range(len(secoes)):
            ini, fim_s = secoes[i], (secoes + [fim])[i + 1]
            if t < fim_s or i == len(secoes) - 1:
                return novas[i] + (t - ini) * fator[i]

    falas_json = []
    voz = np.zeros(int(duracao * SR) + SR)
    for i, f in enumerate(rot["falas"]):
        t = mapa(secoes[f["secao"]] + f["ofs"])
        a = int(t * SR)
        voz[a:a + len(audios[i])] += audios[i]
        if f.get("legenda", True):
            falas_json.append({"t": round(t, 3), "fim": round(t + len(audios[i]) / SR, 3), "texto": f["texto"]})

    sons = []
    for ev in rot["sons"]:
        novo = [ev[0], mapa(ev[1])]
        if ev[0] in ("tique", "coracao", "vibra", "silencio", "grave"):
            novo.append(mapa(ev[2]))
            novo += ev[3:]
        sons.append(novo)
    musica = sintetizar({"duracao": duracao, "eventos": sons})
    voz = voz[: len(musica)]

    # "Ducking": a música abaixa ~10 dB enquanto a voz fala, com transições suaves.
    presenca = (np.abs(voz) > 0.01).astype(float)
    janela = int(0.25 * SR)
    presenca = np.convolve(presenca, np.ones(janela) / janela, mode="same")
    ganho_musica = 1 - 0.68 * np.clip(presenca * 4, 0, 1)
    mix = musica * ganho_musica * 0.8 + voz * 0.95
    mix /= max(1.0, np.max(np.abs(mix)) / 0.95)

    saida = os.path.join(RAIZ, "saida", nome, "audio.wav")
    os.makedirs(os.path.dirname(saida), exist_ok=True)
    salvar_wav(saida, mix)
    tempos = {"secoes": secoes, "fim": fim, "novas": [round(x, 3) for x in novas], "duracao": round(duracao, 3),
              "falas": falas_json}
    json.dump(tempos, open(os.path.join(pasta, "tempos.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"Duração final: {duracao:.1f} s · áudio: {saida}")


if __name__ == "__main__":
    main()
