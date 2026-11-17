"""Gera as legendas de uma narração com faster-whisper (roda local, grátis, sem enviar áudio para a nuvem).

Uso:
    python ferramentas/legendas.py narracao.mp3 > cenas/MEU-VIDEO/legendas.json

O JSON sai no formato que a função legendas() do motor entende:
    [{"t": 0.2, "fim": 2.9, "texto": "Esse vídeo inteiro custou zero reais"}, ...]
Na cena:  import frases from './legendas.json' with { type: 'json' };  legendas(tl, frases);

Na primeira execução o modelo (~500 MB) é baixado do Hugging Face e fica guardado no PC.
"""
import json
import sys

from faster_whisper import WhisperModel


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    audio = sys.argv[1]
    modelo = sys.argv[2] if len(sys.argv) > 2 else "small"  # tiny/base/small/medium
    m = WhisperModel(modelo, device="auto", compute_type="int8")
    segs, _ = m.transcribe(audio, language="pt", vad_filter=True, word_timestamps=True)
    frases = []
    for s in segs:
        palavras = list(s.words or [])
        # quebra frases longas em blocos de até 6 palavras para caber na tela
        for i in range(0, len(palavras), 6):
            bloco = palavras[i:i + 6]
            frases.append({
                "t": round(bloco[0].start, 2),
                "fim": round(bloco[-1].end, 2),
                "texto": " ".join(p.word.strip() for p in bloco),
            })
    json.dump(frases, sys.stdout, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
