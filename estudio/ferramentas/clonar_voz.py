"""Gera falas com a SUA voz clonada (Chatterbox multilíngue, licença MIT). Roda no ambiente Python do Chatterbox.

Uso (chamado automaticamente pelo narrar.py quando o roteiro tem "voz": "clonada"):
    python ferramentas/clonar_voz.py vozes/minha/referencia.wav pasta_saida "frase 1" "frase 2" ...

A referência é um trecho limpo de ~15 s da sua gravação. Cada frase vira pasta_saida/f<N>.wav.
Sem placa de vídeo é lento (minutos por frase), mas funciona. Com GPU NVIDIA, troque device para "cuda".
O áudio gerado leva uma marca d'água inaudível (Perth) que identifica que foi feito por IA.
"""
import os
import sys

import torch
import torchaudio
from chatterbox.mtl_tts import ChatterboxMultilingualTTS


def main():
    referencia, pasta, frases = sys.argv[1], sys.argv[2], sys.argv[3:]
    dispositivo = "cuda" if torch.cuda.is_available() else "cpu"
    torch.set_num_threads(os.cpu_count() or 4)
    modelo = ChatterboxMultilingualTTS.from_pretrained(device=dispositivo)
    os.makedirs(pasta, exist_ok=True)
    for i, frase in enumerate(frases):
        destino = os.path.join(pasta, f"f{i}.wav")
        if os.path.exists(destino):  # permite retomar se for interrompido
            continue
        print(f"Clonando {i + 1}/{len(frases)}: {frase}", flush=True)
        wav = modelo.generate(frase, language_id="pt", audio_prompt_path=referencia,
                              exaggeration=0.45, cfg_weight=0.5, temperature=0.7)
        torchaudio.save(destino, wav, modelo.sr)


if __name__ == "__main__":
    main()
