"""Gera uma trilha de suspense 100% sintetizada (sem direitos autorais de ninguém).

Uso:
    python ferramentas/trilha_suspense.py cenas/andar13/parte1/sons.json saida/andar13/parte1.wav

O JSON lista a duração e os eventos sonoros no tempo:
    {"duracao": 79, "eventos": [["tique", 20, 25], ["toc", 49.2], ["susto", 68.8], ...]}
Eventos: tique (ini, fim) · ding · porta (ini) · papel · impacto · coracao (ini, fim, bpm_ini, bpm_fim)
         toc · vibra (ini, fim) · susto · silencio (ini, fim) · grave (ini, fim) para o drone ficar mais tenso.
"""
import json
import sys
import wave

import numpy as np

SR = 44100


def env(n, ataque=0.005, queda=0.3):
    t = np.arange(n) / SR
    return np.minimum(1, t / ataque) * np.exp(-t / queda)


def ruido(n, rnd, suave=1):
    r = rnd.standard_normal(n)
    if suave > 1:
        r = np.convolve(r, np.ones(suave) / suave, mode="same")
    return r


def tom(freq, dur, queda=0.3, harm=(1,)):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * freq * h * t) / (i + 1) for i, h in enumerate(harm))
    return s * env(n, queda=queda)


def colocar(trilha, som, t, ganho=1.0):
    i = int(t * SR)
    fim = min(len(trilha), i + len(som))
    if i < len(trilha):
        trilha[i:fim] += som[: fim - i] * ganho


def sintetizar(cfg):
    """Devolve a trilha (numpy, mono, 44.1 kHz, pico 0.89)."""
    dur = cfg["duracao"]
    n = int(dur * SR)
    t = np.arange(n) / SR
    rnd = np.random.default_rng(13)
    trilha = np.zeros(n)

    # Drone grave com batimento lento (base de todo o suspense)
    tensao = np.full(n, 0.0)
    for ev in cfg["eventos"]:
        if ev[0] == "grave":
            a, b = int(ev[1] * SR), int(ev[2] * SR)
            tensao[a:b] = np.linspace(0, 1, b - a)
    drone = (np.sin(2 * np.pi * 55 * t) + 0.7 * np.sin(2 * np.pi * 55.7 * t) + 0.35 * np.sin(2 * np.pi * 110.4 * t)
             + 0.25 * np.sin(2 * np.pi * (233 + 6 * tensao) * t) * tensao)
    drone *= 0.5 + 0.5 * np.sin(2 * np.pi * 0.13 * t) ** 2
    vento = ruido(n, rnd, 400) * 0.6
    trilha += (drone * 0.10 + vento * 0.05) * np.minimum(1, t / 2)

    for ev in cfg["eventos"]:
        nome, ini = ev[0], ev[1]
        if nome == "tique":
            k = ini
            while k < ev[2]:
                clique = ruido(int(0.03 * SR), rnd) * env(int(0.03 * SR), 0.001, 0.006)
                colocar(trilha, clique + tom(2400, 0.03, 0.005) * 0.3, k, 0.5)
                k += 0.5
        elif nome == "ding":
            colocar(trilha, tom(1318, 1.8, 0.6, (1, 2.01, 3.02)) + tom(1046, 1.8, 0.6) * 0.5, ini, 0.12)
        elif nome == "porta":
            m = int(1.2 * SR)
            colocar(trilha, ruido(m, rnd, 30) * np.hanning(m), ini, 0.10)
        elif nome == "papel":
            m = int(1.4 * SR)
            colocar(trilha, ruido(m, rnd, 3) * np.hanning(m) * (0.5 + 0.5 * np.sin(np.linspace(0, 40, m))), ini, 0.07)
        elif nome == "impacto":
            colocar(trilha, tom(42, 2.5, 0.9, (1, 1.5)) + ruido(int(2.5 * SR), rnd, 60) * env(int(2.5 * SR), 0.002, 0.4), ini, 0.55)
        elif nome == "coracao":
            fim, bpm0, bpm1 = ev[2], ev[3], ev[4]
            k = ini
            while k < fim:
                bpm = bpm0 + (bpm1 - bpm0) * (k - ini) / (fim - ini)
                batida = tom(55, 0.25, 0.07, (1, 2)) * 1.0
                colocar(trilha, batida, k, 0.45)
                colocar(trilha, batida * 0.7, k + 0.22, 0.45)
                k += 60 / bpm
        elif nome == "toc":
            m = int(0.35 * SR)
            som = tom(95, 0.35, 0.06, (1, 2.3)) + ruido(m, rnd, 8) * env(m, 0.001, 0.02) * 0.6
            colocar(trilha, som, ini, 0.9)
        elif nome == "vibra":
            k = ini
            while k < ev[2]:
                m = int(0.4 * SR)
                tt = np.arange(m) / SR
                colocar(trilha, np.sign(np.sin(2 * np.pi * 160 * tt)) * np.hanning(m), k, 0.06)
                k += 0.6
        elif nome == "susto":
            m = int(2.2 * SR)
            tt = np.arange(m) / SR
            guincho = np.sin(2 * np.pi * (900 + 1400 * tt) * tt) * env(m, 0.005, 0.7)
            colocar(trilha, guincho * 0.35 + tom(38, 2.2, 1.0, (1, 1.5)) + ruido(m, rnd, 2) * env(m, 0.001, 0.25) * 0.6, ini, 0.7)
        elif nome == "lamina":  # faca saindo da gaveta: "shhhing" metálico
            m = int(0.9 * SR)
            tt = np.arange(m) / SR
            brilho = sum(np.sin(2 * np.pi * f * tt) for f in (3150, 4720, 6300)) / 3
            colocar(trilha, (brilho * 0.6 + ruido(m, rnd, 2) * 0.4) * env(m, 0.15, 0.35), ini, 0.25)
        elif nome == "rangido":  # porta rangendo devagar
            m = int(1.8 * SR)
            tt = np.arange(m) / SR
            f = 180 + 120 * np.sin(2 * np.pi * 0.7 * tt) + 40 * np.sin(2 * np.pi * 13 * tt)
            serra = 2 * ((np.cumsum(f) / SR) % 1) - 1
            colocar(trilha, serra * np.hanning(m) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tt)), ini, 0.12)
        elif nome == "silencio":
            a, b = int(ini * SR), int(ev[2] * SR)
            rampa = int(0.05 * SR)
            trilha[a:b] *= 0
            trilha[a - rampa:a] *= np.linspace(1, 0, rampa)

    trilha /= max(1e-9, np.max(np.abs(trilha))) / 0.89
    return trilha


def salvar_wav(caminho, sinal):
    pcm = (np.clip(sinal, -1, 1) * 32767).astype(np.int16)
    with wave.open(caminho, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def main():
    cfg = json.load(open(sys.argv[1]))
    saida = sys.argv[2]
    trilha = sintetizar(cfg)
    pcm = (trilha * 32767).astype(np.int16)
    with wave.open(saida, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("Trilha pronta:", saida)


if __name__ == "__main__":
    main()
