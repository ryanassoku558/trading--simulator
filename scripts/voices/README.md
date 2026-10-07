# Tutorial narration

Tutorial audio uses Piper's en_US-joe-medium neural English voice. Voice weights are CC0; only generated audio and the voice configuration are committed. The narration model does not run in the web app.

To rebuild, install `piper-tts` in a Python virtual environment. Download the pinned `vowel-lab-voices-float@0.1.0` package with `npm pack`, extract `package/float.onnx`, and run:

```sh
python scripts/narrate-tutorials.py /tmp/sprout-narration --model /path/to/float.onnx
node scripts/generate-tutorials.mjs
```

The voice package is published at https://www.npmjs.com/package/vowel-lab-voices-float. Voice configuration provenance: https://github.com/Caelirhythmus/vowel-toy-game/blob/main/public/vendor/piper/en_US-joe-medium.onnx.json.

Each sentence is synthesized separately with a short pause. Caption start and end times derive from the generated audio duration, and video scenes adapt to the narration length. Numeric expressions are expanded for speech while the original text remains visible in captions and transcripts.
